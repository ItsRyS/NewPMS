import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/upload': 'http://localhost:5000', // Proxy เส้นทาง /upload ไปที่ Backend Server
    },
  },
  build: {
    sourcemap: false
  },
});
