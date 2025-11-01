import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 3000, // Changed to port 3000
    strictPort: true, // Won't try other ports if 3000 is taken
  },
  define: {
    'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:5000/api/mgnrega')
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
});
