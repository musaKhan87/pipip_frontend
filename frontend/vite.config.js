import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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

