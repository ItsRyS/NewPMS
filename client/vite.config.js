import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  esbuild: {
    jsx: 'automatic' // ใช้ JSX Runtime แบบ automatic
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
