import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { builtinModules } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Node.js built-in modules that should not be bundled
const nodeBuiltins = [
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`)
];

// Custom plugin to resolve @/ path aliases based on importer location
function aliasResolver() {
  return {
    name: 'alias-resolver',
    resolveId(source, importer) {
      if (!source.startsWith('@/') || !importer) return null;

      // Determine which package the importer is in
      const relativePath = source.replace('@/', '');

      if (importer.includes('/packages/cli/')) {
        return path.resolve(__dirname, 'packages/cli/src', relativePath + '.ts');
      } else if (importer.includes('/packages/core/')) {
        return path.resolve(__dirname, 'packages/core/src', relativePath + '.ts');
      } else if (importer.includes('/packages/utils/')) {
        return path.resolve(__dirname, 'packages/utils/src', relativePath + '.ts');
      }

      return null;
    }
  };
}

export default {
  input: 'packages/cli/src/index.ts',
  output: {
    file: 'packages/cli/dist/index.js',
    format: 'esm',
    // No banner - source file already has shebang
    inlineDynamicImports: false
  },
  // Externalize Node.js built-ins and WASM module (lazy loaded)
  external: [...nodeBuiltins, '@doko-js/wasm'],
  plugins: [
    // Resolve @/ path aliases
    aliasResolver(),
    // Resolve node_modules packages
    resolve({
      preferBuiltins: true,
      exportConditions: ['node', 'import', 'default']
    }),
    // Convert CommonJS modules to ES6
    commonjs(),
    // Handle JSON imports
    json(),
    // Compile TypeScript
    typescript({
      tsconfig: './tsconfig.base.json',
      declaration: false,
      outDir: 'packages/cli/dist',
      rootDir: '.',
      include: ['packages/*/src/**/*.ts'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/test/**', '**/web/**']
    })
  ],
  // Treat missing exports as warnings, not errors (for tree-shaking)
  onwarn(warning, warn) {
    // Ignore circular dependency warnings from internal modules
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    // Ignore "use client" warnings from @provablehq/sdk
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
    warn(warning);
  }
};
