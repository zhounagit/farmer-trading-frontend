import type { StorybookConfig } from '@storybook/react-vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/**/*.story.@(js|jsx|mjs|ts|tsx)',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],

  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true,
        babelOptions: {},
        sourceLoaderOptions: null,
        transcludeMarkdown: true,
      },
    },
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {
      strictMode: true,
    },
  },

  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
      compilerOptions: {
        allowSyntheticDefaultImports: false,
        esModuleInterop: false,
      },
    },
  },

  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation',
  },

  viteFinal: async (config, { configType }) => {
    // Merge with our custom Vite config
    return defineConfig({
      ...config,
      plugins: [
        ...config.plugins || [],
        react({
          include: "**/*.{jsx,tsx}",
          exclude: /node_modules/,
          jsxImportSource: '@emotion/react',
          babel: {
            plugins: ['@emotion/babel-plugin'],
          },
        }),
      ],
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@': resolve(__dirname, '../src'),
          '@components': resolve(__dirname, '../src/components'),
          '@features': resolve(__dirname, '../src/features'),
          '@hooks': resolve(__dirname, '../src/hooks'),
          '@utils': resolve(__dirname, '../src/utils'),
          '@stores': resolve(__dirname, '../src/stores'),
          '@services': resolve(__dirname, '../src/services'),
          '@types': resolve(__dirname, '../src/types'),
          '@shared': resolve(__dirname, '../src/shared'),
        },
      },
      define: {
        ...config.define,
        __STORYBOOK__: true,
        'process.env.NODE_ENV': JSON.stringify(configType === 'DEVELOPMENT' ? 'development' : 'production'),
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [
          ...config.optimizeDeps?.include || [],
          '@emotion/react',
          '@emotion/styled',
          '@mui/material',
          '@mui/icons-material',
          'react',
          'react-dom',
          'react-router-dom',
          '@tanstack/react-query',
        ],
      },
      server: {
        ...config.server,
        fs: {
          allow: ['..'],
        },
      },
      build: {
        ...config.build,
        rollupOptions: {
          ...config.build?.rollupOptions,
          external: (id) => {
            // Don't externalize these packages in Storybook
            if (id.includes('@storybook/') || id.includes('react') || id.includes('@emotion') || id.includes('@mui')) {
              return false;
            }
            return false;
          },
        },
      },
    });
  },

  // Performance optimizations
  core: {
    disableTelemetry: true,
    enableCrashReports: false,
  },

  // Features configuration
  features: {
    storyStoreV7: true,
    argTypeTargetsV7: true,
    warnOnLegacyHierarchySeparator: true,
  },

  // Previewers configuration
  previewHead: (head) => `
    ${head}
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      /* Performance monitoring styles */
      .sb-show-main {
        transition: all 0.2s ease;
      }

      /* Custom loading spinner for components */
      .component-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      }

      .component-loading::after {
        content: 'Loading component...';
        color: #666;
      }

      /* Performance warning styles */
      .performance-warning {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 4px;
        padding: 8px 12px;
        margin: 8px 0;
        color: #856404;
        font-size: 12px;
      }

      /* Accessibility indicators */
      .a11y-indicator {
        position: absolute;
        top: 8px;
        right: 8px;
        background: #28a745;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: bold;
      }

      .a11y-indicator.warning {
        background: #ffc107;
        color: #212529;
      }

      .a11y-indicator.error {
        background: #dc3545;
      }
    </style>
    <script>
      // Performance monitoring for Storybook
      window.__STORYBOOK_PERFORMANCE__ = {
        renderTimes: [],
        startTime: null,

        startRender: function() {
          this.startTime = performance.now();
        },

        endRender: function(storyName) {
          if (this.startTime) {
            const renderTime = performance.now() - this.startTime;
            this.renderTimes.push({ story: storyName, time: renderTime });

            // Warn about slow renders
            if (renderTime > 100) {
              console.warn('Slow story render detected:', storyName, renderTime + 'ms');
            }

            this.startTime = null;
          }
        },

        getReport: function() {
          const avgRenderTime = this.renderTimes.reduce((sum, entry) => sum + entry.time, 0) / this.renderTimes.length;
          const slowStories = this.renderTimes.filter(entry => entry.time > 100);

          return {
            totalStories: this.renderTimes.length,
            averageRenderTime: avgRenderTime,
            slowStories: slowStories,
          };
        }
      };

      // Global error tracking
      window.addEventListener('error', function(event) {
        console.error('Storybook Error:', event.error);
      });

      window.addEventListener('unhandledrejection', function(event) {
        console.error('Storybook Unhandled Promise Rejection:', event.reason);
      });
    </script>
  `,

  // Static directories
  staticDirs: ['../public'],

  // Environment variables to expose
  env: (config) => ({
    ...config,
    STORYBOOK_ENV: 'development',
    NODE_ENV: 'development',
  }),

  // Babel configuration for advanced features
  babel: async (options) => {
    return {
      ...options,
      plugins: [
        ...options.plugins || [],
        '@emotion/babel-plugin',
        ['@babel/plugin-transform-runtime', { regenerator: true }],
      ],
      presets: [
        ...options.presets || [],
        ['@babel/preset-env', { targets: { chrome: '100', firefox: '100', safari: '15' } }],
        ['@babel/preset-react', { runtime: 'automatic', importSource: '@emotion/react' }],
        '@babel/preset-typescript',
      ],
    };
  },

  // WebpackFinal for additional customizations (fallback)
  webpackFinal: async (config) => {
    // Add any webpack-specific customizations here if needed
    // This is a fallback for configurations not covered by viteFinal
    return config;
  },
};

export default config;
