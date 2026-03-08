"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import Link from "next/link";

// ─── Practice problem data ──────────────────────────────────────────────────────

interface PracticeProblem {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  constraints: string;
  examples: string;
  starterCode: Record<string, string>;
}

const PRACTICE_PROBLEMS: Record<string, PracticeProblem> = {
  "two-sum": {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "EASY",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    constraints:
      "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
    examples:
      "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]\n\nInput: nums = [3,3], target = 6\nOutput: [0,1]",
    starterCode: {
      javascript:
        "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // Your solution here\n}\n\n// Test\nconsole.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]\nconsole.log(twoSum([3, 2, 4], 6));       // [1, 2]\n",
      python:
        'def two_sum(nums, target):\n    """Find two indices that sum to target."""\n    # Your solution here\n    pass\n\n# Test\nprint(two_sum([2, 7, 11, 15], 9))  # [0, 1]\nprint(two_sum([3, 2, 4], 6))       # [1, 2]\n',
      typescript:
        "function twoSum(nums: number[], target: number): number[] {\n  // Your solution here\n  return [];\n}\n\n// Test\nconsole.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]\nconsole.log(twoSum([3, 2, 4], 6));       // [1, 2]\n",
      java:
        'import java.util.*;\n\nclass Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Your solution here\n        return new int[]{};\n    }\n\n    public static void main(String[] args) {\n        System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9)));\n        System.out.println(Arrays.toString(twoSum(new int[]{3, 2, 4}, 6)));\n    }\n}\n',
      cpp:
        '#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your solution here\n        return {};\n    }\n};\n\nint main() {\n    Solution sol;\n    vector<int> nums = {2, 7, 11, 15};\n    auto result = sol.twoSum(nums, 9);\n    cout << "[" << result[0] << ", " << result[1] << "]" << endl;\n    return 0;\n}\n',
      go:
        'package main\n\nimport "fmt"\n\nfunc twoSum(nums []int, target int) []int {\n\t// Your solution here\n\treturn nil\n}\n\nfunc main() {\n\tfmt.Println(twoSum([]int{2, 7, 11, 15}, 9))\n\tfmt.Println(twoSum([]int{3, 2, 4}, 6))\n}\n',
      rust:
        'fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n    // Your solution here\n    vec![]\n}\n\nfn main() {\n    println!("{:?}", two_sum(vec![2, 7, 11, 15], 9));\n    println!("{:?}", two_sum(vec![3, 2, 4], 6));\n}\n',
    },
  },
  "reverse-linked-list": {
    id: "reverse-linked-list",
    title: "Reverse Linked List",
    difficulty: "EASY",
    description:
      "Given the head of a singly linked list, reverse the list, and return the reversed list.\n\nImplement the solution both iteratively and recursively if possible.",
    constraints:
      "The number of nodes in the list is in the range [0, 5000].\n-5000 <= Node.val <= 5000",
    examples:
      "Input: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]\n\nInput: head = [1,2]\nOutput: [2,1]\n\nInput: head = []\nOutput: []",
    starterCode: {
      javascript:
        "class ListNode {\n  constructor(val = 0, next = null) {\n    this.val = val;\n    this.next = next;\n  }\n}\n\n/**\n * @param {ListNode} head\n * @return {ListNode}\n */\nfunction reverseList(head) {\n  // Your solution here\n}\n\n// Helper to create a linked list from array\nfunction fromArray(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) {\n    head = new ListNode(arr[i], head);\n  }\n  return head;\n}\n\nfunction toArray(head) {\n  const result = [];\n  while (head) { result.push(head.val); head = head.next; }\n  return result;\n}\n\nconsole.log(toArray(reverseList(fromArray([1,2,3,4,5]))));\n",
      python:
        'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head):\n    """Reverse a singly linked list."""\n    # Your solution here\n    pass\n\n# Helper functions\ndef from_array(arr):\n    head = None\n    for val in reversed(arr):\n        head = ListNode(val, head)\n    return head\n\ndef to_array(head):\n    result = []\n    while head:\n        result.append(head.val)\n        head = head.next\n    return result\n\nprint(to_array(reverse_list(from_array([1,2,3,4,5]))))\n',
      typescript:
        "class ListNode {\n  val: number;\n  next: ListNode | null;\n  constructor(val: number = 0, next: ListNode | null = null) {\n    this.val = val;\n    this.next = next;\n  }\n}\n\nfunction reverseList(head: ListNode | null): ListNode | null {\n  // Your solution here\n  return null;\n}\n\nconsole.log(\"Implement and test your solution\");\n",
      java:
        'class Solution {\n    static class ListNode {\n        int val;\n        ListNode next;\n        ListNode(int val) { this.val = val; }\n    }\n\n    public static ListNode reverseList(ListNode head) {\n        // Your solution here\n        return null;\n    }\n\n    public static void main(String[] args) {\n        System.out.println("Implement and test your solution");\n    }\n}\n',
      cpp:
        '#include <iostream>\nusing namespace std;\n\nstruct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nclass Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Your solution here\n        return nullptr;\n    }\n};\n\nint main() {\n    cout << "Implement and test your solution" << endl;\n    return 0;\n}\n',
      go:
        'package main\n\nimport "fmt"\n\ntype ListNode struct {\n\tVal  int\n\tNext *ListNode\n}\n\nfunc reverseList(head *ListNode) *ListNode {\n\t// Your solution here\n\treturn nil\n}\n\nfunc main() {\n\tfmt.Println("Implement and test your solution")\n}\n',
      rust:
        'fn main() {\n    println!("Implement reverse linked list in Rust");\n    // Linked list problems in Rust require careful ownership handling.\n    // Consider using Option<Box<ListNode>> pattern.\n}\n',
    },
  },
  "valid-parentheses": {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "EASY",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
    examples:
      'Input: s = "()"\nOutput: true\n\nInput: s = "()[]{}"\nOutput: true\n\nInput: s = "(]"\nOutput: false\n\nInput: s = "([])"\nOutput: true',
    starterCode: {
      javascript:
        '/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n  // Your solution here\n}\n\nconsole.log(isValid("()"));     // true\nconsole.log(isValid("()[]{}"));  // true\nconsole.log(isValid("(]"));      // false\nconsole.log(isValid("([])"));    // true\n',
      python:
        'def is_valid(s):\n    """Check if brackets are balanced."""\n    # Your solution here\n    pass\n\nprint(is_valid("()"))      # True\nprint(is_valid("()[]{}"))  # True\nprint(is_valid("(]"))      # False\nprint(is_valid("([])"))    # True\n',
      typescript:
        'function isValid(s: string): boolean {\n  // Your solution here\n  return false;\n}\n\nconsole.log(isValid("()"));     // true\nconsole.log(isValid("()[]{}"));  // true\nconsole.log(isValid("(]"));      // false\n',
      java:
        'class Solution {\n    public static boolean isValid(String s) {\n        // Your solution here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(isValid("()"));      // true\n        System.out.println(isValid("()[]{}"));  // true\n        System.out.println(isValid("(]"));      // false\n    }\n}\n',
      cpp:
        '#include <iostream>\n#include <string>\n#include <stack>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Your solution here\n        return false;\n    }\n};\n\nint main() {\n    Solution sol;\n    cout << boolalpha;\n    cout << sol.isValid("()") << endl;      // true\n    cout << sol.isValid("()[]{}") << endl;  // true\n    cout << sol.isValid("(]") << endl;      // false\n    return 0;\n}\n',
      go:
        'package main\n\nimport "fmt"\n\nfunc isValid(s string) bool {\n\t// Your solution here\n\treturn false\n}\n\nfunc main() {\n\tfmt.Println(isValid("()"))      // true\n\tfmt.Println(isValid("()[]{}"))  // true\n\tfmt.Println(isValid("(]"))      // false\n}\n',
      rust:
        'fn is_valid(s: &str) -> bool {\n    // Your solution here\n    false\n}\n\nfn main() {\n    println!("{}", is_valid("()"));      // true\n    println!("{}", is_valid("()[]{}"));  // true\n    println!("{}", is_valid("(]"));      // false\n}\n',
    },
  },
  "merge-intervals": {
    id: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "MEDIUM",
    description:
      "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    constraints:
      "1 <= intervals.length <= 10^4\nintervals[i].length == 2\n0 <= starti <= endi <= 10^4",
    examples:
      "Input: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]\nExplanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].\n\nInput: intervals = [[1,4],[4,5]]\nOutput: [[1,5]]\nExplanation: Intervals [1,4] and [4,5] are considered overlapping.",
    starterCode: {
      javascript:
        "/**\n * @param {number[][]} intervals\n * @return {number[][]}\n */\nfunction merge(intervals) {\n  // Your solution here\n}\n\nconsole.log(merge([[1,3],[2,6],[8,10],[15,18]])); // [[1,6],[8,10],[15,18]]\nconsole.log(merge([[1,4],[4,5]]));                 // [[1,5]]\n",
      python:
        "def merge(intervals):\n    \"\"\"Merge overlapping intervals.\"\"\"\n    # Your solution here\n    pass\n\nprint(merge([[1,3],[2,6],[8,10],[15,18]]))  # [[1,6],[8,10],[15,18]]\nprint(merge([[1,4],[4,5]]))                  # [[1,5]]\n",
      typescript:
        "function merge(intervals: number[][]): number[][] {\n  // Your solution here\n  return [];\n}\n\nconsole.log(merge([[1,3],[2,6],[8,10],[15,18]]));\nconsole.log(merge([[1,4],[4,5]]));\n",
      java:
        'import java.util.*;\n\nclass Solution {\n    public static int[][] merge(int[][] intervals) {\n        // Your solution here\n        return new int[][]{};\n    }\n\n    public static void main(String[] args) {\n        int[][] result = merge(new int[][]{{1,3},{2,6},{8,10},{15,18}});\n        for (int[] interval : result) {\n            System.out.print(Arrays.toString(interval) + " ");\n        }\n        System.out.println();\n    }\n}\n',
      cpp:
        '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        // Your solution here\n        return {};\n    }\n};\n\nint main() {\n    Solution sol;\n    vector<vector<int>> intervals = {{1,3},{2,6},{8,10},{15,18}};\n    auto result = sol.merge(intervals);\n    for (auto& interval : result) {\n        cout << "[" << interval[0] << "," << interval[1] << "] ";\n    }\n    cout << endl;\n    return 0;\n}\n',
      go:
        'package main\n\nimport (\n\t"fmt"\n\t"sort"\n)\n\nfunc merge(intervals [][]int) [][]int {\n\t// Your solution here\n\tsort.Slice(intervals, func(i, j int) bool {\n\t\treturn intervals[i][0] < intervals[j][0]\n\t})\n\treturn nil\n}\n\nfunc main() {\n\tfmt.Println(merge([][]int{{1,3},{2,6},{8,10},{15,18}}))\n}\n',
      rust:
        'fn merge(mut intervals: Vec<Vec<i32>>) -> Vec<Vec<i32>> {\n    // Your solution here\n    intervals.sort_by_key(|a| a[0]);\n    vec![]\n}\n\nfn main() {\n    println!("{:?}", merge(vec![vec![1,3],vec![2,6],vec![8,10],vec![15,18]]));\n}\n',
    },
  },
  "lru-cache": {
    id: "lru-cache",
    title: "LRU Cache",
    difficulty: "MEDIUM",
    description:
      "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the LRUCache class:\n- LRUCache(int capacity) Initialize the LRU cache with positive size capacity.\n- int get(int key) Return the value of the key if the key exists, otherwise return -1.\n- void put(int key, int value) Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.\n\nThe functions get and put must each run in O(1) average time complexity.",
    constraints:
      "1 <= capacity <= 3000\n0 <= key <= 10^4\n0 <= value <= 10^5\nAt most 2 * 10^5 calls will be made to get and put.",
    examples:
      'Input:\n["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]\nOutput:\n[null, null, null, 1, null, -1, null, -1, 3, 4]\n\nExplanation:\nLRUCache lRUCache = new LRUCache(2);\nlRUCache.put(1, 1);\nlRUCache.put(2, 2);\nlRUCache.get(1);    // return 1\nlRUCache.put(3, 3); // evicts key 2\nlRUCache.get(2);    // returns -1 (not found)\nlRUCache.put(4, 4); // evicts key 1\nlRUCache.get(1);    // return -1 (not found)\nlRUCache.get(3);    // return 3\nlRUCache.get(4);    // return 4',
    starterCode: {
      javascript:
        "class LRUCache {\n  /**\n   * @param {number} capacity\n   */\n  constructor(capacity) {\n    // Your solution here\n  }\n\n  /**\n   * @param {number} key\n   * @return {number}\n   */\n  get(key) {\n    // Your solution here\n  }\n\n  /**\n   * @param {number} key\n   * @param {number} value\n   * @return {void}\n   */\n  put(key, value) {\n    // Your solution here\n  }\n}\n\n// Test\nconst cache = new LRUCache(2);\ncache.put(1, 1);\ncache.put(2, 2);\nconsole.log(cache.get(1));  // 1\ncache.put(3, 3);\nconsole.log(cache.get(2));  // -1\ncache.put(4, 4);\nconsole.log(cache.get(1));  // -1\nconsole.log(cache.get(3));  // 3\nconsole.log(cache.get(4));  // 4\n",
      python:
        'class LRUCache:\n    def __init__(self, capacity: int):\n        """Initialize the LRU cache."""\n        # Your solution here\n        pass\n\n    def get(self, key: int) -> int:\n        """Return value if key exists, else -1."""\n        # Your solution here\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        """Insert or update key-value pair."""\n        # Your solution here\n        pass\n\n# Test\ncache = LRUCache(2)\ncache.put(1, 1)\ncache.put(2, 2)\nprint(cache.get(1))  # 1\ncache.put(3, 3)\nprint(cache.get(2))  # -1\ncache.put(4, 4)\nprint(cache.get(1))  # -1\nprint(cache.get(3))  # 3\nprint(cache.get(4))  # 4\n',
      typescript:
        "class LRUCache {\n  private capacity: number;\n\n  constructor(capacity: number) {\n    this.capacity = capacity;\n    // Your solution here\n  }\n\n  get(key: number): number {\n    // Your solution here\n    return -1;\n  }\n\n  put(key: number, value: number): void {\n    // Your solution here\n  }\n}\n\nconst cache = new LRUCache(2);\ncache.put(1, 1);\ncache.put(2, 2);\nconsole.log(cache.get(1));  // 1\ncache.put(3, 3);\nconsole.log(cache.get(2));  // -1\n",
      java:
        'import java.util.*;\n\nclass LRUCache {\n    private int capacity;\n\n    public LRUCache(int capacity) {\n        this.capacity = capacity;\n        // Your solution here\n    }\n\n    public int get(int key) {\n        // Your solution here\n        return -1;\n    }\n\n    public void put(int key, int value) {\n        // Your solution here\n    }\n\n    public static void main(String[] args) {\n        LRUCache cache = new LRUCache(2);\n        cache.put(1, 1);\n        cache.put(2, 2);\n        System.out.println(cache.get(1));  // 1\n        cache.put(3, 3);\n        System.out.println(cache.get(2));  // -1\n    }\n}\n',
      cpp:
        '#include <iostream>\n#include <unordered_map>\n#include <list>\nusing namespace std;\n\nclass LRUCache {\npublic:\n    int capacity;\n\n    LRUCache(int capacity) : capacity(capacity) {\n        // Your solution here\n    }\n\n    int get(int key) {\n        // Your solution here\n        return -1;\n    }\n\n    void put(int key, int value) {\n        // Your solution here\n    }\n};\n\nint main() {\n    LRUCache cache(2);\n    cache.put(1, 1);\n    cache.put(2, 2);\n    cout << cache.get(1) << endl;  // 1\n    cache.put(3, 3);\n    cout << cache.get(2) << endl;  // -1\n    return 0;\n}\n',
      go:
        'package main\n\nimport "fmt"\n\ntype LRUCache struct {\n\tcapacity int\n\t// Your fields here\n}\n\nfunc Constructor(capacity int) LRUCache {\n\treturn LRUCache{capacity: capacity}\n}\n\nfunc (c *LRUCache) Get(key int) int {\n\t// Your solution here\n\treturn -1\n}\n\nfunc (c *LRUCache) Put(key int, value int) {\n\t// Your solution here\n}\n\nfunc main() {\n\tcache := Constructor(2)\n\tcache.Put(1, 1)\n\tcache.Put(2, 2)\n\tfmt.Println(cache.Get(1)) // 1\n\tcache.Put(3, 3)\n\tfmt.Println(cache.Get(2)) // -1\n}\n',
      rust:
        'use std::collections::HashMap;\n\nstruct LRUCache {\n    capacity: usize,\n    // Your fields here\n}\n\nimpl LRUCache {\n    fn new(capacity: i32) -> Self {\n        LRUCache {\n            capacity: capacity as usize,\n        }\n    }\n\n    fn get(&mut self, _key: i32) -> i32 {\n        // Your solution here\n        -1\n    }\n\n    fn put(&mut self, _key: i32, _value: i32) {\n        // Your solution here\n    }\n}\n\nfn main() {\n    let mut cache = LRUCache::new(2);\n    cache.put(1, 1);\n    cache.put(2, 2);\n    println!("{}", cache.get(1)); // 1\n    cache.put(3, 3);\n    println!("{}", cache.get(2)); // -1\n}\n',
    },
  },
  "binary-tree-level-order": {
    id: "binary-tree-level-order",
    title: "Binary Tree Level Order Traversal",
    difficulty: "MEDIUM",
    description:
      "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    constraints:
      "The number of nodes in the tree is in the range [0, 2000].\n-1000 <= Node.val <= 1000",
    examples:
      "Input: root = [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]\n\nInput: root = [1]\nOutput: [[1]]\n\nInput: root = []\nOutput: []",
    starterCode: {
      javascript:
        "class TreeNode {\n  constructor(val = 0, left = null, right = null) {\n    this.val = val;\n    this.left = left;\n    this.right = right;\n  }\n}\n\n/**\n * @param {TreeNode} root\n * @return {number[][]}\n */\nfunction levelOrder(root) {\n  // Your solution here\n}\n\n// Test\nconst root = new TreeNode(3,\n  new TreeNode(9),\n  new TreeNode(20, new TreeNode(15), new TreeNode(7))\n);\nconsole.log(levelOrder(root)); // [[3],[9,20],[15,7]]\nconsole.log(levelOrder(null));  // []\n",
      python:
        'class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef level_order(root):\n    """Return level order traversal of binary tree."""\n    # Your solution here\n    pass\n\n# Test\nroot = TreeNode(3,\n    TreeNode(9),\n    TreeNode(20, TreeNode(15), TreeNode(7))\n)\nprint(level_order(root))  # [[3],[9,20],[15,7]]\nprint(level_order(None))  # []\n',
      typescript:
        "class TreeNode {\n  val: number;\n  left: TreeNode | null;\n  right: TreeNode | null;\n  constructor(val: number = 0, left: TreeNode | null = null, right: TreeNode | null = null) {\n    this.val = val;\n    this.left = left;\n    this.right = right;\n  }\n}\n\nfunction levelOrder(root: TreeNode | null): number[][] {\n  // Your solution here\n  return [];\n}\n\nconst root = new TreeNode(3,\n  new TreeNode(9),\n  new TreeNode(20, new TreeNode(15), new TreeNode(7))\n);\nconsole.log(levelOrder(root));\n",
      java:
        'import java.util.*;\n\nclass Solution {\n    static class TreeNode {\n        int val;\n        TreeNode left, right;\n        TreeNode(int val) { this.val = val; }\n        TreeNode(int val, TreeNode left, TreeNode right) {\n            this.val = val; this.left = left; this.right = right;\n        }\n    }\n\n    public static List<List<Integer>> levelOrder(TreeNode root) {\n        // Your solution here\n        return new ArrayList<>();\n    }\n\n    public static void main(String[] args) {\n        TreeNode root = new TreeNode(3,\n            new TreeNode(9),\n            new TreeNode(20, new TreeNode(15), new TreeNode(7))\n        );\n        System.out.println(levelOrder(root));\n    }\n}\n',
      cpp:
        '#include <iostream>\n#include <vector>\n#include <queue>\nusing namespace std;\n\nstruct TreeNode {\n    int val;\n    TreeNode *left, *right;\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n    TreeNode(int x, TreeNode* l, TreeNode* r) : val(x), left(l), right(r) {}\n};\n\nclass Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        // Your solution here\n        return {};\n    }\n};\n\nint main() {\n    auto root = new TreeNode(3,\n        new TreeNode(9),\n        new TreeNode(20, new TreeNode(15), new TreeNode(7))\n    );\n    Solution sol;\n    auto result = sol.levelOrder(root);\n    for (auto& level : result) {\n        for (int v : level) cout << v << " ";\n        cout << endl;\n    }\n    return 0;\n}\n',
      go:
        'package main\n\nimport "fmt"\n\ntype TreeNode struct {\n\tVal   int\n\tLeft  *TreeNode\n\tRight *TreeNode\n}\n\nfunc levelOrder(root *TreeNode) [][]int {\n\t// Your solution here\n\treturn nil\n}\n\nfunc main() {\n\troot := &TreeNode{3,\n\t\t&TreeNode{9, nil, nil},\n\t\t&TreeNode{20, &TreeNode{15, nil, nil}, &TreeNode{7, nil, nil}},\n\t}\n\tfmt.Println(levelOrder(root))\n}\n',
      rust:
        'use std::collections::VecDeque;\nuse std::rc::Rc;\nuse std::cell::RefCell;\n\n#[derive(Debug)]\nstruct TreeNode {\n    val: i32,\n    left: Option<Rc<RefCell<TreeNode>>>,\n    right: Option<Rc<RefCell<TreeNode>>>,\n}\n\nimpl TreeNode {\n    fn new(val: i32) -> Self {\n        TreeNode { val, left: None, right: None }\n    }\n}\n\nfn level_order(root: Option<Rc<RefCell<TreeNode>>>) -> Vec<Vec<i32>> {\n    // Your solution here\n    vec![]\n}\n\nfn main() {\n    println!("{:?}", level_order(None));\n}\n',
    },
  },
};

// ─── Constants ──────────────────────────────────────────────────────────────────

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const aiLevelLabels: Record<number, { label: string; color: string }> = {
  0: { label: "L0 No AI", color: "text-red-400" },
  1: { label: "L1 Hint", color: "text-yellow-400" },
  2: { label: "L2 Scaffold", color: "text-blue-400" },
  3: { label: "L3 Guide", color: "text-purple-400" },
  4: { label: "L4 Copilot", color: "text-green-400" },
};

const difficultyColors: Record<string, string> = {
  EASY: "text-green-400",
  MEDIUM: "text-yellow-400",
  HARD: "text-red-400",
};

// ─── Component ──────────────────────────────────────────────────────────────────

export default function PracticeProblemPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const problemId = params.problemId as string;

  const problem = PRACTICE_PROBLEMS[problemId];

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [aiLevel, setAiLevel] = useState(2);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    { role: "user" | "assistant"; content: string; timestamp: string }[]
  >([]);
  const [executing, setExecuting] = useState(false);
  const [execOutput, setExecOutput] = useState<{
    output: string;
    error: string;
    exitCode: number;
  } | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const aiChatRef = useRef<HTMLDivElement>(null);

  // Initialize from URL params and problem starter code
  useEffect(() => {
    const levelParam = searchParams.get("aiLevel");
    if (levelParam) {
      const parsed = parseInt(levelParam, 10);
      if (parsed >= 0 && parsed <= 4) setAiLevel(parsed);
    }
  }, [searchParams]);

  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode[language] || "// Start coding here...\n");
    }
  }, [problem, language]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll AI chat to bottom
  useEffect(() => {
    if (aiChatRef.current) {
      aiChatRef.current.scrollTop = aiChatRef.current.scrollHeight;
    }
  }, [aiMessages]);

  function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Run code
  const handleRunCode = useCallback(async () => {
    if (executing) return;
    setExecuting(true);
    setShowOutput(true);
    setExecOutput(null);

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });
      const data = await res.json();
      setExecOutput({
        output: data.output || "",
        error: data.error || "",
        exitCode: data.exitCode ?? 1,
      });
    } catch {
      setExecOutput({
        output: "",
        error: "Failed to connect to execution service.",
        exitCode: 1,
      });
    } finally {
      setExecuting(false);
    }
  }, [language, code, executing]);

  // Handle AI prompt submission
  async function handleAiSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!aiPrompt.trim() || aiLoading) return;

    if (aiLevel === 0) return;

    const userMessage = {
      role: "user" as const,
      content: aiPrompt,
      timestamp: new Date().toISOString(),
    };
    setAiMessages((prev) => [...prev, userMessage]);
    setAiPrompt("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/sessions/practice-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          code,
          questionContext: problem
            ? `${problem.title}\n\n${problem.description}\n\nConstraints:\n${problem.constraints}\n\nExamples:\n${problem.examples}`
            : "",
          aiLevel,
        }),
      });

      const data = await res.json();

      const assistantMessage = {
        role: "assistant" as const,
        content: data.response || "No response generated.",
        timestamp: new Date().toISOString(),
      };
      setAiMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage = {
        role: "assistant" as const,
        content: "Error: Failed to get AI response. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setAiMessages((prev) => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  }

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleRunCode();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRunCode]);

  // 404 for unknown problem
  if (!problem) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Problem Not Found</h2>
          <p className="text-gray-400 mb-6">
            The practice problem &quot;{problemId}&quot; does not exist.
          </p>
          <Link
            href="/practice"
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
          >
            Back to Practice
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-950 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/practice" className="text-sm text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Practice
          </Link>
          <span className="text-xs text-gray-600">|</span>
          <span className="text-sm font-semibold text-white">{problem.title}</span>
          <span className={`text-xs font-medium ${difficultyColors[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300 focus:border-purple-500 focus:outline-none"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* AI Level Selector */}
          <select
            value={aiLevel}
            onChange={(e) => setAiLevel(parseInt(e.target.value, 10))}
            className={`rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs focus:border-purple-500 focus:outline-none ${
              aiLevelLabels[aiLevel]?.color || "text-gray-300"
            }`}
          >
            {[0, 1, 2, 3, 4].map((level) => (
              <option key={level} value={level}>
                {aiLevelLabels[level].label}
              </option>
            ))}
          </select>

          {/* Timer */}
          <div className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-mono text-gray-300">
              {formatTime(elapsedTime)}
            </span>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunCode}
            disabled={executing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
          >
            {executing ? (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            {executing ? "Running..." : "Run"}
            <span className="text-green-300 text-[10px]">Ctrl+Enter</span>
          </button>
        </div>
      </div>

      {/* Main Content: 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Question */}
        <div className="w-80 shrink-0 overflow-y-auto border-r border-gray-800 bg-gray-900/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-medium ${difficultyColors[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
            <span className="rounded bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 text-xs text-purple-400">
              Practice
            </span>
          </div>

          <h2 className="text-lg font-bold text-white mb-4">{problem.title}</h2>

          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <p className="whitespace-pre-wrap leading-relaxed">{problem.description}</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Constraints
              </h4>
              <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-800 rounded-lg p-3 text-gray-300">
                {problem.constraints}
              </pre>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Examples
              </h4>
              <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-800 rounded-lg p-3 text-gray-300">
                {problem.examples}
              </pre>
            </div>
          </div>
        </div>

        {/* Center: Code Editor + Output */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`flex-1 ${showOutput ? "" : ""}`}>
            <Editor
              height={showOutput ? "60%" : "100%"}
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "var(--font-geist-mono), monospace",
                minimap: { enabled: false },
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                renderLineHighlight: "all",
                lineNumbers: "on",
                tabSize: 2,
                wordWrap: "on",
                automaticLayout: true,
              }}
            />

            {/* Output Panel */}
            {showOutput && (
              <div className="h-[40%] border-t border-gray-800 bg-gray-900 flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400">Output</span>
                    {execOutput && (
                      <span
                        className={`text-xs font-medium ${
                          execOutput.exitCode === 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {execOutput.exitCode === 0 ? "Success" : "Error"}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowOutput(false)}
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {executing ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm">Executing code...</span>
                    </div>
                  ) : execOutput ? (
                    <div className="space-y-2">
                      {execOutput.output && (
                        <pre className="whitespace-pre-wrap font-mono text-sm text-green-300">
                          {execOutput.output}
                        </pre>
                      )}
                      {execOutput.error && (
                        <pre className="whitespace-pre-wrap font-mono text-sm text-red-400">
                          {execOutput.error}
                        </pre>
                      )}
                      {!execOutput.output && !execOutput.error && (
                        <p className="text-sm text-gray-500">No output.</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Run your code to see output here.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: AI Sidebar */}
        <div className="w-80 shrink-0 flex flex-col border-l border-gray-800 bg-gray-900/50">
          <div className="border-b border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
              <span
                className={`text-xs font-medium ${
                  aiLevelLabels[aiLevel]?.color || "text-gray-400"
                }`}
              >
                {aiLevelLabels[aiLevel]?.label}
              </span>
            </div>
            {aiLevel === 0 && (
              <p className="text-xs text-red-400 mt-1">
                AI assistance is disabled. Change the level above to enable it.
              </p>
            )}
          </div>

          {/* Chat Messages */}
          <div
            ref={aiChatRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {aiMessages.length === 0 && aiLevel > 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="mt-2 text-xs text-gray-500">
                  Ask the AI for help with your solution.
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Assistance is tailored to your selected level.
                </p>
              </div>
            )}

            {aiMessages.length === 0 && aiLevel === 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-10 w-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <p className="mt-2 text-xs text-gray-600">
                  AI is off. Select a higher level to get help.
                </p>
              </div>
            )}

            {aiMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-purple-600/20 text-purple-200 border border-purple-500/30"
                      : "bg-gray-800 text-gray-300 border border-gray-700"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="block mt-1 text-[10px] text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}

            {aiLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleAiSubmit} className="border-t border-gray-800 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={aiLevel === 0}
                placeholder={
                  aiLevel === 0
                    ? "AI disabled -- change level above"
                    : "Ask the AI for help..."
                }
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={aiLevel === 0 || aiLoading || !aiPrompt.trim()}
                className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
