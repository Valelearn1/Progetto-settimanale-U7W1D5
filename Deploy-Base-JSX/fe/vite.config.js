import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: {
    // Sempre la 5173: se e' occupata Vite si ferma invece di passare alla 5174
    // (avvia.sh / avvia.cmd la liberano prima di partire).
    port: 5173,
    strictPort: true,
    // In sviluppo /api lo inoltra Vite al backend sulla 8080.
    // In produzione il proxy non esiste: serve VITE_API_URL.
    proxy: {
      '/api': { target: 'http://localhost:8080' },
    },
  },
})
