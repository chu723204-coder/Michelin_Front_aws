import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    open: true,
    proxy: {                              // ✅ 이 부분 추가
      "/api": {
        target: "http://localhost:8080",  // 백엔드 포트
        changeOrigin: true,
      },
    },
  },
})