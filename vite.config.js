import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: process.cwd(),
  publicDir: 'public',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: path.resolve(process.cwd(), 'index.html'),
      },
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/database', 'firebase/messaging'],
          ui: ['react-hot-toast', 'react-icons', 'react-qr-reader'],
          api: ['axios', 'socket.io-client'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'firebase', 'axios', 'socket.io-client'],
    exclude: ['react-qr-reader']
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
});
