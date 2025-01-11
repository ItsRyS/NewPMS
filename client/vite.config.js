import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
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
