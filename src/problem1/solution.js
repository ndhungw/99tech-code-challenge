/**
 * @param n any integer - Assuming this input will always produce a result lesser than Number.MAX_SAFE_INTEGER
 * @returns the sum of all integers from 1 to n
 * 
 * Time: O(n)
 * Memory: O(1)
 * Using loop, not optimized for large n
 */
var sum_to_n_a = function (n) {
    const abs = Math.abs(n);
    let sum = 0;
    let i = 1;

    while (i <= abs) {
        sum += i++;
    }

    return n < 0 ? -sum : sum;
}

/**
 * @param n any integer - Assuming this input will always produce a result lesser than Number.MAX_SAFE_INTEGER
 * @returns the sum of all integers from 1 to n
 * 
 * Time: O(1)
 * Memory: O(1)
 * Optimized using mathematical formula
 */
var sum_to_n_b = function (n) {
    const abs = Math.abs(n);
    const sum = (abs * (abs + 1)) / 2;
    return n < 0 ? -sum : sum;
}

/**
 * @param n any integer - Assuming this input will always produce a result lesser than Number.MAX_SAFE_INTEGER
 * @returns the sum of all integers from 1 to n
 * 
 * Recursion
 * Time: O(n)
 * Memory: O(n)
 */
const sum_to_n_c = function (n) {
    if (n === 0) return 0;
    if (n < 0) return n + sum_to_n_c(n + 1);
    return n + sum_to_n_c(n - 1)
}