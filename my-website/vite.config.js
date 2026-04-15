import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Inline small assets instead of extra HTTP requests
    assetsInlineLimit: 4096,
    // Split vendor chunks for better long-term caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("react") || id.includes("react-dom")) return "react";
          if (id.includes("motion")) return "motion";
          if (id.includes("gsap")) return "gsap";
        },
      },
    },
  },
})
