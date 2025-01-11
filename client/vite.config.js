import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  esbuild: {
    jsx: 'automatic' // ใช้ JSX Runtime แบบ automatic
  },
  server: {
    mimeTypes: {
      'application/javascript': ['js', 'jsx'],
    },
  },
  plugins: [react()],
  build: {
    sourcemap: false,
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router-dom']
    }
  },
});
