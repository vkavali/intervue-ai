import type { ProblemEntry } from "./problem-bank";

export interface CuratedProblem extends ProblemEntry {
  testCases: { input: string; expected: string }[];
  constraints: string;
  examples: string;
  starterCode: Record<string, string>;
  pattern: string;
  patternOrder: number;
}

export interface PatternGroup {
  id: string;
  name: string;
  description: string;
  problems: CuratedProblem[];
}

export const CURATED_PATTERNS: PatternGroup[] = [
  // ─── 1. ARRAYS & HASHING ───────────────────────────────────────────────────
  {
    id: "arrays-hashing",
    name: "Arrays & Hashing",
    description:
      "Foundational problems using hash maps, sets, and array manipulation to achieve optimal time complexity. These patterns form the basis for more advanced techniques.",
    problems: [
      {
        id: "two-sum",
        title: "Two Sum",
        difficulty: "EASY",
        category: "Arrays & Hashing",
        tags: ["Array", "Hash Table"],
        pattern: "arrays-hashing",
        patternOrder: 1,
        description:
          "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume each input has exactly one solution, and you may not use the same element twice. Return the answer in any order.",
        constraints:
          "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
        examples:
          "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] == 9, so we return [0, 1].\n\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]\n\nInput: nums = [3,3], target = 6\nOutput: [0,1]",
        starterCode: {
          javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your code here
}

// Test cases
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6));       // [1, 2]
console.log(twoSum([3, 3], 6));           // [0, 1]`,
          typescript: `function twoSum(nums: number[], target: number): number[] {
  // Your code here
  return [];
}

// Test cases
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6));       // [1, 2]
console.log(twoSum([3, 3], 6));           // [0, 1]`,
          python: `def two_sum(nums: list[int], target: int) -> list[int]:
    """Return indices of two numbers that add up to target."""
    # Your code here
    pass

# Test cases
print(two_sum([2, 7, 11, 15], 9))  # [0, 1]
print(two_sum([3, 2, 4], 6))        # [1, 2]
print(two_sum([3, 3], 6))            # [0, 1]`,
          java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return null;
    }
}`,
        },
        testCases: [
          { input: "twoSum([2,7,11,15], 9)", expected: "[0,1]" },
          { input: "twoSum([3,2,4], 6)", expected: "[1,2]" },
          { input: "twoSum([3,3], 6)", expected: "[0,1]" },
          { input: "twoSum([1,5,3,7], 8)", expected: "[1,2]" },
          { input: "twoSum([0,4,3,0], 0)", expected: "[0,3]" },
          { input: "twoSum([-1,-2,-3,-4,-5], -8)", expected: "[2,4]" },
        ],
      },
      {
        id: "contains-duplicate",
        title: "Contains Duplicate",
        difficulty: "EASY",
        category: "Arrays & Hashing",
        tags: ["Array", "Hash Table", "Sorting"],
        pattern: "arrays-hashing",
        patternOrder: 2,
        description:
          "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
        constraints:
          "1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        examples:
          "Input: nums = [1,2,3,1]\nOutput: true\nExplanation: The element 1 occurs at indices 0 and 3.\n\nInput: nums = [1,2,3,4]\nOutput: false\nExplanation: All elements are distinct.\n\nInput: nums = [1,1,1,3,3,4,3,2,4,2]\nOutput: true",
        starterCode: {
          javascript: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function containsDuplicate(nums) {
  // Your code here
}

// Test cases
console.log(containsDuplicate([1, 2, 3, 1]));             // true
console.log(containsDuplicate([1, 2, 3, 4]));             // false
console.log(containsDuplicate([1, 1, 1, 3, 3, 4, 3, 2, 4, 2])); // true`,
          typescript: `function containsDuplicate(nums: number[]): boolean {
  // Your code here
  return false;
}

// Test cases
console.log(containsDuplicate([1, 2, 3, 1]));             // true
console.log(containsDuplicate([1, 2, 3, 4]));             // false
console.log(containsDuplicate([1, 1, 1, 3, 3, 4, 3, 2, 4, 2])); // true`,
          python: `def contains_duplicate(nums: list[int]) -> bool:
    """Return true if any value appears at least twice."""
    # Your code here
    pass

# Test cases
print(contains_duplicate([1, 2, 3, 1]))              # True
print(contains_duplicate([1, 2, 3, 4]))              # False
print(contains_duplicate([1, 1, 1, 3, 3, 4, 3, 2, 4, 2]))  # True`,
          java: `import java.util.*;

class Solution {
    public boolean containsDuplicate(int[] nums) {
        // Your code here
        return false;
    }
}`,
        },
        testCases: [
          { input: "containsDuplicate([1,2,3,1])", expected: "true" },
          { input: "containsDuplicate([1,2,3,4])", expected: "false" },
          { input: "containsDuplicate([1,1,1,3,3,4,3,2,4,2])", expected: "true" },
          { input: "containsDuplicate([1])", expected: "false" },
          { input: "containsDuplicate([1,1])", expected: "true" },
          { input: "containsDuplicate([0,0,0])", expected: "true" },
          { input: "containsDuplicate([-1,2,-1])", expected: "true" },
        ],
      },
      {
        id: "valid-anagram",
        title: "Valid Anagram",
        difficulty: "EASY",
        category: "Arrays & Hashing",
        tags: ["Hash Table", "String", "Sorting"],
        pattern: "arrays-hashing",
        patternOrder: 3,
        description:
          "Given two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram is a word or phrase formed by rearranging the letters of a different word or phrase, using all the original letters exactly once.",
        constraints:
          "1 <= s.length, t.length <= 5 * 10^4\ns and t consist of lowercase English letters.",
        examples:
          'Input: s = "anagram", t = "nagaram"\nOutput: true\n\nInput: s = "rat", t = "car"\nOutput: false',
        starterCode: {
          javascript: `/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
function isAnagram(s, t) {
  // Your code here
}

// Test cases
console.log(isAnagram("anagram", "nagaram")); // true
console.log(isAnagram("rat", "car"));         // false`,
          typescript: `function isAnagram(s: string, t: string): boolean {
  // Your code here
  return false;
}

// Test cases
console.log(isAnagram("anagram", "nagaram")); // true
console.log(isAnagram("rat", "car"));         // false`,
          python: `def is_anagram(s: str, t: str) -> bool:
    """Return true if t is an anagram of s."""
    # Your code here
    pass

# Test cases
print(is_anagram("anagram", "nagaram"))  # True
print(is_anagram("rat", "car"))          # False`,
          java: `class Solution {
    public boolean isAnagram(String s, String t) {
        // Your code here
        return false;
    }
}`,
        },
        testCases: [
          { input: 'isAnagram("anagram","nagaram")', expected: "true" },
          { input: 'isAnagram("rat","car")', expected: "false" },
          { input: 'isAnagram("a","a")', expected: "true" },
          { input: 'isAnagram("a","b")', expected: "false" },
          { input: 'isAnagram("ab","ba")', expected: "true" },
          { input: 'isAnagram("","" )', expected: "true" },
          { input: 'isAnagram("aacc","ccac")', expected: "false" },
        ],
      },
      {
        id: "group-anagrams",
        title: "Group Anagrams",
        difficulty: "MEDIUM",
        category: "Arrays & Hashing",
        tags: ["Array", "Hash Table", "String"],
        pattern: "arrays-hashing",
        patternOrder: 4,
        description:
          "Given an array of strings strs, group the anagrams together. You can return the answer in any order. An anagram is a word formed by rearranging the letters of another word using all the original letters exactly once.",
        constraints:
          '1 <= strs.length <= 10^4\n0 <= strs[i].length <= 100\nstrs[i] consists of lowercase English letters.',
        examples:
          'Input: strs = ["eat","tea","tan","ate","nat","bat"]\nOutput: [["bat"],["nat","tan"],["ate","eat","tea"]]\nExplanation: The groupings are: "eat","tea","ate" are anagrams; "tan","nat" are anagrams; "bat" has no anagram match.\n\nInput: strs = [""]\nOutput: [[""]]\n\nInput: strs = ["a"]\nOutput: [["a"]]',
        starterCode: {
          javascript: `/**
 * @param {string[]} strs
 * @return {string[][]}
 */
function groupAnagrams(strs) {
  // Your code here
}

// Test cases
console.log(groupAnagrams(["eat","tea","tan","ate","nat","bat"]));
// [["eat","tea","ate"],["tan","nat"],["bat"]]
console.log(groupAnagrams([""]));  // [[""]]
console.log(groupAnagrams(["a"])); // [["a"]]`,
          typescript: `function groupAnagrams(strs: string[]): string[][] {
  // Your code here
  return [];
}

// Test cases
console.log(groupAnagrams(["eat","tea","tan","ate","nat","bat"]));
console.log(groupAnagrams([""]));
console.log(groupAnagrams(["a"]));`,
          python: `def group_anagrams(strs: list[str]) -> list[list[str]]:
    """Group anagram strings together."""
    # Your code here
    pass

# Test cases
print(group_anagrams(["eat","tea","tan","ate","nat","bat"]))
print(group_anagrams([""]))
print(group_anagrams(["a"]))`,
          java: `import java.util.*;

class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        // Your code here
        return new ArrayList<>();
    }
}`,
        },
        testCases: [
          { input: 'groupAnagrams(["eat","tea","tan","ate","nat","bat"])', expected: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
          { input: 'groupAnagrams([""])', expected: '[[""]]' },
          { input: 'groupAnagrams(["a"])', expected: '[["a"]]' },
          { input: 'groupAnagrams(["abc","bca","cab","xyz","zyx"])', expected: '[["abc","bca","cab"],["xyz","zyx"]]' },
          { input: 'groupAnagrams(["a","b","c"])', expected: '[["a"],["b"],["c"]]' },
          { input: 'groupAnagrams(["listen","silent","hello"])', expected: '[["listen","silent"],["hello"]]' },
        ],
      },
      {
        id: "top-k-frequent",
        title: "Top K Frequent Elements",
        difficulty: "MEDIUM",
        category: "Arrays & Hashing",
        tags: ["Array", "Hash Table", "Heap"],
        pattern: "arrays-hashing",
        patternOrder: 5,
        description:
          "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order. It is guaranteed that the answer is unique.",
        constraints:
          "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4\nk is in the range [1, the number of unique elements in the array].\nThe answer is guaranteed to be unique.",
        examples:
          "Input: nums = [1,1,1,2,2,3], k = 2\nOutput: [1,2]\nExplanation: 1 appears 3 times, 2 appears 2 times. The two most frequent elements are 1 and 2.\n\nInput: nums = [1], k = 1\nOutput: [1]",
        starterCode: {
          javascript: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
function topKFrequent(nums, k) {
  // Your code here
}

// Test cases
console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2)); // [1, 2]
console.log(topKFrequent([1], 1));                   // [1]`,
          typescript: `function topKFrequent(nums: number[], k: number): number[] {
  // Your code here
  return [];
}

// Test cases
console.log(topKFrequent([1, 1, 1, 2, 2, 3], 2)); // [1, 2]
console.log(topKFrequent([1], 1));                   // [1]`,
          python: `def top_k_frequent(nums: list[int], k: int) -> list[int]:
    """Return the k most frequent elements."""
    # Your code here
    pass

# Test cases
print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))  # [1, 2]
print(top_k_frequent([1], 1))                    # [1]`,
          java: `import java.util.*;

class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        // Your code here
        return new int[0];
    }
}`,
        },
        testCases: [
          { input: "topKFrequent([1,1,1,2,2,3], 2)", expected: "[1,2]" },
          { input: "topKFrequent([1], 1)", expected: "[1]" },
          { input: "topKFrequent([4,4,4,1,1,2,2,2,3], 2)", expected: "[4,2]" },
          { input: "topKFrequent([1,2], 2)", expected: "[1,2]" },
          { input: "topKFrequent([3,3,3,3], 1)", expected: "[3]" },
          { input: "topKFrequent([5,5,1,1,2,2,3,3], 4)", expected: "[5,1,2,3]" },
        ],
      },
      {
        id: "product-except-self",
        title: "Product of Array Except Self",
        difficulty: "MEDIUM",
        category: "Arrays & Hashing",
        tags: ["Array", "Prefix Sum"],
        pattern: "arrays-hashing",
        patternOrder: 6,
        description:
          "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. You must solve it without using division and in O(n) time complexity.",
        constraints:
          "2 <= nums.length <= 10^5\n-30 <= nums[i] <= 30\nThe product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.",
        examples:
          "Input: nums = [1,2,3,4]\nOutput: [24,12,8,6]\nExplanation: For index 0: 2*3*4=24, index 1: 1*3*4=12, index 2: 1*2*4=8, index 3: 1*2*3=6.\n\nInput: nums = [-1,1,0,-3,3]\nOutput: [0,0,9,0,0]",
        starterCode: {
          javascript: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
function productExceptSelf(nums) {
  // Your code here
}

// Test cases
console.log(productExceptSelf([1, 2, 3, 4]));      // [24, 12, 8, 6]
console.log(productExceptSelf([-1, 1, 0, -3, 3])); // [0, 0, 9, 0, 0]`,
          typescript: `function productExceptSelf(nums: number[]): number[] {
  // Your code here
  return [];
}

// Test cases
console.log(productExceptSelf([1, 2, 3, 4]));      // [24, 12, 8, 6]
console.log(productExceptSelf([-1, 1, 0, -3, 3])); // [0, 0, 9, 0, 0]`,
          python: `def product_except_self(nums: list[int]) -> list[int]:
    """Return array where each element is product of all others."""
    # Your code here
    pass

# Test cases
print(product_except_self([1, 2, 3, 4]))       # [24, 12, 8, 6]
print(product_except_self([-1, 1, 0, -3, 3]))  # [0, 0, 9, 0, 0]`,
          java: `import java.util.*;

class Solution {
    public int[] productExceptSelf(int[] nums) {
        // Your code here
        return new int[0];
    }
}`,
        },
        testCases: [
          { input: "productExceptSelf([1,2,3,4])", expected: "[24,12,8,6]" },
          { input: "productExceptSelf([-1,1,0,-3,3])", expected: "[0,0,9,0,0]" },
          { input: "productExceptSelf([2,3])", expected: "[3,2]" },
          { input: "productExceptSelf([1,1,1,1])", expected: "[1,1,1,1]" },
          { input: "productExceptSelf([0,0])", expected: "[0,0]" },
          { input: "productExceptSelf([5,1,2,10])", expected: "[20,100,50,10]" },
        ],
      },
    ],
  },

  // ─── 2. TWO POINTERS ───────────────────────────────────────────────────────
  {
    id: "two-pointers",
    name: "Two Pointers",
    description:
      "Use two pointers moving toward or away from each other to efficiently solve problems on sorted arrays and strings without extra space.",
    problems: [
      {
        id: "valid-palindrome",
        title: "Valid Palindrome",
        difficulty: "EASY",
        category: "Two Pointers",
        tags: ["Two Pointers", "String"],
        pattern: "two-pointers",
        patternOrder: 1,
        description:
          "A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string s, return true if it is a palindrome, or false otherwise.",
        constraints:
          "1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.",
        examples:
          'Input: s = "A man, a plan, a canal: Panama"\nOutput: true\nExplanation: After filtering: "amanaplanacanalpanama", which is a palindrome.\n\nInput: s = "race a car"\nOutput: false\nExplanation: After filtering: "raceacar", which is not a palindrome.\n\nInput: s = " "\nOutput: true\nExplanation: After filtering, s is an empty string. An empty string is a palindrome by definition.',
        starterCode: {
          javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
  // Your code here
}

// Test cases
console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car"));                      // false
console.log(isPalindrome(" "));                                // true`,
          typescript: `function isPalindrome(s: string): boolean {
  // Your code here
  return false;
}

// Test cases
console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car"));                      // false
console.log(isPalindrome(" "));                                // true`,
          python: `def is_palindrome(s: str) -> bool:
    """Return true if s is a valid palindrome ignoring non-alphanumeric chars."""
    # Your code here
    pass

# Test cases
print(is_palindrome("A man, a plan, a canal: Panama"))  # True
print(is_palindrome("race a car"))                       # False
print(is_palindrome(" "))                                 # True`,
          java: `class Solution {
    public boolean isPalindrome(String s) {
        // Your code here
        return false;
    }
}`,
        },
        testCases: [
          { input: 'isPalindrome("A man, a plan, a canal: Panama")', expected: "true" },
          { input: 'isPalindrome("race a car")', expected: "false" },
          { input: 'isPalindrome(" ")', expected: "true" },
          { input: 'isPalindrome("a")', expected: "true" },
          { input: 'isPalindrome("ab")', expected: "false" },
          { input: 'isPalindrome("0P")', expected: "false" },
          { input: 'isPalindrome("aa")', expected: "true" },
        ],
      },
      {
        id: "two-sum-ii",
        title: "Two Sum II - Input Array Is Sorted",
        difficulty: "MEDIUM",
        category: "Two Pointers",
        tags: ["Array", "Two Pointers", "Binary Search"],
        pattern: "two-pointers",
        patternOrder: 2,
        description:
          "Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target. Return the indices of the two numbers (1-indexed) as an array [index1, index2]. You may not use the same element twice. There is exactly one solution.",
        constraints:
          "2 <= numbers.length <= 3 * 10^4\n-1000 <= numbers[i] <= 1000\nnumbers is sorted in non-decreasing order.\n-1000 <= target <= 1000\nOnly one valid answer exists.",
        examples:
          "Input: numbers = [2,7,11,15], target = 9\nOutput: [1,2]\nExplanation: 2 + 7 = 9. So index1 = 1 and index2 = 2. Return [1, 2].\n\nInput: numbers = [2,3,4], target = 6\nOutput: [1,3]\n\nInput: numbers = [-1,0], target = -1\nOutput: [1,2]",
        starterCode: {
          javascript: `/**
 * @param {number[]} numbers
 * @param {number} target
 * @return {number[]}
 */
function twoSumII(numbers, target) {
  // Your code here
}

// Test cases
console.log(twoSumII([2, 7, 11, 15], 9)); // [1, 2]
console.log(twoSumII([2, 3, 4], 6));       // [1, 3]
console.log(twoSumII([-1, 0], -1));         // [1, 2]`,
          typescript: `function twoSumII(numbers: number[], target: number): number[] {
  // Your code here
  return [];
}

// Test cases
console.log(twoSumII([2, 7, 11, 15], 9)); // [1, 2]
console.log(twoSumII([2, 3, 4], 6));       // [1, 3]
console.log(twoSumII([-1, 0], -1));         // [1, 2]`,
          python: `def two_sum_ii(numbers: list[int], target: int) -> list[int]:
    """Return 1-indexed indices of two numbers that add up to target."""
    # Your code here
    pass

# Test cases
print(two_sum_ii([2, 7, 11, 15], 9))  # [1, 2]
print(two_sum_ii([2, 3, 4], 6))        # [1, 3]
print(two_sum_ii([-1, 0], -1))          # [1, 2]`,
          java: `class Solution {
    public int[] twoSumII(int[] numbers, int target) {
        // Your code here
        return new int[0];
    }
}`,
        },
        testCases: [
          { input: "twoSumII([2,7,11,15], 9)", expected: "[1,2]" },
          { input: "twoSumII([2,3,4], 6)", expected: "[1,3]" },
          { input: "twoSumII([-1,0], -1)", expected: "[1,2]" },
          { input: "twoSumII([1,2,3,4,5], 9)", expected: "[4,5]" },
          { input: "twoSumII([1,3,5,7,9], 12)", expected: "[2,5]" },
          { input: "twoSumII([0,0,3,4], 0)", expected: "[1,2]" },
        ],
      },
      {
        id: "three-sum",
        title: "3Sum",
        difficulty: "MEDIUM",
        category: "Two Pointers",
        tags: ["Array", "Two Pointers", "Sorting"],
        pattern: "two-pointers",
        patternOrder: 3,
        description:
          "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.",
        constraints:
          "3 <= nums.length <= 3000\n-10^5 <= nums[i] <= 10^5",
        examples:
          "Input: nums = [-1,0,1,2,-1,-4]\nOutput: [[-1,-1,2],[-1,0,1]]\nExplanation: nums[0] + nums[1] + nums[2] = -1 + 0 + 1 = 0. nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0. nums[0] + nums[3] + nums[4] = -1 + 2 + (-1) = 0. The distinct triplets are [-1,0,1] and [-1,-1,2].\n\nInput: nums = [0,1,1]\nOutput: []\n\nInput: nums = [0,0,0]\nOutput: [[0,0,0]]",
        starterCode: {
          javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
  // Your code here
}

// Test cases
console.log(threeSum([-1, 0, 1, 2, -1, -4])); // [[-1,-1,2],[-1,0,1]]
console.log(threeSum([0, 1, 1]));               // []
console.log(threeSum([0, 0, 0]));               // [[0,0,0]]`,
          typescript: `function threeSum(nums: number[]): number[][] {
  // Your code here
  return [];
}

// Test cases
console.log(threeSum([-1, 0, 1, 2, -1, -4])); // [[-1,-1,2],[-1,0,1]]
console.log(threeSum([0, 1, 1]));               // []
console.log(threeSum([0, 0, 0]));               // [[0,0,0]]`,
          python: `def three_sum(nums: list[int]) -> list[list[int]]:
    """Return all unique triplets that sum to zero."""
    # Your code here
    pass

# Test cases
print(three_sum([-1, 0, 1, 2, -1, -4]))  # [[-1,-1,2],[-1,0,1]]
print(three_sum([0, 1, 1]))                # []
print(three_sum([0, 0, 0]))                # [[0,0,0]]`,
          java: `import java.util.*;

class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        // Your code here
        return new ArrayList<>();
    }
}`,
        },
        testCases: [
          { input: "threeSum([-1,0,1,2,-1,-4])", expected: "[[-1,-1,2],[-1,0,1]]" },
          { input: "threeSum([0,1,1])", expected: "[]" },
          { input: "threeSum([0,0,0])", expected: "[[0,0,0]]" },
          { input: "threeSum([-2,0,1,1,2])", expected: "[[-2,0,2],[-2,1,1]]" },
          { input: "threeSum([1,2,-2,-1])", expected: "[]" },
          { input: "threeSum([0,0,0,0])", expected: "[[0,0,0]]" },
        ],
      },
      {
        id: "container-most-water",
        title: "Container With Most Water",
        difficulty: "MEDIUM",
        category: "Two Pointers",
        tags: ["Array", "Two Pointers", "Greedy"],
        pattern: "two-pointers",
        patternOrder: 4,
        description:
          "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container that holds the most water. Return the maximum amount of water the container can store.",
        constraints:
          "n == height.length\n2 <= n <= 10^5\n0 <= height[i] <= 10^4",
        examples:
          "Input: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49\nExplanation: Lines at indices 1 (height 8) and 8 (height 7) form a container of width 7 and height 7 = 7 * 7 = 49.\n\nInput: height = [1,1]\nOutput: 1",
        starterCode: {
          javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
  // Your code here
}

// Test cases
console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49
console.log(maxArea([1, 1]));                         // 1`,
          typescript: `function maxArea(height: number[]): number {
  // Your code here
  return 0;
}

// Test cases
console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49
console.log(maxArea([1, 1]));                         // 1`,
          python: `def max_area(height: list[int]) -> int:
    """Return the maximum area of water a container can hold."""
    # Your code here
    pass

# Test cases
print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))  # 49
print(max_area([1, 1]))                          # 1`,
          java: `class Solution {
    public int maxArea(int[] height) {
        // Your code here
        return 0;
    }
}`,
        },
        testCases: [
          { input: "maxArea([1,8,6,2,5,4,8,3,7])", expected: "49" },
          { input: "maxArea([1,1])", expected: "1" },
          { input: "maxArea([4,3,2,1,4])", expected: "16" },
          { input: "maxArea([1,2,1])", expected: "2" },
          { input: "maxArea([2,3,4,5,18,17,6])", expected: "17" },
          { input: "maxArea([1,2,4,3])", expected: "4" },
        ],
      },
      {
        id: "trapping-rain-water",
        title: "Trapping Rain Water",
        difficulty: "HARD",
        category: "Two Pointers",
        tags: ["Array", "Two Pointers", "Dynamic Programming"],
        pattern: "two-pointers",
        patternOrder: 5,
        description:
          "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining. Water is trapped between bars based on the minimum of the maximum heights on both sides.",
        constraints:
          "n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5",
        examples:
          "Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6\nExplanation: 6 units of rain water are trapped between the bars.\n\nInput: height = [4,2,0,3,2,5]\nOutput: 9",
        starterCode: {
          javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
  // Your code here
}

// Test cases
console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])); // 6
console.log(trap([4, 2, 0, 3, 2, 5]));                      // 9`,
          typescript: `function trap(height: number[]): number {
  // Your code here
  return 0;
}

// Test cases
console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])); // 6
console.log(trap([4, 2, 0, 3, 2, 5]));                      // 9`,
          python: `def trap(height: list[int]) -> int:
    """Compute how much water can be trapped after raining."""
    # Your code here
    pass

# Test cases
print(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))  # 6
print(trap([4, 2, 0, 3, 2, 5]))                       # 9`,
          java: `class Solution {
    public int trap(int[] height) {
        // Your code here
        return 0;
    }
}`,
        },
        testCases: [
          { input: "trap([0,1,0,2,1,0,1,3,2,1,2,1])", expected: "6" },
          { input: "trap([4,2,0,3,2,5])", expected: "9" },
          { input: "trap([1,0,1])", expected: "1" },
          { input: "trap([3,0,0,2,0,4])", expected: "10" },
          { input: "trap([0])", expected: "0" },
          { input: "trap([1,2,3,4,5])", expected: "0" },
          { input: "trap([5,4,3,2,1])", expected: "0" },
        ],
      },
    ],
  },

  // ─── 3. SLIDING WINDOW ─────────────────────────────────────────────────────
  {
    id: "sliding-window",
    name: "Sliding Window",
    description:
      "Maintain a dynamic window over a sequence to efficiently compute running aggregates, find optimal substrings, or satisfy constraints without re-scanning.",
    problems: [
      {
        id: "best-time-buy-sell",
        title: "Best Time to Buy and Sell Stock",
        difficulty: "EASY",
        category: "Sliding Window",
        tags: ["Array", "Sliding Window", "Dynamic Programming"],
        pattern: "sliding-window",
        patternOrder: 1,
        description:
          "You are given an array prices where prices[i] is the price of a stock on the ith day. You want to maximize your profit by choosing a single day to buy and a single day to sell in the future. Return the maximum profit you can achieve. If no profit is possible, return 0.",
        constraints:
          "1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4",
        examples:
          "Input: prices = [7,1,5,3,6,4]\nOutput: 5\nExplanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.\n\nInput: prices = [7,6,4,3,1]\nOutput: 0\nExplanation: No profitable transaction is possible.",
        starterCode: {
          javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
  // Your code here
}

// Test cases
console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5
console.log(maxProfit([7, 6, 4, 3, 1]));     // 0`,
          typescript: `function maxProfit(prices: number[]): number {
  // Your code here
  return 0;
}

// Test cases
console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5
console.log(maxProfit([7, 6, 4, 3, 1]));     // 0`,
          python: `def max_profit(prices: list[int]) -> int:
    """Return the maximum profit from a single buy-sell transaction."""
    # Your code here
    pass

# Test cases
print(max_profit([7, 1, 5, 3, 6, 4]))  # 5
print(max_profit([7, 6, 4, 3, 1]))      # 0`,
          java: `class Solution {
    public int maxProfit(int[] prices) {
        // Your code here
        return 0;
    }
}`,
        },
        testCases: [
          { input: "maxProfit([7,1,5,3,6,4])", expected: "5" },
          { input: "maxProfit([7,6,4,3,1])", expected: "0" },
          { input: "maxProfit([1,2])", expected: "1" },
          { input: "maxProfit([2,1])", expected: "0" },
          { input: "maxProfit([2,4,1])", expected: "2" },
          { input: "maxProfit([1])", expected: "0" },
          { input: "maxProfit([3,1,4,1,5,9,2,6])", expected: "8" },
        ],
      },
      {
        id: "longest-substr-no-repeat",
        title: "Longest Substring Without Repeating Characters",
        difficulty: "MEDIUM",
        category: "Sliding Window",
        tags: ["Hash Table", "String", "Sliding Window"],
        pattern: "sliding-window",
        patternOrder: 2,
        description:
          "Given a string s, find the length of the longest substring without repeating characters. A substring is a contiguous non-empty sequence of characters within a string.",
        constraints:
          "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols, and spaces.",
        examples:
          'Input: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.\n\nInput: s = "bbbbb"\nOutput: 1\nExplanation: The answer is "b", with the length of 1.\n\nInput: s = "pwwkew"\nOutput: 3\nExplanation: The answer is "wke", with the length of 3.',
        starterCode: {
          javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Your code here
}

// Test cases
console.log(lengthOfLongestSubstring("abcabcbb")); // 3
console.log(lengthOfLongestSubstring("bbbbb"));     // 1
console.log(lengthOfLongestSubstring("pwwkew"));    // 3`,
          typescript: `function lengthOfLongestSubstring(s: string): number {
  // Your code here
  return 0;
}

// Test cases
console.log(lengthOfLongestSubstring("abcabcbb")); // 3
console.log(lengthOfLongestSubstring("bbbbb"));     // 1
console.log(lengthOfLongestSubstring("pwwkew"));    // 3`,
          python: `def length_of_longest_substring(s: str) -> int:
    """Return the length of the longest substring without repeating characters."""
    # Your code here
    pass

# Test cases
print(length_of_longest_substring("abcabcbb"))  # 3
print(length_of_longest_substring("bbbbb"))      # 1
print(length_of_longest_substring("pwwkew"))     # 3`,
          java: `import java.util.*;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Your code here
        return 0;
    }
}`,
        },
        testCases: [
          { input: 'lengthOfLongestSubstring("abcabcbb")', expected: "3" },
          { input: 'lengthOfLongestSubstring("bbbbb")', expected: "1" },
          { input: 'lengthOfLongestSubstring("pwwkew")', expected: "3" },
          { input: 'lengthOfLongestSubstring("")', expected: "0" },
          { input: 'lengthOfLongestSubstring(" ")', expected: "1" },
          { input: 'lengthOfLongestSubstring("au")', expected: "2" },
          { input: 'lengthOfLongestSubstring("dvdf")', expected: "3" },
        ],
      },
      {
        id: "longest-repeating-char",
        title: "Longest Repeating Character Replacement",
        difficulty: "MEDIUM",
        category: "Sliding Window",
        tags: ["Hash Table", "String", "Sliding Window"],
        pattern: "sliding-window",
        patternOrder: 3,
        description:
          "You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English letter. You can perform this operation at most k times. Return the length of the longest substring containing the same letter you can get after performing the above operations.",
        constraints:
          "1 <= s.length <= 10^5\ns consists of only uppercase English letters.\n0 <= k <= s.length",
        examples:
          'Input: s = "ABAB", k = 2\nOutput: 4\nExplanation: Replace the two A\'s with B\'s or vice versa.\n\nInput: s = "AABABBA", k = 1\nOutput: 4\nExplanation: Replace the B at index 3 with A to get "AAAAABA", giving a longest repeating substring of length 4.',
        starterCode: {
          javascript: `/**
 * @param {string} s
 * @param {number} k
 * @return {number}
 */
function characterReplacement(s, k) {
  // Your code here
}

// Test cases
console.log(characterReplacement("ABAB", 2));    // 4
console.log(characterReplacement("AABABBA", 1)); // 4`,
          typescript: `function characterReplacement(s: string, k: number): number {
  // Your code here
  return 0;
}

// Test cases
console.log(characterReplacement("ABAB", 2));    // 4
console.log(characterReplacement("AABABBA", 1)); // 4`,
          python: `def character_replacement(s: str, k: int) -> int:
    """Return the longest substring with same letter after at most k replacements."""
    # Your code here
    pass

# Test cases
print(character_replacement("ABAB", 2))     # 4
print(character_replacement("AABABBA", 1))  # 4`,
          java: `import java.util.*;

class Solution {
    public int characterReplacement(String s, int k) {
        // Your code here
        return 0;
    }
}`,
        },
        testCases: [
          { input: 'characterReplacement("ABAB", 2)', expected: "4" },
          { input: 'characterReplacement("AABABBA", 1)', expected: "4" },
          { input: 'characterReplacement("AAAA", 0)', expected: "4" },
          { input: 'characterReplacement("ABCD", 2)', expected: "3" },
          { input: 'characterReplacement("A", 0)', expected: "1" },
          { input: 'characterReplacement("ABBB", 2)', expected: "4" },
        ],
      },
      {
        id: "permutation-in-string",
        title: "Permutation in String",
        difficulty: "MEDIUM",
        category: "Sliding Window",
        tags: ["Hash Table", "String", "Sliding Window"],
        pattern: "sliding-window",
        patternOrder: 4,
        description:
          "Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise. In other words, return true if one of s1's permutations is a substring of s2.",
        constraints:
          "1 <= s1.length, s2.length <= 10^4\ns1 and s2 consist of lowercase English letters.",
        examples:
          'Input: s1 = "ab", s2 = "eidbaooo"\nOutput: true\nExplanation: s2 contains one permutation of s1 ("ba").\n\nInput: s1 = "ab", s2 = "eidboaoo"\nOutput: false',
        starterCode: {
          javascript: `/**
 * @param {string} s1
 * @param {string} s2
 * @return {boolean}
 */
function checkInclusion(s1, s2) {
  // Your code here
}

// Test cases
console.log(checkInclusion("ab", "eidbaooo")); // true
console.log(checkInclusion("ab", "eidboaoo")); // false`,
          typescript: `function checkInclusion(s1: string, s2: string): boolean {
  // Your code here
  return false;
}

// Test cases
console.log(checkInclusion("ab", "eidbaooo")); // true
console.log(checkInclusion("ab", "eidboaoo")); // false`,
          python: `def check_inclusion(s1: str, s2: str) -> bool:
    """Return true if s2 contains a permutation of s1."""
    # Your code here
    pass

# Test cases
print(check_inclusion("ab", "eidbaooo"))  # True
print(check_inclusion("ab", "eidboaoo"))  # False`,
          java: `class Solution {
    public boolean checkInclusion(String s1, String s2) {
        // Your code here
        return false;
    }
}`,
        },
        testCases: [
          { input: 'checkInclusion("ab","eidbaooo")', expected: "true" },
          { input: 'checkInclusion("ab","eidboaoo")', expected: "false" },
          { input: 'checkInclusion("a","a")', expected: "true" },
          { input: 'checkInclusion("abc","ccccbbbbaaaa")', expected: "false" },
          { input: 'checkInclusion("adc","dcda")', expected: "true" },
          { input: 'checkInclusion("hello","ooolleoooleh")', expected: "false" },
        ],
      },
      {
        id: "min-window-substring",
        title: "Minimum Window Substring",
        difficulty: "HARD",
        category: "Sliding Window",
        tags: ["Hash Table", "String", "Sliding Window"],
        pattern: "sliding-window",
        patternOrder: 5,
        description:
          'Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string "". The answer is guaranteed to be unique when it exists.',
        constraints:
          "m == s.length\nn == t.length\n1 <= m, n <= 10^5\ns and t consist of uppercase and lowercase English letters.",
        examples:
          'Input: s = "ADOBECODEBANC", t = "ABC"\nOutput: "BANC"\nExplanation: The minimum window substring "BANC" includes \'A\', \'B\', and \'C\' from string t.\n\nInput: s = "a", t = "a"\nOutput: "a"\n\nInput: s = "a", t = "aa"\nOutput: ""\nExplanation: Both \'a\'s from t must be included. Since s only has one \'a\', return empty string.',
        starterCode: {
          javascript: `/**
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
function minWindow(s, t) {
  // Your code here
}

// Test cases
console.log(minWindow("ADOBECODEBANC", "ABC")); // "BANC"
console.log(minWindow("a", "a"));                 // "a"
console.log(minWindow("a", "aa"));                // ""`,
          typescript: `function minWindow(s: string, t: string): string {
  // Your code here
  return "";
}

// Test cases
console.log(minWindow("ADOBECODEBANC", "ABC")); // "BANC"
console.log(minWindow("a", "a"));                 // "a"
console.log(minWindow("a", "aa"));                // ""`,
          python: `def min_window(s: str, t: str) -> str:
    """Return the minimum window substring of s containing all characters of t."""
    # Your code here
    pass

# Test cases
print(min_window("ADOBECODEBANC", "ABC"))  # "BANC"
print(min_window("a", "a"))                 # "a"
print(min_window("a", "aa"))                # ""`,
          java: `import java.util.*;

class Solution {
    public String minWindow(String s, String t) {
        // Your code here
        return "";
    }
}`,
        },
        testCases: [
          { input: 'minWindow("ADOBECODEBANC","ABC")', expected: '"BANC"' },
          { input: 'minWindow("a","a")', expected: '"a"' },
          { input: 'minWindow("a","aa")', expected: '""' },
          { input: 'minWindow("aa","aa")', expected: '"aa"' },
          { input: 'minWindow("abc","b")', expected: '"b"' },
          { input: 'minWindow("cabwefgewcwaefgcf","cae")', expected: '"cwae"' },
        ],
      },
    ],
  },

  // ─── 4. STACK ───────────────────────────────────────────────────────────────
  {
    id: "stack",
    name: "Stack",
    description:
      "Leverage last-in-first-out ordering to solve problems involving matching, nesting, monotonic sequences, and expression evaluation.",
    problems: [
      {
        id: "valid-parentheses",
        title: "Valid Parentheses",
        difficulty: "EASY",
        category: "Stack",
        tags: ["String", "Stack"],
        pattern: "stack",
        patternOrder: 1,
        description:
          "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets, and open brackets are closed in the correct order. Every close bracket has a corresponding open bracket of the same type.",
        constraints:
          "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
        examples:
          'Input: s = "()"\nOutput: true\n\nInput: s = "()[]{}"\nOutput: true\n\nInput: s = "(]"\nOutput: false',
        starterCode: {
          javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Your code here
}

// Test cases
console.log(isValid("()"));     // true
console.log(isValid("()[]{}")); // true
console.log(isValid("(]"));     // false`,
          typescript: `function isValid(s: string): boolean {
  // Your code here
  return false;
}

// Test cases
console.log(isValid("()"));     // true
console.log(isValid("()[]{}")); // true
console.log(isValid("(]"));     // false`,
          python: `def is_valid(s: str) -> bool:
    """Return true if the string has valid bracket nesting."""
    # Your code here
    pass

# Test cases
print(is_valid("()"))      # True
print(is_valid("()[]{}"))  # True
print(is_valid("(]"))      # False`,
          java: `import java.util.*;

class Solution {
    public boolean isValid(String s) {
        // Your code here
        return false;
    }
}`,
        },
        testCases: [
          { input: 'isValid("()")', expected: "true" },
          { input: 'isValid("()[]{}")', expected: "true" },
          { input: 'isValid("(]")', expected: "false" },
          { input: 'isValid("([)]")', expected: "false" },
          { input: 'isValid("{[]}")', expected: "true" },
          { input: 'isValid("(")', expected: "false" },
          { input: 'isValid("]")', expected: "false" },
        ],
      },
      {
        id: "min-stack",
        title: "Min Stack",
        difficulty: "MEDIUM",
        category: "Stack",
        tags: ["Stack", "Design"],
        pattern: "stack",
        patternOrder: 2,
        description:
          "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time. Implement the MinStack class with: push(val) pushes val onto the stack, pop() removes the top element, top() gets the top element, and getMin() retrieves the minimum element in the stack.",
        constraints:
          "-2^31 <= val <= 2^31 - 1\nMethods pop, top and getMin will always be called on non-empty stacks.\nAt most 3 * 10^4 calls will be made to push, pop, top, and getMin.",
        examples:
          'Input:\n["MinStack","push","push","push","getMin","pop","top","getMin"]\n[[],[-2],[0],[-3],[],[],[],[]]\nOutput: [null,null,null,null,-3,null,0,-2]\nExplanation:\nMinStack minStack = new MinStack();\nminStack.push(-2);\nminStack.push(0);\nminStack.push(-3);\nminStack.getMin(); // return -3\nminStack.pop();\nminStack.top();    // return 0\nminStack.getMin(); // return -2',
        starterCode: {
          javascript: `class MinStack {
  constructor() {
    // Your code here
  }

  /** @param {number} val */
  push(val) {
    // Your code here
  }

  pop() {
    // Your code here
  }

  /** @return {number} */
  top() {
    // Your code here
  }

  /** @return {number} */
  getMin() {
    // Your code here
  }
}

// Test cases
const ms = new MinStack();
ms.push(-2); ms.push(0); ms.push(-3);
console.log(ms.getMin()); // -3
ms.pop();
console.log(ms.top());    // 0
console.log(ms.getMin()); // -2`,
          typescript: `class MinStack {
  constructor() {
    // Your code here
  }

  push(val: number): void {
    // Your code here
  }

  pop(): void {
    // Your code here
  }

  top(): number {
    // Your code here
    return 0;
  }

  getMin(): number {
    // Your code here
    return 0;
  }
}

// Test cases
const ms = new MinStack();
ms.push(-2); ms.push(0); ms.push(-3);
console.log(ms.getMin()); // -3
ms.pop();
console.log(ms.top());    // 0
console.log(ms.getMin()); // -2`,
          python: `class MinStack:
    """Stack that supports O(1) push, pop, top, and get_min."""

    def __init__(self):
        # Your code here
        pass

    def push(self, val: int) -> None:
        # Your code here
        pass

    def pop(self) -> None:
        # Your code here
        pass

    def top(self) -> int:
        # Your code here
        pass

    def get_min(self) -> int:
        # Your code here
        pass

# Test cases
ms = MinStack()
ms.push(-2); ms.push(0); ms.push(-3)
print(ms.get_min())  # -3
ms.pop()
print(ms.top())      # 0
print(ms.get_min())  # -2`,
          java: `import java.util.*;

class MinStack {
    public MinStack() {
        // Initialize
    }

    public void push(int val) {
        // Your code here
    }

    public void pop() {
        // Your code here
    }

    public int top() {
        // Your code here
        return 0;
    }

    public int getMin() {
        // Your code here
        return 0;
    }
}`,
        },
        testCases: [
          { input: "(() => { const s = new MinStack(); s.push(-2); s.push(0); s.push(-3); return s.getMin(); })()", expected: "-3" },
          { input: "(() => { const s = new MinStack(); s.push(-2); s.push(0); s.push(-3); s.pop(); return s.top(); })()", expected: "0" },
          { input: "(() => { const s = new MinStack(); s.push(-2); s.push(0); s.push(-3); s.pop(); return s.getMin(); })()", expected: "-2" },
          { input: "(() => { const s = new MinStack(); s.push(1); s.push(2); return s.getMin(); })()", expected: "1" },
          { input: "(() => { const s = new MinStack(); s.push(2); s.push(1); s.pop(); return s.getMin(); })()", expected: "2" },
          { input: "(() => { const s = new MinStack(); s.push(0); s.push(0); s.pop(); return s.getMin(); })()", expected: "0" },
        ],
      },
      {
        id: "eval-reverse-polish",
        title: "Evaluate Reverse Polish Notation",
        difficulty: "MEDIUM",
        category: "Stack",
        tags: ["Array", "Stack", "Math"],
        pattern: "stack",
        patternOrder: 3,
        description:
          'You are given an array of strings tokens that represents an arithmetic expression in Reverse Polish Notation. Evaluate the expression and return an integer that represents the value. Valid operators are +, -, *, and /. Each operand may be an integer or another expression. Division between two integers truncates toward zero. The input is guaranteed to be a valid RPN expression and will always produce a valid result.',
        constraints:
          '1 <= tokens.length <= 10^4\ntokens[i] is either an operator: "+", "-", "*", "/", or an integer in the range [-200, 200].',
        examples:
          'Input: tokens = ["2","1","+","3","*"]\nOutput: 9\nExplanation: ((2 + 1) * 3) = 9\n\nInput: tokens = ["4","13","5","/","+"]\nOutput: 6\nExplanation: (4 + (13 / 5)) = 6\n\nInput: tokens = ["10","6","9","3","+","-11","*","/","*","17","+","5","+"]\nOutput: 22',
        starterCode: {
          javascript: `/**
 * @param {string[]} tokens
 * @return {number}
 */
function evalRPN(tokens) {
  // Your code here
}

// Test cases
console.log(evalRPN(["2","1","+","3","*"]));                                      // 9
console.log(evalRPN(["4","13","5","/","+"]));                                     // 6
console.log(evalRPN(["10","6","9","3","+","-11","*","/","*","17","+","5","+"])); // 22`,
          typescript: `function evalRPN(tokens: string[]): number {
  // Your code here
  return 0;
}

// Test cases
console.log(evalRPN(["2","1","+","3","*"]));                                      // 9
console.log(evalRPN(["4","13","5","/","+"]));                                     // 6
console.log(evalRPN(["10","6","9","3","+","-11","*","/","*","17","+","5","+"])); // 22`,
          python: `def eval_rpn(tokens: list[str]) -> int:
    """Evaluate the arithmetic expression in Reverse Polish Notation."""
    # Your code here
    pass

# Test cases
print(eval_rpn(["2","1","+","3","*"]))                                        # 9
print(eval_rpn(["4","13","5","/","+"]))                                       # 6
print(eval_rpn(["10","6","9","3","+","-11","*","/","*","17","+","5","+"]))   # 22`,
          java: `import java.util.*;

class Solution {
    public int evalRPN(String[] tokens) {
        // Your code here
        return 0;
    }
}`,
        },
        testCases: [
          { input: 'evalRPN(["2","1","+","3","*"])', expected: "9" },
          { input: 'evalRPN(["4","13","5","/","+"])', expected: "6" },
          { input: 'evalRPN(["10","6","9","3","+","-11","*","/","*","17","+","5","+"])', expected: "22" },
          { input: 'evalRPN(["3"])', expected: "3" },
          { input: 'evalRPN(["1","2","+"])', expected: "3" },
          { input: 'evalRPN(["6","3","/"])', expected: "2" },
          { input: 'evalRPN(["7","2","-"])', expected: "5" },
        ],
      },
      {
        id: "daily-temperatures",
        title: "Daily Temperatures",
        difficulty: "MEDIUM",
        category: "Stack",
        tags: ["Array", "Stack", "Monotonic Stack"],
        pattern: "stack",
        patternOrder: 4,
        description:
          "Given an array of integers temperatures representing daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day that is warmer, set answer[i] to 0.",
        constraints:
          "1 <= temperatures.length <= 10^5\n30 <= temperatures[i] <= 100",
        examples:
          "Input: temperatures = [73,74,75,71,69,72,76,73]\nOutput: [1,1,4,2,1,1,0,0]\nExplanation: For day 0 (73), the next warmer day is day 1 (74), so answer[0]=1. For day 2 (75), the next warmer day is day 6 (76), so answer[2]=4.\n\nInput: temperatures = [30,40,50,60]\nOutput: [1,1,1,0]\n\nInput: temperatures = [30,60,90]\nOutput: [1,1,0]",
        starterCode: {
          javascript: `/**
 * @param {number[]} temperatures
 * @return {number[]}
 */
function dailyTemperatures(temperatures) {
  // Your code here
}

// Test cases
console.log(dailyTemperatures([73,74,75,71,69,72,76,73])); // [1,1,4,2,1,1,0,0]
console.log(dailyTemperatures([30,40,50,60]));               // [1,1,1,0]
console.log(dailyTemperatures([30,60,90]));                   // [1,1,0]`,
          typescript: `function dailyTemperatures(temperatures: number[]): number[] {
  // Your code here
  return [];
}

// Test cases
console.log(dailyTemperatures([73,74,75,71,69,72,76,73])); // [1,1,4,2,1,1,0,0]
console.log(dailyTemperatures([30,40,50,60]));               // [1,1,1,0]
console.log(dailyTemperatures([30,60,90]));                   // [1,1,0]`,
          python: `def daily_temperatures(temperatures: list[int]) -> list[int]:
    """Return the number of days to wait for a warmer temperature."""
    # Your code here
    pass

# Test cases
print(daily_temperatures([73,74,75,71,69,72,76,73]))  # [1,1,4,2,1,1,0,0]
print(daily_temperatures([30,40,50,60]))                # [1,1,1,0]
print(daily_temperatures([30,60,90]))                    # [1,1,0]`,
          java: `import java.util.*;

class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        // Your code here
        return new int[0];
    }
}`,
        },
        testCases: [
          { input: "dailyTemperatures([73,74,75,71,69,72,76,73])", expected: "[1,1,4,2,1,1,0,0]" },
          { input: "dailyTemperatures([30,40,50,60])", expected: "[1,1,1,0]" },
          { input: "dailyTemperatures([30,60,90])", expected: "[1,1,0]" },
          { input: "dailyTemperatures([90,80,70,60])", expected: "[0,0,0,0]" },
          { input: "dailyTemperatures([50])", expected: "[0]" },
          { input: "dailyTemperatures([50,50,50])", expected: "[0,0,0]" },
          { input: "dailyTemperatures([71,72,73,70,76])", expected: "[1,1,2,1,0]" },
        ],
      },
      {
        id: "decode-string",
        title: "Decode String",
        difficulty: "MEDIUM",
        category: "Stack",
        tags: ["String", "Stack", "Recursion"],
        pattern: "stack",
        patternOrder: 5,
        description:
          'Given an encoded string, return its decoded string. The encoding rule is: k[encoded_string], where the encoded_string inside the square brackets is repeated exactly k times. You may assume the input string is always valid; there are no extra white spaces, square brackets are well-formed, etc. Additionally, k is guaranteed to be a positive integer.',
        constraints:
          "1 <= s.length <= 30\ns consists of lowercase English letters, digits, and square brackets '[]'.\ns is guaranteed to be a valid input.\nAll integers in s are in the range [1, 300].",
        examples:
          'Input: s = "3[a]2[bc]"\nOutput: "aaabcbc"\n\nInput: s = "3[a2[c]]"\nOutput: "accaccacc"\n\nInput: s = "2[abc]3[cd]ef"\nOutput: "abcabccdcdcdef"',
        starterCode: {
          javascript: `/**
 * @param {string} s
 * @return {string}
 */
function decodeString(s) {
  // Your code here
}

// Test cases
console.log(decodeString("3[a]2[bc]"));    // "aaabcbc"
console.log(decodeString("3[a2[c]]"));     // "accaccacc"
console.log(decodeString("2[abc]3[cd]ef")); // "abcabccdcdcdef"`,
          typescript: `function decodeString(s: string): string {
  // Your code here
  return "";
}

// Test cases
console.log(decodeString("3[a]2[bc]"));    // "aaabcbc"
console.log(decodeString("3[a2[c]]"));     // "accaccacc"
console.log(decodeString("2[abc]3[cd]ef")); // "abcabccdcdcdef"`,
          python: `def decode_string(s: str) -> str:
    """Decode the encoded string with k[encoded] pattern."""
    # Your code here
    pass

# Test cases
print(decode_string("3[a]2[bc]"))     # "aaabcbc"
print(decode_string("3[a2[c]]"))      # "accaccacc"
print(decode_string("2[abc]3[cd]ef")) # "abcabccdcdcdef"`,
          java: `import java.util.*;

class Solution {
    public String decodeString(String s) {
        // Your code here
        return "";
    }
}`,
        },
        testCases: [
          { input: 'decodeString("3[a]2[bc]")', expected: '"aaabcbc"' },
          { input: 'decodeString("3[a2[c]]")', expected: '"accaccacc"' },
          { input: 'decodeString("2[abc]3[cd]ef")', expected: '"abcabccdcdcdef"' },
          { input: 'decodeString("abc")', expected: '"abc"' },
          { input: 'decodeString("1[a]")', expected: '"a"' },
          { input: 'decodeString("10[a]")', expected: '"aaaaaaaaaa"' },
        ],
      },
    ],
  },

  // ─── 5. BINARY SEARCH ──────────────────────────────────────────────────────
  {
    id: "binary-search",
    name: "Binary Search",
    description:
      "Divide the search space in half each iteration to find targets, boundaries, or optimal values in O(log n) time on sorted or monotonic data.",
    problems: [
      {
        id: "binary-search",
        title: "Binary Search",
        difficulty: "EASY",
        category: "Binary Search",
        tags: ["Array", "Binary Search"],
        pattern: "binary-search",
        patternOrder: 1,
        description:
          "Given a sorted array of distinct integers nums and a target value, return the index if the target is found. If not, return -1. You must write an algorithm with O(log n) runtime complexity.",
        constraints:
          "1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll the integers in nums are unique.\nnums is sorted in ascending order.",
        examples:
          "Input: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4\nExplanation: 9 exists in nums at index 4.\n\nInput: nums = [-1,0,3,5,9,12], target = 2\nOutput: -1\nExplanation: 2 does not exist in nums, so return -1.",
        starterCode: {
          javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function binarySearch(nums, target) {
  // Your code here
}

// Test cases
console.log(binarySearch([-1,0,3,5,9,12], 9));  // 4
console.log(binarySearch([-1,0,3,5,9,12], 2));  // -1`,
          typescript: `function binarySearch(nums: number[], target: number): number {
  // Your code here
  return -1;
}

// Test cases
console.log(binarySearch([-1,0,3,5,9,12], 9));  // 4
console.log(binarySearch([-1,0,3,5,9,12], 2));  // -1`,
          python: `def binary_search(nums: list[int], target: int) -> int:
    """Return the index of target in sorted nums, or -1 if not found."""
    # Your code here
    pass

# Test cases
print(binary_search([-1,0,3,5,9,12], 9))   # 4
print(binary_search([-1,0,3,5,9,12], 2))   # -1`,
          java: `class Solution {
    public int binarySearch(int[] nums, int target) {
        // Your code here
        return -1;
    }
}`,
        },
        testCases: [
          { input: "binarySearch([-1,0,3,5,9,12], 9)", expected: "4" },
          { input: "binarySearch([-1,0,3,5,9,12], 2)", expected: "-1" },
          { input: "binarySearch([1], 1)", expected: "0" },
          { input: "binarySearch([1], 0)", expected: "-1" },
          { input: "binarySearch([1,2,3,4,5], 1)", expected: "0" },
          { input: "binarySearch([1,2,3,4,5], 5)", expected: "4" },
          { input: "binarySearch([1,2,3,4,5], 3)", expected: "2" },
        ],
      },
      {
        id: "search-2d-matrix",
        title: "Search a 2D Matrix",
        difficulty: "MEDIUM",
        category: "Binary Search",
        tags: ["Array", "Binary Search", "Matrix"],
        pattern: "binary-search",
        patternOrder: 2,
        description:
          "You are given an m x n integer matrix with two properties: each row is sorted in non-decreasing order, and the first integer of each row is greater than the last integer of the previous row. Given an integer target, return true if target is in the matrix, or false otherwise. You must solve it in O(log(m * n)) time complexity.",
        constraints:
          "m == matrix.length\nn == matrix[i].length\n1 <= m, n <= 100\n-10^4 <= matrix[i][j], target <= 10^4",
        examples:
          "Input: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3\nOutput: true\n\nInput: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13\nOutput: false",
        starterCode: {
          javascript: `/**
 * @param {number[][]} matrix
 * @param {number} target
 * @return {boolean}
 */
function searchMatrix(matrix, target) {
  // Your code here
}

// Test cases
console.log(searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3));  // true
console.log(searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 13)); // false`,
          typescript: `function searchMatrix(matrix: number[][], target: number): boolean {
  // Your code here
  return false;
}

// Test cases
console.log(searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3));  // true
console.log(searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 13)); // false`,
          python: `def search_matrix(matrix: list[list[int]], target: int) -> bool:
    """Return true if target exists in the sorted 2D matrix."""
    # Your code here
    pass

# Test cases
print(search_matrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3))   # True
print(search_matrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 13))  # False`,
          java: `class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        // Your code here
        return false;
    }
}`,
        },
        testCases: [
          { input: "searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3)", expected: "true" },
          { input: "searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 13)", expected: "false" },
          { input: "searchMatrix([[1]], 1)", expected: "true" },
          { input: "searchMatrix([[1]], 0)", expected: "false" },
          { input: "searchMatrix([[1,3],[5,7]], 5)", expected: "true" },
          { input: "searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 60)", expected: "true" },
        ],
      },
      {
        id: "koko-eating-bananas",
        title: "Koko Eating Bananas",
        difficulty: "MEDIUM",
        category: "Binary Search",
        tags: ["Array", "Binary Search"],
        pattern: "binary-search",
        patternOrder: 3,
        description:
          "Koko loves to eat bananas. There are n piles of bananas, the ith pile has piles[i] bananas. The guards will come back in h hours. Koko can decide her bananas-per-hour eating speed k. Each hour, she chooses a pile and eats k bananas from it. If the pile has less than k bananas, she eats all of them and will not eat any more during that hour. Return the minimum integer k such that she can eat all the bananas within h hours.",
        constraints:
          "1 <= piles.length <= 10^4\npiles.length <= h <= 10^9\n1 <= piles[i] <= 10^9",
        examples:
          "Input: piles = [3,6,7,11], h = 8\nOutput: 4\nExplanation: At speed 4: pile 3 takes 1h, pile 6 takes 2h, pile 7 takes 2h, pile 11 takes 3h. Total = 8h.\n\nInput: piles = [30,11,23,4,20], h = 5\nOutput: 30\n\nInput: piles = [30,11,23,4,20], h = 6\nOutput: 23",
        starterCode: {
          javascript: `/**
 * @param {number[]} piles
 * @param {number} h
 * @return {number}
 */
function minEatingSpeed(piles, h) {
  // Your code here
}

// Test cases
console.log(minEatingSpeed([3, 6, 7, 11], 8));       // 4
console.log(minEatingSpeed([30, 11, 23, 4, 20], 5)); // 30
console.log(minEatingSpeed([30, 11, 23, 4, 20], 6)); // 23`,
          typescript: `function minEatingSpeed(piles: number[], h: number): number {
  // Your code here
  return 0;
}

// Test cases
console.log(minEatingSpeed([3, 6, 7, 11], 8));       // 4
console.log(minEatingSpeed([30, 11, 23, 4, 20], 5)); // 30
console.log(minEatingSpeed([30, 11, 23, 4, 20], 6)); // 23`,
          python: `def min_eating_speed(piles: list[int], h: int) -> int:
    """Return the minimum eating speed to finish all bananas in h hours."""
    # Your code here
    pass

# Test cases
print(min_eating_speed([3, 6, 7, 11], 8))        # 4
print(min_eating_speed([30, 11, 23, 4, 20], 5))  # 30
print(min_eating_speed([30, 11, 23, 4, 20], 6))  # 23`,
          java: `class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        // Your code here
        return 0;
    }
}`,
        },
        testCases: [
          { input: "minEatingSpeed([3,6,7,11], 8)", expected: "4" },
          { input: "minEatingSpeed([30,11,23,4,20], 5)", expected: "30" },
          { input: "minEatingSpeed([30,11,23,4,20], 6)", expected: "23" },
          { input: "minEatingSpeed([1,1,1,1], 4)", expected: "1" },
          { input: "minEatingSpeed([1000000000], 2)", expected: "500000000" },
          { input: "minEatingSpeed([312884470], 312884469)", expected: "2" },
        ],
      },
      {
        id: "find-min-rotated",
        title: "Find Minimum in Rotated Sorted Array",
        difficulty: "MEDIUM",
        category: "Binary Search",
        tags: ["Array", "Binary Search"],
        pattern: "binary-search",
        patternOrder: 4,
        description:
          "Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Given the sorted rotated array nums of unique elements, return the minimum element of this array. You must write an algorithm that runs in O(log n) time.",
        constraints:
          "n == nums.length\n1 <= n <= 5000\n-5000 <= nums[i] <= 5000\nAll the integers of nums are unique.\nnums is sorted and rotated between 1 and n times.",
        examples:
          "Input: nums = [3,4,5,1,2]\nOutput: 1\nExplanation: The original array was [1,2,3,4,5] rotated 3 times.\n\nInput: nums = [4,5,6,7,0,1,2]\nOutput: 0\n\nInput: nums = [11,13,15,17]\nOutput: 11\nExplanation: The array was not rotated (or rotated n times).",
        starterCode: {
          javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function findMin(nums) {
  // Your code here
}

// Test cases
console.log(findMin([3, 4, 5, 1, 2]));       // 1
console.log(findMin([4, 5, 6, 7, 0, 1, 2])); // 0
console.log(findMin([11, 13, 15, 17]));       // 11`,
          typescript: `function findMin(nums: number[]): number {
  // Your code here
  return 0;
}

// Test cases
console.log(findMin([3, 4, 5, 1, 2]));       // 1
console.log(findMin([4, 5, 6, 7, 0, 1, 2])); // 0
console.log(findMin([11, 13, 15, 17]));       // 11`,
          python: `def find_min(nums: list[int]) -> int:
    """Find the minimum element in a rotated sorted array."""
    # Your code here
    pass

# Test cases
print(find_min([3, 4, 5, 1, 2]))        # 1
print(find_min([4, 5, 6, 7, 0, 1, 2]))  # 0
print(find_min([11, 13, 15, 17]))        # 11`,
          java: `class Solution {
    public int findMin(int[] nums) {
        // Your code here
        return 0;
    }
}`,
        },
        testCases: [
          { input: "findMin([3,4,5,1,2])", expected: "1" },
          { input: "findMin([4,5,6,7,0,1,2])", expected: "0" },
          { input: "findMin([11,13,15,17])", expected: "11" },
          { input: "findMin([2,1])", expected: "1" },
          { input: "findMin([1])", expected: "1" },
          { input: "findMin([2,3,4,5,1])", expected: "1" },
          { input: "findMin([5,1,2,3,4])", expected: "1" },
        ],
      },
      {
        id: "search-rotated-array",
        title: "Search in Rotated Sorted Array",
        difficulty: "MEDIUM",
        category: "Binary Search",
        tags: ["Array", "Binary Search"],
        pattern: "binary-search",
        patternOrder: 5,
        description:
          "There is an integer array nums sorted in ascending order with distinct values. Prior to being passed to your function, nums is possibly rotated at an unknown pivot. Given the rotated array nums and an integer target, return the index of target if it is in nums, or -1 if it is not. You must write an algorithm with O(log n) runtime complexity.",
        constraints:
          "1 <= nums.length <= 5000\n-10^4 <= nums[i] <= 10^4\nAll values of nums are unique.\nnums is an ascending array that is possibly rotated.\n-10^4 <= target <= 10^4",
        examples:
          "Input: nums = [4,5,6,7,0,1,2], target = 0\nOutput: 4\n\nInput: nums = [4,5,6,7,0,1,2], target = 3\nOutput: -1\n\nInput: nums = [1], target = 0\nOutput: -1",
        starterCode: {
          javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function searchRotated(nums, target) {
  // Your code here
}

// Test cases
console.log(searchRotated([4,5,6,7,0,1,2], 0)); // 4
console.log(searchRotated([4,5,6,7,0,1,2], 3)); // -1
console.log(searchRotated([1], 0));               // -1`,
          typescript: `function searchRotated(nums: number[], target: number): number {
  // Your code here
  return -1;
}

// Test cases
console.log(searchRotated([4,5,6,7,0,1,2], 0)); // 4
console.log(searchRotated([4,5,6,7,0,1,2], 3)); // -1
console.log(searchRotated([1], 0));               // -1`,
          python: `def search_rotated(nums: list[int], target: int) -> int:
    """Search for target in a rotated sorted array, return index or -1."""
    # Your code here
    pass

# Test cases
print(search_rotated([4,5,6,7,0,1,2], 0))  # 4
print(search_rotated([4,5,6,7,0,1,2], 3))  # -1
print(search_rotated([1], 0))                # -1`,
          java: `class Solution {
    public int searchRotated(int[] nums, int target) {
        // Your code here
        return -1;
    }
}`,
        },
        testCases: [
          { input: "searchRotated([4,5,6,7,0,1,2], 0)", expected: "4" },
          { input: "searchRotated([4,5,6,7,0,1,2], 3)", expected: "-1" },
          { input: "searchRotated([1], 0)", expected: "-1" },
          { input: "searchRotated([1], 1)", expected: "0" },
          { input: "searchRotated([3,1], 1)", expected: "1" },
          { input: "searchRotated([5,1,3], 5)", expected: "0" },
          { input: "searchRotated([4,5,6,7,0,1,2], 6)", expected: "2" },
        ],
      },
    ],
  },

  // ─── 6. LINKED LIST ──────────────────────────────────────────────────────
  {
    id: "LinkedList",
    name: "Linked List",
    description: "Pointer manipulation problems requiring careful tracking of prev, current, and next nodes. Master the two-pointer technique for cycle detection and list merging.",
    problems: [
      {
        id: "reverse-linked-list",
        title: "Reverse Linked List",
        difficulty: "EASY" as const,
        description: "Given the head of a singly linked list, reverse the list and return the reversed list.",
        tags: ["Linked List", "Recursion"],
        category: "LinkedLists",
        pattern: "LinkedList",
        patternOrder: 1,
        constraints: "The number of nodes in the list is [0, 5000].\n-5000 <= Node.val <= 5000",
        examples: "Input: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]\n\nInput: head = [1,2]\nOutput: [2,1]\n\nInput: head = []\nOutput: []",
        starterCode: {
          javascript: "class ListNode {\n  constructor(val = 0, next = null) { this.val = val; this.next = next; }\n}\nfunction fromArray(a) { let h = null; for (let i = a.length-1; i >= 0; i--) h = new ListNode(a[i], h); return h; }\nfunction toArray(h) { const r = []; while (h) { r.push(h.val); h = h.next; } return r; }\n\nfunction reverseList(head) {\n  // Your solution here\n}\n\nconsole.log(toArray(reverseList(fromArray([1,2,3,4,5]))));\n",
          typescript: "class ListNode { val: number; next: ListNode | null; constructor(val = 0, next: ListNode | null = null) { this.val = val; this.next = next; } }\nfunction fromArray(a: number[]): ListNode | null { let h: ListNode | null = null; for (let i = a.length-1; i >= 0; i--) h = new ListNode(a[i], h); return h; }\nfunction toArray(h: ListNode | null): number[] { const r: number[] = []; while (h) { r.push(h.val); h = h.next; } return r; }\n\nfunction reverseList(head: ListNode | null): ListNode | null {\n  // Your solution here\n  return null;\n}\n\nconsole.log(toArray(reverseList(fromArray([1,2,3,4,5]))));\n",
          python: "class ListNode:\n    def __init__(self, val=0, next=None): self.val = val; self.next = next\ndef from_array(a):\n    h = None\n    for v in reversed(a): h = ListNode(v, h)\n    return h\ndef to_array(h):\n    r = []\n    while h: r.append(h.val); h = h.next\n    return r\n\ndef reverse_list(head):\n    # Your solution here\n    pass\n\nprint(to_array(reverse_list(from_array([1,2,3,4,5]))))\n",
          java: `class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

class Solution {
    public ListNode reverseList(ListNode head) {
        // Your code here
        return null;
    }
}`,
        },
        testCases: [
          { input: "toArray(reverseList(fromArray([1,2,3,4,5])))", expected: "[5,4,3,2,1]" },
          { input: "toArray(reverseList(fromArray([1,2])))", expected: "[2,1]" },
          { input: "toArray(reverseList(fromArray([])))", expected: "[]" },
          { input: "toArray(reverseList(fromArray([1])))", expected: "[1]" },
          { input: "toArray(reverseList(fromArray([1,2,3])))", expected: "[3,2,1]" },
        ],
      },
      {
        id: "merge-two-sorted",
        title: "Merge Two Sorted Lists",
        difficulty: "EASY" as const,
        description: "Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.",
        tags: ["Linked List", "Recursion"],
        category: "LinkedLists",
        pattern: "LinkedList",
        patternOrder: 2,
        constraints: "Both lists are sorted in non-decreasing order.\n0 <= list length <= 50\n-100 <= Node.val <= 100",
        examples: "Input: l1 = [1,2,4], l2 = [1,3,4]\nOutput: [1,1,2,3,4,4]\n\nInput: l1 = [], l2 = []\nOutput: []\n\nInput: l1 = [], l2 = [0]\nOutput: [0]",
        starterCode: {
          javascript: "class ListNode {\n  constructor(val = 0, next = null) { this.val = val; this.next = next; }\n}\nfunction fromArray(a) { let h = null; for (let i = a.length-1; i >= 0; i--) h = new ListNode(a[i], h); return h; }\nfunction toArray(h) { const r = []; while (h) { r.push(h.val); h = h.next; } return r; }\n\nfunction mergeTwoLists(list1, list2) {\n  // Your solution here\n}\n\nconsole.log(toArray(mergeTwoLists(fromArray([1,2,4]), fromArray([1,3,4]))));\n",
          typescript: "class ListNode { val: number; next: ListNode | null; constructor(val = 0, next: ListNode | null = null) { this.val = val; this.next = next; } }\nfunction fromArray(a: number[]): ListNode | null { let h: ListNode | null = null; for (let i = a.length-1; i >= 0; i--) h = new ListNode(a[i], h); return h; }\nfunction toArray(h: ListNode | null): number[] { const r: number[] = []; while (h) { r.push(h.val); h = h.next; } return r; }\n\nfunction mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {\n  return null;\n}\n\nconsole.log(toArray(mergeTwoLists(fromArray([1,2,4]), fromArray([1,3,4]))));\n",
          python: "class ListNode:\n    def __init__(self, val=0, next=None): self.val = val; self.next = next\ndef from_array(a):\n    h = None\n    for v in reversed(a): h = ListNode(v, h)\n    return h\ndef to_array(h):\n    r = []\n    while h: r.append(h.val); h = h.next\n    return r\n\ndef merge_two_lists(list1, list2):\n    pass\n\nprint(to_array(merge_two_lists(from_array([1,2,4]), from_array([1,3,4]))))\n",
          java: `class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Your code here
        return null;
    }
}`,
        },
        testCases: [
          { input: "toArray(mergeTwoLists(fromArray([1,2,4]), fromArray([1,3,4])))", expected: "[1,1,2,3,4,4]" },
          { input: "toArray(mergeTwoLists(fromArray([]), fromArray([])))", expected: "[]" },
          { input: "toArray(mergeTwoLists(fromArray([]), fromArray([0])))", expected: "[0]" },
          { input: "toArray(mergeTwoLists(fromArray([1]), fromArray([2])))", expected: "[1,2]" },
          { input: "toArray(mergeTwoLists(fromArray([5,10,15]), fromArray([2,3,20])))", expected: "[2,3,5,10,15,20]" },
        ],
      },
      {
        id: "linked-list-cycle",
        title: "Linked List Cycle",
        difficulty: "EASY" as const,
        description: "Given head of a linked list, determine if the linked list has a cycle in it. Use Floyd's cycle detection algorithm with O(1) memory.",
        tags: ["Linked List", "Two Pointers"],
        category: "LinkedLists",
        pattern: "LinkedList",
        patternOrder: 3,
        constraints: "0 <= number of nodes <= 10^4\n-10^5 <= Node.val <= 10^5",
        examples: "Input: head = [3,2,0,-4], pos = 1\nOutput: true\nExplanation: Tail connects to node index 1.\n\nInput: head = [1], pos = -1\nOutput: false",
        starterCode: {
          javascript: "class ListNode {\n  constructor(val = 0, next = null) { this.val = val; this.next = next; }\n}\n\nfunction hasCycle(head) {\n  // Your solution here\n}\n\n// Test: no cycle\nconst n1 = new ListNode(1, new ListNode(2, new ListNode(3)));\nconsole.log(hasCycle(n1)); // false\n// Test: cycle\nconst c1 = new ListNode(3); const c2 = new ListNode(2); const c3 = new ListNode(0); const c4 = new ListNode(-4);\nc1.next = c2; c2.next = c3; c3.next = c4; c4.next = c2;\nconsole.log(hasCycle(c1)); // true\n",
          typescript: "class ListNode { val: number; next: ListNode | null; constructor(val = 0, next: ListNode | null = null) { this.val = val; this.next = next; } }\n\nfunction hasCycle(head: ListNode | null): boolean {\n  return false;\n}\n\nconsole.log(hasCycle(new ListNode(1, new ListNode(2))));\n",
          python: "class ListNode:\n    def __init__(self, val=0, next=None): self.val = val; self.next = next\n\ndef has_cycle(head):\n    pass\n\nn = ListNode(1, ListNode(2, ListNode(3)))\nprint(has_cycle(n))  # False\n",
          java: `class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

class Solution {
    public boolean hasCycle(ListNode head) {
        // Your code here
        return false;
    }
}`,
        },
        testCases: [
          { input: "(function() { const n = new ListNode(1, new ListNode(2, new ListNode(3))); return hasCycle(n); })()", expected: "false" },
          { input: "(function() { const a = new ListNode(1); const b = new ListNode(2); a.next = b; b.next = a; return hasCycle(a); })()", expected: "true" },
          { input: "hasCycle(null)", expected: "false" },
          { input: "(function() { const a = new ListNode(1); return hasCycle(a); })()", expected: "false" },
          { input: "(function() { const a = new ListNode(1); a.next = a; return hasCycle(a); })()", expected: "true" },
        ],
      },
      {
        id: "remove-nth-from-end",
        title: "Remove Nth Node From End of List",
        difficulty: "MEDIUM" as const,
        description: "Given the head of a linked list, remove the nth node from the end of the list and return its head. Do it in one pass.",
        tags: ["Linked List", "Two Pointers"],
        category: "LinkedLists",
        pattern: "LinkedList",
        patternOrder: 4,
        constraints: "1 <= sz <= 30\n0 <= Node.val <= 100\n1 <= n <= sz",
        examples: "Input: head = [1,2,3,4,5], n = 2\nOutput: [1,2,3,5]\n\nInput: head = [1], n = 1\nOutput: []\n\nInput: head = [1,2], n = 1\nOutput: [1]",
        starterCode: {
          javascript: "class ListNode {\n  constructor(val = 0, next = null) { this.val = val; this.next = next; }\n}\nfunction fromArray(a) { let h = null; for (let i = a.length-1; i >= 0; i--) h = new ListNode(a[i], h); return h; }\nfunction toArray(h) { const r = []; while (h) { r.push(h.val); h = h.next; } return r; }\n\nfunction removeNthFromEnd(head, n) {\n  // Your solution here\n}\n\nconsole.log(toArray(removeNthFromEnd(fromArray([1,2,3,4,5]), 2)));\n",
          typescript: "class ListNode { val: number; next: ListNode | null; constructor(val = 0, next: ListNode | null = null) { this.val = val; this.next = next; } }\nfunction fromArray(a: number[]): ListNode | null { let h: ListNode | null = null; for (let i = a.length-1; i >= 0; i--) h = new ListNode(a[i], h); return h; }\nfunction toArray(h: ListNode | null): number[] { const r: number[] = []; while (h) { r.push(h.val); h = h.next; } return r; }\n\nfunction removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {\n  return null;\n}\n\nconsole.log(toArray(removeNthFromEnd(fromArray([1,2,3,4,5]), 2)));\n",
          python: "class ListNode:\n    def __init__(self, val=0, next=None): self.val = val; self.next = next\ndef from_array(a):\n    h = None\n    for v in reversed(a): h = ListNode(v, h)\n    return h\ndef to_array(h):\n    r = []\n    while h: r.append(h.val); h = h.next\n    return r\n\ndef remove_nth_from_end(head, n):\n    pass\n\nprint(to_array(remove_nth_from_end(from_array([1,2,3,4,5]), 2)))\n",
          java: `class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        // Your code here
        return null;
    }
}`,
        },
        testCases: [
          { input: "toArray(removeNthFromEnd(fromArray([1,2,3,4,5]), 2))", expected: "[1,2,3,5]" },
          { input: "toArray(removeNthFromEnd(fromArray([1]), 1))", expected: "[]" },
          { input: "toArray(removeNthFromEnd(fromArray([1,2]), 1))", expected: "[1]" },
          { input: "toArray(removeNthFromEnd(fromArray([1,2]), 2))", expected: "[2]" },
          { input: "toArray(removeNthFromEnd(fromArray([1,2,3]), 3))", expected: "[2,3]" },
        ],
      },
      {
        id: "lru-cache",
        title: "LRU Cache",
        difficulty: "MEDIUM" as const,
        description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement get and put with O(1) time complexity.",
        tags: ["Design", "Hash Table", "Linked List"],
        category: "Design",
        pattern: "LinkedList",
        patternOrder: 5,
        constraints: "1 <= capacity <= 3000\n0 <= key <= 10^4\n0 <= value <= 10^5\nAt most 2 * 10^5 calls to get and put.",
        examples: 'LRUCache cache = new LRUCache(2);\ncache.put(1, 1);\ncache.put(2, 2);\ncache.get(1);    // returns 1\ncache.put(3, 3); // evicts key 2\ncache.get(2);    // returns -1\ncache.put(4, 4); // evicts key 1\ncache.get(1);    // returns -1\ncache.get(3);    // returns 3\ncache.get(4);    // returns 4',
        starterCode: {
          javascript: "class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    // Your solution here\n  }\n  get(key) {\n    // Your solution here\n  }\n  put(key, value) {\n    // Your solution here\n  }\n}\n\nconst c = new LRUCache(2);\nc.put(1,1); c.put(2,2);\nconsole.log(c.get(1)); // 1\nc.put(3,3);\nconsole.log(c.get(2)); // -1\n",
          typescript: "class LRUCache {\n  private capacity: number;\n  constructor(capacity: number) { this.capacity = capacity; }\n  get(key: number): number { return -1; }\n  put(key: number, value: number): void {}\n}\n\nconst c = new LRUCache(2);\nc.put(1,1); c.put(2,2);\nconsole.log(c.get(1));\n",
          python: "class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n    def get(self, key: int) -> int:\n        return -1\n    def put(self, key: int, value: int) -> None:\n        pass\n\nc = LRUCache(2)\nc.put(1,1); c.put(2,2)\nprint(c.get(1))  # 1\n",
          java: `import java.util.*;

class LRUCache {
    public LRUCache(int capacity) {
        // Initialize
    }

    public int get(int key) {
        // Your code here
        return -1;
    }

    public void put(int key, int value) {
        // Your code here
    }
}`,
        },
        testCases: [
          { input: "(function() { const c = new LRUCache(2); c.put(1,1); c.put(2,2); return c.get(1); })()", expected: "1" },
          { input: "(function() { const c = new LRUCache(2); c.put(1,1); c.put(2,2); c.put(3,3); return c.get(2); })()", expected: "-1" },
          { input: "(function() { const c = new LRUCache(2); c.put(1,1); c.put(2,2); c.get(1); c.put(3,3); return c.get(2); })()", expected: "-1" },
          { input: "(function() { const c = new LRUCache(2); c.put(1,1); c.put(2,2); c.put(3,3); c.put(4,4); return c.get(3); })()", expected: "3" },
          { input: "(function() { const c = new LRUCache(1); c.put(1,1); c.put(2,2); return c.get(1); })()", expected: "-1" },
        ],
      },
    ],
  },

  // ─── 7. TREES ───────────────────────────────────────────────────────────────
  {
    id: "Trees",
    name: "Trees",
    description: "Binary tree traversal, construction, and property validation. Master DFS, BFS, and recursive thinking for tree-based problems.",
    problems: [
      {
        id: "invert-binary-tree",
        title: "Invert Binary Tree",
        difficulty: "EASY" as const,
        description: "Given the root of a binary tree, invert the tree (mirror it) and return its root.",
        tags: ["Tree", "DFS", "BFS"],
        category: "Trees",
        pattern: "Trees",
        patternOrder: 1,
        constraints: "0 <= number of nodes <= 100\n-100 <= Node.val <= 100",
        examples: "Input: root = [4,2,7,1,3,6,9]\nOutput: [4,7,2,9,6,3,1]\n\nInput: root = [2,1,3]\nOutput: [2,3,1]",
        starterCode: {
          javascript: "class TreeNode {\n  constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; }\n}\n\nfunction invertTree(root) {\n  // Your solution here\n}\n\nconst root = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)), new TreeNode(7, new TreeNode(6), new TreeNode(9)));\nconst result = invertTree(root);\nconsole.log(result?.val, result?.left?.val, result?.right?.val);\n",
          typescript: "class TreeNode { val: number; left: TreeNode | null; right: TreeNode | null; constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) { this.val = val; this.left = left; this.right = right; } }\n\nfunction invertTree(root: TreeNode | null): TreeNode | null {\n  return null;\n}\n",
          python: "class TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val = val; self.left = left; self.right = right\n\ndef invert_tree(root):\n    pass\n",
          java: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

class Solution {
    public TreeNode invertTree(TreeNode root) {
        // Your code here
        return null;
    }
}`,
        },
        testCases: [
          { input: "(function() { const r = invertTree(new TreeNode(4, new TreeNode(2), new TreeNode(7))); return [r.val, r.left.val, r.right.val]; })()", expected: "[4,7,2]" },
          { input: "invertTree(null)", expected: "null" },
          { input: "(function() { const r = invertTree(new TreeNode(1)); return r.val; })()", expected: "1" },
          { input: "(function() { const r = invertTree(new TreeNode(2, new TreeNode(1), new TreeNode(3))); return [r.val, r.left.val, r.right.val]; })()", expected: "[2,3,1]" },
        ],
      },
      {
        id: "max-depth-binary-tree",
        title: "Maximum Depth of Binary Tree",
        difficulty: "EASY" as const,
        description: "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
        tags: ["Tree", "DFS", "BFS"],
        category: "Trees",
        pattern: "Trees",
        patternOrder: 2,
        constraints: "0 <= number of nodes <= 10^4\n-100 <= Node.val <= 100",
        examples: "Input: root = [3,9,20,null,null,15,7]\nOutput: 3\n\nInput: root = [1,null,2]\nOutput: 2",
        starterCode: {
          javascript: "class TreeNode {\n  constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; }\n}\n\nfunction maxDepth(root) {\n  // Your solution here\n}\n\nconsole.log(maxDepth(new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)))));\n",
          typescript: "class TreeNode { val: number; left: TreeNode | null; right: TreeNode | null; constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) { this.val = val; this.left = left; this.right = right; } }\n\nfunction maxDepth(root: TreeNode | null): number {\n  return 0;\n}\n",
          python: "class TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val = val; self.left = left; self.right = right\n\ndef max_depth(root):\n    pass\n",
          java: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

class Solution {
    public int maxDepth(TreeNode root) {
        // Your code here
        return 0;
    }
}`,
        },
        testCases: [
          { input: "maxDepth(new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7))))", expected: "3" },
          { input: "maxDepth(new TreeNode(1, null, new TreeNode(2)))", expected: "2" },
          { input: "maxDepth(null)", expected: "0" },
          { input: "maxDepth(new TreeNode(1))", expected: "1" },
          { input: "maxDepth(new TreeNode(1, new TreeNode(2, new TreeNode(3, new TreeNode(4), null), null), null))", expected: "4" },
        ],
      },
      {
        id: "validate-bst",
        title: "Validate Binary Search Tree",
        difficulty: "MEDIUM" as const,
        description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST has left subtree values less than the node and right subtree values greater.",
        tags: ["Tree", "DFS", "BST"],
        category: "Trees",
        pattern: "Trees",
        patternOrder: 3,
        constraints: "1 <= number of nodes <= 10^4\n-2^31 <= Node.val <= 2^31 - 1",
        examples: "Input: root = [2,1,3]\nOutput: true\n\nInput: root = [5,1,4,null,null,3,6]\nOutput: false (4 is in right subtree but < 5... wait, 3 < 5 in right subtree)",
        starterCode: {
          javascript: "class TreeNode {\n  constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; }\n}\n\nfunction isValidBST(root) {\n  // Your solution here\n}\n\nconsole.log(isValidBST(new TreeNode(2, new TreeNode(1), new TreeNode(3)))); // true\nconsole.log(isValidBST(new TreeNode(5, new TreeNode(1), new TreeNode(4, new TreeNode(3), new TreeNode(6))))); // false\n",
          typescript: "class TreeNode { val: number; left: TreeNode | null; right: TreeNode | null; constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) { this.val = val; this.left = left; this.right = right; } }\n\nfunction isValidBST(root: TreeNode | null): boolean {\n  return false;\n}\n",
          python: "class TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val = val; self.left = left; self.right = right\n\ndef is_valid_bst(root):\n    pass\n",
          java: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

class Solution {
    public boolean isValidBST(TreeNode root) {
        // Your code here
        return false;
    }
}`,
        },
        testCases: [
          { input: "isValidBST(new TreeNode(2, new TreeNode(1), new TreeNode(3)))", expected: "true" },
          { input: "isValidBST(new TreeNode(5, new TreeNode(1), new TreeNode(4, new TreeNode(3), new TreeNode(6))))", expected: "false" },
          { input: "isValidBST(new TreeNode(1))", expected: "true" },
          { input: "isValidBST(new TreeNode(5, new TreeNode(4), new TreeNode(6, new TreeNode(3), new TreeNode(7))))", expected: "false" },
          { input: "isValidBST(new TreeNode(2, new TreeNode(2), new TreeNode(2)))", expected: "false" },
        ],
      },
      {
        id: "kth-smallest-bst",
        title: "Kth Smallest Element in a BST",
        difficulty: "MEDIUM" as const,
        description: "Given the root of a BST and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.",
        tags: ["Tree", "DFS", "BST"],
        category: "Trees",
        pattern: "Trees",
        patternOrder: 4,
        constraints: "1 <= k <= n <= 10^4\n0 <= Node.val <= 10^4",
        examples: "Input: root = [3,1,4,null,2], k = 1\nOutput: 1\n\nInput: root = [5,3,6,2,4,null,null,1], k = 3\nOutput: 3",
        starterCode: {
          javascript: "class TreeNode {\n  constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; }\n}\n\nfunction kthSmallest(root, k) {\n  // Your solution here\n}\n\nconsole.log(kthSmallest(new TreeNode(3, new TreeNode(1, null, new TreeNode(2)), new TreeNode(4)), 1));\n",
          typescript: "class TreeNode { val: number; left: TreeNode | null; right: TreeNode | null; constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) { this.val = val; this.left = left; this.right = right; } }\n\nfunction kthSmallest(root: TreeNode | null, k: number): number {\n  return 0;\n}\n",
          python: "class TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val = val; self.left = left; self.right = right\n\ndef kth_smallest(root, k):\n    pass\n",
          java: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

class Solution {
    public int kthSmallest(TreeNode root, int k) {
        // Your code here
        return 0;
    }
}`,
        },
        testCases: [
          { input: "kthSmallest(new TreeNode(3, new TreeNode(1, null, new TreeNode(2)), new TreeNode(4)), 1)", expected: "1" },
          { input: "kthSmallest(new TreeNode(3, new TreeNode(1, null, new TreeNode(2)), new TreeNode(4)), 2)", expected: "2" },
          { input: "kthSmallest(new TreeNode(3, new TreeNode(1, null, new TreeNode(2)), new TreeNode(4)), 3)", expected: "3" },
          { input: "kthSmallest(new TreeNode(1), 1)", expected: "1" },
          { input: "kthSmallest(new TreeNode(5, new TreeNode(3, new TreeNode(2), new TreeNode(4)), new TreeNode(6)), 4)", expected: "5" },
        ],
      },
      {
        id: "binary-tree-level-order",
        title: "Binary Tree Level Order Traversal",
        difficulty: "MEDIUM" as const,
        description: "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
        tags: ["Tree", "BFS"],
        category: "Trees",
        pattern: "Trees",
        patternOrder: 5,
        constraints: "0 <= number of nodes <= 2000\n-1000 <= Node.val <= 1000",
        examples: "Input: root = [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]\n\nInput: root = [1]\nOutput: [[1]]",
        starterCode: {
          javascript: "class TreeNode {\n  constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; }\n}\n\nfunction levelOrder(root) {\n  // Your solution here\n}\n\nconsole.log(levelOrder(new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)))));\n",
          typescript: "class TreeNode { val: number; left: TreeNode | null; right: TreeNode | null; constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) { this.val = val; this.left = left; this.right = right; } }\n\nfunction levelOrder(root: TreeNode | null): number[][] {\n  return [];\n}\n",
          python: "class TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val = val; self.left = left; self.right = right\n\ndef level_order(root):\n    pass\n",
          java: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        // Your code here
        return new ArrayList<>();
    }
}`,
        },
        testCases: [
          { input: "JSON.stringify(levelOrder(new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)))))", expected: "\"[[3],[9,20],[15,7]]\"" },
          { input: "JSON.stringify(levelOrder(new TreeNode(1)))", expected: "\"[[1]]\"" },
          { input: "JSON.stringify(levelOrder(null))", expected: "\"[]\"" },
          { input: "JSON.stringify(levelOrder(new TreeNode(1, new TreeNode(2), new TreeNode(3))))", expected: "\"[[1],[2,3]]\"" },
        ],
      },
      {
        id: "lowest-common-ancestor",
        title: "Lowest Common Ancestor of a BST",
        difficulty: "MEDIUM" as const,
        description: "Given a BST and two nodes p and q, find their lowest common ancestor. The LCA is the deepest node that has both p and q as descendants (a node can be a descendant of itself).",
        tags: ["Tree", "BST", "DFS"],
        category: "Trees",
        pattern: "Trees",
        patternOrder: 6,
        constraints: "2 <= number of nodes <= 10^5\n-10^9 <= Node.val <= 10^9\nAll Node.val are unique.\np != q\np and q exist in BST.",
        examples: "Input: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8\nOutput: 6\n\nInput: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4\nOutput: 2",
        starterCode: {
          javascript: "class TreeNode {\n  constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; }\n}\n\nfunction lowestCommonAncestor(root, p, q) {\n  // Your solution here\n}\n\nconst root = new TreeNode(6, new TreeNode(2, new TreeNode(0), new TreeNode(4, new TreeNode(3), new TreeNode(5))), new TreeNode(8, new TreeNode(7), new TreeNode(9)));\nconsole.log(lowestCommonAncestor(root, root.left, root.right)?.val); // 6\n",
          typescript: "class TreeNode { val: number; left: TreeNode | null; right: TreeNode | null; constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) { this.val = val; this.left = left; this.right = right; } }\n\nfunction lowestCommonAncestor(root: TreeNode | null, p: TreeNode, q: TreeNode): TreeNode | null {\n  return null;\n}\n",
          python: "class TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val = val; self.left = left; self.right = right\n\ndef lowest_common_ancestor(root, p, q):\n    pass\n",
          java: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        // Your code here
        return null;
    }
}`,
        },
        testCases: [
          { input: "(function() { const r = new TreeNode(6, new TreeNode(2, new TreeNode(0), new TreeNode(4)), new TreeNode(8)); return lowestCommonAncestor(r, r.left, r.right).val; })()", expected: "6" },
          { input: "(function() { const r = new TreeNode(6, new TreeNode(2, new TreeNode(0), new TreeNode(4)), new TreeNode(8)); return lowestCommonAncestor(r, r.left, r.left.right).val; })()", expected: "2" },
          { input: "(function() { const r = new TreeNode(2, new TreeNode(1), null); return lowestCommonAncestor(r, r, r.left).val; })()", expected: "2" },
        ],
      },
    ],
  },

  // ─── 8. HEAP / PRIORITY QUEUE ─────────────────────────────────────────────
  {
    id: "Heap",
    name: "Heap / Priority Queue",
    description: "Use heaps to efficiently find top-k elements, merge sorted sequences, and schedule tasks with priority constraints.",
    problems: [
      {
        id: "kth-largest-element",
        title: "Kth Largest Element in an Array",
        difficulty: "MEDIUM" as const,
        description: "Given an integer array nums and an integer k, return the kth largest element in the array. Note that it is the kth largest element in sorted order, not the kth distinct element.",
        tags: ["Heap", "Sorting", "Quickselect"],
        category: "Sorting",
        pattern: "Heap",
        patternOrder: 1,
        constraints: "1 <= k <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
        examples: "Input: nums = [3,2,1,5,6,4], k = 2\nOutput: 5\n\nInput: nums = [3,2,3,1,2,4,5,5,6], k = 4\nOutput: 4",
        starterCode: {
          javascript: "function findKthLargest(nums, k) {\n  // Your solution here\n}\n\nconsole.log(findKthLargest([3,2,1,5,6,4], 2)); // 5\nconsole.log(findKthLargest([3,2,3,1,2,4,5,5,6], 4)); // 4\n",
          typescript: "function findKthLargest(nums: number[], k: number): number {\n  return 0;\n}\n\nconsole.log(findKthLargest([3,2,1,5,6,4], 2));\n",
          python: "def find_kth_largest(nums, k):\n    pass\n\nprint(find_kth_largest([3,2,1,5,6,4], 2))  # 5\n",
          java: `import java.util.*;

class Solution {
    public int findKthLargest(int[] nums, int k) {
        // Your code here
        return 0;
    }
}`,
        },
        testCases: [
          { input: "findKthLargest([3,2,1,5,6,4], 2)", expected: "5" },
          { input: "findKthLargest([3,2,3,1,2,4,5,5,6], 4)", expected: "4" },
          { input: "findKthLargest([1], 1)", expected: "1" },
          { input: "findKthLargest([7,6,5,4,3,2,1], 5)", expected: "3" },
          { input: "findKthLargest([1,2], 2)", expected: "1" },
        ],
      },
      {
        id: "k-closest-points",
        title: "K Closest Points to Origin",
        difficulty: "MEDIUM" as const,
        description: "Given an array of points on the X-Y plane and an integer k, return the k closest points to the origin (0, 0). Distance is Euclidean distance.",
        tags: ["Heap", "Sorting", "Math"],
        category: "Sorting",
        pattern: "Heap",
        patternOrder: 2,
        constraints: "1 <= k <= points.length <= 10^4\n-10^4 <= xi, yi <= 10^4",
        examples: "Input: points = [[1,3],[-2,2]], k = 1\nOutput: [[-2,2]]\nExplanation: dist(1,3) = sqrt(10), dist(-2,2) = sqrt(8). [-2,2] is closer.\n\nInput: points = [[3,3],[5,-1],[-2,4]], k = 2\nOutput: [[3,3],[-2,4]]",
        starterCode: {
          javascript: "function kClosest(points, k) {\n  // Your solution here\n}\n\nconsole.log(kClosest([[1,3],[-2,2]], 1));\n",
          typescript: "function kClosest(points: number[][], k: number): number[][] {\n  return [];\n}\n",
          python: "def k_closest(points, k):\n    pass\n\nprint(k_closest([[1,3],[-2,2]], 1))\n",
          java: `import java.util.*;

class Solution {
    public int[][] kClosest(int[][] points, int k) {
        // Your code here
        return new int[0][0];
    }
}`,
        },
        testCases: [
          { input: "JSON.stringify(kClosest([[1,3],[-2,2]], 1))", expected: "\"[[-2,2]]\"" },
          { input: "kClosest([[0,0],[1,1]], 2).length", expected: "2" },
          { input: "kClosest([[1,0]], 1).length", expected: "1" },
          { input: "JSON.stringify(kClosest([[3,3],[5,-1],[-2,4]], 2).sort((a,b) => a[0]-b[0]))", expected: "\"[[-2,4],[3,3]]\"" },
        ],
      },
      {
        id: "task-scheduler",
        title: "Task Scheduler",
        difficulty: "MEDIUM" as const,
        description: "Given a char array representing tasks and a non-negative cooling interval n, find the least number of units of time the CPU will take to finish all tasks. Same tasks must be separated by at least n intervals.",
        tags: ["Heap", "Greedy", "Sorting"],
        category: "Greedy",
        pattern: "Heap",
        patternOrder: 3,
        constraints: "1 <= tasks.length <= 10^4\ntasks[i] is uppercase English letter\n0 <= n <= 100",
        examples: "Input: tasks = ['A','A','A','B','B','B'], n = 2\nOutput: 8\nExplanation: A -> B -> idle -> A -> B -> idle -> A -> B\n\nInput: tasks = ['A','A','A','B','B','B'], n = 0\nOutput: 6",
        starterCode: {
          javascript: "function leastInterval(tasks, n) {\n  // Your solution here\n}\n\nconsole.log(leastInterval(['A','A','A','B','B','B'], 2)); // 8\n",
          typescript: "function leastInterval(tasks: string[], n: number): number {\n  return 0;\n}\n",
          python: "def least_interval(tasks, n):\n    pass\n\nprint(least_interval(['A','A','A','B','B','B'], 2))  # 8\n",
          java: `import java.util.*;

class Solution {
    public int leastInterval(char[] tasks, int n) {
        // Your code here
        return 0;
    }
}`,
        },
        testCases: [
          { input: "leastInterval(['A','A','A','B','B','B'], 2)", expected: "8" },
          { input: "leastInterval(['A','A','A','B','B','B'], 0)", expected: "6" },
          { input: "leastInterval(['A','A','A','A','A','A','B','C','D','E','F','G'], 2)", expected: "16" },
          { input: "leastInterval(['A'], 2)", expected: "1" },
          { input: "leastInterval(['A','B','C','D','A','B','C','D'], 2)", expected: "8" },
        ],
      },
      {
        id: "merge-k-sorted-lists",
        title: "Merge k Sorted Lists",
        difficulty: "HARD" as const,
        description: "You are given an array of k linked-lists, each sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
        tags: ["Heap", "Linked List", "Divide and Conquer"],
        category: "LinkedLists",
        pattern: "Heap",
        patternOrder: 4,
        constraints: "k == lists.length\n0 <= k <= 10^4\n0 <= lists[i].length <= 500\n-10^4 <= lists[i][j] <= 10^4",
        examples: "Input: lists = [[1,4,5],[1,3,4],[2,6]]\nOutput: [1,1,2,3,4,4,5,6]",
        starterCode: {
          javascript: "class ListNode {\n  constructor(val = 0, next = null) { this.val = val; this.next = next; }\n}\nfunction fromArray(a) { let h = null; for (let i = a.length-1; i >= 0; i--) h = new ListNode(a[i], h); return h; }\nfunction toArray(h) { const r = []; while (h) { r.push(h.val); h = h.next; } return r; }\n\nfunction mergeKLists(lists) {\n  // Your solution here\n}\n\nconsole.log(toArray(mergeKLists([fromArray([1,4,5]), fromArray([1,3,4]), fromArray([2,6])])));\n",
          typescript: "class ListNode { val: number; next: ListNode | null; constructor(val = 0, next: ListNode | null = null) { this.val = val; this.next = next; } }\nfunction fromArray(a: number[]): ListNode | null { let h: ListNode | null = null; for (let i = a.length-1; i >= 0; i--) h = new ListNode(a[i], h); return h; }\nfunction toArray(h: ListNode | null): number[] { const r: number[] = []; while (h) { r.push(h.val); h = h.next; } return r; }\n\nfunction mergeKLists(lists: (ListNode | null)[]): ListNode | null {\n  return null;\n}\n",
          python: "class ListNode:\n    def __init__(self, val=0, next=None): self.val = val; self.next = next\n\ndef merge_k_lists(lists):\n    pass\n",
          java: `import java.util.*;

class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        // Your code here
        return null;
    }
}`,
        },
        testCases: [
          { input: "toArray(mergeKLists([fromArray([1,4,5]), fromArray([1,3,4]), fromArray([2,6])]))", expected: "[1,1,2,3,4,4,5,6]" },
          { input: "toArray(mergeKLists([]))", expected: "[]" },
          { input: "toArray(mergeKLists([fromArray([])]))", expected: "[]" },
          { input: "toArray(mergeKLists([fromArray([1]), fromArray([2]), fromArray([3])]))", expected: "[1,2,3]" },
          { input: "toArray(mergeKLists([fromArray([2]), fromArray([1])]))", expected: "[1,2]" },
        ],
      },
    ],
  },

  // ─── 9. BACKTRACKING ──────────────────────────────────────────────────────
  {
    id: "Backtracking",
    name: "Backtracking",
    description: "Generate all possible combinations, permutations, and subsets by exploring decision trees and pruning invalid branches.",
    problems: [
      {
        id: "subsets", title: "Subsets", difficulty: "MEDIUM" as const,
        description: "Given an integer array nums of unique elements, return all possible subsets (the power set). The solution must not contain duplicate subsets.",
        tags: ["Backtracking", "Bit Manipulation"], category: "Backtracking", pattern: "Backtracking", patternOrder: 1,
        constraints: "1 <= nums.length <= 10\n-10 <= nums[i] <= 10\nAll elements are unique.",
        examples: "Input: nums = [1,2,3]\nOutput: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]\n\nInput: nums = [0]\nOutput: [[],[0]]",
        starterCode: {
          javascript: "function subsets(nums) {\n  // Your solution here\n}\n\nconsole.log(subsets([1,2,3]));\n",
          typescript: "function subsets(nums: number[]): number[][] {\n  return [];\n}\n",
          python: "def subsets(nums):\n    pass\n\nprint(subsets([1,2,3]))\n",
          java: `import java.util.*;

class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        // Your code here
        return new ArrayList<>();
    }
}`,
        },
        testCases: [
          { input: "subsets([1,2,3]).length", expected: "8" },
          { input: "subsets([0]).length", expected: "2" },
          { input: "subsets([1]).length", expected: "2" },
          { input: "JSON.stringify(subsets([]).sort())", expected: "\"[[]]\"" },
          { input: "subsets([1,2]).length", expected: "4" },
        ],
      },
      {
        id: "permutations", title: "Permutations", difficulty: "MEDIUM" as const,
        description: "Given an array nums of distinct integers, return all possible permutations in any order.",
        tags: ["Backtracking", "Recursion"], category: "Backtracking", pattern: "Backtracking", patternOrder: 2,
        constraints: "1 <= nums.length <= 6\n-10 <= nums[i] <= 10\nAll integers are unique.",
        examples: "Input: nums = [1,2,3]\nOutput: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
        starterCode: {
          javascript: "function permute(nums) {\n  // Your solution here\n}\n\nconsole.log(permute([1,2,3]));\n",
          typescript: "function permute(nums: number[]): number[][] {\n  return [];\n}\n",
          python: "def permute(nums):\n    pass\n\nprint(permute([1,2,3]))\n",
          java: `import java.util.*;

class Solution {
    public List<List<Integer>> permute(int[] nums) {
        // Your code here
        return new ArrayList<>();
    }
}`,
        },
        testCases: [
          { input: "permute([1,2,3]).length", expected: "6" },
          { input: "permute([0,1]).length", expected: "2" },
          { input: "permute([1]).length", expected: "1" },
          { input: "JSON.stringify(permute([1]))", expected: "\"[[1]]\"" },
        ],
      },
      {
        id: "combination-sum", title: "Combination Sum", difficulty: "MEDIUM" as const,
        description: "Given an array of distinct integers candidates and a target, return all unique combinations where the chosen numbers sum to target. The same number may be chosen unlimited times.",
        tags: ["Backtracking", "Array"], category: "Backtracking", pattern: "Backtracking", patternOrder: 3,
        constraints: "1 <= candidates.length <= 30\n2 <= candidates[i] <= 40\n1 <= target <= 40",
        examples: "Input: candidates = [2,3,6,7], target = 7\nOutput: [[2,2,3],[7]]\n\nInput: candidates = [2,3,5], target = 8\nOutput: [[2,2,2,2],[2,3,3],[3,5]]",
        starterCode: {
          javascript: "function combinationSum(candidates, target) {\n  // Your solution here\n}\n\nconsole.log(combinationSum([2,3,6,7], 7));\n",
          typescript: "function combinationSum(candidates: number[], target: number): number[][] {\n  return [];\n}\n",
          python: "def combination_sum(candidates, target):\n    pass\n\nprint(combination_sum([2,3,6,7], 7))\n",
          java: `import java.util.*;

class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        // Your code here
        return new ArrayList<>();
    }
}`,
        },
        testCases: [
          { input: "combinationSum([2,3,6,7], 7).length", expected: "2" },
          { input: "combinationSum([2,3,5], 8).length", expected: "3" },
          { input: "combinationSum([2], 1).length", expected: "0" },
          { input: "combinationSum([1], 1).length", expected: "1" },
          { input: "combinationSum([1], 2).length", expected: "1" },
        ],
      },
      {
        id: "word-search", title: "Word Search", difficulty: "MEDIUM" as const,
        description: "Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells (horizontal or vertical).",
        tags: ["Backtracking", "Matrix", "DFS"], category: "Backtracking", pattern: "Backtracking", patternOrder: 4,
        constraints: "m == board.length\nn = board[i].length\n1 <= m, n <= 6\n1 <= word.length <= 15",
        examples: "Input: board = [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], word = 'ABCCED'\nOutput: true\n\nInput: board = [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], word = 'SEE'\nOutput: true",
        starterCode: {
          javascript: "function exist(board, word) {\n  // Your solution here\n}\n\nconsole.log(exist([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], 'ABCCED'));\n",
          typescript: "function exist(board: string[][], word: string): boolean {\n  return false;\n}\n",
          python: "def exist(board, word):\n    pass\n\nprint(exist([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], 'ABCCED'))\n",
          java: `class Solution {
    public boolean exist(char[][] board, String word) {
        // Your code here
        return false;
    }
}`,
        },
        testCases: [
          { input: "exist([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], 'ABCCED')", expected: "true" },
          { input: "exist([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], 'SEE')", expected: "true" },
          { input: "exist([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], 'ABCB')", expected: "false" },
          { input: "exist([['a']], 'a')", expected: "true" },
          { input: "exist([['a','b'],['c','d']], 'abdc')", expected: "true" },
        ],
      },
      {
        id: "n-queens", title: "N-Queens", difficulty: "HARD" as const,
        description: "Place n queens on an n x n chessboard such that no two queens attack each other. Return all distinct solutions where each solution is a board configuration.",
        tags: ["Backtracking"], category: "Backtracking", pattern: "Backtracking", patternOrder: 5,
        constraints: "1 <= n <= 9",
        examples: "Input: n = 4\nOutput: [['.Q..','...Q','Q...','..Q.'],['..Q.','Q...','...Q','.Q..']]\n\nInput: n = 1\nOutput: [['Q']]",
        starterCode: {
          javascript: "function solveNQueens(n) {\n  // Your solution here\n}\n\nconsole.log(solveNQueens(4).length); // 2\n",
          typescript: "function solveNQueens(n: number): string[][] {\n  return [];\n}\n",
          python: "def solve_n_queens(n):\n    pass\n\nprint(len(solve_n_queens(4)))  # 2\n",
          java: `import java.util.*;

class Solution {
    public List<List<String>> solveNQueens(int n) {
        // Your code here
        return new ArrayList<>();
    }
}`,
        },
        testCases: [
          { input: "solveNQueens(4).length", expected: "2" },
          { input: "solveNQueens(1).length", expected: "1" },
          { input: "solveNQueens(2).length", expected: "0" },
          { input: "solveNQueens(3).length", expected: "0" },
          { input: "solveNQueens(5).length", expected: "10" },
        ],
      },
    ],
  },

  // ─── 10. GRAPH ────────────────────────────────────────────────────────────
  {
    id: "Graph",
    name: "Graph",
    description: "Traverse and analyze connected structures using DFS, BFS, topological sort, and union-find. Essential for modeling real-world relationships.",
    problems: [
      {
        id: "number-of-islands", title: "Number of Islands", difficulty: "MEDIUM" as const,
        description: "Given an m x n 2D grid of '1's (land) and '0's (water), count the number of islands. An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.",
        tags: ["DFS", "BFS", "Matrix"], category: "Graph", pattern: "Graph", patternOrder: 1,
        constraints: "m == grid.length\nn == grid[i].length\n1 <= m, n <= 300\ngrid[i][j] is '0' or '1'",
        examples: "Input: grid = [['1','1','1','1','0'],['1','1','0','1','0'],['1','1','0','0','0'],['0','0','0','0','0']]\nOutput: 1\n\nInput: grid = [['1','1','0','0','0'],['1','1','0','0','0'],['0','0','1','0','0'],['0','0','0','1','1']]\nOutput: 3",
        starterCode: {
          javascript: "function numIslands(grid) {\n  // Your solution here\n}\n\nconsole.log(numIslands([['1','1','0'],['0','1','0'],['0','0','1']])); // 2\n",
          typescript: "function numIslands(grid: string[][]): number {\n  return 0;\n}\n",
          python: "def num_islands(grid):\n    pass\n\nprint(num_islands([['1','1','0'],['0','1','0'],['0','0','1']]))  # 2\n",
          java: `class Solution {
    public int numIslands(char[][] grid) {
        // Your code here
        return 0;
    }
}`,
        },
        testCases: [
          { input: "numIslands([['1','1','1','1','0'],['1','1','0','1','0'],['1','1','0','0','0'],['0','0','0','0','0']])", expected: "1" },
          { input: "numIslands([['1','1','0','0','0'],['1','1','0','0','0'],['0','0','1','0','0'],['0','0','0','1','1']])", expected: "3" },
          { input: "numIslands([['0']])", expected: "0" },
          { input: "numIslands([['1']])", expected: "1" },
          { input: "numIslands([['1','0'],['0','1']])", expected: "2" },
        ],
      },
      {
        id: "course-schedule", title: "Course Schedule", difficulty: "MEDIUM" as const,
        description: "There are numCourses courses labeled 0 to numCourses-1. Given prerequisite pairs, determine if you can finish all courses (no circular dependencies).",
        tags: ["Graph", "Topological Sort", "DFS"], category: "Graph", pattern: "Graph", patternOrder: 2,
        constraints: "1 <= numCourses <= 2000\n0 <= prerequisites.length <= 5000",
        examples: "Input: numCourses = 2, prerequisites = [[1,0]]\nOutput: true\n\nInput: numCourses = 2, prerequisites = [[1,0],[0,1]]\nOutput: false",
        starterCode: {
          javascript: "function canFinish(numCourses, prerequisites) {\n  // Your solution here\n}\n\nconsole.log(canFinish(2, [[1,0]])); // true\nconsole.log(canFinish(2, [[1,0],[0,1]])); // false\n",
          typescript: "function canFinish(numCourses: number, prerequisites: number[][]): boolean {\n  return false;\n}\n",
          python: "def can_finish(num_courses, prerequisites):\n    pass\n",
          java: `import java.util.*;

class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        // Your code here
        return false;
    }
}`,
        },
        testCases: [
          { input: "canFinish(2, [[1,0]])", expected: "true" },
          { input: "canFinish(2, [[1,0],[0,1]])", expected: "false" },
          { input: "canFinish(1, [])", expected: "true" },
          { input: "canFinish(3, [[1,0],[2,1]])", expected: "true" },
          { input: "canFinish(3, [[1,0],[2,1],[0,2]])", expected: "false" },
        ],
      },
      {
        id: "rotting-oranges", title: "Rotting Oranges", difficulty: "MEDIUM" as const,
        description: "In a grid, 0=empty, 1=fresh orange, 2=rotten. Every minute, fresh oranges adjacent to rotten ones become rotten. Return the min minutes until no fresh orange remains, or -1 if impossible.",
        tags: ["BFS", "Matrix"], category: "Graph", pattern: "Graph", patternOrder: 3,
        constraints: "m == grid.length\nn == grid[i].length\n1 <= m, n <= 10\ngrid[i][j] is 0, 1, or 2",
        examples: "Input: grid = [[2,1,1],[1,1,0],[0,1,1]]\nOutput: 4\n\nInput: grid = [[2,1,1],[0,1,1],[1,0,1]]\nOutput: -1\n\nInput: grid = [[0,2]]\nOutput: 0",
        starterCode: {
          javascript: "function orangesRotting(grid) {\n  // Your solution here\n}\n\nconsole.log(orangesRotting([[2,1,1],[1,1,0],[0,1,1]])); // 4\n",
          typescript: "function orangesRotting(grid: number[][]): number {\n  return 0;\n}\n",
          python: "def oranges_rotting(grid):\n    pass\n\nprint(oranges_rotting([[2,1,1],[1,1,0],[0,1,1]]))  # 4\n",
          java: `import java.util.*;

class Solution {
    public int orangesRotting(int[][] grid) {
        // Your code here
        return 0;
    }
}`,
        },
        testCases: [
          { input: "orangesRotting([[2,1,1],[1,1,0],[0,1,1]])", expected: "4" },
          { input: "orangesRotting([[2,1,1],[0,1,1],[1,0,1]])", expected: "-1" },
          { input: "orangesRotting([[0,2]])", expected: "0" },
          { input: "orangesRotting([[0]])", expected: "0" },
          { input: "orangesRotting([[1]])", expected: "-1" },
        ],
      },
      {
        id: "clone-graph", title: "Clone Graph", difficulty: "MEDIUM" as const,
        description: "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node has a value and a list of its neighbors.",
        tags: ["Graph", "DFS", "Hash Table"], category: "Graph", pattern: "Graph", patternOrder: 4,
        constraints: "1 <= Node.val <= 100\nNode.val is unique.\nNo repeated edges or self-loops.\nGraph is connected.",
        examples: "Input: adjList = [[2,4],[1,3],[2,4],[1,3]]\nOutput: [[2,4],[1,3],[2,4],[1,3]]",
        starterCode: {
          javascript: "class GraphNode {\n  constructor(val = 0, neighbors = []) { this.val = val; this.neighbors = neighbors; }\n}\n\nfunction cloneGraph(node) {\n  // Your solution here\n}\n\n// Build test graph: 1-2-3-4-1\nconst n1 = new GraphNode(1), n2 = new GraphNode(2), n3 = new GraphNode(3), n4 = new GraphNode(4);\nn1.neighbors = [n2, n4]; n2.neighbors = [n1, n3]; n3.neighbors = [n2, n4]; n4.neighbors = [n1, n3];\nconst clone = cloneGraph(n1);\nconsole.log(clone?.val, clone !== n1);\n",
          typescript: "class GraphNode { val: number; neighbors: GraphNode[]; constructor(val = 0, neighbors: GraphNode[] = []) { this.val = val; this.neighbors = neighbors; } }\n\nfunction cloneGraph(node: GraphNode | null): GraphNode | null {\n  return null;\n}\n",
          python: "class GraphNode:\n    def __init__(self, val=0, neighbors=None): self.val = val; self.neighbors = neighbors or []\n\ndef clone_graph(node):\n    pass\n",
          java: `import java.util.*;

class Node {
    public int val;
    public List<Node> neighbors;
    public Node(int val) { this.val = val; this.neighbors = new ArrayList<>(); }
}

class Solution {
    public Node cloneGraph(Node node) {
        // Your code here
        return null;
    }
}`,
        },
        testCases: [
          { input: "(function() { const n1 = new GraphNode(1); const c = cloneGraph(n1); return c !== n1 && c.val === 1; })()", expected: "true" },
          { input: "cloneGraph(null)", expected: "null" },
          { input: "(function() { const n1 = new GraphNode(1), n2 = new GraphNode(2); n1.neighbors = [n2]; n2.neighbors = [n1]; const c = cloneGraph(n1); return c.neighbors[0].val; })()", expected: "2" },
        ],
      },
      {
        id: "pacific-atlantic", title: "Pacific Atlantic Water Flow", difficulty: "MEDIUM" as const,
        description: "Given an m x n matrix of heights, find all cells where rain water can flow to both the Pacific Ocean (top/left edges) and the Atlantic Ocean (bottom/right edges).",
        tags: ["DFS", "BFS", "Matrix"], category: "Graph", pattern: "Graph", patternOrder: 5,
        constraints: "m == heights.length\nn == heights[i].length\n1 <= m, n <= 200\n0 <= heights[i][j] <= 10^5",
        examples: "Input: heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]\nOutput: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]",
        starterCode: {
          javascript: "function pacificAtlantic(heights) {\n  // Your solution here\n}\n\nconsole.log(pacificAtlantic([[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]));\n",
          typescript: "function pacificAtlantic(heights: number[][]): number[][] {\n  return [];\n}\n",
          python: "def pacific_atlantic(heights):\n    pass\n",
          java: `import java.util.*;

class Solution {
    public List<List<Integer>> pacificAtlantic(int[][] heights) {
        // Your code here
        return new ArrayList<>();
    }
}`,
        },
        testCases: [
          { input: "pacificAtlantic([[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]).length", expected: "7" },
          { input: "pacificAtlantic([[1]]).length", expected: "1" },
          { input: "pacificAtlantic([[1,1],[1,1]]).length", expected: "4" },
          { input: "pacificAtlantic([[1,2],[3,4]]).length", expected: "3" },
        ],
      },
    ],
  },

  // ─── 11. DYNAMIC PROGRAMMING ──────────────────────────────────────────────
  {
    id: "DynamicProgramming",
    name: "Dynamic Programming",
    description: "Break complex problems into overlapping subproblems, memoize results, and build optimal solutions bottom-up. The most common pattern in technical interviews.",
    problems: [
      {
        id: "climbing-stairs", title: "Climbing Stairs", difficulty: "EASY" as const,
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        tags: ["DP", "Math"], category: "DynamicProgramming", pattern: "DynamicProgramming", patternOrder: 1,
        constraints: "1 <= n <= 45",
        examples: "Input: n = 2\nOutput: 2 (1+1 or 2)\n\nInput: n = 3\nOutput: 3 (1+1+1, 1+2, 2+1)",
        starterCode: { javascript: "function climbStairs(n) {\n  // Your solution here\n}\n\nconsole.log(climbStairs(2)); // 2\nconsole.log(climbStairs(3)); // 3\n", typescript: "function climbStairs(n: number): number {\n  return 0;\n}\n", python: "def climb_stairs(n):\n    pass\n\nprint(climb_stairs(2))  # 2\n", java: `class Solution {
    public int climbStairs(int n) {
        // Your code here
        return 0;
    }
}` },
        testCases: [
          { input: "climbStairs(2)", expected: "2" }, { input: "climbStairs(3)", expected: "3" },
          { input: "climbStairs(1)", expected: "1" }, { input: "climbStairs(4)", expected: "5" },
          { input: "climbStairs(5)", expected: "8" },
        ],
      },
      {
        id: "coin-change", title: "Coin Change", difficulty: "MEDIUM" as const,
        description: "Given coins of different denominations and a total amount, return the fewest number of coins needed to make up that amount. Return -1 if it cannot be made.",
        tags: ["DP", "BFS"], category: "DynamicProgramming", pattern: "DynamicProgramming", patternOrder: 2,
        constraints: "1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4",
        examples: "Input: coins = [1,5,10], amount = 11\nOutput: 2 (5+5+1... wait, 10+1=2 coins)\n\nInput: coins = [2], amount = 3\nOutput: -1",
        starterCode: { javascript: "function coinChange(coins, amount) {\n  // Your solution here\n}\n\nconsole.log(coinChange([1,5,10], 11)); // 2\n", typescript: "function coinChange(coins: number[], amount: number): number {\n  return 0;\n}\n", python: "def coin_change(coins, amount):\n    pass\n", java: `import java.util.*;

class Solution {
    public int coinChange(int[] coins, int amount) {
        // Your code here
        return -1;
    }
}` },
        testCases: [
          { input: "coinChange([1,5,10], 11)", expected: "2" }, { input: "coinChange([2], 3)", expected: "-1" },
          { input: "coinChange([1], 0)", expected: "0" }, { input: "coinChange([1,2,5], 11)", expected: "3" },
          { input: "coinChange([1], 1)", expected: "1" },
        ],
      },
      {
        id: "house-robber", title: "House Robber", difficulty: "MEDIUM" as const,
        description: "Given an array representing the amount of money at each house, determine the maximum amount you can rob without robbing two adjacent houses.",
        tags: ["DP", "Array"], category: "DynamicProgramming", pattern: "DynamicProgramming", patternOrder: 3,
        constraints: "1 <= nums.length <= 100\n0 <= nums[i] <= 400",
        examples: "Input: nums = [1,2,3,1]\nOutput: 4 (rob house 1 and 3)\n\nInput: nums = [2,7,9,3,1]\nOutput: 12 (rob house 1, 3, 5)",
        starterCode: { javascript: "function rob(nums) {\n  // Your solution here\n}\n\nconsole.log(rob([1,2,3,1])); // 4\n", typescript: "function rob(nums: number[]): number {\n  return 0;\n}\n", python: "def rob(nums):\n    pass\n", java: `class Solution {
    public int rob(int[] nums) {
        // Your code here
        return 0;
    }
}` },
        testCases: [
          { input: "rob([1,2,3,1])", expected: "4" }, { input: "rob([2,7,9,3,1])", expected: "12" },
          { input: "rob([0])", expected: "0" }, { input: "rob([2,1,1,2])", expected: "4" },
          { input: "rob([1,2])", expected: "2" },
        ],
      },
      {
        id: "longest-increasing-subseq", title: "Longest Increasing Subsequence", difficulty: "MEDIUM" as const,
        description: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
        tags: ["DP", "Binary Search"], category: "DynamicProgramming", pattern: "DynamicProgramming", patternOrder: 4,
        constraints: "1 <= nums.length <= 2500\n-10^4 <= nums[i] <= 10^4",
        examples: "Input: nums = [10,9,2,5,3,7,101,18]\nOutput: 4 ([2,3,7,101])",
        starterCode: { javascript: "function lengthOfLIS(nums) {\n  // Your solution here\n}\n\nconsole.log(lengthOfLIS([10,9,2,5,3,7,101,18])); // 4\n", typescript: "function lengthOfLIS(nums: number[]): number {\n  return 0;\n}\n", python: "def length_of_lis(nums):\n    pass\n", java: `import java.util.*;

class Solution {
    public int lengthOfLIS(int[] nums) {
        // Your code here
        return 0;
    }
}` },
        testCases: [
          { input: "lengthOfLIS([10,9,2,5,3,7,101,18])", expected: "4" },
          { input: "lengthOfLIS([0,1,0,3,2,3])", expected: "4" },
          { input: "lengthOfLIS([7,7,7,7])", expected: "1" },
          { input: "lengthOfLIS([1])", expected: "1" },
          { input: "lengthOfLIS([1,3,6,7,9,4,10,5,6])", expected: "6" },
        ],
      },
      {
        id: "word-break", title: "Word Break", difficulty: "MEDIUM" as const,
        description: "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.",
        tags: ["DP", "String", "Hash Table"], category: "DynamicProgramming", pattern: "DynamicProgramming", patternOrder: 5,
        constraints: "1 <= s.length <= 300\n1 <= wordDict.length <= 1000\n1 <= wordDict[i].length <= 20",
        examples: "Input: s = 'leetcode', wordDict = ['leet','code']\nOutput: true\n\nInput: s = 'catsandog', wordDict = ['cats','dog','sand','and','cat']\nOutput: false",
        starterCode: { javascript: "function wordBreak(s, wordDict) {\n  // Your solution here\n}\n\nconsole.log(wordBreak('leetcode', ['leet','code'])); // true\n", typescript: "function wordBreak(s: string, wordDict: string[]): boolean {\n  return false;\n}\n", python: "def word_break(s, word_dict):\n    pass\n", java: `import java.util.*;

class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        // Your code here
        return false;
    }
}` },
        testCases: [
          { input: "wordBreak('leetcode', ['leet','code'])", expected: "true" },
          { input: "wordBreak('applepenapple', ['apple','pen'])", expected: "true" },
          { input: "wordBreak('catsandog', ['cats','dog','sand','and','cat'])", expected: "false" },
          { input: "wordBreak('a', ['a'])", expected: "true" },
          { input: "wordBreak('aaaaaaa', ['aaaa','aaa'])", expected: "true" },
        ],
      },
      {
        id: "unique-paths", title: "Unique Paths", difficulty: "MEDIUM" as const,
        description: "A robot is at the top-left corner of an m x n grid. It can only move right or down. How many unique paths exist to reach the bottom-right corner?",
        tags: ["DP", "Math"], category: "DynamicProgramming", pattern: "DynamicProgramming", patternOrder: 6,
        constraints: "1 <= m, n <= 100",
        examples: "Input: m = 3, n = 7\nOutput: 28\n\nInput: m = 3, n = 2\nOutput: 3",
        starterCode: { javascript: "function uniquePaths(m, n) {\n  // Your solution here\n}\n\nconsole.log(uniquePaths(3, 7)); // 28\n", typescript: "function uniquePaths(m: number, n: number): number {\n  return 0;\n}\n", python: "def unique_paths(m, n):\n    pass\n", java: `class Solution {
    public int uniquePaths(int m, int n) {
        // Your code here
        return 0;
    }
}` },
        testCases: [
          { input: "uniquePaths(3, 7)", expected: "28" }, { input: "uniquePaths(3, 2)", expected: "3" },
          { input: "uniquePaths(1, 1)", expected: "1" }, { input: "uniquePaths(3, 3)", expected: "6" },
          { input: "uniquePaths(7, 3)", expected: "28" },
        ],
      },
      {
        id: "longest-common-subseq", title: "Longest Common Subsequence", difficulty: "MEDIUM" as const,
        description: "Given two strings, return the length of their longest common subsequence. Characters don't need to be contiguous.",
        tags: ["DP", "String"], category: "DynamicProgramming", pattern: "DynamicProgramming", patternOrder: 7,
        constraints: "1 <= text1.length, text2.length <= 1000",
        examples: "Input: text1 = 'abcde', text2 = 'ace'\nOutput: 3 ('ace')\n\nInput: text1 = 'abc', text2 = 'def'\nOutput: 0",
        starterCode: { javascript: "function longestCommonSubsequence(text1, text2) {\n  // Your solution here\n}\n\nconsole.log(longestCommonSubsequence('abcde', 'ace')); // 3\n", typescript: "function longestCommonSubsequence(text1: string, text2: string): number {\n  return 0;\n}\n", python: "def longest_common_subsequence(text1, text2):\n    pass\n", java: `class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        // Your code here
        return 0;
    }
}` },
        testCases: [
          { input: "longestCommonSubsequence('abcde', 'ace')", expected: "3" },
          { input: "longestCommonSubsequence('abc', 'abc')", expected: "3" },
          { input: "longestCommonSubsequence('abc', 'def')", expected: "0" },
          { input: "longestCommonSubsequence('bl', 'yby')", expected: "1" },
        ],
      },
      {
        id: "edit-distance", title: "Edit Distance", difficulty: "HARD" as const,
        description: "Given two words, return the minimum number of operations (insert, delete, replace) required to convert word1 to word2.",
        tags: ["DP", "String"], category: "DynamicProgramming", pattern: "DynamicProgramming", patternOrder: 8,
        constraints: "0 <= word1.length, word2.length <= 500",
        examples: "Input: word1 = 'horse', word2 = 'ros'\nOutput: 3\n\nInput: word1 = 'intention', word2 = 'execution'\nOutput: 5",
        starterCode: { javascript: "function minDistance(word1, word2) {\n  // Your solution here\n}\n\nconsole.log(minDistance('horse', 'ros')); // 3\n", typescript: "function minDistance(word1: string, word2: string): number {\n  return 0;\n}\n", python: "def min_distance(word1, word2):\n    pass\n", java: `class Solution {
    public int minDistance(String word1, String word2) {
        // Your code here
        return 0;
    }
}` },
        testCases: [
          { input: "minDistance('horse', 'ros')", expected: "3" },
          { input: "minDistance('intention', 'execution')", expected: "5" },
          { input: "minDistance('', '')", expected: "0" },
          { input: "minDistance('a', 'b')", expected: "1" },
          { input: "minDistance('abc', 'abc')", expected: "0" },
        ],
      },
    ],
  },

  // ─── 12. GREEDY / INTERVALS ───────────────────────────────────────────────
  {
    id: "Greedy",
    name: "Greedy / Intervals",
    description: "Make locally optimal choices for globally optimal solutions. Interval problems are classic greedy applications involving sorting and sweep-line techniques.",
    problems: [
      {
        id: "merge-intervals", title: "Merge Intervals", difficulty: "MEDIUM" as const,
        description: "Given an array of intervals, merge all overlapping intervals and return the non-overlapping intervals that cover all ranges.",
        tags: ["Intervals", "Sorting"], category: "Greedy", pattern: "Greedy", patternOrder: 1,
        constraints: "1 <= intervals.length <= 10^4\nintervals[i].length == 2\n0 <= starti <= endi <= 10^4",
        examples: "Input: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]",
        starterCode: { javascript: "function merge(intervals) {\n  // Your solution here\n}\n\nconsole.log(merge([[1,3],[2,6],[8,10],[15,18]]));\n", typescript: "function merge(intervals: number[][]): number[][] {\n  return [];\n}\n", python: "def merge(intervals):\n    pass\n", java: `import java.util.*;

class Solution {
    public int[][] merge(int[][] intervals) {
        // Your code here
        return new int[0][0];
    }
}` },
        testCases: [
          { input: "JSON.stringify(merge([[1,3],[2,6],[8,10],[15,18]]))", expected: "\"[[1,6],[8,10],[15,18]]\"" },
          { input: "JSON.stringify(merge([[1,4],[4,5]]))", expected: "\"[[1,5]]\"" },
          { input: "JSON.stringify(merge([[1,4],[2,3]]))", expected: "\"[[1,4]]\"" },
          { input: "JSON.stringify(merge([[1,3]]))", expected: "\"[[1,3]]\"" },
          { input: "JSON.stringify(merge([[1,4],[0,4]]))", expected: "\"[[0,4]]\"" },
        ],
      },
      {
        id: "jump-game", title: "Jump Game", difficulty: "MEDIUM" as const,
        description: "Given an array of non-negative integers where each element represents the max jump length from that position, determine if you can reach the last index.",
        tags: ["Greedy", "DP", "Array"], category: "Greedy", pattern: "Greedy", patternOrder: 2,
        constraints: "1 <= nums.length <= 10^4\n0 <= nums[i] <= 10^5",
        examples: "Input: nums = [2,3,1,1,4]\nOutput: true\n\nInput: nums = [3,2,1,0,4]\nOutput: false",
        starterCode: { javascript: "function canJump(nums) {\n  // Your solution here\n}\n\nconsole.log(canJump([2,3,1,1,4])); // true\n", typescript: "function canJump(nums: number[]): boolean {\n  return false;\n}\n", python: "def can_jump(nums):\n    pass\n", java: `class Solution {
    public boolean canJump(int[] nums) {
        // Your code here
        return false;
    }
}` },
        testCases: [
          { input: "canJump([2,3,1,1,4])", expected: "true" }, { input: "canJump([3,2,1,0,4])", expected: "false" },
          { input: "canJump([0])", expected: "true" }, { input: "canJump([2,0,0])", expected: "true" },
          { input: "canJump([1,0,1,0])", expected: "false" },
        ],
      },
      {
        id: "non-overlapping-intervals", title: "Non-overlapping Intervals", difficulty: "MEDIUM" as const,
        description: "Given a collection of intervals, find the minimum number of intervals you need to remove to make the rest non-overlapping.",
        tags: ["Greedy", "Intervals", "Sorting"], category: "Greedy", pattern: "Greedy", patternOrder: 3,
        constraints: "1 <= intervals.length <= 10^5\nintervals[i].length == 2",
        examples: "Input: intervals = [[1,2],[2,3],[3,4],[1,3]]\nOutput: 1\n\nInput: intervals = [[1,2],[1,2],[1,2]]\nOutput: 2",
        starterCode: { javascript: "function eraseOverlapIntervals(intervals) {\n  // Your solution here\n}\n\nconsole.log(eraseOverlapIntervals([[1,2],[2,3],[3,4],[1,3]]));\n", typescript: "function eraseOverlapIntervals(intervals: number[][]): number {\n  return 0;\n}\n", python: "def erase_overlap_intervals(intervals):\n    pass\n", java: `import java.util.*;

class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        // Your code here
        return 0;
    }
}` },
        testCases: [
          { input: "eraseOverlapIntervals([[1,2],[2,3],[3,4],[1,3]])", expected: "1" },
          { input: "eraseOverlapIntervals([[1,2],[1,2],[1,2]])", expected: "2" },
          { input: "eraseOverlapIntervals([[1,2],[2,3]])", expected: "0" },
        ],
      },
      {
        id: "meeting-rooms-ii", title: "Meeting Rooms II", difficulty: "MEDIUM" as const,
        description: "Given an array of meeting time intervals, find the minimum number of conference rooms required to hold all meetings.",
        tags: ["Heap", "Intervals", "Sorting"], category: "Greedy", pattern: "Greedy", patternOrder: 4,
        constraints: "1 <= intervals.length <= 10^4\n0 <= starti < endi <= 10^6",
        examples: "Input: intervals = [[0,30],[5,10],[15,20]]\nOutput: 2\n\nInput: intervals = [[7,10],[2,4]]\nOutput: 1",
        starterCode: { javascript: "function minMeetingRooms(intervals) {\n  // Your solution here\n}\n\nconsole.log(minMeetingRooms([[0,30],[5,10],[15,20]])); // 2\n", typescript: "function minMeetingRooms(intervals: number[][]): number {\n  return 0;\n}\n", python: "def min_meeting_rooms(intervals):\n    pass\n", java: `import java.util.*;

class Solution {
    public int minMeetingRooms(int[][] intervals) {
        // Your code here
        return 0;
    }
}` },
        testCases: [
          { input: "minMeetingRooms([[0,30],[5,10],[15,20]])", expected: "2" },
          { input: "minMeetingRooms([[7,10],[2,4]])", expected: "1" },
          { input: "minMeetingRooms([[1,5],[2,3],[4,6]])", expected: "2" },
          { input: "minMeetingRooms([[0,5],[5,10]])", expected: "1" },
        ],
      },
      {
        id: "partition-labels", title: "Partition Labels", difficulty: "MEDIUM" as const,
        description: "Given a string, partition it into as many parts as possible so that each letter appears in at most one part. Return the sizes of the parts.",
        tags: ["Greedy", "String", "Hash Table"], category: "Greedy", pattern: "Greedy", patternOrder: 5,
        constraints: "1 <= s.length <= 500\ns consists of lowercase English letters",
        examples: "Input: s = 'ababcbacadefegdehijhklij'\nOutput: [9,7,8]",
        starterCode: { javascript: "function partitionLabels(s) {\n  // Your solution here\n}\n\nconsole.log(partitionLabels('ababcbacadefegdehijhklij')); // [9,7,8]\n", typescript: "function partitionLabels(s: string): number[] {\n  return [];\n}\n", python: "def partition_labels(s):\n    pass\n", java: `import java.util.*;

class Solution {
    public List<Integer> partitionLabels(String s) {
        // Your code here
        return new ArrayList<>();
    }
}` },
        testCases: [
          { input: "JSON.stringify(partitionLabels('ababcbacadefegdehijhklij'))", expected: "\"[9,7,8]\"" },
          { input: "JSON.stringify(partitionLabels('eccbbbbdec'))", expected: "\"[10]\"" },
          { input: "JSON.stringify(partitionLabels('a'))", expected: "\"[1]\"" },
        ],
      },
    ],
  },

  // ─── 13. TRIE ─────────────────────────────────────────────────────────────
  {
    id: "Trie",
    name: "Trie",
    description: "Prefix trees for efficient string search, autocomplete, and word matching. Essential for problems involving dictionary lookups and prefix operations.",
    problems: [
      {
        id: "implement-trie", title: "Implement Trie (Prefix Tree)", difficulty: "MEDIUM" as const,
        description: "Implement a trie with insert, search, and startsWith methods.",
        tags: ["Trie", "Design", "String"], category: "Design", pattern: "Trie", patternOrder: 1,
        constraints: "1 <= word.length, prefix.length <= 2000\nword and prefix consist of lowercase English letters.",
        examples: "Trie trie = new Trie();\ntrie.insert('apple');\ntrie.search('apple');   // true\ntrie.search('app');     // false\ntrie.startsWith('app'); // true",
        starterCode: { javascript: "class Trie {\n  constructor() {\n    // Your solution here\n  }\n  insert(word) {}\n  search(word) {}\n  startsWith(prefix) {}\n}\n\nconst t = new Trie();\nt.insert('apple');\nconsole.log(t.search('apple')); // true\nconsole.log(t.search('app')); // false\nconsole.log(t.startsWith('app')); // true\n", typescript: "class Trie {\n  constructor() {}\n  insert(word: string): void {}\n  search(word: string): boolean { return false; }\n  startsWith(prefix: string): boolean { return false; }\n}\n", python: "class Trie:\n    def __init__(self): pass\n    def insert(self, word): pass\n    def search(self, word): pass\n    def starts_with(self, prefix): pass\n", java: `class Trie {
    public Trie() {
        // Initialize
    }

    public void insert(String word) {
        // Your code here
    }

    public boolean search(String word) {
        // Your code here
        return false;
    }

    public boolean startsWith(String prefix) {
        // Your code here
        return false;
    }
}` },
        testCases: [
          { input: "(function() { const t = new Trie(); t.insert('apple'); return t.search('apple'); })()", expected: "true" },
          { input: "(function() { const t = new Trie(); t.insert('apple'); return t.search('app'); })()", expected: "false" },
          { input: "(function() { const t = new Trie(); t.insert('apple'); return t.startsWith('app'); })()", expected: "true" },
          { input: "(function() { const t = new Trie(); t.insert('apple'); t.insert('app'); return t.search('app'); })()", expected: "true" },
        ],
      },
      {
        id: "add-search-words", title: "Design Add and Search Words Data Structure", difficulty: "MEDIUM" as const,
        description: "Design a data structure that supports adding words and searching for words with '.' wildcard that matches any single letter.",
        tags: ["Trie", "DFS", "Design"], category: "Design", pattern: "Trie", patternOrder: 2,
        constraints: "1 <= word.length <= 25\nword consists of lowercase English letters.\nSearch word may contain '.' wildcards.",
        examples: "WordDictionary wd = new WordDictionary();\nwd.addWord('bad');\nwd.search('.ad'); // true\nwd.search('b..'); // true\nwd.search('b.'); // false",
        starterCode: { javascript: "class WordDictionary {\n  constructor() {\n    // Your solution here\n  }\n  addWord(word) {}\n  search(word) {}\n}\n\nconst wd = new WordDictionary();\nwd.addWord('bad');\nconsole.log(wd.search('.ad')); // true\nconsole.log(wd.search('b..')); // true\n", typescript: "class WordDictionary {\n  constructor() {}\n  addWord(word: string): void {}\n  search(word: string): boolean { return false; }\n}\n", python: "class WordDictionary:\n    def __init__(self): pass\n    def add_word(self, word): pass\n    def search(self, word): pass\n", java: `class WordDictionary {
    public WordDictionary() {
        // Initialize
    }

    public void addWord(String word) {
        // Your code here
    }

    public boolean search(String word) {
        // Your code here
        return false;
    }
}` },
        testCases: [
          { input: "(function() { const w = new WordDictionary(); w.addWord('bad'); return w.search('.ad'); })()", expected: "true" },
          { input: "(function() { const w = new WordDictionary(); w.addWord('bad'); return w.search('b..'); })()", expected: "true" },
          { input: "(function() { const w = new WordDictionary(); w.addWord('bad'); return w.search('b.'); })()", expected: "false" },
          { input: "(function() { const w = new WordDictionary(); w.addWord('bad'); w.addWord('dad'); return w.search('.ad'); })()", expected: "true" },
        ],
      },
      {
        id: "word-search-ii", title: "Word Search II", difficulty: "HARD" as const,
        description: "Given an m x n board of characters and a list of words, return all words that can be formed by sequentially adjacent cells on the board.",
        tags: ["Trie", "Backtracking", "Matrix"], category: "Backtracking", pattern: "Trie", patternOrder: 3,
        constraints: "m == board.length\nn == board[i].length\n1 <= m, n <= 12\n1 <= words.length <= 3 * 10^4",
        examples: "Input: board = [['o','a','a','n'],['e','t','a','e'],['i','h','k','r'],['i','f','l','v']], words = ['oath','pea','eat','rain']\nOutput: ['eat','oath']",
        starterCode: { javascript: "function findWords(board, words) {\n  // Your solution here\n}\n\nconsole.log(findWords([['o','a','a','n'],['e','t','a','e'],['i','h','k','r'],['i','f','l','v']], ['oath','pea','eat','rain']));\n", typescript: "function findWords(board: string[][], words: string[]): string[] {\n  return [];\n}\n", python: "def find_words(board, words):\n    pass\n", java: `import java.util.*;

class Solution {
    public List<String> findWords(char[][] board, String[] words) {
        // Your code here
        return new ArrayList<>();
    }
}` },
        testCases: [
          { input: "findWords([['o','a','a','n'],['e','t','a','e'],['i','h','k','r'],['i','f','l','v']], ['oath','pea','eat','rain']).sort().join(',')", expected: "\"eat,oath\"" },
          { input: "findWords([['a','b'],['c','d']], ['abcb']).length", expected: "0" },
          { input: "findWords([['a']], ['a']).length", expected: "1" },
        ],
      },
    ],
  },

  // ─── 14. MATH & BIT MANIPULATION ──────────────────────────────────────────
  {
    id: "BitManipulation",
    name: "Math & Bit Manipulation",
    description: "Leverage bitwise operations and mathematical properties for elegant O(1) space solutions. XOR, bit counting, and power-of-two tricks.",
    problems: [
      {
        id: "single-number", title: "Single Number", difficulty: "EASY" as const,
        description: "Given a non-empty array of integers, every element appears twice except for one. Find that single element. Use XOR for O(1) space.",
        tags: ["Bit Manipulation", "Array"], category: "Math", pattern: "BitManipulation", patternOrder: 1,
        constraints: "1 <= nums.length <= 3 * 10^4\n-3 * 10^4 <= nums[i] <= 3 * 10^4\nEach element appears twice except one.",
        examples: "Input: nums = [2,2,1]\nOutput: 1\n\nInput: nums = [4,1,2,1,2]\nOutput: 4",
        starterCode: { javascript: "function singleNumber(nums) {\n  // Your solution here\n}\n\nconsole.log(singleNumber([2,2,1])); // 1\n", typescript: "function singleNumber(nums: number[]): number {\n  return 0;\n}\n", python: "def single_number(nums):\n    pass\n", java: `class Solution {
    public int singleNumber(int[] nums) {
        // Your code here
        return 0;
    }
}` },
        testCases: [
          { input: "singleNumber([2,2,1])", expected: "1" }, { input: "singleNumber([4,1,2,1,2])", expected: "4" },
          { input: "singleNumber([1])", expected: "1" }, { input: "singleNumber([0,1,0])", expected: "1" },
        ],
      },
      {
        id: "counting-bits", title: "Counting Bits", difficulty: "EASY" as const,
        description: "Given an integer n, return an array ans of length n+1 such that ans[i] is the number of 1's in the binary representation of i.",
        tags: ["Bit Manipulation", "DP"], category: "Math", pattern: "BitManipulation", patternOrder: 2,
        constraints: "0 <= n <= 10^5",
        examples: "Input: n = 2\nOutput: [0,1,1]\n\nInput: n = 5\nOutput: [0,1,1,2,1,2]",
        starterCode: { javascript: "function countBits(n) {\n  // Your solution here\n}\n\nconsole.log(countBits(5)); // [0,1,1,2,1,2]\n", typescript: "function countBits(n: number): number[] {\n  return [];\n}\n", python: "def count_bits(n):\n    pass\n", java: `class Solution {
    public int[] countBits(int n) {
        // Your code here
        return new int[0];
    }
}` },
        testCases: [
          { input: "JSON.stringify(countBits(2))", expected: "\"[0,1,1]\"" },
          { input: "JSON.stringify(countBits(5))", expected: "\"[0,1,1,2,1,2]\"" },
          { input: "JSON.stringify(countBits(0))", expected: "\"[0]\"" },
          { input: "countBits(8).length", expected: "9" },
        ],
      },
      {
        id: "reverse-bits", title: "Reverse Bits", difficulty: "EASY" as const,
        description: "Reverse bits of a given 32-bit unsigned integer.",
        tags: ["Bit Manipulation"], category: "Math", pattern: "BitManipulation", patternOrder: 3,
        constraints: "Input is a 32-bit unsigned integer.",
        examples: "Input: n = 43261596 (00000010100101000001111010011100)\nOutput: 964176192 (00111001011110000010100101000000)",
        starterCode: { javascript: "function reverseBits(n) {\n  // Your solution here\n}\n\nconsole.log(reverseBits(43261596)); // 964176192\n", typescript: "function reverseBits(n: number): number {\n  return 0;\n}\n", python: "def reverse_bits(n):\n    pass\n", java: `class Solution {
    public int reverseBits(int n) {
        // Your code here
        return 0;
    }
}` },
        testCases: [
          { input: "reverseBits(43261596)", expected: "964176192" },
          { input: "reverseBits(0)", expected: "0" },
          { input: "reverseBits(1)", expected: "2147483648" },
        ],
      },
    ],
  },

  // ─── 15. INTERVALS & MATH ─────────────────────────────────────────────────
  {
    id: "Math",
    name: "Intervals & Math",
    description: "Additional interval manipulation and mathematical computation problems that round out a complete interview preparation.",
    problems: [
      {
        id: "insert-interval", title: "Insert Interval", difficulty: "MEDIUM" as const,
        description: "Insert a new interval into a sorted list of non-overlapping intervals, merging if necessary. Return the resulting list still sorted and non-overlapping.",
        tags: ["Intervals", "Array"], category: "Arrays", pattern: "Math", patternOrder: 1,
        constraints: "0 <= intervals.length <= 10^4\nnewInterval.length == 2\n0 <= start <= end <= 10^5",
        examples: "Input: intervals = [[1,3],[6,9]], newInterval = [2,5]\nOutput: [[1,5],[6,9]]\n\nInput: intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]\nOutput: [[1,2],[3,10],[12,16]]",
        starterCode: { javascript: "function insert(intervals, newInterval) {\n  // Your solution here\n}\n\nconsole.log(insert([[1,3],[6,9]], [2,5]));\n", typescript: "function insert(intervals: number[][], newInterval: number[]): number[][] {\n  return [];\n}\n", python: "def insert(intervals, new_interval):\n    pass\n", java: `import java.util.*;

class Solution {
    public int[][] insert(int[][] intervals, int[] newInterval) {
        // Your code here
        return new int[0][0];
    }
}` },
        testCases: [
          { input: "JSON.stringify(insert([[1,3],[6,9]], [2,5]))", expected: "\"[[1,5],[6,9]]\"" },
          { input: "JSON.stringify(insert([[1,2],[3,5],[6,7],[8,10],[12,16]], [4,8]))", expected: "\"[[1,2],[3,10],[12,16]]\"" },
          { input: "JSON.stringify(insert([], [5,7]))", expected: "\"[[5,7]]\"" },
          { input: "JSON.stringify(insert([[1,5]], [2,3]))", expected: "\"[[1,5]]\"" },
        ],
      },
      {
        id: "pow-x-n", title: "Pow(x, n)", difficulty: "MEDIUM" as const,
        description: "Implement pow(x, n), which calculates x raised to the power n. Use fast exponentiation for O(log n) time complexity.",
        tags: ["Math", "Recursion"], category: "Math", pattern: "Math", patternOrder: 2,
        constraints: "-100.0 < x < 100.0\n-2^31 <= n <= 2^31 - 1\nx is not zero when n < 0",
        examples: "Input: x = 2.0, n = 10\nOutput: 1024.0\n\nInput: x = 2.1, n = 3\nOutput: 9.261\n\nInput: x = 2.0, n = -2\nOutput: 0.25",
        starterCode: { javascript: "function myPow(x, n) {\n  // Your solution here\n}\n\nconsole.log(myPow(2.0, 10)); // 1024\nconsole.log(myPow(2.0, -2)); // 0.25\n", typescript: "function myPow(x: number, n: number): number {\n  return 0;\n}\n", python: "def my_pow(x, n):\n    pass\n", java: `class Solution {
    public double myPow(double x, int n) {
        // Your code here
        return 0.0;
    }
}` },
        testCases: [
          { input: "myPow(2.0, 10)", expected: "1024" },
          { input: "myPow(2.0, -2)", expected: "0.25" },
          { input: "myPow(2.0, 0)", expected: "1" },
          { input: "myPow(1.0, 100)", expected: "1" },
          { input: "myPow(3.0, 2)", expected: "9" },
        ],
      },
    ],
  },
];

export const CURATED_PROBLEMS: CuratedProblem[] = CURATED_PATTERNS.flatMap(p => p.problems);
