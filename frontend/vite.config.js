import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query', 'axios'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.pipip.in',
        changeOrigin: true,
        secure: true,
      },
      '/socket.io': {
        target: 'https://api.pipip.in',
        ws: true,
        changeOrigin: true,
        secure: true,
      },
    },
  },
})

