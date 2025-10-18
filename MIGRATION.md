# Migration Guide to v2.0

## Overview

Version 2.0 brings major updates to dependencies and restructures the project for better organization. This guide will help you migrate from v1.x to v2.0.

## Breaking Changes

### 1. Project Structure

**Changed**: Educational content moved to `curriculum/` directory

```diff
- beginner/
- intermediate/
- advanced/
+ curriculum/
+   ├── beginner/
+   ├── intermediate/
+   └── advanced/
```

**Action Required**: Update any custom scripts or imports that reference the old paths:

```diff
- pnpm tsx beginner/01-tool-calling-cli/index.ts
+ pnpm tsx curriculum/beginner/01-tool-calling-cli/index.ts
```

### 2. Node.js Version

**Changed**: Minimum Node.js version increased from 20 to 22 (LTS)

**Action Required**: Update your Node.js version:

```bash
nvm install 22
nvm use 22
```

### 3. Package Manager

**Changed**: pnpm version updated from 8.15.0 to 9.12.3

**Action Required**: Update pnpm:

```bash
npm install -g pnpm@9
```

### 4. ESLint Configuration

**Changed**: ESLint upgraded from v8 to v9 with new flat config format

- **Removed**: `.eslintrc.json`
- **Added**: `eslint.config.js`

**Action Required**: If you have custom ESLint rules, migrate them to the new flat config format. See [ESLint Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0).

### 5. TypeScript Configuration

**Changed**: Updated to ES2023 and NodeNext module resolution

```diff
  "compilerOptions": {
-   "target": "ES2022",
-   "module": "ESNext",
-   "lib": ["ES2022"],
-   "moduleResolution": "bundler",
+   "target": "ES2023",
+   "module": "NodeNext",
+   "lib": ["ES2023"],
+   "moduleResolution": "NodeNext",
```

**Action Required**: This is backward compatible, but you may need to rebuild:

```bash
pnpm clean
pnpm install
pnpm typecheck
```

## Updated Dependencies

### Major Version Updates

| Package       | Old Version | New Version | Notes                   |
| ------------- | ----------- | ----------- | ----------------------- |
| TypeScript    | 5.3         | 5.6         | New language features   |
| ESLint        | 8.56        | 9.14        | Flat config format      |
| Vitest        | 1.2         | 2.1         | Breaking changes in API |
| Vercel AI SDK | 3.0         | 4.0         | Improved streaming      |
| LangChain     | 0.1         | 0.3         | New LangGraph features  |
| Anthropic SDK | 0.20        | 0.36        | Claude 3.5 support      |
| OpenAI SDK    | 4.28        | 4.67        | GPT-4o support          |

### New Packages

- `@langchain/anthropic` - Dedicated Anthropic integration
- `@langchain/community` - Community integrations
- `@langchain/google-genai` - Google AI integration
- `typescript-eslint` - Unified TypeScript ESLint package

### Removed Packages

- `eslint-plugin-prettier` - Use Prettier directly
- `@typescript-eslint/eslint-plugin` - Replaced by `typescript-eslint`
- `@typescript-eslint/parser` - Replaced by `typescript-eslint`

## Migration Steps

### Step 1: Backup Your Work

```bash
git add .
git commit -m "Backup before v2.0 migration"
git checkout -b migrate-to-v2
```

### Step 2: Update System Dependencies

```bash
# Update Node.js
nvm install 22
nvm use 22

# Update pnpm
npm install -g pnpm@9
```

### Step 3: Update Project

```bash
# Pull latest changes
git pull origin main

# Remove old dependencies
rm -rf node_modules pnpm-lock.yaml

# Install new dependencies
pnpm install

# Verify installation
pnpm typecheck
pnpm lint
```

### Step 4: Update Custom Code

If you have custom projects or modifications:

1. **Update import paths**: Add `curriculum/` prefix to any imports from beginner/intermediate/advanced
2. **Update ESLint config**: Migrate any custom rules to `eslint.config.js`
3. **Test your code**: Run your agents and tests to ensure compatibility

### Step 5: Update CI/CD

If you're using GitHub Actions or other CI/CD:

```diff
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
-     node-version: 20
+     node-version: 22

  - name: Setup pnpm
    uses: pnpm/action-setup@v2
    with:
-     version: 8
+     version: 9
```

## New Features

### Modern AI Models

Now supporting the latest models as of October 2025:

- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-4o-mini
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus/Haiku
- **Google**: Gemini 1.5 Pro, Gemini 1.5 Flash

### Improved Project Organization

- Clear separation of curriculum from infrastructure
- Better documentation structure
- Easier to navigate and understand

### Enhanced Developer Experience

- Faster type checking with TypeScript 5.6
- Better error messages with ESLint 9
- Improved test performance with Vitest 2

## Troubleshooting

### Issue: `Module not found` errors

**Cause**: Import paths haven't been updated for new structure

**Solution**: Add `curriculum/` prefix to imports:

```typescript
// Old
import something from '../beginner/...';

// New
import something from '../curriculum/beginner/...';
```

### Issue: ESLint not working

**Cause**: Old `.eslintrc.json` still present

**Solution**: Remove old config and ensure `eslint.config.js` exists:

```bash
rm .eslintrc.json
git checkout eslint.config.js
```

### Issue: Type errors after upgrade

**Cause**: Stricter TypeScript checks in 5.6

**Solution**: Review and fix type errors, or temporarily adjust `tsconfig.json`:

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

### Issue: Tests failing with Vitest 2

**Cause**: Breaking changes in Vitest API

**Solution**: Check [Vitest Migration Guide](https://vitest.dev/guide/migration.html)

## Rollback Instructions

If you need to rollback to v1.x:

```bash
git checkout main
git reset --hard <commit-before-v2>
nvm use 20
npm install -g pnpm@8
pnpm install
```

## Getting Help

- 📖 [Documentation](docs/)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)

## Version History

- **v2.0.0** (October 2025): Major restructure and dependency updates
- **v1.0.0** (Early 2024): Initial release
