import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'examples',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'examples/src/ar_main.ts')
      },
      output: {
        entryFileNames: 'ar_bundle.js',
        format: 'es',
        sourcemap: false
      }
    },
    target: 'es2020',
    minify: false,
    assetsDir: '',
    copyPublicDir: true
  },
  resolve: {
    alias: {
      'three': resolve(__dirname, 'build/three.module.js')
    }
  },
  server: {
    port: 3000,
    open: '/ar_web_dev.html'
  },
  optimizeDeps: {
    include: ['three']
  }
}); 