import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // Enable JSX in ALL contexts including inline HTML scripts
      include: /\.(jsx|tsx|js|ts|html)$/
    })
  ],
  resolve: {
    alias: {
      '@': '/src',
      // Figma asset aliases
      'figma:asset/ffd0a0d7d582101431a5f08c43e5cca5e4dedd59.png': path.resolve(__dirname, './src/assets/ffd0a0d7d582101431a5f08c43e5cca5e4dedd59.png'),
      'figma:asset/fecf94a9418e54b88d39fd7f742c93a62efe3681.png': path.resolve(__dirname, './src/assets/fecf94a9418e54b88d39fd7f742c93a62efe3681.png'),
      'figma:asset/f2ca5ebc3cc3b3b3cd76d741dc18b557f3c97742.png': path.resolve(__dirname, './src/assets/f2ca5ebc3cc3b3b3cd76d741dc18b557f3c97742.png'),
      'figma:asset/e848b14a74d352089a614d152282f09191ed8fc0.png': path.resolve(__dirname, './src/assets/e848b14a74d352089a614d152282f09191ed8fc0.png')
    }
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: '/index.html',
        admin: '/admin.html',
        customer: '/customer.html',
        'architecture-diagram': '/architecture-diagram.html',
        'design-flows-documentation': '/design-flows-documentation.html',
        'test-landing': '/test-landing.html',
        'sendgrid-template': '/sendgrid-template.html'
      }
    }
  },
  server: {
    host: true,
    port: 5173
  },
  esbuild: {
    loader: 'jsx',
    include: /.*\.html$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
        '.html': 'jsx'
      }
    }
  }
});
