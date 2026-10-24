import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true
  },
  base: './' // Para que funcione tanto en dev web como empaquetado en Electron
});
