import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/documents': {
        target: `${process.env.VITE_API_URL || 'http://localhost:8080'}/api`,
        changeOrigin: true,
        secure: false,
      },
      '/approvals': {
        target: `${process.env.VITE_API_URL || 'http://localhost:8080'}/api`,
        changeOrigin: true,
        secure: false,
      }
    }
  }
}) 