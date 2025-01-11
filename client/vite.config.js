import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  esbuild: {
    loader: 'jsx', // กำหนดให้ esbuild ใช้ loader แบบ jsx
  },
  server: {
    mimeTypes: {
      'application/javascript': ['js', 'jsx'],
    },
  },
  plugins: [react()],
  build: {
    sourcemap: false,
  },
});

