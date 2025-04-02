import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import wasm from 'vite-plugin-wasm';
import path from 'path';

export default defineConfig({
  plugins: [wasm(), react()],
  build: {
    target: 'es2022',
    outDir: './dist',
    ssrManifest: true,
  },
  optimizeDeps: {
    exclude: ['@doko-js/wasm']
  },
  resolve: {
    alias: {
      '@doko-js/wasm': path.resolve(
        __dirname,
        'node_modules/@doko-js/wasm/dist/pkg-web/wasm.js'
      ),
    }
  }
})
