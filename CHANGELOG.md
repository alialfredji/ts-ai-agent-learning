# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-10-18

### 🎉 Major Release - Modern Tooling & Restructuring

This release brings the curriculum up to date with the latest tools and frameworks as of October 2025, and restructures the project for better organization.

### Added

- **New Structure**: Created `curriculum/` directory to clearly separate educational content from infrastructure
- **Migration Guide**: Added `MIGRATION.md` to help users upgrade from v1.x
- **Changelog**: Added this changelog to track changes
- **Modern AI Models**: Added support for latest models:
  - OpenAI: GPT-4o, GPT-4o-mini
  - Anthropic: Claude 3.5 Sonnet (October 2024)
  - Google: Gemini 1.5 Pro/Flash
- **.nvmrc**: Added Node version specification file

### Changed

- **Updated Dependencies** (Major Version Bumps):
  - Node.js: 20+ → 22 LTS
  - pnpm: 8.15.0 → 9.12.3
  - TypeScript: 5.3 → 5.6
  - ESLint: 8.56 → 9.14 (with flat config)
  - Vitest: 1.2 → 2.1
  - Vercel AI SDK: 3.0 → 4.0
  - LangChain: 0.1 → 0.3
  - Anthropic SDK: 0.20 → 0.36
  - OpenAI SDK: 4.28 → 4.67
  - Google Generative AI: 0.7 → 0.21

- **Project Structure**:
  - Moved `beginner/` → `curriculum/beginner/`
  - Moved `intermediate/` → `curriculum/intermediate/`
  - Moved `advanced/` → `curriculum/advanced/`
  - Updated all import paths throughout the project

- **Configuration**:
  - Migrated from `.eslintrc.json` to `eslint.config.js` (ESLint 9 flat config)
  - Updated `tsconfig.json` to ES2023 and NodeNext module resolution
  - Updated `.env.example` with latest model names and recommendations

- **Documentation**:
  - Completely refreshed `README.md` with new structure
  - Updated `docs/SETUP.md` with modern prerequisites
  - Updated `docs/MODELS.md` with October 2025 model information and pricing
  - Added new "What's New in 2.0" section
  - Added "Technology Stack" reference table

- **GitHub Workflows**:
  - Updated all workflows to use Node 22
  - Updated all workflows to use pnpm 9

### Fixed

- Fixed linting errors in security utilities (removed unnecessary async/await)
- Fixed import paths after restructuring
- Fixed ESLint configuration for modern TypeScript

### Removed

- Removed `.eslintrc.json` (replaced with `eslint.config.js`)
- Removed deprecated ESLint plugins (migrated to `typescript-eslint` unified package)

### Breaking Changes

⚠️ **This is a major version with breaking changes. See [MIGRATION.md](MIGRATION.md) for detailed upgrade instructions.**

1. **Project Structure**: All educational content moved to `curriculum/` directory
2. **Node.js**: Minimum version increased from 20 to 22
3. **pnpm**: Minimum version increased from 8 to 9
4. **ESLint**: Configuration format changed (flat config)
5. **API Changes**: Some security utilities changed from async to sync
   - `BudgetGuard.checkBudget()` is now synchronous
   - `RateLimiter.checkLimit()` is now synchronous
   - `RateLimiter.getRemainingRequests()` is now synchronous

### Migration Path

1. Update Node.js to 22: `nvm install 22 && nvm use 22`
2. Update pnpm to 9: `npm install -g pnpm@9`
3. Update import paths: Add `curriculum/` prefix where needed
4. Remove old dependencies: `rm -rf node_modules pnpm-lock.yaml`
5. Install new dependencies: `pnpm install`
6. Review and test your custom code

See [MIGRATION.md](MIGRATION.md) for complete instructions.

## [1.0.0] - 2024-01-15

### Added

- Initial release of TypeScript AI Agents Curriculum
- Beginner, Intermediate, and Advanced project examples
- Multi-provider support (OpenAI, Anthropic, Google)
- Infrastructure templates (Docker, Pulumi, Terraform)
- Comprehensive documentation
- Security utilities (rate limiting, budget guards)
- Observability integration (LangSmith, OpenTelemetry)
- Evaluation harness

---

**Legend**:

- 🎉 Major Release
- ✨ New Feature
- 🔧 Bug Fix
- 📚 Documentation
- ⚠️ Breaking Change
