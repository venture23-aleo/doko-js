import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [wasm(), react()], 
  build: {
    target: 'es2022',
    outDir: './dist',
    ssrManifest: true,
  },
  optimizeDeps: {
    exclude: ['@doko-js/wasm']
  }
})
