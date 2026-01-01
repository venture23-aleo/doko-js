# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DokoJS is a TypeScript/JavaScript library and CLI tool for interacting with the Aleo blockchain. It enables building and deploying Leo smart contracts, generating TypeScript types from Leo programs, and managing contract execution and transactions.

This is a **fork** of [venture23-aleo/doko-js](https://github.com/venture23-aleo/doko-js) maintained at sealance-io/doko-js.

## Fork Changes (vs upstream)

Key improvements in this fork (see `docs/DEEP-DIVE-CLI-CORE.md` for full details):

- **Multi-dimensional array handling** - Fixed parsing, type inference, and conversion for nested arrays like `[[[u32 2] 3] 4]`
- **Record `_version` field** - Added to `BaseRecord` type for Aleo record versioning
- **SDK update** - Upgraded to @provablehq/sdk 0.8.8 (`TransactionModel` → `Transaction`)
- **Compile improvements** - Auto-generates `.env` if missing, simplified import resolution using aleo-config endpoint

## Common Commands

```bash
# Build all packages (required after changes)
pnpm build

# Lint the codebase
pnpm lint

# Run tests (compiles Leo programs first, then runs Jest)
pnpm test

# Run a specific test file
pnpm test -- <test-name>  # e.g., pnpm test -- token.test

# Install CLI globally for local development
pnpm install:cli

# Build bundled CLI (single-file distribution)
pnpm build:bundle

# Build WASM module (run from packages/wasm directory)
cd packages/wasm && pnpm build  # uses wasm-pack
```

### CLI Commands (after global install)

```bash
dokojs init <project-name>    # Initialize new project
dokojs add <program-name>     # Add new Leo program
dokojs compile                # Build Leo programs and generate TS artifacts
dokojs deploy <program-name>  # Deploy to network
dokojs execute <file-path>    # Execute Leo scripts
dokojs run <file>             # Execute test files
```

## Architecture

**Monorepo Structure (pnpm workspace):**

- **`packages/cli`** - Command-line interface using Commander.js. Entry point for all developer interactions.
- **`packages/core`** - Core compilation engine: parser (tokenizes `.aleo` files), generator (creates TypeScript from Leo types), execution handlers (`SnarkExecute`, `LeoExecute`, `LeoRun`).
- **`packages/utils`** - Shared utilities: logging, requirements checking (Rust/Leo), file system, shell execution.
- **`packages/wasm`** - Rust WASM module for cryptographic operations (wasm-pack build).
- **`packages/web`** - React UI (Vite + Express SSR) for contract interaction.
- **`test/`** - Integration tests with sample Leo programs (Jest + ts-jest ESM).

**Dependency Flow:** `cli → core → utils`, both `cli` and `core` depend on `wasm`.

## Key Configuration

**`aleo-config.js`** (per-project): Accounts, networks, execution mode (`execute` | `evaluate`), priority fees.

**Execution modes:**
- `execute`: Generates proof and broadcasts on-chain (calls `leo developer execute`)
- `evaluate`: No proof/broadcast, dry run (calls `leo run`)

## Core Module Internals

### Compile Pipeline
```
CLI compile → buildPrograms() → leo build
            → compilePrograms() → parseAleo() → Generator → TypeScript artifacts
```

### Generator Output (per program)
- `types/<program>.ts` - Interfaces + Zod schemas
- `js2leo/<program>.ts` - JS → Leo converters
- `leo2js/<program>.ts` - Leo → JS converters
- `transitions/<program>.ts` - Transaction receipt types
- `<program>.ts` - Contract class

### Type Conversion System
- `js2leo`: Serialize JS objects to Leo format
- `leo2js`: Deserialize Leo output to JS objects
- Zod schemas for runtime validation

### Array Type Handling
Leo arrays like `[[[u32 2] 3] 4]` are parsed via:
- `getNestedType()` → extracts base type and depth
- `extractArraySizes()` → extracts dimension sizes
- Generator creates nested `Array<Array<T>>` types and `.map()` chains

### Key Source Files
- `core/src/utils/aleo-utils.ts`: Type detection (`IsLeoArray`, `IsLeoPrimitiveType`, `getNestedType`)
- `core/src/generator/generator-utils.ts`: `InferJSDataType()`, `GenerateTypeConversionStatement()`
- `core/src/generator/leo-naming.ts`: Naming conventions (`GenerateLeoSchemaName`, `GetConverterFunctionName`)

## Testing

Tests require `--experimental-vm-modules` flag (handled automatically by test script). Test config: `test/jest.config.json`

## Code Style

Single quotes, 2-space indent, 80 char line limit, semicolons, no trailing commas. ESLint + Prettier enforced.

## Publishing

Uses [changesets](https://github.com/changesets/changesets) for versioning. GitHub Actions automates releases on push to `main`.

```bash
npx changeset          # Create a changeset
pnpm pkg:publish       # Build and publish all packages
```

**npm packages:** `@doko-js/cli`, `@doko-js/core`, `@doko-js/utils`, `@doko-js/wasm`
