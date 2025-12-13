# Setup Instructions

After cloning the repository, follow these steps:

## Prerequisites

- Node.js 18+ or Bun (recommended)
- Bun package manager (optional but recommended for faster installs)

## 1. Install Dependencies

### Using npm

```bash
npm install
```

### Using Bun (recommended)

```bash
bun install
```

This will automatically:

- Install all dev and runtime dependencies
- Install husky git hooks (via `npm run prepare`)
- Set up pre-commit, pre-push, and commit-msg hooks

## 2. Verify Setup

```bash
# TypeScript type checking
bun run typecheck

# Linting with oxlint
bun run lint

# Code formatting with oxfmt
bun run fmt

# Tests with vitest
bun run test

# Build
bun run build
```

## Git Hooks

The project uses Husky to manage git hooks:

### Pre-commit Hook

Automatically runs before each commit:

- TypeScript type checking (`tsc --noEmit`)
- Linting with oxlint (`oxlint --type-aware --type-check`)
- Staged file formatting with lint-staged

### Pre-push Hook

Automatically runs before pushing commits:

- Full test suite (`bun run test:run`)
- Build verification (`bun run build`)

### Commit-msg Hook

Placeholder for commit message validation (can add conventional commits validation)

## Skipping Hooks

If you need to skip hooks temporarily:

```bash
# Skip pre-commit hook
git commit --no-verify

# Skip pre-push hook
git push --no-verify
```

> ⚠️ Use sparingly - hooks are there to maintain code quality!

## Development Workflow

```bash
# Start development
bun run dev

# Make changes and stage files
git add .

# Commit (pre-commit hook runs automatically)
git commit -m "feat: add new feature"

# Push (pre-push hook runs automatically)
git push origin main
```

## Tooling

- **Build**: [tsup](https://tsup.egoist.dev/) - Bundle your TypeScript files
- **Test**: [Vitest](https://vitest.dev/) - Blazing fast unit test framework
- **Lint**: [oxlint](https://oxc-project.github.io/docs/guide/linters/oxlint.html) - The fastest JavaScript linter
- **Format**: [oxfmt](https://oxc-project.github.io/docs/guide/formatters/oxfmt.html) - Fast formatter for JavaScript
- **Hooks**: [Husky](https://typicode.github.io/husky/) - Git hooks made easy
- **Type Check**: TypeScript - Strict mode type checking

## Publishing & Releases

### Automatic Releases (GitHub Actions)

The project uses GitHub Actions to automatically:

1. **Run CI** on every push/PR (test, lint, type check, build)
2. **Create GitHub Release** when you update version in `package.json` and push to `master`
3. **Publish to npm** automatically

### Setup for Automatic Publishing

1. **Create npm token** on [npmjs.com](https://www.npmjs.com/settings/tokens)
   - Create a new "Automation" token
   - Copy the token

2. **Add GitHub Secret**
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token

3. **Version Bump & Release**

   ```bash
   # Update version in package.json (semver)
   # e.g., 1.0.0 → 1.0.1 (patch) or 1.1.0 (minor) or 2.0.0 (major)

   # Commit and push to master
   git add package.json
   git commit -m "chore: bump version to 1.0.1"
   git push origin master
   ```

4. **GitHub Actions will:**
   - ✅ Run all tests and linting
   - ✅ Build the package
   - ✅ Create a GitHub Release with tag `v1.0.1`
   - ✅ Publish to npm automatically

### Manual Publishing (if needed)

```bash
# Ensure everything is built and tested
bun run build
bun run test:run

# Publish to npm (requires NPM_TOKEN in .npmrc or env)
npm publish
```

## Troubleshooting

### Hooks not running?

```bash
# Reinstall husky hooks
bun run prepare

# Make hooks executable
chmod +x .husky/pre-commit .husky/pre-push .husky/commit-msg
```

### Lint errors?

```bash
# Fix all linting issues
bun run lint -- --fix

# Auto-format code
bun run fmt
```

### Test issues?

```bash
# Run tests with verbose output
bun run test:run -- --reporter=verbose

# Run tests for a specific file
bun run test:run src/index.test.ts
```
