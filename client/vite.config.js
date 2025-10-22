import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API requests from the React dev server (default port 5173)
    // to the Express server (default port 5000).
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false, // Set to false because the backend uses HTTP (not HTTPS)
      },
      '/uploads': { // To serve static uploaded files
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});