# Deep Dive: CLI and Core Modules

## 1. How CLI Was Published to npm

### Publishing Pipeline

**Changesets Workflow** (`.changeset/config.json` + `.github/workflows/release.yml`):
1. On push to `main`, GitHub Actions runs the changesets action
2. Creates a "Release Pull Request" with version bumps
3. When merged, packages are published

**Manual Publishing** (alternative):
```bash
pnpm pkg:publish  # runs: pnpm build && pnpm -r publish --access=public
```

### Build Process for CLI

1. `rollup -c` bundles `src/index.ts` → `dist/index.js` (ESM with shebang)
2. `copyfiles` copies `template/` to `dist/template/`
3. TypeScript declarations generated at `dist/index.d.ts`
4. `bin.dokojs` in package.json points to `dist/index.js`

### WASM Considerations

- `@doko-js/wasm` is pre-built with `wasm-pack build --release`
- Published version was reverted to 1.0.0 due to "breaking of CLI on NodeJS issue" (commit `0ae61e5`)
- WASM is a dependency of core, not directly of CLI

### Workspace Dependencies

- Uses `workspace:*` protocol for internal deps
- pnpm resolves to actual versions during publish

**Published Versions:** 0.0.1 → 0.0.2 → 0.0.3 → 0.1.0 → 0.2.0 → 1.0.0 → 1.0.1 → 1.0.2 (latest: Oct 9, 2024)

---

## 2. Changes Since Release on Origin Repository

This fork (sealance-io/doko-js) is **14 commits ahead** of upstream (venture23-aleo/doko-js):

| Commit | Description |
|--------|-------------|
| `82f918d` | Generate .env file during compilation (if missing) |
| `5625015` | Use aleo-config to get endpoint of dependencies |
| `8e6375a` | Use local imports (simplified import resolution) |
| `0dc1562` | Add `_version` property to record interface |
| `0ae61e5` | Revert wasm package.json to 1.0.0 (NodeJS fix) |
| `b0fd43a` | Update @provablehq/sdk to 0.8.8 |
| `df377a3` - `d41ee74` | **Array handling fixes** (8 commits) |

---

## 3. Core Module Changes (Unpublished Feature Branch)

The main focus is **fixing multi-dimensional array handling**.

### A. New Utility Functions (`packages/core/src/utils/aleo-utils.ts`)

```typescript
// Recursively extracts nested type and depth from array definitions
getNestedType(type: string, depth: number = 0): [string, number]
// "[[[u32 2] 3] 4]" → ["u32", 3]

// Extracts array sizes
extractArraySizes(type: string): number[]
// "[[[u32 2] 3] 4]" → [2, 3, 4]
```

### B. Type Inference Fix (`packages/core/src/generator/generator-utils.ts`)

```typescript
// Before: Arrays weren't properly typed
// After: Properly generates nested Array<Array<...>> types
export function InferJSDataType(type: string): string {
  if(IsLeoArray(type)) {
    const [nestedType, depth] = getNestedType(type);
    const tsType = ConvertToJSType(nestedType) || nestedType;
    return generateArgType(tsType, depth);  // Array<Array<bigint>>
  }
  // ...
}
```

### C. Type Conversion Fixes (`packages/core/src/generator/generator-utils.ts`)

Multi-dimensional array conversion now uses nested `.map()` chains:

```typescript
// For a 3D array, generates:
// input.map(element1 => input.map(element2 => js2leo.array(element2, converterFn)))

// With qualifiers (.public/.private):
// Properly applies qualifier at innermost level
```

### D. Output Converter for Multi-dimensional Arrays (`packages/core/src/generator/generator.ts`)

```typescript
// Dynamically generates converter functions for N-dimensional arrays:
const generateMultiDimensionalArrayConverter = (depth: number): string => {
  // Returns: (arr: any[][][], converterFn) => arr.map(arr1 => arr1.map(arr2 => leo2js.array(arr2, converterFn)))
};
```

### E. Zod Schema Generation Fix (`packages/core/src/generator/leo-naming.ts`)

```typescript
// Before: Only handled 1D arrays
// After: Properly nests z.array().length() for each dimension
// "[[[u32 2] 3] 4]" → z.array(z.array(z.array(leoU32Schema).length(2)).length(3)).length(4)
```

### F. Array Stringification Fix (`packages/core/src/leo-types/js2leo/common.ts`)

```typescript
// Before: arr2string = (arr) => `[${arr.join(',')}]`
// After: Uses JSON.stringify with quote stripping for nested arrays
arr2string = (arr) => JSON.stringify(arr)
  .replace(/"(\w+)":/g, '$1:')  // Remove key quotes
  .replace(/"/g, '');            // Remove value quotes
```

### G. Record Interface Update (`packages/core/src/outputs/types/record.ts`)

```typescript
// Added _version field to BaseRecord
export type BaseRecord = {
  owner: LeoAddress;
  _nonce: bigint;
  _version: number;  // NEW
};
```

### H. SDK Type Rename

```typescript
// TransactionModel → Transaction (following @provablehq/sdk 0.8.8 API)
```

---

## 4. CLI Compile Changes (`packages/cli/src/scripts/compile.ts`)

1. **Simplified import resolution** - removed execution mode branching, always uses local for `programs/` source and network for external
2. **Endpoint from config** - `leo new` now includes `--endpoint` from aleo-config
3. **Generate .env if missing** - creates `.env` with NETWORK, PRIVATE_KEY, ENDPOINT if file doesn't exist

---

## 5. Files Changed from Upstream

### Core Module (13 files, +165/-72 lines)

| File | Changes |
|------|---------|
| `package.json` | SDK version bump |
| `execution/execution-helper.ts` | Minor fixes |
| `execution/snark-execute.ts` | Type updates |
| `execution/types.ts` | Type updates |
| `execution/utils.ts` | Import changes |
| `generator/generator-utils.ts` | **Major: array type inference** |
| `generator/generator.ts` | **Major: multi-dim array handling** |
| `generator/leo-naming.ts` | Nested Zod schema generation |
| `leo-types/js2leo/common.ts` | Array stringification fix |
| `leo-types/transaction/transaction-response.ts` | TransactionModel → Transaction |
| `outputs/types/record.ts` | Added _version field |
| `parser/parser.ts` | Added _version to records |
| `utils/aleo-utils.ts` | New getNestedType, extractArraySizes |

### CLI Module (3 files, +42/-35 lines)

| File | Changes |
|------|---------|
| `package.json` | Dependency updates |
| `src/scripts/compile.ts` | Import resolution, .env generation |
| `template/package.json` | SDK version bump |

### Test Suite (8 files, +255/-162 lines)

Added comprehensive tests for multi-dimensional arrays with custom types.

---

## Summary

This feature branch primarily fixes **array type handling throughout the entire pipeline**:

| Component | Fix |
|-----------|-----|
| Parser | Extracts nested types from `[[[u32 2] 3] 4]` format |
| Type inference | Generates proper `Array<Array<T>>` TypeScript types |
| js2leo conversion | Nested `.map()` chains for multi-dimensional arrays |
| leo2js conversion | Dynamic converter generation for N-dimensional arrays |
| Zod schemas | Nested `z.array().length()` validation |
| Stringification | JSON-based approach for nested array serialization |

Plus secondary changes: record `_version` field, SDK update to 0.8.8, and compile script improvements for .env handling and import resolution.
