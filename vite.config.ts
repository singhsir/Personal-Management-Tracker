import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    'process.env.OPENROUTER_API_KEY': JSON.stringify(
      process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || ''
    ),
  },
});
