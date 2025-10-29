# 99tech Code Challenge Submission

This repository contains my solutions to the 99tech coding challenge, demonstrating skills in JavaScript algorithms, React development, code refactoring, and performance optimization.

## Overview

- **Problem 1**: JavaScript coding
- **Problem 2**: React application with form handling and API integration
- **Problem 3**: Code review and refactoring of messy react component

## Problem 1: Three ways to sum to n

**Task**: Provide 3 unique implementations of the following function in JavaScript.

**Input**: `n` - any integer

*Assuming this input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`*.

**Output**: `return` - summation to `n`, i.e. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.

**Solution**: [./src/problem1/solution.js](./src/problem1/solution.js)

## Problem 2: React Application

**Task**: Build a currency swap form

**Technologies used**:

- React with TypeScript
- TanStack Query for data fetching
- Shadcn for UI components
- React Hook Form and Zod for form handling and validating
- Responsive design with mobile first

**Implementation (using Vite)**: [./src/problem2/problem2-vite/](./src/problem2/problem2-vite/)

**To run locally**:
```bash
cd src/problem2/problem2-vite
pnpm i
pnpm dev
```

## Problem 3: Code Review & Refactoring

**Task**: Review and fix issues and anti-patterns

**Submission**: [See PR#1](https://github.com/ndhungw/99tech-code-challenge/pull/1)

- Original: [./src/problem3/original.tsx](./src/problem3/original.tsx)  
- Refactored: [./src/problem3/refactored.tsx](./src/problem3/refactored.tsx)

**Issues identified**:

- Many unnecessary array iterations
- Incorrect filter logic
- Type safety violations
- Missing error handling

**Improvements made**:

- Fixed type annotations
- Combined array operations
- Enhanced performance with proper memoization
- Improved React key usage
- Added proper error handling

## Technical Stack

- **Languages**: JavaScript, TypeScript
- **Framework**: React
- **Build Tools**: Vite
- **Data Fetching**: TanStack Query
- **Styling**: Tailwindcss
- **Code Quality**: Biome (linting/formatting)
