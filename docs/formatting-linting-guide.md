# Formatting and Linting Guide

## Overview

This document explains the formatting and linting setup for the smartfyt-student project, including recent fixes to resolve conflicts between Prettier and ESLint.

## Recent Fixes

### 1. Removed Deprecated Next.js Configuration

**Issue**: `devIndicators.buildActivity` was deprecated in Next.js 15 and causing warnings.

**Fix**: Removed the deprecated configuration from `next.config.ts`.

### 2. Resolved Format/Lint Conflicts

**Issue**: Prettier and ESLint were conflicting on indentation, quotes, semicolons, and comma dangle rules.

**Fix**: 
- Disabled conflicting ESLint rules (`indent`, `quotes`, `semi`, `comma-dangle`) to let Prettier handle formatting
- Enhanced Prettier configuration with TypeScript parser overrides
- Added a new `format:fix` script that runs both Prettier and ESLint fix in sequence

## Available Scripts

```bash
# Formatting
npm run format          # Format all files with Prettier
npm run format:check    # Check if files are properly formatted
npm run format:fix      # Format files and fix linting issues

# Linting
npm run lint            # Run ESLint
npm run lint:fix        # Run ESLint with auto-fix
npm run lint:strict     # Run ESLint with zero warnings allowed
```

## Best Practices

### 1. Pre-commit Workflow

Always run formatting and linting before committing:

```bash
# Option 1: Use the combined script
npm run format:fix

# Option 2: Run separately
npm run format
npm run lint:fix
```

### 2. IDE Setup

Configure your IDE to:
- Format on save using Prettier
- Show ESLint errors/warnings
- Use the project's `.prettierrc` and `.eslintrc.json` configurations

### 3. VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

## Configuration Details

### Prettier Configuration (`.prettierrc`)

- **Semicolons**: Always
- **Quotes**: Single quotes
- **Trailing commas**: ES5 style
- **Tab width**: 2 spaces
- **Print width**: 80 characters
- **Tailwind CSS**: Auto-sorting enabled

### ESLint Configuration (`.eslintrc.json`)

- **Base**: Next.js core web vitals + TypeScript
- **Formatting rules**: Disabled (handled by Prettier)
- **Code quality rules**: Active
- **Accessibility rules**: Active
- **Import ordering**: Enforced

## Troubleshooting

### Common Issues

1. **Format and lint still conflict**: Make sure you're using the latest versions of both tools
2. **IDE not formatting**: Check that Prettier is set as the default formatter
3. **Import order issues**: ESLint handles import ordering, not Prettier

### Reset Configuration

If you need to reset your formatting:

```bash
# Remove all formatting and reapply
npm run format
npm run lint:fix
```

## Team Guidelines

1. **Never commit without formatting**: Always run `npm run format:fix` before commits
2. **Use the centralized logger**: Avoid `console.log` - use the project's logger instead
3. **Follow the established patterns**: The configuration is optimized for this project's needs
4. **Report conflicts**: If you find new formatting/linting conflicts, document them here

## Dependencies

- **Prettier**: `^3.2.5`
- **ESLint**: `^8.57.0`
- **eslint-config-prettier**: `^9.1.0` (prevents conflicts)
- **prettier-plugin-tailwindcss**: `^0.5.11` (Tailwind class sorting) 