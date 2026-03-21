// Shared code execution backend: Piston → Judge0 → Local fallback
import { exec } from "child_process";
import { writeFile, mkdir, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const TIMEOUT_MS = 10000;
const MAX_BUFFER = 1024 * 1024; // 1MB

const PISTON_URL = process.env.PISTON_URL;
const JUDGE0_URL = process.env.JUDGE0_URL;
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

const PISTON_LANGUAGES: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "*" },
  typescript: { language: "typescript", version: "*" },
  python: { language: "python", version: "*" },
  java: { language: "java", version: "*" },
  cpp: { language: "c++", version: "*" },
  go: { language: "go", version: "*" },
  rust: { language: "rust", version: "*" },
};

const JUDGE0_LANGUAGES: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
  go: 60,
  rust: 73,
};

export const SUPPORTED_LANGUAGES = ["javascript", "typescript", "python", "java", "cpp", "go", "rust"];
export const LOCAL_LANGUAGES = ["javascript", "typescript", "python", "java", "cpp", "go", "rust"];

export interface ExecutionResult {
  output: string;
  error: string;
  exitCode: number;
}

async function executePiston(language: string, code: string): Promise<ExecutionResult> {
  const langConfig = PISTON_LANGUAGES[language];
  if (!langConfig) throw new Error(`Unsupported language: ${language}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(PISTON_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [{ content: code }],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Piston API error:", res.status, errorText);
      throw new Error("Piston execution failed");
    }

    const result = await res.json();
    const run = result.run;
    return {
      output: run?.output ?? "",
      error: run?.stderr ?? "",
      exitCode: run?.code ?? 1,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function executeJudge0(language: string, code: string): Promise<ExecutionResult> {
  const langId = JUDGE0_LANGUAGES[language];
  if (!langId) throw new Error(`Unsupported language: ${language}`);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (JUDGE0_API_KEY) {
    headers["X-RapidAPI-Key"] = JUDGE0_API_KEY;
    headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com";
  }

  const submitRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      language_id: langId,
      source_code: Buffer.from(code).toString("base64"),
    }),
  });

  if (!submitRes.ok) {
    throw new Error("Judge0 submission failed");
  }

  const result = await submitRes.json();

  const stdout = result.stdout ? Buffer.from(result.stdout, "base64").toString() : "";
  const stderr = result.stderr ? Buffer.from(result.stderr, "base64").toString() : "";
  const compileError = result.compile_output ? Buffer.from(result.compile_output, "base64").toString() : "";

  return {
    output: stdout,
    error: stderr || compileError,
    exitCode: result.status?.id === 3 ? 0 : 1,
  };
}

function runCommand(cmd: string, cwd?: string): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    exec(cmd, { timeout: TIMEOUT_MS, maxBuffer: MAX_BUFFER, cwd }, (err, stdout, stderr) => {
      let errorMsg = stderr || "";
      if (err && !errorMsg) {
        const msg = err.message || "";
        const cmdFailedIdx = msg.indexOf("\n");
        errorMsg = cmdFailedIdx > 0 ? msg.substring(cmdFailedIdx + 1).trim() : "";
        if (!errorMsg && msg.startsWith("Command failed:")) {
          errorMsg = "Process exited with a non-zero exit code";
        } else if (!errorMsg) {
          errorMsg = msg;
        }
      }
      resolve({
        output: stdout || "",
        error: errorMsg,
        exitCode: err ? (typeof err.code === "number" ? err.code : 1) : 0,
      });
    });
  });
}

async function executeLocal(language: string, code: string): Promise<ExecutionResult> {
  const tmpDir = join(tmpdir(), `intervue-exec-${randomUUID()}`);
  await mkdir(tmpDir, { recursive: true });

  try {
    if (language === "javascript") {
      const filePath = join(tmpDir, "solution.js");
      await writeFile(filePath, code);
      return await runCommand(`node "${filePath}"`, tmpDir);
    }

    if (language === "typescript") {
      const filePath = join(tmpDir, "solution.ts");
      await writeFile(filePath, code);
      const result = await runCommand(`npx tsx "${filePath}"`, tmpDir);
      if (result.exitCode !== 0 && result.error.includes("not found")) {
        return await runCommand(`npx ts-node "${filePath}"`, tmpDir);
      }
      return result;
    }

    if (language === "python") {
      const filePath = join(tmpDir, "solution.py");
      await writeFile(filePath, code);
      let result = await runCommand(`python3 "${filePath}"`, tmpDir);
      if (result.exitCode !== 0 && (result.error.includes("not found") || result.error.includes("not recognized"))) {
        result = await runCommand(`python "${filePath}"`, tmpDir);
      }
      if (result.exitCode !== 0 && (result.error.includes("not found") || result.error.includes("not recognized"))) {
        result = await runCommand(`py "${filePath}"`, tmpDir);
      }
      return result;
    }

    if (language === "java") {
      const publicClassMatch = code.match(/public\s+class\s+(\w+)/);
      const mainClassMatch = code.match(/class\s+(\w+)[\s\S]*?public\s+static\s+void\s+main/);
      const anyClassMatch = code.match(/^(?!.*\/\/).*class\s+(\w+)/m);
      const className = (publicClassMatch || mainClassMatch || anyClassMatch)?.[1] || "Solution";

      // If no main method exists, inject an empty one so Java can run without error
      const hasMain = /public\s+static\s+void\s+main\s*\(/.test(code);
      if (!hasMain) {
        const lastBrace = code.lastIndexOf("}");
        if (lastBrace !== -1) {
          code = code.slice(0, lastBrace) + "\n    public static void main(String[] args) {}\n}";
        }
      }

      const filePath = join(tmpDir, `${className}.java`);
      await writeFile(filePath, code);

      const compileResult = await runCommand(`javac "${filePath}"`, tmpDir);
      if (compileResult.exitCode !== 0) {
        return {
          output: "",
          error: compileResult.error || "Compilation failed",
          exitCode: 1,
        };
      }

      return await runCommand(`java -cp "${tmpDir}" ${className}`, tmpDir);
    }

    if (language === "cpp") {
      const filePath = join(tmpDir, "solution.cpp");
      const outPath = join(tmpDir, "solution");
      await writeFile(filePath, code);

      const compileResult = await runCommand(`g++ -std=c++17 -o "${outPath}" "${filePath}"`, tmpDir);
      if (compileResult.exitCode !== 0) {
        return {
          output: "",
          error: compileResult.error || "Compilation failed",
          exitCode: 1,
        };
      }
      return await runCommand(`"${outPath}"`, tmpDir);
    }

    if (language === "go") {
      const filePath = join(tmpDir, "solution.go");
      await writeFile(filePath, code);
      return await runCommand(`go run "${filePath}"`, tmpDir);
    }

    if (language === "rust") {
      const filePath = join(tmpDir, "solution.rs");
      const outPath = join(tmpDir, "solution");
      await writeFile(filePath, code);

      const compileResult = await runCommand(`rustc -o "${outPath}" "${filePath}"`, tmpDir);
      if (compileResult.exitCode !== 0) {
        return {
          output: "",
          error: compileResult.error || "Compilation failed",
          exitCode: 1,
        };
      }
      return await runCommand(`"${outPath}"`, tmpDir);
    }

    throw new Error(`Local execution not supported for ${language}`);
  } finally {
    rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Execute code using the best available backend: Piston → Judge0 → Local
 * Returns USE_CLIENT_EXECUTION error for JS/TS when no backend is available.
 */
export async function executeCode(language: string, code: string): Promise<ExecutionResult> {
  const langKey = language.toLowerCase();

  // Try Piston first
  if (PISTON_URL) {
    try {
      return await executePiston(langKey, code);
    } catch (err) {
      console.error("Piston execution error:", err);
    }
  }

  // Try Judge0
  if (JUDGE0_URL) {
    try {
      return await executeJudge0(langKey, code);
    } catch (err) {
      console.error("Judge0 execution error:", err);
    }
  }

  // Local execution for supported languages
  if (LOCAL_LANGUAGES.includes(langKey)) {
    return await executeLocal(langKey, code);
  }

  // No backend available
  throw new Error(`NO_BACKEND:${langKey}`);
}

/**
 * Get the best available backend for a language.
 */
export function getAvailableBackend(language: string): "piston" | "judge0" | "local" | null {
  const langKey = language.toLowerCase();
  if (PISTON_URL && PISTON_LANGUAGES[langKey]) return "piston";
  if (JUDGE0_URL && JUDGE0_LANGUAGES[langKey]) return "judge0";
  if (LOCAL_LANGUAGES.includes(langKey)) return "local";
  return null;
}

/**
 * Get list of all supported languages.
 */
export function getSupportedLanguages(): string[] {
  return [...SUPPORTED_LANGUAGES];
}
