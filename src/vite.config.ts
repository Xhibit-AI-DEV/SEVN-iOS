import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: './', // CRITICAL: Use relative paths for Capacitor
  plugins: [
    react({
      // Enable JSX in .tsx, .jsx files
      include: /\.(jsx|tsx)$/
    })
  ],
  resolve: {
    alias: {
      '@': '/',
      // Figma asset aliases
      'figma:asset/ffd0a0d7d582101431a5f08c43e5cca5e4dedd59.png': path.resolve(__dirname, './assets/ffd0a0d7d582101431a5f08c43e5cca5e4dedd59.png'),
      'figma:asset/fecf94a9418e54b88d39fd7f742c93a62efe3681.png': path.resolve(__dirname, './assets/fecf94a9418e54b88d39fd7f742c93a62efe3681.png'),
      'figma:asset/f2ca5ebc3cc3b3b3cd76d741dc18b557f3c97742.png': path.resolve(__dirname, './assets/f2ca5ebc3cc3b3b3cd76d741dc18b557f3c97742.png'),
      'figma:asset/e848b14a74d352089a614d152282f09191ed8fc0.png': path.resolve(__dirname, './assets/e848b14a74d352089a614d152282f09191ed8fc0.png')
    }
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: '/index.html'
        // Removed extra HTML entries - they were causing dev scanning issues
        // If you need them for production builds, add them back here
      }
    }
  },
  server: {
    host: true,
    port: 3000
  },
  esbuild: {
    loader: 'tsx',
    include: /\.(jsx|tsx|ts|js)$/
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx'
      }
    }
  }
});