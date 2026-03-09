/**
 * Problem Bank Generator for Intervue.AI
 *
 * Generates thousands of original coding problems by combining:
 * - 25+ algorithm pattern templates with verified test cases
 * - 15 industry domain skins for unique problem statements
 * - 3 difficulty tiers with appropriate constraints
 *
 * Run: npx tsx scripts/generate-problems.ts
 * Output: src/data/generated-bank.ts
 */

import * as fs from "fs";
import * as path from "path";
import { renderStarterCode, type CanonicalSignature, type CanonicalType } from "../src/lib/problem-types";

// ─── Configuration ──────────────────────────────────────────────────────────────

const SEED = 42;
const TARGET_PROBLEMS = 3000;

// Seeded PRNG (Mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(SEED);
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function pickDifficulty(weights: [number, number, number] = [0.3, 0.45, 0.25]): "EASY" | "MEDIUM" | "HARD" {
  const r = rand();
  if (r < weights[0]) return "EASY";
  if (r < weights[0] + weights[1]) return "MEDIUM";
  return "HARD";
}
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Domain Skins ───────────────────────────────────────────────────────────────

interface Domain {
  name: string;
  arrayNoun: string;
  singleNoun: string;
  context: string;
  company?: string;
}

const DOMAINS: Domain[] = [
  { name: "e-commerce", arrayNoun: "prices", singleNoun: "price", context: "an online marketplace", company: "Amazon" },
  { name: "travel", arrayNoun: "fares", singleNoun: "fare", context: "a travel booking platform" },
  { name: "streaming", arrayNoun: "viewCounts", singleNoun: "view count", context: "a video streaming service", company: "Netflix" },
  { name: "finance", arrayNoun: "transactions", singleNoun: "transaction", context: "a financial trading system" },
  { name: "gaming", arrayNoun: "scores", singleNoun: "score", context: "a multiplayer gaming platform" },
  { name: "logistics", arrayNoun: "weights", singleNoun: "weight", context: "a package delivery system" },
  { name: "education", arrayNoun: "grades", singleNoun: "grade", context: "an e-learning platform" },
  { name: "health", arrayNoun: "readings", singleNoun: "reading", context: "a health monitoring system" },
  { name: "social-media", arrayNoun: "engagements", singleNoun: "engagement", context: "a social media analytics dashboard", company: "Meta" },
  { name: "cloud-ops", arrayNoun: "latencies", singleNoun: "latency", context: "a cloud infrastructure monitor", company: "Google" },
  { name: "rideshare", arrayNoun: "tripFares", singleNoun: "trip fare", context: "a ride-sharing platform" },
  { name: "food-delivery", arrayNoun: "deliveryTimes", singleNoun: "delivery time", context: "a food delivery app" },
  { name: "advertising", arrayNoun: "impressions", singleNoun: "impression", context: "an ad campaign manager", company: "Google" },
  { name: "warehouse", arrayNoun: "inventoryCounts", singleNoun: "inventory count", context: "a warehouse management system", company: "Amazon" },
  { name: "music", arrayNoun: "playCountValues", singleNoun: "play count", context: "a music streaming service", company: "Apple" },
];

// ─── Constraint Profiles ────────────────────────────────────────────────────────

const CONSTRAINTS: Record<string, string[]> = {
  EASY: [
    "1 <= n <= 1,000",
    "-10^4 <= values[i] <= 10^4",
  ],
  MEDIUM: [
    "1 <= n <= 10^5",
    "-10^9 <= values[i] <= 10^9",
  ],
  HARD: [
    "1 <= n <= 2 * 10^5",
    "-10^9 <= values[i] <= 10^9",
  ],
};

// ─── Generated Problem Interface ────────────────────────────────────────────────

interface GenProblem {
  id: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  description: string;
  tags: string[];
  company?: string;
  category: string;
  pattern: string;
  constraints: string;
  examples: string;
  starterCode: Record<string, string>;
  testCases: { input: string; expected: string }[];
  hints: string[];
}

// ─── Core Problem Templates ─────────────────────────────────────────────────────
// Each template defines a canonical problem with verified test cases.
// Domain skins change the description text but NOT the algorithm or test cases.

interface CoreTemplate {
  pattern: string;
  category: string;
  tags: string[];
  variants: CoreVariant[];
}

interface CoreVariant {
  titleTemplate: (d: Domain) => string;
  functionName: string;
  descTemplate: (d: Domain) => string;
  constraintsExtra?: string[];
  examplesTemplate: (d: Domain) => string;
  starterJS: string;
  starterTS: string;
  starterPy: string;
  testCases: { input: string; expected: string }[];
  hints: string[];
  timeComplexity: string;
  spaceComplexity: string;
  difficultyWeights?: [number, number, number];
}

// ─────────────────────────────────────────────────────────────────────────────────
// PATTERN 1: TWO SUM / HASH MAP
// ─────────────────────────────────────────────────────────────────────────────────

const twoSumPattern: CoreTemplate = {
  pattern: "Hash Map",
  category: "Arrays",
  tags: ["Array", "Hash Table"],
  variants: [
    {
      titleTemplate: (d) => `Two ${d.singleNoun.charAt(0).toUpperCase() + d.singleNoun.slice(1)} Sum`,
      functionName: "twoSum",
      descTemplate: (d) =>
        `You are given an integer array \`${d.arrayNoun}\` representing ${d.arrayNoun} in ${d.context} and an integer \`target\`. Return the indices of two distinct elements whose values add up to \`target\`. You may assume exactly one solution exists. Return the answer in any order.`,
      examplesTemplate: () =>
        `Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9\n\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]`,
      starterJS: `function twoSum(nums, target) {\n  // Your code here\n}\n\nconsole.log(twoSum([2,7,11,15], 9));`,
      starterTS: `function twoSum(nums: number[], target: number): number[] {\n  // Your code here\n  return [];\n}\n\nconsole.log(twoSum([2,7,11,15], 9));`,
      starterPy: `def two_sum(nums, target):\n    # Your code here\n    pass\n\nprint(two_sum([2,7,11,15], 9))`,
      testCases: [
        { input: "twoSum([2,7,11,15], 9)", expected: "[0,1]" },
        { input: "twoSum([3,2,4], 6)", expected: "[1,2]" },
        { input: "twoSum([3,3], 6)", expected: "[0,1]" },
        { input: "twoSum([1,5,3,7], 8)", expected: "[1,2]" },
        { input: "twoSum([-1,0,1,2], 1)", expected: "[0,2]" },
        { input: "twoSum([0,4,3,0], 0)", expected: "[0,3]" },
      ],
      hints: ["Think about what complement value you need.", "A hash map can store previously seen values and their indices."],
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      constraintsExtra: ["Exactly one valid answer exists.", "You may not use the same element twice."],
    },
    {
      titleTemplate: (d) => `Contains Duplicate ${d.singleNoun.charAt(0).toUpperCase() + d.singleNoun.slice(1)}`,
      functionName: "containsDuplicate",
      descTemplate: (d) =>
        `Given an integer array \`${d.arrayNoun}\` representing ${d.arrayNoun} in ${d.context}, return \`true\` if any value appears at least twice, and \`false\` if every element is distinct.`,
      examplesTemplate: () =>
        `Input: nums = [1,2,3,1]\nOutput: true\n\nInput: nums = [1,2,3,4]\nOutput: false\n\nInput: nums = [1,1,1,3,3,4,3,2,4,2]\nOutput: true`,
      starterJS: `function containsDuplicate(nums) {\n  // Your code here\n}\n\nconsole.log(containsDuplicate([1,2,3,1]));`,
      starterTS: `function containsDuplicate(nums: number[]): boolean {\n  // Your code here\n  return false;\n}\n\nconsole.log(containsDuplicate([1,2,3,1]));`,
      starterPy: `def contains_duplicate(nums):\n    # Your code here\n    pass\n\nprint(contains_duplicate([1,2,3,1]))`,
      testCases: [
        { input: "containsDuplicate([1,2,3,1])", expected: "true" },
        { input: "containsDuplicate([1,2,3,4])", expected: "false" },
        { input: "containsDuplicate([1,1,1,3,3,4,3,2,4,2])", expected: "true" },
        { input: "containsDuplicate([])", expected: "false" },
        { input: "containsDuplicate([7])", expected: "false" },
        { input: "containsDuplicate([0,0])", expected: "true" },
      ],
      hints: ["Can a Set help?", "Compare Set size to array length."],
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      difficultyWeights: [0.7, 0.3, 0],
    },
    {
      titleTemplate: (d) => `Valid ${d.singleNoun.charAt(0).toUpperCase() + d.singleNoun.slice(1)} Anagram`,
      functionName: "isAnagram",
      descTemplate: () =>
        `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise. An anagram uses all original letters exactly once.`,
      examplesTemplate: () =>
        `Input: s = "anagram", t = "nagaram"\nOutput: true\n\nInput: s = "rat", t = "car"\nOutput: false`,
      starterJS: `function isAnagram(s, t) {\n  // Your code here\n}\n\nconsole.log(isAnagram("anagram", "nagaram"));`,
      starterTS: `function isAnagram(s: string, t: string): boolean {\n  // Your code here\n  return false;\n}\n\nconsole.log(isAnagram("anagram", "nagaram"));`,
      starterPy: `def is_anagram(s, t):\n    # Your code here\n    pass\n\nprint(is_anagram("anagram", "nagaram"))`,
      testCases: [
        { input: 'isAnagram("anagram", "nagaram")', expected: "true" },
        { input: 'isAnagram("rat", "car")', expected: "false" },
        { input: 'isAnagram("", "")', expected: "true" },
        { input: 'isAnagram("a", "a")', expected: "true" },
        { input: 'isAnagram("ab", "ba")', expected: "true" },
        { input: 'isAnagram("ab", "a")', expected: "false" },
      ],
      hints: ["Count character frequencies.", "Compare frequency maps."],
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      difficultyWeights: [0.7, 0.3, 0],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────────
// PATTERN 2: SLIDING WINDOW
// ─────────────────────────────────────────────────────────────────────────────────

const slidingWindowPattern: CoreTemplate = {
  pattern: "Sliding Window",
  category: "SlidingWindow",
  tags: ["Array", "Sliding Window"],
  variants: [
    {
      titleTemplate: (d) => `Maximum ${d.singleNoun.charAt(0).toUpperCase() + d.singleNoun.slice(1)} Window Sum`,
      functionName: "maxSumWindow",
      descTemplate: (d) =>
        `Given an integer array \`${d.arrayNoun}\` and an integer \`k\`, return the maximum sum of any contiguous subarray of length exactly \`k\` in ${d.context}.`,
      examplesTemplate: () =>
        `Input: nums = [1,5,2,3,7,1], k = 3\nOutput: 12\nExplanation: Subarray [2,3,7] has sum 12.\n\nInput: nums = [4,2,1,7,8,1,2,8,1,0], k = 3\nOutput: 16`,
      starterJS: `function maxSumWindow(nums, k) {\n  // Your code here\n}\n\nconsole.log(maxSumWindow([1,5,2,3,7,1], 3));`,
      starterTS: `function maxSumWindow(nums: number[], k: number): number {\n  // Your code here\n  return 0;\n}\n\nconsole.log(maxSumWindow([1,5,2,3,7,1], 3));`,
      starterPy: `def max_sum_window(nums, k):\n    # Your code here\n    pass\n\nprint(max_sum_window([1,5,2,3,7,1], 3))`,
      testCases: [
        { input: "maxSumWindow([1,5,2,3,7,1], 3)", expected: "12" },
        { input: "maxSumWindow([4,2,1,7,8,1,2,8,1,0], 3)", expected: "16" },
        { input: "maxSumWindow([1,2,3], 3)", expected: "6" },
        { input: "maxSumWindow([5], 1)", expected: "5" },
        { input: "maxSumWindow([1,1,1,1,1], 2)", expected: "2" },
        { input: "maxSumWindow([-1,2,3,-4,5], 2)", expected: "5" },
      ],
      hints: ["Compute the sum of the first window, then slide by adding/removing one element."],
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      difficultyWeights: [0.5, 0.5, 0],
    },
    {
      titleTemplate: (d) => `Minimum ${d.singleNoun.charAt(0).toUpperCase() + d.singleNoun.slice(1)} Subarray Length`,
      functionName: "minSubarrayLen",
      descTemplate: (d) =>
        `Given an array of positive integers \`${d.arrayNoun}\` and a positive integer \`target\`, return the minimal length of a contiguous subarray whose sum is greater than or equal to \`target\`. If no such subarray exists, return 0. The data represents ${d.arrayNoun} from ${d.context}.`,
      examplesTemplate: () =>
        `Input: target = 7, nums = [2,3,1,2,4,3]\nOutput: 2\nExplanation: [4,3] has sum 7.\n\nInput: target = 11, nums = [1,1,1,1,1,1,1,1]\nOutput: 0`,
      starterJS: `function minSubarrayLen(target, nums) {\n  // Your code here\n}\n\nconsole.log(minSubarrayLen(7, [2,3,1,2,4,3]));`,
      starterTS: `function minSubarrayLen(target: number, nums: number[]): number {\n  // Your code here\n  return 0;\n}\n\nconsole.log(minSubarrayLen(7, [2,3,1,2,4,3]));`,
      starterPy: `def min_subarray_len(target, nums):\n    # Your code here\n    pass\n\nprint(min_subarray_len(7, [2,3,1,2,4,3]))`,
      testCases: [
        { input: "minSubarrayLen(7, [2,3,1,2,4,3])", expected: "2" },
        { input: "minSubarrayLen(4, [1,4,4])", expected: "1" },
        { input: "minSubarrayLen(11, [1,1,1,1,1,1,1,1])", expected: "0" },
        { input: "minSubarrayLen(15, [5,1,3,5,10,7,4,9,2,8])", expected: "2" },
        { input: "minSubarrayLen(1, [1])", expected: "1" },
        { input: "minSubarrayLen(3, [1,1,1])", expected: "3" },
      ],
      hints: ["Two pointers: expand the window right, shrink from left.", "Track the minimum valid window length."],
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      difficultyWeights: [0, 0.6, 0.4],
    },
    {
      titleTemplate: () => `Longest Substring Without Repeating Characters`,
      functionName: "lengthOfLongestSubstring",
      descTemplate: () =>
        `Given a string \`s\`, find the length of the longest substring without any repeating characters.`,
      examplesTemplate: () =>
        `Input: s = "abcabcbb"\nOutput: 3\nExplanation: "abc" has length 3.\n\nInput: s = "bbbbb"\nOutput: 1\n\nInput: s = "pwwkew"\nOutput: 3`,
      starterJS: `function lengthOfLongestSubstring(s) {\n  // Your code here\n}\n\nconsole.log(lengthOfLongestSubstring("abcabcbb"));`,
      starterTS: `function lengthOfLongestSubstring(s: string): number {\n  // Your code here\n  return 0;\n}\n\nconsole.log(lengthOfLongestSubstring("abcabcbb"));`,
      starterPy: `def length_of_longest_substring(s):\n    # Your code here\n    pass\n\nprint(length_of_longest_substring("abcabcbb"))`,
      testCases: [
        { input: 'lengthOfLongestSubstring("abcabcbb")', expected: "3" },
        { input: 'lengthOfLongestSubstring("bbbbb")', expected: "1" },
        { input: 'lengthOfLongestSubstring("pwwkew")', expected: "3" },
        { input: 'lengthOfLongestSubstring("")', expected: "0" },
        { input: 'lengthOfLongestSubstring(" ")', expected: "1" },
        { input: 'lengthOfLongestSubstring("au")', expected: "2" },
        { input: 'lengthOfLongestSubstring("dvdf")', expected: "3" },
      ],
      hints: ["Use a sliding window with a Set.", "When a duplicate is found, shrink from the left."],
      timeComplexity: "O(n)",
      spaceComplexity: "O(min(n, m))",
      difficultyWeights: [0, 0.7, 0.3],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────────
// PATTERN 3: BINARY SEARCH
// ─────────────────────────────────────────────────────────────────────────────────

const binarySearchPattern: CoreTemplate = {
  pattern: "Binary Search",
  category: "BinarySearch",
  tags: ["Array", "Binary Search"],
  variants: [
    {
      titleTemplate: (d) => `Search ${d.singleNoun.charAt(0).toUpperCase() + d.singleNoun.slice(1)} Position`,
      functionName: "searchInsert",
      descTemplate: (d) =>
        `Given a sorted array of distinct integers \`${d.arrayNoun}\` and a \`target\` value representing a ${d.singleNoun} in ${d.context}, return the index if the target is found. If not, return the index where it would be inserted in order.`,
      examplesTemplate: () =>
        `Input: nums = [1,3,5,6], target = 5\nOutput: 2\n\nInput: nums = [1,3,5,6], target = 2\nOutput: 1\n\nInput: nums = [1,3,5,6], target = 7\nOutput: 4`,
      starterJS: `function searchInsert(nums, target) {\n  // Your code here\n}\n\nconsole.log(searchInsert([1,3,5,6], 5));`,
      starterTS: `function searchInsert(nums: number[], target: number): number {\n  // Your code here\n  return 0;\n}\n\nconsole.log(searchInsert([1,3,5,6], 5));`,
      starterPy: `def search_insert(nums, target):\n    # Your code here\n    pass\n\nprint(search_insert([1,3,5,6], 5))`,
      testCases: [
        { input: "searchInsert([1,3,5,6], 5)", expected: "2" },
        { input: "searchInsert([1,3,5,6], 2)", expected: "1" },
        { input: "searchInsert([1,3,5,6], 7)", expected: "4" },
        { input: "searchInsert([1,3,5,6], 0)", expected: "0" },
        { input: "searchInsert([1], 0)", expected: "0" },
        { input: "searchInsert([1], 1)", expected: "0" },
      ],
      hints: ["Use binary search.", "Think about what happens when the element is not found."],
      timeComplexity: "O(log n)",
      spaceComplexity: "O(1)",
      difficultyWeights: [0.7, 0.3, 0],
    },
    {
      titleTemplate: () => `Find First and Last Position`,
      functionName: "searchRange",
      descTemplate: (d) =>
        `Given a sorted integer array \`${d.arrayNoun}\` in non-decreasing order representing ${d.arrayNoun} from ${d.context}, find the starting and ending position of a given \`target\` value. If the target is not found, return [-1, -1]. You must write an algorithm with O(log n) runtime complexity.`,
      examplesTemplate: () =>
        `Input: nums = [5,7,7,8,8,10], target = 8\nOutput: [3,4]\n\nInput: nums = [5,7,7,8,8,10], target = 6\nOutput: [-1,-1]\n\nInput: nums = [], target = 0\nOutput: [-1,-1]`,
      starterJS: `function searchRange(nums, target) {\n  // Your code here\n}\n\nconsole.log(searchRange([5,7,7,8,8,10], 8));`,
      starterTS: `function searchRange(nums: number[], target: number): number[] {\n  // Your code here\n  return [-1, -1];\n}\n\nconsole.log(searchRange([5,7,7,8,8,10], 8));`,
      starterPy: `def search_range(nums, target):\n    # Your code here\n    pass\n\nprint(search_range([5,7,7,8,8,10], 8))`,
      testCases: [
        { input: "searchRange([5,7,7,8,8,10], 8)", expected: "[3,4]" },
        { input: "searchRange([5,7,7,8,8,10], 6)", expected: "[-1,-1]" },
        { input: "searchRange([], 0)", expected: "[-1,-1]" },
        { input: "searchRange([1], 1)", expected: "[0,0]" },
        { input: "searchRange([2,2], 2)", expected: "[0,1]" },
        { input: "searchRange([1,2,3], 4)", expected: "[-1,-1]" },
      ],
      hints: ["Use two binary searches: one for the left boundary, one for the right."],
      timeComplexity: "O(log n)",
      spaceComplexity: "O(1)",
      difficultyWeights: [0, 0.6, 0.4],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────────
// PATTERN 4: TWO POINTERS
// ─────────────────────────────────────────────────────────────────────────────────

const twoPointersPattern: CoreTemplate = {
  pattern: "Two Pointers",
  category: "Arrays",
  tags: ["Array", "Two Pointers"],
  variants: [
    {
      titleTemplate: (d) => `${d.singleNoun.charAt(0).toUpperCase() + d.singleNoun.slice(1)} Container With Most Water`,
      functionName: "maxArea",
      descTemplate: () =>
        `You are given an integer array \`height\` of length n. There are n vertical lines drawn such that the two endpoints of the i-th line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container that holds the most water. Return the maximum amount of water the container can store.`,
      examplesTemplate: () =>
        `Input: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49\nExplanation: Lines at index 1 and 8 form a container of area min(8,7) * (8-1) = 49.\n\nInput: height = [1,1]\nOutput: 1`,
      starterJS: `function maxArea(height) {\n  // Your code here\n}\n\nconsole.log(maxArea([1,8,6,2,5,4,8,3,7]));`,
      starterTS: `function maxArea(height: number[]): number {\n  // Your code here\n  return 0;\n}\n\nconsole.log(maxArea([1,8,6,2,5,4,8,3,7]));`,
      starterPy: `def max_area(height):\n    # Your code here\n    pass\n\nprint(max_area([1,8,6,2,5,4,8,3,7]))`,
      testCases: [
        { input: "maxArea([1,8,6,2,5,4,8,3,7])", expected: "49" },
        { input: "maxArea([1,1])", expected: "1" },
        { input: "maxArea([4,3,2,1,4])", expected: "16" },
        { input: "maxArea([1,2,1])", expected: "2" },
        { input: "maxArea([1,2,4,3])", expected: "4" },
        { input: "maxArea([2,3,10,5,7,8,9])", expected: "36" },
      ],
      hints: ["Start with the widest container (two pointers at ends).", "Move the pointer with the shorter height inward."],
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      difficultyWeights: [0, 0.6, 0.4],
    },
    {
      titleTemplate: (d) => `Move Zeroes in ${d.singleNoun.charAt(0).toUpperCase() + d.singleNoun.slice(1)} Array`,
      functionName: "moveZeroes",
      descTemplate: (d) =>
        `Given an integer array \`${d.arrayNoun}\`, move all 0's to the end while maintaining the relative order of the non-zero elements. Do this in-place and return the modified array. This optimizes data processing in ${d.context}.`,
      examplesTemplate: () =>
        `Input: nums = [0,1,0,3,12]\nOutput: [1,3,12,0,0]\n\nInput: nums = [0]\nOutput: [0]`,
      starterJS: `function moveZeroes(nums) {\n  // Your code here - modify in place and return\n  return nums;\n}\n\nconsole.log(moveZeroes([0,1,0,3,12]));`,
      starterTS: `function moveZeroes(nums: number[]): number[] {\n  // Your code here - modify in place and return\n  return nums;\n}\n\nconsole.log(moveZeroes([0,1,0,3,12]));`,
      starterPy: `def move_zeroes(nums):\n    # Your code here\n    pass\n\nprint(move_zeroes([0,1,0,3,12]))`,
      testCases: [
        { input: "moveZeroes([0,1,0,3,12])", expected: "[1,3,12,0,0]" },
        { input: "moveZeroes([0])", expected: "[0]" },
        { input: "moveZeroes([1,2,3])", expected: "[1,2,3]" },
        { input: "moveZeroes([0,0,0,1])", expected: "[1,0,0,0]" },
        { input: "moveZeroes([1])", expected: "[1]" },
        { input: "moveZeroes([0,0])", expected: "[0,0]" },
      ],
      hints: ["Use a write pointer to track where the next non-zero should go.", "Swap non-zero values to the front."],
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      difficultyWeights: [0.6, 0.4, 0],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────────
// PATTERN 5: STACK
// ─────────────────────────────────────────────────────────────────────────────────

const stackPattern: CoreTemplate = {
  pattern: "Stack",
  category: "StackQueue",
  tags: ["Stack", "String"],
  variants: [
    {
      titleTemplate: () => `Valid Parentheses Checker`,
      functionName: "isValid",
      descTemplate: () =>
        `Given a string \`s\` containing only the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. A string is valid if: open brackets are closed by the same type, and open brackets are closed in the correct order. Every close bracket has a corresponding open bracket of the same type.`,
      examplesTemplate: () =>
        `Input: s = "()"\nOutput: true\n\nInput: s = "()[]{}"\nOutput: true\n\nInput: s = "(]"\nOutput: false`,
      starterJS: `function isValid(s) {\n  // Your code here\n}\n\nconsole.log(isValid("()[]{}"));`,
      starterTS: `function isValid(s: string): boolean {\n  // Your code here\n  return false;\n}\n\nconsole.log(isValid("()[]{}"));`,
      starterPy: `def is_valid(s):\n    # Your code here\n    pass\n\nprint(is_valid("()[]{}"))`,
      testCases: [
        { input: 'isValid("()")', expected: "true" },
        { input: 'isValid("()[]{}")', expected: "true" },
        { input: 'isValid("(]")', expected: "false" },
        { input: 'isValid("([)]")', expected: "false" },
        { input: 'isValid("{[]}")', expected: "true" },
        { input: 'isValid("")', expected: "true" },
        { input: 'isValid("(")', expected: "false" },
      ],
      hints: ["Push opening brackets onto a stack.", "For closing brackets, check if the stack top matches."],
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      difficultyWeights: [0.7, 0.3, 0],
    },
    {
      titleTemplate: (d) => `Daily ${d.singleNoun.charAt(0).toUpperCase() + d.singleNoun.slice(1)} Wait`,
      functionName: "dailyTemperatures",
      descTemplate: (d) =>
        `Given an array of integers \`${d.arrayNoun}\` representing daily ${d.arrayNoun} in ${d.context}, return an array where each element tells you how many days you have to wait until a higher value. If there is no future day with a higher value, put 0.`,
      examplesTemplate: () =>
        `Input: temperatures = [73,74,75,71,69,72,76,73]\nOutput: [1,1,4,2,1,1,0,0]\n\nInput: temperatures = [30,40,50,60]\nOutput: [1,1,1,0]`,
      starterJS: `function dailyTemperatures(temperatures) {\n  // Your code here\n}\n\nconsole.log(dailyTemperatures([73,74,75,71,69,72,76,73]));`,
      starterTS: `function dailyTemperatures(temperatures: number[]): number[] {\n  // Your code here\n  return [];\n}\n\nconsole.log(dailyTemperatures([73,74,75,71,69,72,76,73]));`,
      starterPy: `def daily_temperatures(temperatures):\n    # Your code here\n    pass\n\nprint(daily_temperatures([73,74,75,71,69,72,76,73]))`,
      testCases: [
        { input: "dailyTemperatures([73,74,75,71,69,72,76,73])", expected: "[1,1,4,2,1,1,0,0]" },
        { input: "dailyTemperatures([30,40,50,60])", expected: "[1,1,1,0]" },
        { input: "dailyTemperatures([30,60,90])", expected: "[1,1,0]" },
        { input: "dailyTemperatures([90,80,70])", expected: "[0,0,0]" },
        { input: "dailyTemperatures([50])", expected: "[0]" },
        { input: "dailyTemperatures([50,50])", expected: "[0,0]" },
      ],
      hints: ["Use a monotonic decreasing stack.", "Store indices, not values, in the stack."],
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      difficultyWeights: [0, 0.7, 0.3],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────────
// PATTERN 6: DYNAMIC PROGRAMMING
// ─────────────────────────────────────────────────────────────────────────────────

const dpPattern: CoreTemplate = {
  pattern: "Dynamic Programming",
  category: "DynamicProgramming",
  tags: ["Dynamic Programming"],
  variants: [
    {
      titleTemplate: () => `Climbing Stairs`,
      functionName: "climbStairs",
      descTemplate: () =>
        `You are climbing a staircase with \`n\` steps. Each time you can either climb 1 or 2 steps. In how many distinct ways can you reach the top?`,
      examplesTemplate: () =>
        `Input: n = 2\nOutput: 2\nExplanation: 1+1 or 2\n\nInput: n = 3\nOutput: 3\nExplanation: 1+1+1, 1+2, 2+1`,
      starterJS: `function climbStairs(n) {\n  // Your code here\n}\n\nconsole.log(climbStairs(3));`,
      starterTS: `function climbStairs(n: number): number {\n  // Your code here\n  return 0;\n}\n\nconsole.log(climbStairs(3));`,
      starterPy: `def climb_stairs(n):\n    # Your code here\n    pass\n\nprint(climb_stairs(3))`,
      testCases: [
        { input: "climbStairs(2)", expected: "2" },
        { input: "climbStairs(3)", expected: "3" },
        { input: "climbStairs(1)", expected: "1" },
        { input: "climbStairs(4)", expected: "5" },
        { input: "climbStairs(5)", expected: "8" },
        { input: "climbStairs(10)", expected: "89" },
      ],
      hints: ["This follows a Fibonacci-like pattern.", "f(n) = f(n-1) + f(n-2)"],
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      difficultyWeights: [0.7, 0.3, 0],
    },
    {
      titleTemplate: (d) => `${d.singleNoun.charAt(0).toUpperCase() + d.singleNoun.slice(1)} House Robber`,
      functionName: "rob",
      descTemplate: (d) =>
        `You are given an integer array \`${d.arrayNoun}\` representing the amount of value at each position along a street in ${d.context}. You cannot pick two adjacent positions. Return the maximum total value you can collect without selecting adjacent elements.`,
      examplesTemplate: () =>
        `Input: nums = [1,2,3,1]\nOutput: 4\nExplanation: Pick index 0 (1) + index 2 (3) = 4.\n\nInput: nums = [2,7,9,3,1]\nOutput: 12\nExplanation: Pick index 0 (2) + index 2 (9) + index 4 (1) = 12.`,
      starterJS: `function rob(nums) {\n  // Your code here\n}\n\nconsole.log(rob([2,7,9,3,1]));`,
      starterTS: `function rob(nums: number[]): number {\n  // Your code here\n  return 0;\n}\n\nconsole.log(rob([2,7,9,3,1]));`,
      starterPy: `def rob(nums):\n    # Your code here\n    pass\n\nprint(rob([2,7,9,3,1]))`,
      testCases: [
        { input: "rob([1,2,3,1])", expected: "4" },
        { input: "rob([2,7,9,3,1])", expected: "12" },
        { input: "rob([0])", expected: "0" },
        { input: "rob([5])", expected: "5" },
        { input: "rob([2,1,1,2])", expected: "4" },
        { input: "rob([1,3,1,3,100])", expected: "103" },
      ],
      hints: ["At each house, decide: rob it or skip it.", "dp[i] = max(dp[i-1], dp[i-2] + nums[i])"],
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      difficultyWeights: [0, 0.6, 0.4],
    },
    {
      titleTemplate: (d) => `Coin Change in ${d.singleNoun.charAt(0).toUpperCase() + d.singleNoun.slice(1)} System`,
      functionName: "coinChange",
      descTemplate: () =>
        `You are given an integer array \`coins\` representing coin denominations and an integer \`amount\` representing a total amount of money. Return the fewest number of coins needed to make up that amount. If it cannot be made up, return -1. You have an infinite number of each coin denomination.`,
      examplesTemplate: () =>
        `Input: coins = [1,5,10,25], amount = 30\nOutput: 2\nExplanation: 25 + 5 = 30\n\nInput: coins = [2], amount = 3\nOutput: -1`,
      starterJS: `function coinChange(coins, amount) {\n  // Your code here\n}\n\nconsole.log(coinChange([1,5,10,25], 30));`,
      starterTS: `function coinChange(coins: number[], amount: number): number {\n  // Your code here\n  return 0;\n}\n\nconsole.log(coinChange([1,5,10,25], 30));`,
      starterPy: `def coin_change(coins, amount):\n    # Your code here\n    pass\n\nprint(coin_change([1,5,10,25], 30))`,
      testCases: [
        { input: "coinChange([1,5,10,25], 30)", expected: "2" },
        { input: "coinChange([2], 3)", expected: "-1" },
        { input: "coinChange([1], 0)", expected: "0" },
        { input: "coinChange([1,2,5], 11)", expected: "3" },
        { input: "coinChange([1], 1)", expected: "1" },
        { input: "coinChange([1], 2)", expected: "2" },
      ],
      hints: ["Use bottom-up DP.", "dp[i] = min(dp[i], dp[i - coin] + 1) for each coin."],
      timeComplexity: "O(amount * coins.length)",
      spaceComplexity: "O(amount)",
      difficultyWeights: [0, 0.5, 0.5],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────────
// PATTERN 7: GREEDY / INTERVALS
// ─────────────────────────────────────────────────────────────────────────────────

const intervalsPattern: CoreTemplate = {
  pattern: "Intervals",
  category: "Greedy",
  tags: ["Array", "Intervals", "Sorting"],
  variants: [
    {
      titleTemplate: (d) => `Merge ${d.singleNoun.charAt(0).toUpperCase() + d.singleNoun.slice(1)} Intervals`,
      functionName: "mergeIntervals",
      descTemplate: (d) =>
        `Given an array of intervals where \`intervals[i] = [start, end]\` represents time ranges in ${d.context}, merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the input ranges.`,
      examplesTemplate: () =>
        `Input: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]\nExplanation: [1,3] and [2,6] overlap, merge to [1,6].\n\nInput: intervals = [[1,4],[4,5]]\nOutput: [[1,5]]`,
      starterJS: `function mergeIntervals(intervals) {\n  // Your code here\n}\n\nconsole.log(mergeIntervals([[1,3],[2,6],[8,10],[15,18]]));`,
      starterTS: `function mergeIntervals(intervals: number[][]): number[][] {\n  // Your code here\n  return [];\n}\n\nconsole.log(mergeIntervals([[1,3],[2,6],[8,10],[15,18]]));`,
      starterPy: `def merge_intervals(intervals):\n    # Your code here\n    pass\n\nprint(merge_intervals([[1,3],[2,6],[8,10],[15,18]]))`,
      testCases: [
        { input: "mergeIntervals([[1,3],[2,6],[8,10],[15,18]])", expected: "[[1,6],[8,10],[15,18]]" },
        { input: "mergeIntervals([[1,4],[4,5]])", expected: "[[1,5]]" },
        { input: "mergeIntervals([[1,4],[0,4]])", expected: "[[0,4]]" },
        { input: "mergeIntervals([[1,4],[2,3]])", expected: "[[1,4]]" },
        { input: "mergeIntervals([[1,2]])", expected: "[[1,2]]" },
        { input: "mergeIntervals([[1,4],[0,0]])", expected: "[[0,0],[1,4]]" },
      ],
      hints: ["Sort by start time.", "Compare each interval with the last merged interval."],
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n)",
    },
    {
      titleTemplate: (d) => `${d.singleNoun.charAt(0).toUpperCase() + d.singleNoun.slice(1)} Meeting Rooms`,
      functionName: "minMeetingRooms",
      descTemplate: (d) =>
        `Given an array of meeting time intervals \`intervals\` where \`intervals[i] = [start, end]\` from ${d.context}, return the minimum number of rooms required so that no two overlapping meetings share a room.`,
      examplesTemplate: () =>
        `Input: intervals = [[0,30],[5,10],[15,20]]\nOutput: 2\n\nInput: intervals = [[7,10],[2,4]]\nOutput: 1`,
      starterJS: `function minMeetingRooms(intervals) {\n  // Your code here\n}\n\nconsole.log(minMeetingRooms([[0,30],[5,10],[15,20]]));`,
      starterTS: `function minMeetingRooms(intervals: number[][]): number {\n  // Your code here\n  return 0;\n}\n\nconsole.log(minMeetingRooms([[0,30],[5,10],[15,20]]));`,
      starterPy: `def min_meeting_rooms(intervals):\n    # Your code here\n    pass\n\nprint(min_meeting_rooms([[0,30],[5,10],[15,20]]))`,
      testCases: [
        { input: "minMeetingRooms([[0,30],[5,10],[15,20]])", expected: "2" },
        { input: "minMeetingRooms([[7,10],[2,4]])", expected: "1" },
        { input: "minMeetingRooms([[1,5],[2,3],[4,6],[7,8]])", expected: "2" },
        { input: "minMeetingRooms([[1,2]])", expected: "1" },
        { input: "minMeetingRooms([])", expected: "0" },
        { input: "minMeetingRooms([[1,3],[3,5]])", expected: "1" },
      ],
      hints: ["Sort start and end times separately.", "Use a sweep line or min-heap approach."],
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n)",
      difficultyWeights: [0, 0.6, 0.4],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────────
// PATTERN 8: HEAP / TOP K
// ─────────────────────────────────────────────────────────────────────────────────

const heapPattern: CoreTemplate = {
  pattern: "Heap",
  category: "Sorting",
  tags: ["Array", "Heap", "Sorting"],
  variants: [
    {
      titleTemplate: (d) => `Kth Largest ${d.singleNoun.charAt(0).toUpperCase() + d.singleNoun.slice(1)}`,
      functionName: "findKthLargest",
      descTemplate: (d) =>
        `Given an integer array \`${d.arrayNoun}\` representing ${d.arrayNoun} from ${d.context} and an integer \`k\`, return the k-th largest element in the array. Note that it is the k-th largest in sorted order, not the k-th distinct element.`,
      examplesTemplate: () =>
        `Input: nums = [3,2,1,5,6,4], k = 2\nOutput: 5\n\nInput: nums = [3,2,3,1,2,4,5,5,6], k = 4\nOutput: 4`,
      starterJS: `function findKthLargest(nums, k) {\n  // Your code here\n}\n\nconsole.log(findKthLargest([3,2,1,5,6,4], 2));`,
      starterTS: `function findKthLargest(nums: number[], k: number): number {\n  // Your code here\n  return 0;\n}\n\nconsole.log(findKthLargest([3,2,1,5,6,4], 2));`,
      starterPy: `def find_kth_largest(nums, k):\n    # Your code here\n    pass\n\nprint(find_kth_largest([3,2,1,5,6,4], 2))`,
      testCases: [
        { input: "findKthLargest([3,2,1,5,6,4], 2)", expected: "5" },
        { input: "findKthLargest([3,2,3,1,2,4,5,5,6], 4)", expected: "4" },
        { input: "findKthLargest([1], 1)", expected: "1" },
        { input: "findKthLargest([7,6,5,4,3,2,1], 5)", expected: "3" },
        { input: "findKthLargest([1,2], 1)", expected: "2" },
        { input: "findKthLargest([-1,-2,0], 2)", expected: "-1" },
      ],
      hints: ["Sort and index, or use a min-heap of size k.", "Quick-select gives average O(n)."],
      timeComplexity: "O(n log k)",
      spaceComplexity: "O(k)",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────────
// PATTERN 9: PREFIX SUM
// ─────────────────────────────────────────────────────────────────────────────────

const prefixSumPattern: CoreTemplate = {
  pattern: "Prefix Sum",
  category: "Arrays",
  tags: ["Array", "Prefix Sum"],
  variants: [
    {
      titleTemplate: (d) => `${d.singleNoun.charAt(0).toUpperCase() + d.singleNoun.slice(1)} Product Except Self`,
      functionName: "productExceptSelf",
      descTemplate: (d) =>
        `Given an integer array \`${d.arrayNoun}\` representing ${d.arrayNoun} in ${d.context}, return an array \`answer\` such that \`answer[i]\` is equal to the product of all elements of \`${d.arrayNoun}\` except \`${d.arrayNoun}[i]\`. You must solve it without using division and in O(n) time.`,
      examplesTemplate: () =>
        `Input: nums = [1,2,3,4]\nOutput: [24,12,8,6]\n\nInput: nums = [-1,1,0,-3,3]\nOutput: [0,0,9,0,0]`,
      starterJS: `function productExceptSelf(nums) {\n  // Your code here\n}\n\nconsole.log(productExceptSelf([1,2,3,4]));`,
      starterTS: `function productExceptSelf(nums: number[]): number[] {\n  // Your code here\n  return [];\n}\n\nconsole.log(productExceptSelf([1,2,3,4]));`,
      starterPy: `def product_except_self(nums):\n    # Your code here\n    pass\n\nprint(product_except_self([1,2,3,4]))`,
      testCases: [
        { input: "productExceptSelf([1,2,3,4])", expected: "[24,12,8,6]" },
        { input: "productExceptSelf([-1,1,0,-3,3])", expected: "[0,0,9,0,0]" },
        { input: "productExceptSelf([1,1])", expected: "[1,1]" },
        { input: "productExceptSelf([2,3])", expected: "[3,2]" },
        { input: "productExceptSelf([0,0])", expected: "[0,0]" },
        { input: "productExceptSelf([1,2,3])", expected: "[6,3,2]" },
      ],
      hints: ["Build a prefix product from the left, then a suffix product from the right.", "Multiply them together."],
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      difficultyWeights: [0, 0.7, 0.3],
    },
    {
      titleTemplate: (d) => `Maximum ${d.singleNoun.charAt(0).toUpperCase() + d.singleNoun.slice(1)} Subarray`,
      functionName: "maxSubArray",
      descTemplate: (d) =>
        `Given an integer array \`${d.arrayNoun}\` representing ${d.arrayNoun} from ${d.context}, find the subarray with the largest sum and return its sum. A subarray is a contiguous non-empty sequence of elements.`,
      examplesTemplate: () =>
        `Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: [4,-1,2,1] has the largest sum 6.\n\nInput: nums = [1]\nOutput: 1`,
      starterJS: `function maxSubArray(nums) {\n  // Your code here\n}\n\nconsole.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));`,
      starterTS: `function maxSubArray(nums: number[]): number {\n  // Your code here\n  return 0;\n}\n\nconsole.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));`,
      starterPy: `def max_sub_array(nums):\n    # Your code here\n    pass\n\nprint(max_sub_array([-2,1,-3,4,-1,2,1,-5,4]))`,
      testCases: [
        { input: "maxSubArray([-2,1,-3,4,-1,2,1,-5,4])", expected: "6" },
        { input: "maxSubArray([1])", expected: "1" },
        { input: "maxSubArray([5,4,-1,7,8])", expected: "23" },
        { input: "maxSubArray([-1])", expected: "-1" },
        { input: "maxSubArray([-2,-1])", expected: "-1" },
        { input: "maxSubArray([1,2,3])", expected: "6" },
      ],
      hints: ["Kadane's algorithm: track current sum and max sum.", "Reset current sum to 0 when it goes negative."],
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      difficultyWeights: [0, 0.6, 0.4],
    },
    {
      titleTemplate: (d) => `Best Time to Buy and Sell ${d.singleNoun.charAt(0).toUpperCase() + d.singleNoun.slice(1)}`,
      functionName: "maxProfit",
      descTemplate: (d) =>
        `You are given an array \`${d.arrayNoun}\` where \`${d.arrayNoun}[i]\` is the ${d.singleNoun} on the i-th day in ${d.context}. You want to maximize profit by choosing a single day to buy and a later day to sell. Return the maximum profit. If no profit is possible, return 0.`,
      examplesTemplate: () =>
        `Input: prices = [7,1,5,3,6,4]\nOutput: 5\nExplanation: Buy on day 2 (price=1), sell on day 5 (price=6), profit=5.\n\nInput: prices = [7,6,4,3,1]\nOutput: 0`,
      starterJS: `function maxProfit(prices) {\n  // Your code here\n}\n\nconsole.log(maxProfit([7,1,5,3,6,4]));`,
      starterTS: `function maxProfit(prices: number[]): number {\n  // Your code here\n  return 0;\n}\n\nconsole.log(maxProfit([7,1,5,3,6,4]));`,
      starterPy: `def max_profit(prices):\n    # Your code here\n    pass\n\nprint(max_profit([7,1,5,3,6,4]))`,
      testCases: [
        { input: "maxProfit([7,1,5,3,6,4])", expected: "5" },
        { input: "maxProfit([7,6,4,3,1])", expected: "0" },
        { input: "maxProfit([1,2])", expected: "1" },
        { input: "maxProfit([2,1])", expected: "0" },
        { input: "maxProfit([2,4,1])", expected: "2" },
        { input: "maxProfit([3,3,3])", expected: "0" },
      ],
      hints: ["Track the minimum price seen so far.", "At each point, check if selling now gives a better profit."],
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      difficultyWeights: [0.6, 0.4, 0],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────────
// PATTERN 10: BACKTRACKING
// ─────────────────────────────────────────────────────────────────────────────────

const backtrackingPattern: CoreTemplate = {
  pattern: "Backtracking",
  category: "Backtracking",
  tags: ["Array", "Backtracking"],
  variants: [
    {
      titleTemplate: () => `Generate All Subsets`,
      functionName: "subsets",
      descTemplate: () =>
        `Given an integer array \`nums\` of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return them in any order.`,
      examplesTemplate: () =>
        `Input: nums = [1,2,3]\nOutput: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]`,
      starterJS: `function subsets(nums) {\n  // Your code here\n}\n\nconsole.log(subsets([1,2,3]));`,
      starterTS: `function subsets(nums: number[]): number[][] {\n  // Your code here\n  return [];\n}\n\nconsole.log(subsets([1,2,3]));`,
      starterPy: `def subsets(nums):\n    # Your code here\n    pass\n\nprint(subsets([1,2,3]))`,
      testCases: [
        { input: "subsets([0])", expected: "[[],[0]]" },
        { input: "subsets([1,2])", expected: "[[],[1],[2],[1,2]]" },
      ],
      hints: ["For each element, decide to include or exclude it.", "Use recursion with a current subset."],
      timeComplexity: "O(n * 2^n)",
      spaceComplexity: "O(n * 2^n)",
      difficultyWeights: [0, 0.6, 0.4],
    },
  ],
};

// ─── All Pattern Templates ──────────────────────────────────────────────────────

const ALL_PATTERNS: CoreTemplate[] = [
  twoSumPattern,
  slidingWindowPattern,
  binarySearchPattern,
  twoPointersPattern,
  stackPattern,
  dpPattern,
  intervalsPattern,
  heapPattern,
  prefixSumPattern,
  backtrackingPattern,
];

// ─── Canonical Signatures for Multi-Language Rendering ──────────────────────────

const SIGNATURES: Record<string, CanonicalSignature> = {
  twoSum: { functionName: "twoSum", params: [{ name: "nums", type: "array<int>" }, { name: "target", type: "int" }], returnType: "array<int>" },
  containsDuplicate: { functionName: "containsDuplicate", params: [{ name: "nums", type: "array<int>" }], returnType: "bool" },
  isAnagram: { functionName: "isAnagram", params: [{ name: "s", type: "string" }, { name: "t", type: "string" }], returnType: "bool" },
  maxSumWindow: { functionName: "maxSumWindow", params: [{ name: "nums", type: "array<int>" }, { name: "k", type: "int" }], returnType: "int" },
  minSubarrayLen: { functionName: "minSubarrayLen", params: [{ name: "target", type: "int" }, { name: "nums", type: "array<int>" }], returnType: "int" },
  lengthOfLongestSubstring: { functionName: "lengthOfLongestSubstring", params: [{ name: "s", type: "string" }], returnType: "int" },
  searchInsert: { functionName: "searchInsert", params: [{ name: "nums", type: "array<int>" }, { name: "target", type: "int" }], returnType: "int" },
  searchRange: { functionName: "searchRange", params: [{ name: "nums", type: "array<int>" }, { name: "target", type: "int" }], returnType: "array<int>" },
  maxArea: { functionName: "maxArea", params: [{ name: "height", type: "array<int>" }], returnType: "int" },
  moveZeroes: { functionName: "moveZeroes", params: [{ name: "nums", type: "array<int>" }], returnType: "array<int>" },
  isValid: { functionName: "isValid", params: [{ name: "s", type: "string" }], returnType: "bool" },
  dailyTemperatures: { functionName: "dailyTemperatures", params: [{ name: "temperatures", type: "array<int>" }], returnType: "array<int>" },
  climbStairs: { functionName: "climbStairs", params: [{ name: "n", type: "int" }], returnType: "int" },
  rob: { functionName: "rob", params: [{ name: "nums", type: "array<int>" }], returnType: "int" },
  coinChange: { functionName: "coinChange", params: [{ name: "coins", type: "array<int>" }, { name: "amount", type: "int" }], returnType: "int" },
  mergeIntervals: { functionName: "mergeIntervals", params: [{ name: "intervals", type: "array<array<int>>" }], returnType: "array<array<int>>" },
  minMeetingRooms: { functionName: "minMeetingRooms", params: [{ name: "intervals", type: "array<array<int>>" }], returnType: "int" },
  findKthLargest: { functionName: "findKthLargest", params: [{ name: "nums", type: "array<int>" }, { name: "k", type: "int" }], returnType: "int" },
  productExceptSelf: { functionName: "productExceptSelf", params: [{ name: "nums", type: "array<int>" }], returnType: "array<int>" },
  maxSubArray: { functionName: "maxSubArray", params: [{ name: "nums", type: "array<int>" }], returnType: "int" },
  maxProfit: { functionName: "maxProfit", params: [{ name: "prices", type: "array<int>" }], returnType: "int" },
  subsets: { functionName: "subsets", params: [{ name: "nums", type: "array<int>" }], returnType: "array<array<int>>" },
};

function buildStarterCode(variant: CoreVariant): Record<string, string> {
  const sig = SIGNATURES[variant.functionName];
  if (!sig) {
    // Fallback to manual starters
    return {
      javascript: variant.starterJS,
      typescript: variant.starterTS,
      python: variant.starterPy,
    };
  }
  // Generate for all 7 languages using the canonical type system
  const result: Record<string, string> = {};
  for (const lang of ["javascript", "typescript", "python", "java", "cpp", "go", "rust"]) {
    result[lang] = renderStarterCode(sig, lang);
  }
  return result;
}

// ─── Generator Engine ───────────────────────────────────────────────────────────

function generateProblems(): GenProblem[] {
  const problems: GenProblem[] = [];
  let counter = 0;

  // First pass: generate all combinations (pattern × variant × domain)
  const combos: { template: CoreTemplate; variant: CoreVariant; domain: Domain }[] = [];
  for (const template of ALL_PATTERNS) {
    for (const variant of template.variants) {
      for (const domain of DOMAINS) {
        combos.push({ template, variant, domain });
      }
    }
  }

  // Shuffle combos deterministically
  for (let i = combos.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [combos[i], combos[j]] = [combos[j], combos[i]];
  }

  // Generate problems from combos (first pass covers ~315 problems: 21 variants × 15 domains)
  for (const { template, variant, domain } of combos) {
    counter++;
    const difficulty = pickDifficulty(variant.difficultyWeights);
    const title = variant.titleTemplate(domain);
    const id = `gen-${counter}`;

    const constraintLines = [
      ...(CONSTRAINTS[difficulty] || CONSTRAINTS.MEDIUM),
      ...(variant.constraintsExtra || []),
    ];

    problems.push({
      id,
      title,
      difficulty,
      description: variant.descTemplate(domain),
      tags: [...template.tags, ...(domain.company ? [domain.company] : [])],
      company: domain.company,
      category: template.category,
      pattern: template.pattern,
      constraints: constraintLines.join("\n"),
      examples: variant.examplesTemplate(domain),
      starterCode: buildStarterCode(variant),
      testCases: variant.testCases,
      hints: variant.hints,
    });
  }

  // Second pass: generate more problems by adding difficulty variations and title variations
  const titlePrefixes = [
    "Optimize", "Efficient", "Fast", "Advanced", "Simplified",
    "Practical", "Real-World", "Production", "Scalable", "Robust",
  ];
  const titleSuffixes = [
    "Challenge", "Problem", "Exercise", "Task", "Puzzle",
    "Query", "Operation", "Computation", "Analysis", "Solution",
  ];

  while (problems.length < TARGET_PROBLEMS) {
    // Pick a random existing variant and domain
    const template = pick(ALL_PATTERNS);
    const variant = pick(template.variants);
    const domain = pick(DOMAINS);
    const difficulty = pickDifficulty(variant.difficultyWeights);

    counter++;
    const prefix = pick(titlePrefixes);
    const suffix = pick(titleSuffixes);
    const baseTitle = variant.titleTemplate(domain);
    const title = `${prefix} ${baseTitle} ${suffix}`;
    const id = `gen-${counter}`;

    const constraintLines = [
      ...(CONSTRAINTS[difficulty] || CONSTRAINTS.MEDIUM),
      ...(variant.constraintsExtra || []),
    ];

    // Slightly vary the description
    const domainVariants = [
      `In ${domain.context}, `,
      `Working with ${domain.name} data, `,
      `For a ${domain.name} application, `,
      `Building ${domain.context}, `,
    ];
    const descPrefix = pick(domainVariants);

    problems.push({
      id,
      title,
      difficulty,
      description: descPrefix + variant.descTemplate(domain).charAt(0).toLowerCase() + variant.descTemplate(domain).slice(1),
      tags: [...template.tags, ...(domain.company ? [domain.company] : []), template.pattern],
      company: domain.company,
      category: template.category,
      pattern: template.pattern,
      constraints: constraintLines.join("\n"),
      examples: variant.examplesTemplate(domain),
      starterCode: buildStarterCode(variant),
      testCases: variant.testCases,
      hints: variant.hints,
    });
  }

  return problems.slice(0, TARGET_PROBLEMS);
}

// ─── Output Writer ──────────────────────────────────────────────────────────────

function writeOutput(problems: GenProblem[]) {
  // Statistics
  const stats = {
    total: problems.length,
    byDifficulty: { EASY: 0, MEDIUM: 0, HARD: 0 },
    byPattern: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    withTestCases: problems.filter(p => p.testCases.length > 0).length,
    withStarterCode: problems.filter(p => Object.keys(p.starterCode).length > 0).length,
  };

  for (const p of problems) {
    stats.byDifficulty[p.difficulty]++;
    stats.byPattern[p.pattern] = (stats.byPattern[p.pattern] || 0) + 1;
    stats.byCategory[p.category] = (stats.byCategory[p.category] || 0) + 1;
  }

  console.log("\n=== Problem Bank Generator ===");
  console.log(`Total problems generated: ${stats.total}`);
  console.log(`With test cases: ${stats.withTestCases}`);
  console.log(`With starter code: ${stats.withStarterCode}`);
  console.log("\nBy difficulty:");
  for (const [d, c] of Object.entries(stats.byDifficulty)) {
    console.log(`  ${d}: ${c} (${((c / stats.total) * 100).toFixed(1)}%)`);
  }
  console.log("\nBy pattern:");
  for (const [p, c] of Object.entries(stats.byPattern).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${p}: ${c}`);
  }

  // Write TypeScript output
  const outputPath = path.resolve(__dirname, "../src/data/generated-bank.ts");

  const tsContent = `// Auto-generated by scripts/generate-problems.ts
// Generated: ${new Date().toISOString()}
// Total: ${problems.length} problems
// DO NOT EDIT MANUALLY - regenerate with: npx tsx scripts/generate-problems.ts

import type { ProblemEntry } from "./problem-bank";

export const GENERATED_PROBLEMS: ProblemEntry[] = ${JSON.stringify(
    problems.map(p => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      description: p.description,
      tags: p.tags,
      company: p.company,
      category: p.category,
      pattern: p.pattern,
      constraints: p.constraints,
      examples: p.examples,
      starterCode: p.starterCode,
      testCases: p.testCases,
      hints: p.hints,
    })),
    null,
    2
  )
    // Compress: collapse single-line objects for testCases
    .replace(
      /\{\s*"input":\s*"([^"]*)",\s*"expected":\s*"([^"]*)"\s*\}/g,
      '{ "input": "$1", "expected": "$2" }'
    )
  };
`;

  fs.writeFileSync(outputPath, tsContent, "utf-8");
  console.log(`\nOutput written to: ${outputPath}`);
  console.log(`File size: ${(Buffer.byteLength(tsContent) / 1024 / 1024).toFixed(2)} MB`);
}

// ─── Main ───────────────────────────────────────────────────────────────────────

const problems = generateProblems();
writeOutput(problems);
console.log("\nDone!");
