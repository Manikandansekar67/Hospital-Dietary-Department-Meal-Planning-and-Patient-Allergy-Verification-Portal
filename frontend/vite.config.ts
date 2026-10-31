import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
<<<<<<< HEAD
import { defineConfig } from 'vite';
=======
import {defineConfig} from 'vite';
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
<<<<<<< HEAD
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: process.env.VITE_BACKEND_TARGET || 'http://localhost:5001',
          changeOrigin: true,
        },
      },
=======
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
    },
  };
});
