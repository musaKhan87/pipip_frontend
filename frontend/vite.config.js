
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normId = id.replace(/\\/g, '/');
          if (normId.includes('/node_modules/')) {
            if (
              normId.includes('/react/') ||
              normId.includes('/react-dom/') ||
              normId.includes('/react-router/') ||
              normId.includes('/react-router-dom/') ||
              normId.includes('/scheduler/') ||
              normId.includes('/@radix-ui/') ||
              normId.includes('/use-sync-external-store/')
            ) {
              return 'vendor-react';
            }
            if (normId.includes('/@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (normId.includes('/framer-motion/')) {
              return 'vendor-animation';
            }
            if (normId.includes('/lucide-react/')) {
              return 'vendor-icons';
            }
            if (normId.includes('/recharts/') || normId.includes('/d3-')) {
              return 'vendor-charts';
            }
            if (normId.includes('/jspdf/') || normId.includes('/html2canvas/')) {
              return 'vendor-pdf';
            }
            if (normId.includes('/date-fns/')) {
              return 'vendor-date';
            }
            if (normId.includes('/socket.io-client/')) {
              return 'vendor-socket';
            }
          }
        },
      },
    },
  },
});