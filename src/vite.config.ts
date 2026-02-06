import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Enable JSX in ALL contexts including inline HTML scripts
      include: /\.(jsx|tsx|js|ts|html)$/
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    outDir: 'dist',
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