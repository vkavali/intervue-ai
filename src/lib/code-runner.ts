// Client-side JavaScript code runner using Web Worker
export function runJavaScriptInWorker(code: string): Promise<{ output: string; error: string; exitCode: number }> {
  return new Promise((resolve) => {
    const workerCode = `
      const __output = [];
      const __origConsole = { log: console.log, error: console.error, warn: console.warn };
      console.log = (...args) => __output.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
      console.error = (...args) => __output.push('ERROR: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
      console.warn = (...args) => __output.push('WARN: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));

      try {
        ${code}
        self.postMessage({ output: __output.join('\\n'), error: '', exitCode: 0 });
      } catch (e) {
        self.postMessage({ output: __output.join('\\n'), error: e.message || String(e), exitCode: 1 });
      }
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    const timeout = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ output: "", error: "Execution timed out (10s limit)", exitCode: 1 });
    }, 10000);

    worker.onmessage = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(e.data);
    };

    worker.onerror = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ output: "", error: e.message || "Worker error", exitCode: 1 });
    };
  });
}
