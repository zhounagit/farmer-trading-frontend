import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7008',
        changeOrigin: true,
        secure: false,
        followRedirects: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            // Ensure Authorization header is preserved
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log(
              'Received Response from the Target:',
              proxyRes.statusCode,
              req.url
            );
            // Log redirects
            if (
              proxyRes.statusCode &&
              proxyRes.statusCode >= 300 &&
              proxyRes.statusCode < 400
            ) {
              console.log('Redirect detected to:', proxyRes.headers.location);
            }
          });
        },
      },
      '/uploads': {
        target: 'https://localhost:7008',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      '/Uploads': {
        target: 'https://localhost:7008',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
});
