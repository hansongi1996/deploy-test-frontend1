import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',        // ← 핵심
    'process.env': {},       // (옵션) process 관련 에러 예방
  },
})
