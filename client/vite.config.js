import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  esbuild: {
    loader: 'jsx', // กำหนดให้ esbuild ใช้ loader แบบ jsx
    jsx: 'automatic'
  },
  server: {
    mimeTypes: {
      'application/javascript': ['js', 'jsx'],
    },
  },
  plugins: [react(), commonjs()],
  optimizeDeps: {
    include: ['@mui/material', '@mui/icons-material','fabric'],
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router-dom']
    }
  },
  
});

