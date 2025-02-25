import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    target: 'es2022'
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1000
  }
})
