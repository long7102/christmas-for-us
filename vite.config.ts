import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwind()],
  server: { host: true, port: 5173, allowedHosts: true },
  build: { target: 'es2020', chunkSizeWarningLimit: 900 },
})
