import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Enable JSX in .js files and inline scripts
      include: '**/*.{jsx,tsx,js,ts}',
      jsxRuntime: 'automatic'
    })
  ],
  resolve: {
    alias: {
      '@': '/'
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
    host: true, // Allows access from network (needed for mobile testing)
    port: 5173
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