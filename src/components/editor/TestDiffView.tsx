"use client";

interface TestDiffViewProps {
  expected: string;
  actual: string;
}

/**
 * Character-level diff view for test case comparison.
 * Shows red highlighting for mismatched characters in actual,
 * green highlighting for expected characters.
 */
export default function TestDiffView({ expected, actual }: TestDiffViewProps) {
  const expectedChars = expected.trim().split("");
  const actualChars = actual.trim().split("");
  const maxLen = Math.max(expectedChars.length, actualChars.length);

  // Build diff spans
  const expectedSpans: { text: string; type: "match" | "diff" | "missing" }[] = [];
  const actualSpans: { text: string; type: "match" | "diff" | "extra" }[] = [];

  let i = 0;
  while (i < maxLen) {
    const ec = i < expectedChars.length ? expectedChars[i] : undefined;
    const ac = i < actualChars.length ? actualChars[i] : undefined;

    if (ec !== undefined && ac !== undefined) {
      if (ec === ac) {
        // Extend or create a match span
        const eLast = expectedSpans[expectedSpans.length - 1];
        const aLast = actualSpans[actualSpans.length - 1];
        if (eLast && eLast.type === "match") {
          eLast.text += ec;
        } else {
          expectedSpans.push({ text: ec, type: "match" });
        }
        if (aLast && aLast.type === "match") {
          aLast.text += ac;
        } else {
          actualSpans.push({ text: ac, type: "match" });
        }
      } else {
        const eLast = expectedSpans[expectedSpans.length - 1];
        const aLast = actualSpans[actualSpans.length - 1];
        if (eLast && eLast.type === "diff") {
          eLast.text += ec;
        } else {
          expectedSpans.push({ text: ec, type: "diff" });
        }
        if (aLast && aLast.type === "diff") {
          aLast.text += ac;
        } else {
          actualSpans.push({ text: ac, type: "diff" });
        }
      }
    } else if (ec !== undefined) {
      const eLast = expectedSpans[expectedSpans.length - 1];
      if (eLast && eLast.type === "missing") {
        eLast.text += ec;
      } else {
        expectedSpans.push({ text: ec, type: "missing" });
      }
    } else if (ac !== undefined) {
      const aLast = actualSpans[actualSpans.length - 1];
      if (aLast && aLast.type === "extra") {
        aLast.text += ac;
      } else {
        actualSpans.push({ text: ac, type: "extra" });
      }
    }
    i++;
  }

  const spanClass = (type: string) => {
    switch (type) {
      case "match":
        return "text-gray-300";
      case "diff":
        return "bg-red-500/20 text-red-300";
      case "missing":
        return "bg-yellow-500/20 text-yellow-300";
      case "extra":
        return "bg-red-500/20 text-red-300";
      default:
        return "text-gray-300";
    }
  };

  return (
    <div className="space-y-2 text-xs font-mono">
      <div>
        <span className="text-[10px] font-semibold uppercase text-green-500 block mb-1">
          Expected
        </span>
        <div className="rounded bg-green-500/5 border border-green-500/10 px-3 py-2 whitespace-pre-wrap break-all">
          {expectedSpans.map((s, idx) => (
            <span
              key={idx}
              className={
                s.type === "match"
                  ? "text-green-300"
                  : "bg-green-500/20 text-green-200 rounded px-0.5"
              }
            >
              {s.text}
            </span>
          ))}
        </div>
      </div>
      <div>
        <span className="text-[10px] font-semibold uppercase text-red-500 block mb-1">
          Actual
        </span>
        <div className="rounded bg-red-500/5 border border-red-500/10 px-3 py-2 whitespace-pre-wrap break-all">
          {actualSpans.map((s, idx) => (
            <span key={idx} className={spanClass(s.type)}>
              {s.text}
            </span>
          ))}
          {actualChars.length === 0 && (
            <span className="text-gray-600 italic">(empty)</span>
          )}
        </div>
      </div>
    </div>
  );
}
