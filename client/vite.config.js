import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: { // <-- Add this entire 'resolve' section
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
 }
})
