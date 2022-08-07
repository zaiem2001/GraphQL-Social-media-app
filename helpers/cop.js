// leetcode.com/problems/longest-palindromic-substring/

/**
 * @param {string} s
 * @return {string}
 * @time complexity: O(n^2)
 * @space complexity: O(n^2)
 * @score: 100
 * @submit: true
 *
 * @tag: string
 * @tag: dynamic programming
 * @tag: two pointers
 * @tag: array
 * @tag: string
 *
 * @description:
 * Given a string s, find the longest palindromic substring in s. You may assume that the maximum length of s is 1000.
 *
 *
 * Example 1:
 *
 * Input: "babad"
 * Output: "bab"
 * Note: "aba" is also a valid answer.
 *
 * Example 2:
 *
 * Input: "cbbd"
 * Output: "bb"
 *
 * @summary:
 * 1. use two pointers to find the longest palindromic substring
 * 2. use a boolean array to record the palindromic substring
 **/

/**
 * @param {string} s
 * @return {string}
 * @time complexity: O(n^2)
 **/

export const longestPalindrome = (s) => {
  if (s.length === 0) {
    return "";
  }
  let max = 0;
  let start = 0;
  let end = 0;
  let boolArray = new Array(s.length);
  for (let i = 0; i < s.length; i++) {
    boolArray[i] = new Array(s.length);
    for (let j = 0; j < s.length; j++) {
      boolArray[i][j] = false;
    }
  }
  for (let i = 0; i < s.length; i++) {
    boolArray[i][i] = true;
  }
  for (let i = 0; i < s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (s[i] === s[j] && (i - j < 2 || boolArray[j + 1][i - 1])) {
        boolArray[j][i] = true;
        if (i - j + 1 > max) {
          max = i - j + 1;
          start = j;
          end = i;
        }
      }
    }
  }
  return s.substring(start, end + 1);
};
