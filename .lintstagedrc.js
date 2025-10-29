module.exports = {
  // TypeScript and JavaScript files
  '*.{js,jsx,ts,tsx}': [
    // ESLint with auto-fix
    'eslint --fix --ext .js,.jsx,.ts,.tsx',
    // Type checking for TypeScript files
    () => 'tsc --noEmit',
    // Prettier formatting
    'prettier --write',
    // Run tests related to changed files
    'npm run test -- --findRelatedTests --passWithNoTests',
  ],

  // CSS, SCSS, and styled-components
  '*.{css,scss,sass}': [
    'prettier --write',
  ],

  // JSON files
  '*.{json,jsonc}': [
    'prettier --write',
  ],

  // Markdown files
  '*.{md,mdx}': [
    'prettier --write',
    // Markdown linting
    'markdownlint --fix',
  ],

  // HTML files
  '*.html': [
    'prettier --write',
  ],

  // YAML files
  '*.{yml,yaml}': [
    'prettier --write',
  ],

  // Package.json specific checks
  'package.json': [
    'prettier --write',
    // Sort package.json
    'sort-package-json',
  ],

  // Git hooks and shell scripts
  '*.sh': [
    'shellcheck',
  ],

  // Image optimization
  '*.{png,jpg,jpeg,gif,svg}': [
    // Optimize images
    'imagemin --plugin=imagemin-optipng --plugin=imagemin-svgo',
  ],

  // Bundle analysis for significant changes
  'src/**/*.{js,jsx,ts,tsx}': [
    // Check bundle size impact
    () => 'npm run build:analyze -- --json > bundle-analysis.json',
  ],

  // Storybook stories
  '*.stories.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    // Test storybook stories
    () => 'npm run storybook:test',
  ],

  // Performance critical files get extra checks
  'src/{components,hooks,utils}/**/*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    // Run performance tests
    () => 'npm run test:performance',
  ],

  // Documentation files
  '{README,CHANGELOG,CONTRIBUTING}.md': [
    'prettier --write',
    'markdownlint --fix',
    // Check for broken links
    'markdown-link-check',
  ],

  // Configuration files
  '*.{config,conf}.{js,ts,json}': [
    'prettier --write',
    // Validate configuration
    () => 'npm run validate:config',
  ],

  // Test files get additional checks
  '**/*.{test,spec}.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    // Run the specific test
    'npm test -- --testPathPattern',
    // Check test coverage
    () => 'npm run test:coverage -- --collectCoverageOnlyFrom',
  ],

  // E2E test files
  'tests/e2e/**/*.{js,ts}': [
    'eslint --fix',
    'prettier --write',
    // Validate test structure
    () => 'npm run test:e2e:validate',
  ],

  // API and service files
  'src/services/**/*.{js,ts}': [
    'eslint --fix',
    'prettier --write',
    // API endpoint validation
    () => 'npm run validate:api',
  ],

  // Store/state management files
  'src/stores/**/*.{js,ts}': [
    'eslint --fix',
    'prettier --write',
    // State management validation
    () => 'npm run validate:stores',
  ],

  // Utility functions
  'src/utils/**/*.{js,ts}': [
    'eslint --fix',
    'prettier --write',
    // Utility function tests
    () => 'npm run test:utils',
    // Performance benchmarks
    () => 'npm run benchmark:utils',
  ],
};
