// Language-specific test code wrappers for server-side test execution
// Transforms {code, testInput} into executable code that outputs results as JSON

// Languages that support full test case wrapping (input→output comparison)
export const TEST_CASE_LANGUAGES = ["javascript", "typescript", "python", "java", "cpp", "go", "rust"];

/**
 * Convert a camelCase name to snake_case (for Python)
 */
function camelToSnake(name: string): string {
  return name.replace(/([A-Z])/g, "_$1").toLowerCase();
}

/**
 * Extract function name from a JS-style test expression like `twoSum([2,7], 9)`
 */
function extractFunctionName(jsExpression: string): string {
  const match = jsExpression.match(/^(\w+)\s*\(/);
  return match ? match[1] : "";
}

/**
 * Translate JS array literal syntax to Java array syntax.
 * e.g. [2,7,11,15] → new int[]{2,7,11,15}
 * Handles nested arrays and string arrays.
 */
function translateJSArrayToJava(expr: string): string {
  // Replace array literals: [1,2,3] → new int[]{1,2,3}
  // First detect if it's a string array
  return expr.replace(/\[([^\[\]]*)\]/g, (match, inner: string) => {
    const trimmed = inner.trim();
    if (!trimmed) return "new int[]{}";
    // Check if elements are strings
    if (trimmed.includes('"') || trimmed.includes("'")) {
      return `new String[]{${trimmed.replace(/'/g, '"')}}`;
    }
    // Check if elements are doubles/floats
    if (trimmed.includes(".")) {
      return `new double[]{${trimmed}}`;
    }
    // Check if elements are booleans
    if (/^(true|false)(,\s*(true|false))*$/.test(trimmed)) {
      return `new boolean[]{${trimmed}}`;
    }
    return `new int[]{${trimmed}}`;
  });
}

/**
 * Adapt a JS function call expression to the target language.
 * e.g. twoSum([2,7,11,15], 9) → two_sum([2,7,11,15], 9) for Python
 */
export function adaptFunctionCall(language: string, jsExpression: string): string {
  const fnName = extractFunctionName(jsExpression);
  if (!fnName) return jsExpression;

  switch (language) {
    case "python": {
      const pyName = camelToSnake(fnName);
      return jsExpression.replace(new RegExp(`^${fnName}`), pyName);
    }
    case "java": {
      // Translate array syntax in the arguments
      const argsStart = jsExpression.indexOf("(");
      if (argsStart === -1) return jsExpression;
      const argsStr = jsExpression.slice(argsStart + 1, jsExpression.lastIndexOf(")"));
      const translatedArgs = translateJSArrayToJava(argsStr);
      return `${fnName}(${translatedArgs})`;
    }
    case "cpp":
    case "go": {
      // C++ and Go use camelCase like JS
      return jsExpression;
    }
    case "rust": {
      const rustName = camelToSnake(fnName);
      return jsExpression.replace(new RegExp(`^${fnName}`), rustName);
    }
    default:
      return jsExpression;
  }
}

/**
 * Wrap user code + test input expression into complete executable code
 * that prints the result as JSON to stdout.
 */
export function wrapTestCode(language: string, userCode: string, testInput: string): string {
  switch (language) {
    case "javascript":
      return `${userCode}\nconsole.log(JSON.stringify(${testInput}));`;

    case "typescript":
      return `${userCode}\nconsole.log(JSON.stringify(${testInput}));`;

    case "python": {
      const adapted = adaptFunctionCall("python", testInput);
      return `${userCode}\nimport json\nprint(json.dumps(${adapted}))`;
    }

    case "java": {
      const adapted = adaptFunctionCall("java", testInput);
      // Extract the class name from user code, or use "Solution"
      const classMatch = userCode.match(/public\s+class\s+(\w+)/);
      const className = classMatch ? classMatch[1] : "Solution";

      // Remove existing main method so we can inject our test-calling main
      const mainRegex = /public\s+static\s+void\s+main\s*\([^)]*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/;
      userCode = userCode.replace(mainRegex, '');

      // Wrap: add a main method that instantiates the class and calls the function
      // Use Object type to avoid Java's strict instanceof compile-time checks with var
      const printCode = `
    public static void main(String[] args) {
        Object result = new ${className}().${adapted};
        if (result == null) {
            System.out.println("null");
        } else if (result instanceof int[]) {
            System.out.println(java.util.Arrays.toString((int[]) result));
        } else if (result instanceof String[]) {
            System.out.println(java.util.Arrays.toString((String[]) result));
        } else if (result instanceof double[]) {
            System.out.println(java.util.Arrays.toString((double[]) result));
        } else if (result instanceof boolean[]) {
            System.out.println(java.util.Arrays.toString((boolean[]) result));
        } else if (result instanceof Object[]) {
            System.out.println(java.util.Arrays.deepToString((Object[]) result));
        } else {
            System.out.println(String.valueOf(result));
        }
    }`;

      // Insert main method before the last closing brace of the class
      const lastBrace = userCode.lastIndexOf("}");
      if (lastBrace === -1) {
        // No class structure — wrap entirely
        return `import java.util.*;\n\nclass ${className} {\n${userCode}\n${printCode}\n}`;
      }
      return `import java.util.*;\n\n${userCode.slice(0, lastBrace)}\n${printCode}\n}`;
    }

    case "cpp": {
      const adapted = adaptFunctionCall("cpp", testInput);
      // Remove existing main function if present
      const mainRegexCpp = /int\s+main\s*\([^)]*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/;
      userCode = userCode.replace(mainRegexCpp, '');

      const mainCode = `
int main() {
    Solution sol;
    auto result = sol.${adapted};
    // Print result as JSON-like
    std::cout << result << std::endl;
    return 0;
}`;
      return `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\n${userCode}\n${mainCode}`;
    }

    case "go": {
      const adapted = adaptFunctionCall("go", testInput);
      // Remove existing main func if present
      const mainRegexGo = /func\s+main\s*\(\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/;
      userCode = userCode.replace(mainRegexGo, '');
      // Remove package declaration (we'll add our own)
      userCode = userCode.replace(/^package\s+\w+\s*\n?/m, '');

      return `package main

import "fmt"

${userCode}

func main() {
	result := ${adapted}
	fmt.Println(result)
}`;
    }

    case "rust": {
      const adapted = adaptFunctionCall("rust", testInput);
      // Remove existing main fn if present
      const mainRegexRust = /fn\s+main\s*\(\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/;
      userCode = userCode.replace(mainRegexRust, '');

      return `${userCode}

fn main() {
    let result = ${adapted};
    println!("{:?}", result);
}`;
    }

    default:
      // For unsupported languages, return code as-is
      return userCode;
  }
}

/**
 * Normalize an output value for comparison.
 * Handles JSON array format differences, whitespace, etc.
 */
export function normalizeOutput(actual: string, expected: string): boolean {
  const a = actual.trim();
  const e = expected.trim();

  // Direct match
  if (a === e) return true;

  // Try JSON parse both and compare
  try {
    const parsedA = JSON.parse(a);
    const parsedE = JSON.parse(e);
    return JSON.stringify(parsedA) === JSON.stringify(parsedE);
  } catch {
    // Not JSON — continue
  }

  // Handle Java array format: [1, 2, 3] vs [1,2,3]
  const normalizeSpaces = (s: string) => s.replace(/,\s*/g, ",").replace(/\s+/g, "");
  if (normalizeSpaces(a) === normalizeSpaces(e)) return true;

  return false;
}

/**
 * Check if a language supports test case wrapping
 */
export function supportsTestCases(language: string): boolean {
  return TEST_CASE_LANGUAGES.includes(language.toLowerCase());
}
