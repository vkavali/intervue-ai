/**
 * Canonical Problem Type System
 *
 * Language-agnostic problem definitions with type mappings.
 * One source of truth for function signatures that renders
 * correctly across all supported languages.
 *
 * Architecture:
 *   Layer 1: Canonical Problem Definition (this file)
 *   Layer 2: Language Template Renderer (renderStarterCode)
 *   Layer 3: Judge Adapters (separate per-language execution wrappers)
 */

// ─── Canonical Types ────────────────────────────────────────────────────────────

export type CanonicalType =
  | "int"
  | "float"
  | "string"
  | "bool"
  | "void"
  | "array<int>"
  | "array<float>"
  | "array<string>"
  | "array<bool>"
  | "array<array<int>>"
  | "array<array<string>>"
  | "map<string,int>"
  | "map<string,string>"
  | "set<int>"
  | "set<string>"
  | "TreeNode"
  | "ListNode";

export interface ParamDef {
  name: string;
  type: CanonicalType;
  description?: string;
}

export interface CanonicalSignature {
  functionName: string;
  params: ParamDef[];
  returnType: CanonicalType;
}

// ─── Language Type Mappings ─────────────────────────────────────────────────────

const TYPE_MAP: Record<string, Record<CanonicalType, string>> = {
  javascript: {
    int: "number",
    float: "number",
    string: "string",
    bool: "boolean",
    void: "void",
    "array<int>": "number[]",
    "array<float>": "number[]",
    "array<string>": "string[]",
    "array<bool>": "boolean[]",
    "array<array<int>>": "number[][]",
    "array<array<string>>": "string[][]",
    "map<string,int>": "Object",
    "map<string,string>": "Object",
    "set<int>": "Set",
    "set<string>": "Set",
    TreeNode: "TreeNode",
    ListNode: "ListNode",
  },
  typescript: {
    int: "number",
    float: "number",
    string: "string",
    bool: "boolean",
    void: "void",
    "array<int>": "number[]",
    "array<float>": "number[]",
    "array<string>": "string[]",
    "array<bool>": "boolean[]",
    "array<array<int>>": "number[][]",
    "array<array<string>>": "string[][]",
    "map<string,int>": "Map<string, number>",
    "map<string,string>": "Map<string, string>",
    "set<int>": "Set<number>",
    "set<string>": "Set<string>",
    TreeNode: "TreeNode | null",
    ListNode: "ListNode | null",
  },
  python: {
    int: "int",
    float: "float",
    string: "str",
    bool: "bool",
    void: "None",
    "array<int>": "List[int]",
    "array<float>": "List[float]",
    "array<string>": "List[str]",
    "array<bool>": "List[bool]",
    "array<array<int>>": "List[List[int]]",
    "array<array<string>>": "List[List[str]]",
    "map<string,int>": "Dict[str, int]",
    "map<string,string>": "Dict[str, str]",
    "set<int>": "Set[int]",
    "set<string>": "Set[str]",
    TreeNode: "Optional[TreeNode]",
    ListNode: "Optional[ListNode]",
  },
  java: {
    int: "int",
    float: "double",
    string: "String",
    bool: "boolean",
    void: "void",
    "array<int>": "int[]",
    "array<float>": "double[]",
    "array<string>": "String[]",
    "array<bool>": "boolean[]",
    "array<array<int>>": "int[][]",
    "array<array<string>>": "String[][]",
    "map<string,int>": "Map<String, Integer>",
    "map<string,string>": "Map<String, String>",
    "set<int>": "Set<Integer>",
    "set<string>": "Set<String>",
    TreeNode: "TreeNode",
    ListNode: "ListNode",
  },
  cpp: {
    int: "int",
    float: "double",
    string: "string",
    bool: "bool",
    void: "void",
    "array<int>": "vector<int>",
    "array<float>": "vector<double>",
    "array<string>": "vector<string>",
    "array<bool>": "vector<bool>",
    "array<array<int>>": "vector<vector<int>>",
    "array<array<string>>": "vector<vector<string>>",
    "map<string,int>": "unordered_map<string, int>",
    "map<string,string>": "unordered_map<string, string>",
    "set<int>": "unordered_set<int>",
    "set<string>": "unordered_set<string>",
    TreeNode: "TreeNode*",
    ListNode: "ListNode*",
  },
  go: {
    int: "int",
    float: "float64",
    string: "string",
    bool: "bool",
    void: "",
    "array<int>": "[]int",
    "array<float>": "[]float64",
    "array<string>": "[]string",
    "array<bool>": "[]bool",
    "array<array<int>>": "[][]int",
    "array<array<string>>": "[][]string",
    "map<string,int>": "map[string]int",
    "map<string,string>": "map[string]string",
    "set<int>": "map[int]bool",
    "set<string>": "map[string]bool",
    TreeNode: "*TreeNode",
    ListNode: "*ListNode",
  },
  rust: {
    int: "i32",
    float: "f64",
    string: "String",
    bool: "bool",
    void: "()",
    "array<int>": "Vec<i32>",
    "array<float>": "Vec<f64>",
    "array<string>": "Vec<String>",
    "array<bool>": "Vec<bool>",
    "array<array<int>>": "Vec<Vec<i32>>",
    "array<array<string>>": "Vec<Vec<String>>",
    "map<string,int>": "HashMap<String, i32>",
    "map<string,string>": "HashMap<String, String>",
    "set<int>": "HashSet<i32>",
    "set<string>": "HashSet<String>",
    TreeNode: "Option<Rc<RefCell<TreeNode>>>",
    ListNode: "Option<Box<ListNode>>",
  },
};

// ─── Type Resolver ──────────────────────────────────────────────────────────────

export function resolveType(canonical: CanonicalType, language: string): string {
  const langMap = TYPE_MAP[language];
  if (!langMap) return canonical;
  return langMap[canonical] || canonical;
}

// ─── Starter Code Renderer ──────────────────────────────────────────────────────

export function renderStarterCode(
  sig: CanonicalSignature,
  language: string
): string {
  const fn = sig.functionName;
  const params = sig.params;
  const ret = sig.returnType;

  switch (language) {
    case "javascript": {
      const paramNames = params.map((p) => p.name).join(", ");
      const jsdoc = params
        .map((p) => ` * @param {${resolveType(p.type, "javascript")}} ${p.name}`)
        .join("\n");
      const retDoc = ` * @return {${resolveType(ret, "javascript")}}`;
      return `/**\n${jsdoc}\n${retDoc}\n */\nfunction ${fn}(${paramNames}) {\n  // Your code here\n}\n`;
    }

    case "typescript": {
      const paramList = params
        .map((p) => `${p.name}: ${resolveType(p.type, "typescript")}`)
        .join(", ");
      const retType = resolveType(ret, "typescript");
      const defaultReturn =
        ret === "void"
          ? ""
          : ret === "bool"
          ? "\n  return false;"
          : ret === "int" || ret === "float"
          ? "\n  return 0;"
          : ret === "string"
          ? '\n  return "";'
          : "\n  return [] as any;";
      return `function ${fn}(${paramList}): ${retType} {\n  // Your code here${defaultReturn}\n}\n`;
    }

    case "python": {
      const pyFn = fn.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
      const paramList = params.map((p) => p.name).join(", ");
      const typeHints = params
        .map((p) => `        ${p.name}: ${resolveType(p.type, "python")}`)
        .join("\n");
      return `def ${pyFn}(${paramList}):\n    """\n    Args:\n${typeHints}\n    Returns:\n        ${resolveType(ret, "python")}\n    """\n    # Your code here\n    pass\n`;
    }

    case "java": {
      const paramList = params
        .map((p) => `${resolveType(p.type, "java")} ${p.name}`)
        .join(", ");
      const retType = resolveType(ret, "java");
      // Box return types for collections
      const javaRet =
        ret === "int"
          ? "int"
          : ret === "bool"
          ? "boolean"
          : retType;
      const defaultReturn =
        ret === "void"
          ? ""
          : ret === "bool"
          ? "\n        return false;"
          : ret === "int" || ret === "float"
          ? "\n        return 0;"
          : "\n        return null;";
      return `class Solution {\n    public ${javaRet} ${fn}(${paramList}) {\n        // Your code here${defaultReturn}\n    }\n}\n`;
    }

    case "cpp": {
      const paramList = params
        .map((p) => `${resolveType(p.type, "cpp")}& ${p.name}`)
        .join(", ");
      const retType = resolveType(ret, "cpp");
      const defaultReturn =
        ret === "void"
          ? ""
          : ret === "bool"
          ? "\n        return false;"
          : ret === "int" || ret === "float"
          ? "\n        return 0;"
          : "\n        return {};";
      return `class Solution {\npublic:\n    ${retType} ${fn}(${paramList}) {\n        // Your code here${defaultReturn}\n    }\n};\n`;
    }

    case "go": {
      const goFn = fn.charAt(0).toUpperCase() + fn.slice(1);
      const paramList = params
        .map((p) => `${p.name} ${resolveType(p.type, "go")}`)
        .join(", ");
      const retType = resolveType(ret, "go");
      const retClause = retType ? ` ${retType}` : "";
      return `func ${goFn}(${paramList})${retClause} {\n\t// Your code here\n}\n`;
    }

    case "rust": {
      const rustFn = fn.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
      const paramList = params
        .map((p) => `${p.name}: ${resolveType(p.type, "rust")}`)
        .join(", ");
      const retType = resolveType(ret, "rust");
      const retClause = ret === "void" ? "" : ` -> ${retType}`;
      return `impl Solution {\n    pub fn ${rustFn}(${paramList})${retClause} {\n        // Your code here\n        todo!()\n    }\n}\n`;
    }

    default:
      return `// Language '${language}' not supported for auto-generation\n`;
  }
}

// ─── Generate All Language Starters from Canonical Signature ─────────────────

export function generateAllStarters(sig: CanonicalSignature): Record<string, string> {
  const langs = ["javascript", "typescript", "python", "java", "cpp", "go", "rust"];
  const result: Record<string, string> = {};
  for (const lang of langs) {
    result[lang] = renderStarterCode(sig, lang);
  }
  return result;
}

// ─── Canonical Signatures for Common Problems ───────────────────────────────

export const CANONICAL_SIGNATURES: Record<string, CanonicalSignature> = {
  twoSum: {
    functionName: "twoSum",
    params: [
      { name: "nums", type: "array<int>", description: "Array of integers" },
      { name: "target", type: "int", description: "Target sum" },
    ],
    returnType: "array<int>",
  },
  containsDuplicate: {
    functionName: "containsDuplicate",
    params: [{ name: "nums", type: "array<int>" }],
    returnType: "bool",
  },
  maxSubArray: {
    functionName: "maxSubArray",
    params: [{ name: "nums", type: "array<int>" }],
    returnType: "int",
  },
  mergeIntervals: {
    functionName: "mergeIntervals",
    params: [{ name: "intervals", type: "array<array<int>>" }],
    returnType: "array<array<int>>",
  },
  climbStairs: {
    functionName: "climbStairs",
    params: [{ name: "n", type: "int" }],
    returnType: "int",
  },
  coinChange: {
    functionName: "coinChange",
    params: [
      { name: "coins", type: "array<int>" },
      { name: "amount", type: "int" },
    ],
    returnType: "int",
  },
  isValid: {
    functionName: "isValid",
    params: [{ name: "s", type: "string" }],
    returnType: "bool",
  },
  searchInsert: {
    functionName: "searchInsert",
    params: [
      { name: "nums", type: "array<int>" },
      { name: "target", type: "int" },
    ],
    returnType: "int",
  },
  maxArea: {
    functionName: "maxArea",
    params: [{ name: "height", type: "array<int>" }],
    returnType: "int",
  },
  rob: {
    functionName: "rob",
    params: [{ name: "nums", type: "array<int>" }],
    returnType: "int",
  },
  maxProfit: {
    functionName: "maxProfit",
    params: [{ name: "prices", type: "array<int>" }],
    returnType: "int",
  },
  productExceptSelf: {
    functionName: "productExceptSelf",
    params: [{ name: "nums", type: "array<int>" }],
    returnType: "array<int>",
  },
  findKthLargest: {
    functionName: "findKthLargest",
    params: [
      { name: "nums", type: "array<int>" },
      { name: "k", type: "int" },
    ],
    returnType: "int",
  },
  minMeetingRooms: {
    functionName: "minMeetingRooms",
    params: [{ name: "intervals", type: "array<array<int>>" }],
    returnType: "int",
  },
  lengthOfLongestSubstring: {
    functionName: "lengthOfLongestSubstring",
    params: [{ name: "s", type: "string" }],
    returnType: "int",
  },
};
