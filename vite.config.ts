import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const isAnalyze = mode === 'analyze';

  return {
    plugins: [
      react({
        // React optimizations
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
        // Fast Refresh optimizations
        include: '**/*.{jsx,tsx}',
        exclude: /node_modules/,
      }),

      // Bundle analyzer
      isAnalyze &&
        visualizer({
          filename: 'dist/stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true,
          template: 'treemap', // or 'sunburst', 'network'
        }),

      // PWA configuration for performance
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\./,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24, // 24 hours
                },
              },
            },
          ],
        },
        manifest: {
          name: 'Farmer Trading Platform',
          short_name: 'FarmerTrade',
          theme_color: '#1976d2',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ].filter(Boolean),

    // Build optimizations
    build: {
      target: 'esnext',
      minify: isProduction ? 'terser' : false,
      sourcemap: isProduction ? 'hidden' : true,

      // Bundle size optimizations
      chunkSizeWarningLimit: 1600,

      terserOptions: isProduction
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info'],
              passes: 2,
            },
            mangle: {
              safari10: true,
            },
            format: {
              comments: false,
            },
          }
        : undefined,

      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            // React ecosystem
            'react-core': ['react', 'react-dom'],
            'react-router': ['react-router-dom'],

            // UI libraries
            'mui-core': [
              '@mui/material',
              '@mui/system',
              '@emotion/react',
              '@emotion/styled',
            ],
            'mui-icons': ['@mui/icons-material'],
            'mui-lab': ['@mui/lab'],
            'mui-pickers': ['@mui/x-date-pickers'],

            // Data management
            'react-query': [
              '@tanstack/react-query',
              '@tanstack/react-query-devtools',
            ],
            'state-management': ['zustand', 'immer'],

            // Forms and validation
            forms: ['react-hook-form', '@hookform/resolvers', 'yup'],

            // Charts and visualization
            charts: ['chart.js', 'react-chartjs-2'],

            // Utilities
            'date-utils': ['date-fns', '@date-io/date-fns'],
            'http-client': ['axios'],
            animations: ['framer-motion'],
            notifications: ['react-hot-toast'],
            utils: ['clsx'],
          },

          // Optimize chunk names for caching
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId
                  .split('/')
                  .pop()
                  ?.replace(/\.[^.]+$/, '') || 'chunk'
              : 'chunk';
            return `js/${facadeModuleId}-[hash].js`;
          },

          assetFileNames: (assetInfo) => {
            const info = assetInfo.name ? assetInfo.name.split('.') : [];
            const extType = info[info.length - 1];

            if (
              assetInfo.name &&
              /\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)
            ) {
              return `images/[name]-[hash][extname]`;
            }
            if (
              assetInfo.name &&
              /\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)
            ) {
              return `fonts/[name]-[hash][extname]`;
            }
            if (extType === 'css') {
              return `css/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
        },

        external: () => {
          // Don't externalize anything for now, but could be used for CDN resources
          return false;
        },
      },
    },

    // Development server optimizations
    server: {
      port: 5173,
      host: true,
      open: false,
      cors: true,

      // Proxy API calls during development
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: env.VITE_API_BASE_URL || 'https://localhost:7008',
          changeOrigin: true,
          secure: false,
        },
      },

      // HMR optimizations
      hmr: {
        overlay: true,
      },
    },

    // Preview server (for production builds)
    preview: {
      port: 5173,
      host: true,
      cors: true,
    },

    // Path resolution
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@features': resolve(__dirname, './src/features'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@utils': resolve(__dirname, './src/utils'),
        '@stores': resolve(__dirname, './src/stores'),
        '@services': resolve(__dirname, './src/services'),
        '@types': resolve(__dirname, './src/types'),
        '@shared': resolve(__dirname, './src/shared'),
        '@assets': resolve(__dirname, './src/assets'),
      },
    },

    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
        '@tanstack/react-query',
        'zustand',
        'axios',
        'react-hook-form',
        'yup',
        'date-fns',
        'chart.js',
        'react-chartjs-2',
        'framer-motion',
        'react-hot-toast',
        'clsx',
      ],

      // Pre-bundle these dependencies for faster dev startup
      force: command === 'serve',
    },

    // Performance optimizations
    esbuild: {
      // Remove console.log in production
      drop: isProduction ? ['console', 'debugger'] : [],

      // Target modern browsers for better performance
      target: 'esnext',

      // Optimize JSX
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
    },

    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __PERFORMANCE_MONITORING__: JSON.stringify(
        !isProduction || env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true'
      ),
    },

    // CSS optimizations
    css: {
      devSourcemap: !isProduction,
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`,
        },
      },
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isProduction
          ? '[hash:base64:5]'
          : '[name]__[local]__[hash:base64:5]',
      },
    },

    // Worker optimizations
    worker: {
      format: 'es',
    },

    // Experimental features for performance
    experimental: {
      renderBuiltUrl(filename) {
        // Custom CDN URL logic could go here
        return { runtime: `window.__assetsPath(${JSON.stringify(filename)})` };
      },
    },
  };
});
