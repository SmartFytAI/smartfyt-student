# 🔧 SmartFyt Student Linting Guide

## Overview

This project uses a comprehensive **ESLint + Prettier** setup optimized for **Next.js 15 + TypeScript + TanStack React Query**. The configuration enforces code quality, consistency, and best practices across the codebase.

## 🚀 Quick Start

### Install Dependencies
```bash
cd smartfyt-student && flox activate -- npm install
```

### Run Linting
```bash
# Check for linting issues
flox activate -- npm run lint

# Fix auto-fixable issues
flox activate -- npm run lint:fix

# Strict mode (no warnings allowed)
flox activate -- npm run lint:strict

# Format code with Prettier
flox activate -- npm run format

# Check formatting without changing files
flox activate -- npm run format:check
```

## 🏗️ Linting Architecture

### Core Tools
- **ESLint** - JavaScript/TypeScript linting with extensive rule set
- **Prettier** - Code formatting with Tailwind CSS plugin
- **TypeScript ESLint** - TypeScript-specific linting rules
- **React ESLint** - React and React Hooks rules
- **Testing Library ESLint** - Testing best practices
- **Accessibility ESLint** - Accessibility (a11y) rules

### Configuration Files
```
smartfyt-student/
├── eslint.config.mjs          # Main ESLint configuration
├── .prettierrc               # Prettier formatting rules
├── .prettierignore           # Files to ignore in formatting
├── .vscode/
│   └── settings.json         # VS Code editor settings
└── package.json              # Scripts and dependencies
```

## 📋 ESLint Rules Overview

### TypeScript Rules
- **No unused variables** - Catches dead code
- **Prefer const** - Enforces immutable variables
- **No explicit any** - Warns about type safety issues
- **No var requires** - Enforces ES modules

### Import Rules
- **Organized imports** - Groups and sorts imports automatically
- **No duplicates** - Prevents duplicate imports
- **Alphabetical order** - Consistent import ordering

### React Rules
- **JSX key prop** - Ensures proper list rendering
- **No array index keys** - Warns about unstable keys
- **No deprecated APIs** - Catches outdated React patterns
- **No direct state mutation** - Enforces immutability

### React Hooks Rules
- **Rules of hooks** - Enforces hooks usage patterns
- **Exhaustive deps** - Catches missing dependencies

### Accessibility Rules
- **Alt text for images** - Ensures screen reader compatibility
- **Valid ARIA attributes** - Enforces proper accessibility
- **Semantic HTML** - Ensures proper element usage
- **Keyboard navigation** - Ensures keyboard accessibility

### Testing Library Rules
- **Async query usage** - Enforces proper async testing
- **Screen queries** - Prefers screen over container queries
- **User event preference** - Encourages user-centric testing
- **No debugging in production** - Removes debug code

### General Code Quality
- **No console.log** - Warns about debug statements
- **No debugger** - Prevents debugger statements in production
- **Consistent formatting** - Enforces code style
- **No trailing spaces** - Clean code formatting

## 🎨 Prettier Configuration

### Formatting Rules
```json
{
  "semi": true,                    // Always use semicolons
  "trailingComma": "es5",         // Trailing commas where valid
  "singleQuote": true,            // Use single quotes
  "printWidth": 80,               // Line length limit
  "tabWidth": 2,                  // 2 spaces for indentation
  "useTabs": false,               // Use spaces, not tabs
  "bracketSpacing": true,         // Spaces in object literals
  "bracketSameLine": false,       // JSX closing bracket on new line
  "arrowParens": "avoid",         // Minimal parentheses
  "endOfLine": "lf",              // Unix line endings
  "jsxSingleQuote": true,         // Single quotes in JSX
  "plugins": ["prettier-plugin-tailwindcss"] // Tailwind class sorting
}
```

### Tailwind CSS Integration
- **Automatic class sorting** - Organizes Tailwind classes
- **Consistent formatting** - Maintains class order
- **Plugin integration** - Works with Tailwind CSS v4

## 🔧 VS Code Integration

### Auto-Formatting
- **Format on save** - Automatically formats code
- **ESLint auto-fix** - Fixes linting issues on save
- **Import organization** - Sorts imports automatically
- **TypeScript preferences** - Optimized for TypeScript

### Editor Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  }
}
```

## 📝 Scripts Reference

### Package.json Scripts
```json
{
  "scripts": {
    "lint": "next lint",                    // Standard linting
    "lint:fix": "next lint --fix",          // Auto-fix issues
    "lint:strict": "eslint . --max-warnings 0", // Zero tolerance
    "format": "prettier --write .",         // Format all files
    "format:check": "prettier --check ."    // Check formatting
  }
}
```

## 🎯 Best Practices

### 1. Development Workflow
```bash
# Before committing
flox activate -- npm run lint:fix
flox activate -- npm run format
flox activate -- npm run type-check
```

### 2. CI/CD Integration
```yaml
# GitHub Actions example
- name: Lint and format check
  run: |
    npm run lint:strict
    npm run format:check
    npm run type-check
```

### 3. Pre-commit Hooks
Consider adding pre-commit hooks to automatically run:
- ESLint with auto-fix
- Prettier formatting
- TypeScript type checking

## 🚨 Common Issues & Solutions

### 1. Import Organization
```typescript
// ❌ Bad - Unorganized imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

// ✅ Good - Organized imports
import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
```

### 2. TypeScript Strictness
```typescript
// ❌ Bad - Using any
const handleClick = (event: any) => {
  console.log(event.target.value);
};

// ✅ Good - Proper typing
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  console.log(event.currentTarget.value);
};
```

### 3. React Hooks Dependencies
```typescript
// ❌ Bad - Missing dependencies
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId

// ✅ Good - Complete dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### 4. Accessibility
```typescript
// ❌ Bad - Missing alt text
<img src="/logo.png" />

// ✅ Good - Proper alt text
<img src="/logo.png" alt="SmartFyt Logo" />
```

## 🔍 Debugging Linting Issues

### 1. Understanding Error Messages
```bash
# ESLint error format
file.tsx:line:column error rule-name error message

# Example
src/components/Button.tsx:15:5 error react/jsx-key Missing "key" prop for element in array
```

### 2. Disabling Rules (Use Sparingly)
```typescript
// Disable for specific line
// eslint-disable-next-line react/jsx-key
<div key={index}>{item}</div>

// Disable for specific file
/* eslint-disable react/jsx-key */

// Disable specific rule for file
/* eslint-disable react/jsx-key, react/no-array-index-key */
```

### 3. Rule Configuration
```javascript
// In eslint.config.mjs
rules: {
  'react/jsx-key': 'error',        // Error
  'react/no-array-index-key': 'warn', // Warning
  'no-console': 'off',             // Disabled
}
```

## 📊 Code Quality Metrics

### Target Standards
- **ESLint errors**: 0
- **ESLint warnings**: < 10
- **TypeScript errors**: 0
- **Prettier formatting**: 100% compliant
- **Accessibility violations**: 0

### Monitoring
- **Pre-commit checks** - Catch issues before commit
- **CI/CD integration** - Automated quality gates
- **Regular audits** - Monthly code quality reviews

## 🎯 Next Steps

1. **Install dependencies** and run initial linting
2. **Fix existing issues** with `npm run lint:fix`
3. **Set up pre-commit hooks** for automated checks
4. **Configure CI/CD** with quality gates
5. **Train team** on linting best practices

## 📚 Resources

- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [React ESLint Rules](https://github.com/jsx-eslint/eslint-plugin-react)
- [Testing Library ESLint](https://github.com/testing-library/eslint-plugin-testing-library)

---

**Remember**: Good linting is like good documentation - it helps maintain code quality and catches issues before they become problems! 🔧✨ 