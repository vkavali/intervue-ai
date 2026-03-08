"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import Link from "next/link";
import { PROBLEM_BANK } from "@/data/problem-bank";

// ─── Practice problem data ──────────────────────────────────────────────────────

interface TestCase {
  input: string;
  expected: string;
}

interface PracticeProblem {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  constraints: string;
  examples: string;
  starterCode: Record<string, string>;
  testCases?: TestCase[];
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
    testCases: [
      { input: "twoSum([2, 7, 11, 15], 9)", expected: "[0,1]" },
      { input: "twoSum([3, 2, 4], 6)", expected: "[1,2]" },
      { input: "twoSum([3, 3], 6)", expected: "[0,1]" },
      { input: "twoSum([-1, -2, -3, -4, -5], -8)", expected: "[2,4]" },
      { input: "twoSum([0, 4, 3, 0], 0)", expected: "[0,3]" },
    ],
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
    testCases: [
      { input: "toArray(reverseList(fromArray([1,2,3,4,5])))", expected: "[5,4,3,2,1]" },
      { input: "toArray(reverseList(fromArray([1,2])))", expected: "[2,1]" },
      { input: "toArray(reverseList(fromArray([])))", expected: "[]" },
      { input: "toArray(reverseList(fromArray([1])))", expected: "[1]" },
    ],
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
    testCases: [
      { input: 'isValid("()")', expected: "true" },
      { input: 'isValid("()[]{}")', expected: "true" },
      { input: 'isValid("(]")', expected: "false" },
      { input: 'isValid("([])")', expected: "true" },
      { input: 'isValid("")', expected: "true" },
      { input: 'isValid("{{[()]}}")', expected: "true" },
      { input: 'isValid("((")', expected: "false" },
    ],
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
    testCases: [
      { input: "merge([[1,3],[2,6],[8,10],[15,18]])", expected: "[[1,6],[8,10],[15,18]]" },
      { input: "merge([[1,4],[4,5]])", expected: "[[1,5]]" },
      { input: "merge([[1,4],[2,3]])", expected: "[[1,4]]" },
      { input: "merge([[1,3]])", expected: "[[1,3]]" },
      { input: "merge([[1,4],[0,4]])", expected: "[[0,4]]" },
    ],
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
    testCases: [
      { input: "(function() { const c = new LRUCache(2); c.put(1,1); c.put(2,2); return c.get(1); })()", expected: "1" },
      { input: "(function() { const c = new LRUCache(2); c.put(1,1); c.put(2,2); c.put(3,3); return c.get(2); })()", expected: "-1" },
      { input: "(function() { const c = new LRUCache(2); c.put(1,1); c.put(2,2); c.get(1); c.put(3,3); return c.get(2); })()", expected: "-1" },
      { input: "(function() { const c = new LRUCache(2); c.put(1,1); c.put(2,2); c.put(3,3); c.put(4,4); return c.get(3); })()", expected: "3" },
      { input: "(function() { const c = new LRUCache(2); c.put(1,1); c.put(2,2); c.put(3,3); c.put(4,4); return c.get(4); })()", expected: "4" },
    ],
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
    testCases: [
      { input: "levelOrder(new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7))))", expected: "[[3],[9,20],[15,7]]" },
      { input: "levelOrder(new TreeNode(1))", expected: "[[1]]" },
      { input: "levelOrder(null)", expected: "[]" },
      { input: "levelOrder(new TreeNode(1, new TreeNode(2, new TreeNode(4), null), new TreeNode(3, null, new TreeNode(5))))", expected: "[[1],[2,3],[4,5]]" },
    ],
  },
  "rate-limiter": {
    id: "rate-limiter",
    title: "Request Rate Limiter",
    difficulty: "MEDIUM",
    description:
      "Design a rate limiter that allows at most N requests per time window of W seconds for each unique client ID. Implement allow(clientId, timestamp) that returns true if the request should be permitted, false if it exceeds the rate limit. Handle multiple clients independently.",
    constraints:
      "1 <= N <= 1000 (max requests per window)\n1 <= W <= 3600 (window in seconds)\nTimestamps are given in ascending order\nClient IDs are strings",
    examples:
      "RateLimiter(maxRequests=3, windowSeconds=10)\n\nallow('user1', 1)  => true  (1st request)\nallow('user1', 2)  => true  (2nd request)\nallow('user1', 3)  => true  (3rd request)\nallow('user1', 4)  => false (exceeded limit in window)\nallow('user2', 4)  => true  (different client)\nallow('user1', 12) => true  (window expired, reset)",
    starterCode: {
      javascript:
        "class RateLimiter {\n  constructor(maxRequests, windowSeconds) {\n    this.maxRequests = maxRequests;\n    this.windowSeconds = windowSeconds;\n    // Your data structures here\n  }\n\n  /**\n   * @param {string} clientId\n   * @param {number} timestamp - in seconds\n   * @return {boolean}\n   */\n  allow(clientId, timestamp) {\n    // Your solution here\n  }\n}\n\n// Test\nconst limiter = new RateLimiter(3, 10);\nconsole.log(limiter.allow('user1', 1));   // true\nconsole.log(limiter.allow('user1', 2));   // true\nconsole.log(limiter.allow('user1', 3));   // true\nconsole.log(limiter.allow('user1', 4));   // false\nconsole.log(limiter.allow('user2', 4));   // true\nconsole.log(limiter.allow('user1', 12));  // true\n",
      python:
        "class RateLimiter:\n    def __init__(self, max_requests, window_seconds):\n        self.max_requests = max_requests\n        self.window_seconds = window_seconds\n        # Your data structures here\n\n    def allow(self, client_id, timestamp):\n        \"\"\"Return True if request is allowed, False if rate limited.\"\"\"\n        # Your solution here\n        pass\n\n# Test\nlimiter = RateLimiter(3, 10)\nprint(limiter.allow('user1', 1))   # True\nprint(limiter.allow('user1', 2))   # True\nprint(limiter.allow('user1', 3))   # True\nprint(limiter.allow('user1', 4))   # False\nprint(limiter.allow('user2', 4))   # True\nprint(limiter.allow('user1', 12))  # True\n",
    },
    testCases: [
      { input: "(function() { const l = new RateLimiter(3, 10); return l.allow('u1', 1); })()", expected: "true" },
      { input: "(function() { const l = new RateLimiter(3, 10); l.allow('u1', 1); l.allow('u1', 2); l.allow('u1', 3); return l.allow('u1', 4); })()", expected: "false" },
      { input: "(function() { const l = new RateLimiter(3, 10); l.allow('u1', 1); l.allow('u1', 2); l.allow('u1', 3); return l.allow('u2', 4); })()", expected: "true" },
      { input: "(function() { const l = new RateLimiter(3, 10); l.allow('u1', 1); l.allow('u1', 2); l.allow('u1', 3); l.allow('u1', 4); return l.allow('u1', 12); })()", expected: "true" },
      { input: "(function() { const l = new RateLimiter(1, 5); l.allow('a', 1); return l.allow('a', 2); })()", expected: "false" },
    ],
  },
  "flatten-nested-data": {
    id: "flatten-nested-data",
    title: "Nested Data Flattener",
    difficulty: "EASY",
    description:
      "Given a deeply nested data structure (arrays within arrays, to any depth), produce a single flat array containing all the values in order. For example, [1, [2, [3, 4], 5], 6] becomes [1, 2, 3, 4, 5, 6]. Do not use any built-in flatten methods.",
    constraints:
      "Input can be nested to any depth\nValues are integers\nEmpty arrays should be skipped\nDo not use Array.flat() or similar built-ins",
    examples:
      "Input: [1, [2, [3, 4], 5], 6]\nOutput: [1, 2, 3, 4, 5, 6]\n\nInput: [[1, 2], [3, [4, [5]]]]\nOutput: [1, 2, 3, 4, 5]\n\nInput: [1, [], [2, []], 3]\nOutput: [1, 2, 3]",
    starterCode: {
      javascript:
        "/**\n * Flatten a deeply nested array without using Array.flat()\n * @param {any[]} arr\n * @return {number[]}\n */\nfunction flatten(arr) {\n  // Your solution here\n}\n\n// Test\nconsole.log(flatten([1, [2, [3, 4], 5], 6]));  // [1, 2, 3, 4, 5, 6]\nconsole.log(flatten([[1, 2], [3, [4, [5]]]]));  // [1, 2, 3, 4, 5]\nconsole.log(flatten([1, [], [2, []], 3]));       // [1, 2, 3]\nconsole.log(flatten([]));                         // []\n",
      python:
        "def flatten(arr):\n    \"\"\"Flatten a deeply nested list into a single list.\"\"\"\n    # Your solution here\n    pass\n\n# Test\nprint(flatten([1, [2, [3, 4], 5], 6]))   # [1, 2, 3, 4, 5, 6]\nprint(flatten([[1, 2], [3, [4, [5]]]]))  # [1, 2, 3, 4, 5]\nprint(flatten([1, [], [2, []], 3]))       # [1, 2, 3]\nprint(flatten([]))                         # []\n",
    },
    testCases: [
      { input: "flatten([1, [2, [3, 4], 5], 6])", expected: "[1,2,3,4,5,6]" },
      { input: "flatten([[1, 2], [3, [4, [5]]]])", expected: "[1,2,3,4,5]" },
      { input: "flatten([])", expected: "[]" },
      { input: "flatten([1, [], [2, []], 3])", expected: "[1,2,3]" },
      { input: "flatten([[[1]]])", expected: "[1]" },
    ],
  },
  "event-emitter": {
    id: "event-emitter",
    title: "Event System",
    difficulty: "MEDIUM",
    description:
      "Implement a publish-subscribe event system with three methods: on(eventName, callback) to register a listener, off(eventName, callback) to remove a specific listener, and emit(eventName, ...args) to trigger all listeners for that event with the given arguments. Support multiple listeners per event.",
    constraints:
      "Event names are strings\nCallbacks are functions\noff() should only remove the specific callback, not all listeners\nemit() should call listeners in the order they were registered\nCalling off() with an unregistered callback should be a no-op",
    examples:
      "const emitter = new EventEmitter();\nconst fn = (x) => console.log('got:', x);\nemitter.on('data', fn);\nemitter.emit('data', 42);  // prints 'got: 42'\nemitter.off('data', fn);\nemitter.emit('data', 42);  // nothing printed",
    starterCode: {
      javascript:
        "class EventEmitter {\n  constructor() {\n    // Your data structures here\n  }\n\n  /**\n   * Register a listener for an event\n   * @param {string} event\n   * @param {Function} callback\n   */\n  on(event, callback) {\n    // Your solution here\n  }\n\n  /**\n   * Remove a specific listener\n   * @param {string} event\n   * @param {Function} callback\n   */\n  off(event, callback) {\n    // Your solution here\n  }\n\n  /**\n   * Trigger all listeners for an event\n   * @param {string} event\n   * @param {...any} args\n   */\n  emit(event, ...args) {\n    // Your solution here\n  }\n}\n\n// Test\nconst emitter = new EventEmitter();\nconst log1 = (x) => console.log('Listener 1:', x);\nconst log2 = (x) => console.log('Listener 2:', x);\n\nemitter.on('test', log1);\nemitter.on('test', log2);\nconsole.log('--- Emit with both ---');\nemitter.emit('test', 'hello');\n\nemitter.off('test', log1);\nconsole.log('--- Emit after removing log1 ---');\nemitter.emit('test', 'world');\n",
      python:
        "class EventEmitter:\n    def __init__(self):\n        # Your data structures here\n        pass\n\n    def on(self, event, callback):\n        \"\"\"Register a listener.\"\"\"\n        # Your solution here\n        pass\n\n    def off(self, event, callback):\n        \"\"\"Remove a specific listener.\"\"\"\n        # Your solution here\n        pass\n\n    def emit(self, event, *args):\n        \"\"\"Trigger all listeners for an event.\"\"\"\n        # Your solution here\n        pass\n\n# Test\nemitter = EventEmitter()\nlog1 = lambda x: print(f'Listener 1: {x}')\nlog2 = lambda x: print(f'Listener 2: {x}')\n\nemitter.on('test', log1)\nemitter.on('test', log2)\nprint('--- Emit with both ---')\nemitter.emit('test', 'hello')\n\nemitter.off('test', log1)\nprint('--- Emit after removing log1 ---')\nemitter.emit('test', 'world')\n",
    },
    testCases: [
      { input: "(function() { const e = new EventEmitter(); let r = []; e.on('a', x => r.push(x)); e.emit('a', 1); e.emit('a', 2); return r; })()", expected: "[1,2]" },
      { input: "(function() { const e = new EventEmitter(); let r = []; const fn = x => r.push(x); e.on('a', fn); e.off('a', fn); e.emit('a', 1); return r; })()", expected: "[]" },
      { input: "(function() { const e = new EventEmitter(); let r = []; e.on('a', x => r.push('a'+x)); e.on('b', x => r.push('b'+x)); e.emit('a', 1); e.emit('b', 2); return r; })()", expected: "[\"a1\",\"b2\"]" },
      { input: "(function() { const e = new EventEmitter(); let r = []; e.on('a', x => r.push(x)); e.on('a', x => r.push(x*10)); e.emit('a', 5); return r; })()", expected: "[5,50]" },
    ],
  },
  "debounce-throttle": {
    id: "debounce-throttle",
    title: "Call Frequency Controller",
    difficulty: "MEDIUM",
    description:
      "Implement two utility functions:\n\n1. debounce(fn, delay) - Returns a wrapper that delays calling fn until no invocations happen for 'delay' ms. If called again before delay expires, the timer resets.\n\n2. throttle(fn, interval) - Returns a wrapper that ensures fn is called at most once per 'interval' ms. Additional calls during the interval are ignored.",
    constraints:
      "delay and interval are positive integers in milliseconds\nWrapper functions should pass through all arguments to fn\ndebounce should reset the timer on each call\nthrottle should call fn immediately on first invocation",
    examples:
      "// Debounce: typing in search box\nconst search = debounce(query => fetch('/search?q=' + query), 300);\nsearch('h'); search('he'); search('hel');\n// Only 'hel' query fires after 300ms\n\n// Throttle: scroll handler\nconst onScroll = throttle(() => updatePosition(), 100);\n// Called at most once per 100ms during scrolling",
    starterCode: {
      javascript:
        "/**\n * Debounce: delay fn until no calls for `delay` ms\n * @param {Function} fn\n * @param {number} delay\n * @return {Function}\n */\nfunction debounce(fn, delay) {\n  // Your solution here\n}\n\n/**\n * Throttle: call fn at most once per `interval` ms\n * @param {Function} fn\n * @param {number} interval\n * @return {Function}\n */\nfunction throttle(fn, interval) {\n  // Your solution here\n}\n\n// Test debounce\nlet debounceCount = 0;\nconst debouncedFn = debounce((val) => {\n  debounceCount++;\n  console.log(`Debounced call #${debounceCount}: ${val}`);\n}, 100);\n\ndebouncedFn('a');\ndebouncedFn('b');\ndebouncedFn('c');\nsetTimeout(() => {\n  console.log(`Debounce fired ${debounceCount} time(s)`);\n\n  // Test throttle\n  let throttleCount = 0;\n  const throttledFn = throttle((val) => {\n    throttleCount++;\n    console.log(`Throttled call #${throttleCount}: ${val}`);\n  }, 100);\n\n  throttledFn('x');\n  throttledFn('y');\n  throttledFn('z');\n  setTimeout(() => {\n    console.log(`Throttle fired ${throttleCount} time(s)`);\n  }, 200);\n}, 200);\n",
      python:
        "import time\nimport threading\n\ndef debounce(fn, delay_seconds):\n    \"\"\"Delay fn until no calls for delay_seconds.\"\"\"\n    # Your solution here\n    # Hint: use threading.Timer\n    pass\n\ndef throttle(fn, interval_seconds):\n    \"\"\"Call fn at most once per interval_seconds.\"\"\"\n    # Your solution here\n    pass\n\n# Simple synchronous test\nprint('Debounce and throttle are timing-based.')\nprint('Implement and test with actual delays.')\nprint('Consider using threading.Timer for debounce.')\n",
    },
    testCases: [
      { input: "(function() { return typeof debounce(() => {}, 100); })()", expected: "\"function\"" },
      { input: "(function() { return typeof throttle(() => {}, 100); })()", expected: "\"function\"" },
      { input: "(function() { let c = 0; const t = throttle(() => c++, 100); t(); return c; })()", expected: "1" },
      { input: "(function() { let c = 0; const t = throttle(() => c++, 100); t(); t(); t(); return c; })()", expected: "1" },
    ],
  },
  "string-compressor": {
    id: "string-compressor",
    title: "Text Compressor",
    difficulty: "EASY",
    description:
      "Implement basic string compression using counts of repeated consecutive characters. For example, 'aabcccccaaa' becomes 'a2b1c5a3'. If the compressed string is not shorter than the original, return the original string. Handle edge cases like empty strings and single characters.",
    constraints:
      "Input consists of uppercase and/or lowercase letters only\nReturn original if compressed version isn't shorter\nEmpty string returns empty string\nSingle character returns original character",
    examples:
      "Input: 'aabcccccaaa'\nOutput: 'a2b1c5a3'\n\nInput: 'abc'\nOutput: 'abc' (compressed 'a1b1c1' is longer)\n\nInput: 'aaa'\nOutput: 'a3'\n\nInput: ''\nOutput: ''",
    starterCode: {
      javascript:
        "/**\n * Compress a string using character counts\n * @param {string} str\n * @return {string}\n */\nfunction compress(str) {\n  // Your solution here\n}\n\n// Test\nconsole.log(compress('aabcccccaaa'));  // 'a2b1c5a3'\nconsole.log(compress('abc'));          // 'abc'\nconsole.log(compress('aaa'));          // 'a3'\nconsole.log(compress(''));             // ''\nconsole.log(compress('a'));            // 'a'\nconsole.log(compress('aabb'));         // 'aabb' (same length)\n",
      python:
        "def compress(s):\n    \"\"\"Compress string using consecutive character counts.\"\"\"\n    # Your solution here\n    pass\n\n# Test\nprint(compress('aabcccccaaa'))  # 'a2b1c5a3'\nprint(compress('abc'))          # 'abc'\nprint(compress('aaa'))          # 'a3'\nprint(compress(''))             # ''\nprint(compress('a'))            # 'a'\nprint(compress('aabb'))         # 'aabb'\n",
    },
    testCases: [
      { input: "compress('aabcccccaaa')", expected: "\"a2b1c5a3\"" },
      { input: "compress('abc')", expected: "\"abc\"" },
      { input: "compress('')", expected: "\"\"" },
      { input: "compress('aaa')", expected: "\"a3\"" },
      { input: "compress('a')", expected: "\"a\"" },
      { input: "compress('aabb')", expected: "\"aabb\"" },
    ],
  },
  "task-scheduler": {
    id: "task-scheduler",
    title: "Task Queue Scheduler",
    difficulty: "HARD",
    description:
      "Design a task scheduler that processes tasks with cooldown constraints. Each task has a type (letter), and the same task type must wait at least N time units before running again. Given a list of tasks and cooldown N, find the minimum time units needed to execute all tasks. Idle slots must be inserted when no eligible task is available.",
    constraints:
      "1 <= tasks.length <= 10000\nTasks are uppercase letters A-Z\n0 <= cooldown <= 100\nTasks can be executed in any order\nEach task takes exactly 1 time unit",
    examples:
      "Input: tasks = ['A','A','A','B','B','B'], cooldown = 2\nOutput: 8\nExplanation: A -> B -> idle -> A -> B -> idle -> A -> B\n\nInput: tasks = ['A','A','A','B','B','B'], cooldown = 0\nOutput: 6\nExplanation: No cooldown needed, just run all 6 tasks\n\nInput: tasks = ['A','A','A','A','B','B'], cooldown = 1\nOutput: 7\nExplanation: A -> B -> A -> B -> A -> idle -> A",
    starterCode: {
      javascript:
        "/**\n * Find minimum time units to execute all tasks with cooldown\n * @param {string[]} tasks\n * @param {number} cooldown\n * @return {number}\n */\nfunction scheduleTasks(tasks, cooldown) {\n  // Your solution here\n}\n\n// Test\nconsole.log(scheduleTasks(['A','A','A','B','B','B'], 2));  // 8\nconsole.log(scheduleTasks(['A','A','A','B','B','B'], 0));  // 6\nconsole.log(scheduleTasks(['A','A','A','A','B','B'], 1));  // 7\nconsole.log(scheduleTasks(['A'], 2));                       // 1\n",
      python:
        "def schedule_tasks(tasks, cooldown):\n    \"\"\"Find minimum time units to execute all tasks.\"\"\"\n    # Your solution here\n    pass\n\n# Test\nprint(schedule_tasks(['A','A','A','B','B','B'], 2))  # 8\nprint(schedule_tasks(['A','A','A','B','B','B'], 0))  # 6\nprint(schedule_tasks(['A','A','A','A','B','B'], 1))  # 7\nprint(schedule_tasks(['A'], 2))                       # 1\n",
    },
    testCases: [
      { input: "scheduleTasks(['A','A','A','B','B','B'], 2)", expected: "8" },
      { input: "scheduleTasks(['A','A','A','B','B','B'], 0)", expected: "6" },
      { input: "scheduleTasks(['A'], 2)", expected: "1" },
      { input: "scheduleTasks(['A','A','A','A','B','B'], 1)", expected: "7" },
    ],
  },
};

// ─── Constants ──────────────────────────────────────────────────────────────────

const languages = [
  { value: "javascript", label: "JavaScript", runnable: true },
  { value: "typescript", label: "TypeScript", runnable: true },
  { value: "python", label: "Python", runnable: true },
  { value: "java", label: "Java", runnable: true },
  { value: "cpp", label: "C++", runnable: false },
  { value: "go", label: "Go", runnable: false },
  { value: "rust", label: "Rust", runnable: false },
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

  const hardcodedProblem = PRACTICE_PROBLEMS[problemId];
  const bankProblem = !hardcodedProblem ? PROBLEM_BANK.find((p) => p.id === problemId) : null;

  // Build unified problem object - bank problems use description directly, no AI enrichment
  const problem: PracticeProblem | null = useMemo(() => {
    if (hardcodedProblem) return hardcodedProblem;
    if (!bankProblem) return null;
    const fnName = bankProblem.title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("");
    const pyName = bankProblem.title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .map((w) => w.toLowerCase())
      .join("_");
    const className = bankProblem.title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("");
    return {
      id: bankProblem.id,
      title: bankProblem.title,
      difficulty: bankProblem.difficulty,
      description: bankProblem.description,
      constraints: bankProblem.constraints || "",
      examples: bankProblem.examples || "",
      starterCode: bankProblem.starterCode || {
        javascript: `/**\n * ${bankProblem.title}\n * ${bankProblem.description.slice(0, 80)}...\n */\nfunction ${fnName}() {\n  // Your solution here\n}\n\n// Test\nconsole.log(${fnName}());\n`,
        python: `def ${pyName}():\n    """${bankProblem.title}"""\n    # Your solution here\n    pass\n\n# Test\nprint(${pyName}())\n`,
        typescript: `function ${fnName}(): void {\n  // Your solution here\n}\n\n// Test\nconsole.log(${fnName}());\n`,
        java: `class ${className} {\n    public static void solve() {\n        // Your solution here\n    }\n\n    public static void main(String[] args) {\n        solve();\n    }\n}\n`,
      },
    };
  }, [hardcodedProblem, bankProblem]);

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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [testResults, setTestResults] = useState<{ input: string; expected: string; actual: string; passed: boolean }[] | null>(null);
  const [runningTests, setRunningTests] = useState(false);
  const [bottomTab, setBottomTab] = useState<"testcases" | "results" | "console">("testcases");
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
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

  // Auto-save progress every 30 seconds
  const lastSavedCode = useRef(code);
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (code !== lastSavedCode.current && code.trim()) {
        lastSavedCode.current = code;
        fetch("/api/practice/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bankProblemId: problemId,
            code,
            language,
            status: "IN_PROGRESS",
            timeSpentSeconds: elapsedTime,
          }),
        }).catch(() => {}); // Silently fail for non-authenticated users
      }
    }, 30000);
    return () => clearInterval(saveInterval);
  }, [code, language, problemId, elapsedTime]);

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
    setBottomTab("console");
    setBottomPanelOpen(true);
    setExecOutput(null);

    try {
      // For JavaScript/TypeScript, execute client-side in Web Worker
      if (language === "javascript" || language === "typescript") {
        const { runJavaScriptInWorker } = await import("@/lib/code-runner");
        const result = await runJavaScriptInWorker(code);
        setExecOutput(result);
        return;
      }

      // Check if language is runnable
      const langInfo = languages.find(l => l.value === language);
      if (!langInfo?.runnable) {
        setExecOutput({
          output: "",
          error: `${langInfo?.label || language} code execution is not available in practice mode.\n\nOnly JavaScript and TypeScript can run in the browser.\nSelect JavaScript or TypeScript to execute your code, or use the AI assistant to review your ${langInfo?.label || language} solution.`,
          exitCode: 1,
        });
        return;
      }

      // For other runnable languages, try server-side execution
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });
      const data = await res.json();
      if (data.error === "USE_CLIENT_EXECUTION") {
        const { runJavaScriptInWorker } = await import("@/lib/code-runner");
        const result = await runJavaScriptInWorker(code);
        setExecOutput(result);
      } else if (data.error && data.error.includes("No code execution service")) {
        // Friendly message for practice mode
        setExecOutput({
          output: "",
          error: `${language.charAt(0).toUpperCase() + language.slice(1)} execution requires a server-side runtime.\n\nIn practice mode, JavaScript and TypeScript run directly in your browser.\nFor other languages, switch to JavaScript/TypeScript or use the AI assistant to verify your logic.`,
          exitCode: 1,
        });
      } else {
        setExecOutput({
          output: data.output || "",
          error: data.error || "",
          exitCode: data.exitCode ?? 1,
        });
      }
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

  // Run test cases
  const handleRunTests = useCallback(async () => {
    if (runningTests || !problem?.testCases?.length) return;
    setBottomTab("results");
    setBottomPanelOpen(true);
    if (language !== "javascript" && language !== "typescript") {
      setTestResults([{
        input: "--",
        expected: "--",
        actual: "Test cases only run with JavaScript/TypeScript in the browser.",
        passed: false,
      }]);
      return;
    }

    setRunningTests(true);
    const results: { input: string; expected: string; actual: string; passed: boolean }[] = [];

    for (const tc of problem.testCases) {
      try {
        const testCode = `${code}\nconsole.log(JSON.stringify(${tc.input}));`;
        const { runJavaScriptInWorker } = await import("@/lib/code-runner");
        const result = await runJavaScriptInWorker(testCode);
        const actual = (result.output || "").trim();
        const expected = tc.expected.trim();
        const passed = actual === expected || actual === JSON.stringify(JSON.parse(expected));
        results.push({ input: tc.input, expected, actual: result.error ? `Error: ${result.error}` : actual, passed: !result.error && passed });
      } catch {
        results.push({ input: tc.input, expected: tc.expected, actual: "Execution error", passed: false });
      }
    }

    setTestResults(results);
    setRunningTests(false);
  }, [runningTests, problem, code, language]);

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

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        handleRunTests();
      } else if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleRunCode();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRunCode, handleRunTests]);

  const testSummary = testResults ? {
    passed: testResults.filter(t => t.passed).length,
    total: testResults.length,
    allPassed: testResults.every(t => t.passed),
  } : null;

  const visibleCount = 2;

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
                {lang.label}{!lang.runnable ? " (editor only)" : ""}
              </option>
            ))}
          </select>
          {!languages.find(l => l.value === language)?.runnable && (
            <span className="text-[10px] text-yellow-400">Editor only</span>
          )}

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

          {/* Run Tests Button */}
          {problem?.testCases && problem.testCases.length > 0 && (
            <button
              onClick={handleRunTests}
              disabled={runningTests}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {runningTests ? (
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {runningTests ? "Testing..." : "Run Tests"}
              <span className="text-blue-300 text-[10px]">Ctrl+Shift+Enter</span>
            </button>
          )}
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
                {problem.constraints || "See the problem description above for constraints."}
              </pre>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Examples
              </h4>
              <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-800 rounded-lg p-3 text-gray-300">
                {problem.examples || "Try solving with sample inputs from the description."}
              </pre>
            </div>
          </div>
        </div>

        {/* Center: Code Editor + Bottom Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
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
          </div>

          {/* Bottom Panel - 3 tabs */}
          <div className={`border-t border-gray-800 bg-gray-900 flex flex-col shrink-0 transition-all ${bottomPanelOpen ? "h-[280px]" : "h-[36px]"}`}>
            {/* Tab bar */}
            <div className="flex items-center justify-between px-3 py-1 border-b border-gray-800 shrink-0">
              <div className="flex items-center gap-1">
                {problem?.testCases && problem.testCases.length > 0 && (
                  <button
                    onClick={() => { setBottomTab("testcases"); setBottomPanelOpen(true); }}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      bottomTab === "testcases" && bottomPanelOpen
                        ? "bg-gray-800 text-white"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    Test Cases
                  </button>
                )}
                {problem?.testCases && problem.testCases.length > 0 && (
                  <button
                    onClick={() => { setBottomTab("results"); setBottomPanelOpen(true); }}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                      bottomTab === "results" && bottomPanelOpen
                        ? "bg-gray-800 text-white"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    Test Results
                    {testSummary && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        testSummary.allPassed
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {testSummary.passed}/{testSummary.total}
                      </span>
                    )}
                  </button>
                )}
                <button
                  onClick={() => { setBottomTab("console"); setBottomPanelOpen(true); }}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    bottomTab === "console" && bottomPanelOpen
                      ? "bg-gray-800 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Console
                </button>
              </div>
              <button
                onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
                className="text-gray-500 hover:text-gray-300 text-xs p-1"
                title={bottomPanelOpen ? "Collapse" : "Expand"}
              >
                <svg className={`w-4 h-4 transition-transform ${bottomPanelOpen ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Tab content */}
            {bottomPanelOpen && (
              <div className="flex-1 overflow-auto">
                {/* Test Cases Tab */}
                {bottomTab === "testcases" && problem?.testCases && problem.testCases.length > 0 && (
                  <div className="p-3">
                    {/* Case pills */}
                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                      {problem.testCases.map((_, i) => {
                        const isHidden = i >= visibleCount && !testResults;
                        return (
                          <button
                            key={i}
                            onClick={() => setActiveTestCaseIndex(i)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                              i === activeTestCaseIndex
                                ? "bg-gray-700 text-white"
                                : isHidden
                                ? "bg-gray-800/30 text-gray-600"
                                : "bg-gray-800/50 text-gray-500 hover:text-gray-300"
                            }`}
                          >
                            Case {i + 1}
                          </button>
                        );
                      })}
                    </div>
                    {/* Selected case detail */}
                    {problem.testCases[activeTestCaseIndex] && (
                      activeTestCaseIndex >= visibleCount && !testResults ? (
                        <div className="flex items-center gap-3 py-8 justify-center text-gray-500">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span className="text-sm">Hidden Test Case {activeTestCaseIndex + 1}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div>
                            <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-1">Input</span>
                            <div className="rounded bg-gray-800 px-3 py-2 font-mono text-xs text-gray-300">
                              {problem.testCases[activeTestCaseIndex].input}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-1">Expected Output</span>
                            <div className="rounded bg-gray-800 px-3 py-2 font-mono text-xs text-gray-300">
                              {problem.testCases[activeTestCaseIndex].expected}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Test Results Tab */}
                {bottomTab === "results" && (
                  <div className="p-3">
                    {language !== "javascript" && language !== "typescript" ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500 py-4 justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Test cases only available for JavaScript/TypeScript
                      </div>
                    ) : runningTests ? (
                      <div className="flex items-center gap-2 text-xs text-gray-400 py-4 justify-center">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Running tests...
                      </div>
                    ) : testResults ? (
                      <div className="space-y-2">
                        {/* Summary bar */}
                        {testSummary && (
                          <div className={`rounded-lg px-3 py-2 text-xs font-medium ${
                            testSummary.allPassed
                              ? "bg-green-500/10 border border-green-500/20 text-green-400"
                              : "bg-red-500/10 border border-red-500/20 text-red-400"
                          }`}>
                            {testSummary.allPassed
                              ? "All Passed"
                              : `${testSummary.passed}/${testSummary.total} passed`}
                          </div>
                        )}
                        {/* Per-case results */}
                        {testResults.map((r, i) => (
                          <div key={i} className={`rounded-lg border p-3 ${
                            r.passed
                              ? "border-green-500/20 bg-green-500/5"
                              : "border-red-500/20 bg-red-500/5"
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              {r.passed ? (
                                <span className="text-green-400 text-xs font-semibold flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                  Case {i + 1} Passed
                                </span>
                              ) : (
                                <span className="text-red-400 text-xs font-semibold flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                  Case {i + 1} Failed
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-0.5">Input</span>
                                <code className="font-mono text-gray-400 text-[11px]">{r.input}</code>
                              </div>
                              <div>
                                <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-0.5">Expected</span>
                                <code className="font-mono text-gray-300 text-[11px]">{r.expected}</code>
                              </div>
                              <div>
                                <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-0.5">Actual</span>
                                <code className={`font-mono text-[11px] ${r.passed ? "text-green-400" : "text-red-400"}`}>{r.actual || "(empty)"}</code>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 py-4 text-center">
                        Click &quot;Run Tests&quot; to execute test cases
                      </div>
                    )}
                  </div>
                )}

                {/* Console Tab */}
                {bottomTab === "console" && (
                  <div className="p-3">
                    {executing ? (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Running code...
                      </div>
                    ) : execOutput ? (
                      <pre className="font-mono text-xs whitespace-pre-wrap">
                        {execOutput.output && <span className="text-gray-300">{execOutput.output}</span>}
                        {execOutput.error && <span className="text-red-400">{execOutput.error}</span>}
                        {!execOutput.output && !execOutput.error && <span className="text-gray-500">No output</span>}
                      </pre>
                    ) : (
                      <div className="text-xs text-gray-500 py-4 text-center">
                        Click &quot;Run Code&quot; to see output
                      </div>
                    )}
                  </div>
                )}
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
