import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import wasm from 'vite-plugin-wasm';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [wasm(), react()], 
  ssr: {
    noExternal: ['@doko-js/wasm', '@doko-js/core'],
  },
  optimizeDeps: {
    exclude: ['@doko-js/core', '@doko-js/wasm'],
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          wasm: ['@doko-js/wasm'],
        },
      },
      external: ['*.wasm'],
    },
  },
})
