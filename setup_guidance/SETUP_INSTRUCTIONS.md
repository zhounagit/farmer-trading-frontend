# React Frontend Setup Instructions
## Farmer Trading Platform

### 🚀 Quick Start Guide

Follow these steps to set up your React frontend project:

## Step 1: Prerequisites

### Install Required Software:

1. **Node.js (v18 or higher)**
   ```bash
   # Check if installed
   node --version
   npm --version
   
   # Download from: https://nodejs.org/
   # Recommended: Use Node Version Manager (nvm)
   ```

2. **Visual Studio Code**
   ```bash
   # Download from: https://code.visualstudio.com/
   ```

3. **Git** (if not already installed)
   ```bash
   # Check if installed
   git --version
   
   # Download from: https://git-scm.com/
   ```

## Step 2: VS Code Extensions Setup

Open VS Code and install these essential extensions:

### Core Extensions:
```
1. ES7+ React/Redux/React-Native snippets (dsznajder.es7-react-js-snippets)
2. TypeScript Importer (pmneo.tsimporter)
3. Prettier - Code formatter (esbenp.prettier-vscode)
4. ESLint (dbaeumer.vscode-eslint)
5. Auto Rename Tag (formulahendry.auto-rename-tag)
6. Bracket Pair Colorizer 2 (coenraads.bracket-pair-colorizer-2)
7. GitLens (eamodio.gitlens)
8. Thunder Client (rangav.vscode-thunder-client)
```

### UI/Theme Extensions:
```
9. Material Icon Theme (pkief.material-icon-theme)
10. One Dark Pro (zhuangtongfa.material-theme)
```

### Install Extensions via Command Palette:
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Extensions: Install Extensions"
3. Search for each extension and install

## Step 3: Create React Project

### Navigate to your project directory:
```bash
cd FarmerTrading
```

### Create React app with TypeScript:
```bash
# Using Vite (Recommended - faster than Create React App)
npm create vite@latest farmer-trading-frontend -- --template react-ts

# Alternative with Create React App (slower but more established)
# npx create-react-app farmer-trading-frontend --template typescript
```

### Navigate to the frontend directory:
```bash
cd farmer-trading-frontend
```

### Install dependencies:
```bash
npm install
```

## Step 4: Install Essential Dependencies

### Core Dependencies:
```bash
# API and State Management
npm install axios @tanstack/react-query @tanstack/react-query-devtools

# UI Framework (Material-UI)
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/x-date-pickers

# Routing and Forms
npm install react-router-dom react-hook-form @hookform/resolvers

# Validation and Utilities
npm install yup date-fns

# Notifications
npm install react-hot-toast

# Loading and Animation
npm install framer-motion
```

### Development Dependencies:
```bash
npm install -D @types/node
npm install -D eslint-config-prettier eslint-plugin-prettier
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

## Step 5: Project Structure Setup

Create the following folder structure in your `src` directory:

```
src/
├── components/          # Reusable UI components
│   ├── common/          # Shared components
│   ├── forms/           # Form components
│   ├── product/         # Product-related components
│   └── store/           # Store-related components
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   ├── customer/        # Customer pages
│   ├── farmer/          # Farmer dashboard pages
│   └── shared/          # Shared pages
├── services/            # API service functions
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── assets/              # Static assets
└── styles/              # Global styles
```

### Create the folder structure:
```bash
# In the farmer-trading-frontend/src directory
mkdir -p components/{common,forms,product,store}
mkdir -p pages/{auth,customer,farmer,shared}
mkdir -p services hooks types utils assets styles
```

## Step 6: Configuration Files

### 1. Create `.env.local` file in root directory:
```env
VITE_API_BASE_URL=https://localhost:7008/api
VITE_APP_NAME=Farmer Trading
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 2. Update `tsconfig.json` (if using Vite):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/pages/*": ["src/pages/*"],
      "@/services/*": ["src/services/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. Create `src/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## Step 7: VS Code Workspace Settings

Create `.vscode/settings.json` in your project root:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "css",
    "*.scss": "scss"
  }
}
```

Create `.vscode/extensions.json`:
```json
{
  "recommendations": [
    "dsznajder.es7-react-js-snippets",
    "pmneo.tsimporter",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "coenraads.bracket-pair-colorizer-2",
    "eamodio.gitlens",
    "rangav.vscode-thunder-client",
    "pkief.material-icon-theme"
  ]
}
```

## Step 8: Prettier Configuration

Create `.prettierrc` in project root:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

## Step 9: ESLint Configuration

Create `.eslintrc.json`:
```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error"
  },
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  }
}
```

## Step 10: Test the Setup

### Start the development server:
```bash
npm run dev
```

### Verify everything works:
1. Open browser to `http://localhost:5173` (Vite) or `http://localhost:3000` (CRA)
2. You should see the React welcome page
3. Open VS Code and verify extensions are working
4. Try creating a new `.tsx` file and test TypeScript intellisense

## Step 11: VS Code Useful Shortcuts

### Essential Shortcuts:
```
Ctrl+Shift+P / Cmd+Shift+P  - Command Palette
Ctrl+`                      - Toggle Terminal
Ctrl+Shift+E               - Explorer Panel
Ctrl+Shift+F               - Global Search
Ctrl+D                     - Select Next Occurrence
Ctrl+Shift+L               - Select All Occurrences
Alt+Shift+F                - Format Document
Ctrl+/                     - Toggle Comment
```

### React-Specific Shortcuts:
```
Type "rfc" + Tab           - Create React Functional Component
Type "rafce" + Tab         - Create React Arrow Function Component
Type "imr" + Tab           - Import React
Type "useState" + Tab      - useState hook
Type "useEffect" + Tab     - useEffect hook
```

## Step 12: Connect to Your .NET Backend

### Test API Connection:

Create `src/services/api.ts`:
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7008/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Test API connection
export const testApiConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('API Connection Successful:', response.data);
    return true;
  } catch (error) {
    console.error('API Connection Failed:', error);
    return false;
  }
};
```

## Step 13: Next Steps

### After setup is complete:

1. **Start your .NET backend**:
   ```bash
   cd ../  # Go back to FarmerTrading root
   dotnet run
   ```

2. **Start your React frontend**:
   ```bash
   cd farmer-trading-frontend
   npm run dev
   ```

3. **Test the connection**:
   - Open browser dev tools
   - Call `testApiConnection()` in console
   - Verify your React app can reach the .NET API

## 🔧 Troubleshooting

### Common Issues:

1. **Port conflicts**:
   - Backend: Default port 7008
   - Frontend: Default port 5173 (Vite) or 3000 (CRA)

2. **CORS issues**:
   - Ensure your .NET backend has CORS configured for `http://localhost:5173`

3. **TypeScript errors**:
   - Make sure all type definitions are installed
   - Restart TypeScript server: Ctrl+Shift+P > "TypeScript: Restart TS Server"

4. **Extension not working**:
   - Reload VS Code: Ctrl+Shift+P > "Developer: Reload Window"

## ✅ Setup Complete Checklist

- [ ] Node.js installed
- [ ] VS Code installed with extensions
- [ ] React project created with TypeScript
- [ ] Dependencies installed
- [ ] Project structure created
- [ ] Configuration files set up
- [ ] VS Code workspace configured
- [ ] Development server running
- [ ] API connection tested
- [ ] .NET backend connection verified

Your React frontend is now ready for development! 🚀

## 📚 Recommended Learning Resources

- **React TypeScript**: https://react-typescript-cheatsheet.netlify.app/
- **Material-UI**: https://mui.com/getting-started/
- **React Query**: https://tanstack.com/query/latest
- **React Router**: https://reactrouter.com/
- **VS Code React**: https://code.visualstudio.com/docs/nodejs/reactjs-tutorial