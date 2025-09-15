# Troubleshooting Guide - Farmer Trading Frontend

## Common Issues and Solutions

### 🔍 API Connection Issues

#### Problem: Cannot connect to the backend API
**Error:** "Could not connect to backend. Make sure your .NET API is running."

**Solutions:**
1. **Check the backend server:**
   - Ensure your .NET backend is running: `cd ../FarmerTrading && dotnet run`
   - Verify the server starts without errors
   - Confirm it's running on port 5008 (check console output)

2. **Verify API URL configuration:**
   - Check `.env.local` or `.env` file for correct API URL
   - Should be: `VITE_API_BASE_URL=http://localhost:5008/api`
   - After changing, restart the development server: `npm run dev`

3. **Test API directly:**
   - Try accessing the health endpoint in browser: `http://localhost:5008/api/health`
   - Use a tool like Postman or Thunder Client to test the API

4. **Check CORS configuration:**
   - Ensure the .NET backend allows requests from `http://localhost:5173`
   - Look for CORS errors in browser console (F12)

#### Problem: API returns 404 Not Found
**Solutions:**
1. Check if the API endpoint exists and is spelled correctly
2. Verify the API route path is correct
3. Check if you need authentication for the endpoint

### 🛠️ Build and Dependency Issues

#### Problem: "Module not found" or import errors
**Error:** "The requested module '/node_modules/.vite/deps/axios.js?v=cd99f3c9' does not provide an export named 'AxiosResponse'"

**Solutions:**
1. **Clean node_modules and reinstall:**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

2. **Check for correct import syntax:**
   - Some packages export differently in newer versions
   - For axios specifically, use:
   ```typescript
   import axios from 'axios';
   // Define types manually if needed
   type AxiosResponse = {
     data: any;
     status: number;
     statusText: string;
     headers: Record<string, string>;
     config: any;
   };
   ```

3. **Update dependency versions:**
   - Check package.json for compatible versions
   - Consider downgrading if using bleeding-edge versions

#### Problem: TypeScript errors
**Solutions:**
1. Run type checking: `npm run type-check`
2. Clear the TypeScript cache: `rm -rf node_modules/.cache`
3. Make sure `tsconfig.json` is correctly configured

### 📱 UI and Rendering Issues

#### Problem: Components not rendering correctly
**Solutions:**
1. Check browser console for errors (F12)
2. Verify you're using correct React hooks syntax
3. Check for React version compatibility issues
4. Try disabling React.StrictMode in main.tsx temporarily

#### Problem: MUI components look wrong
**Solutions:**
1. Ensure all MUI packages have matching versions
2. Check if you're using the ThemeProvider correctly
3. Verify correct import paths from @mui/material

### 🔄 State Management Issues

#### Problem: State updates not reflecting in UI
**Solutions:**
1. Use React DevTools to inspect component state
2. Check if you're using state updater functions correctly
3. Verify that components re-render when state changes

#### Problem: React Query not working
**Solutions:**
1. Make sure QueryClientProvider is set up correctly
2. Check if you're properly destructuring the results
3. Verify the query key is consistent

### 💾 Environment Variables

#### Problem: Environment variables not available
**Error:** "import.meta.env.VITE_API_BASE_URL is undefined"

**Solutions:**
1. **Check variable naming:**
   - All Vite env variables must start with `VITE_`
   - Make sure there are no typos

2. **Restart development server:**
   - Environment variables are loaded at startup
   - After changing `.env` files, restart with `npm run dev`

3. **Check file location:**
   - `.env.local` should be in project root (same level as package.json)
   - Try creating a plain `.env` file as well

4. **Verify TypeScript support:**
   - Update your `vite-env.d.ts` file with:
   ```typescript
   /// <reference types="vite/client" />
   interface ImportMetaEnv {
     readonly VITE_API_BASE_URL: string;
     readonly VITE_APP_NAME: string;
   }
   interface ImportMeta {
     readonly env: ImportMetaEnv;
   }
   ```

### 🧪 Testing Connection

To quickly test if your setup is working correctly:

1. **Check API Connection with Browser Console:**
   - Open your app in browser
   - Press F12 to open developer tools
   - In the Console tab, enter:
   ```javascript
   fetch('http://localhost:5008/api/health').then(r => r.ok ? 'Connected!' : 'Failed').then(console.log)
   ```

2. **Use the ApiHealthCheck component:**
   - Import and add to any page: `<ApiHealthCheck />`
   - It will show detailed connection status

3. **Check .NET backend logs:**
   - Look for incoming request logs when testing
   - Verify the correct endpoints are being hit

## 📋 Development Workflow Tips

1. **Use VS Code's terminal split view:**
   - Run backend in one terminal: `cd ../FarmerTrading && dotnet run`
   - Run frontend in another: `npm run dev`

2. **Enable React DevTools:**
   - Install the React DevTools browser extension
   - Use it to inspect component props and state

3. **Set up proxying (alternative):**
   - Add to `vite.config.ts`:
   ```typescript
   export default defineConfig({
     // ...other config
     server: {
       proxy: {
         '/api': {
           target: 'http://localhost:5008',
           changeOrigin: true,
         }
       }
     }
   });
   ```
   - Then use relative URLs: `fetch('/api/health')`

4. **Debugging TypeScript:**
   - Add `debugger;` statements in your code
   - Use VS Code's JavaScript debugger with Chrome

## 🆘 Still Having Issues?

1. Check the React and Vite documentation
2. Look for similar issues on Stack Overflow
3. Verify your Node.js version is compatible (v18+)
4. Try creating a new project and comparing configurations
5. Check for console warnings about deprecated APIs

Remember that modern frontend development can involve complex tooling - sometimes a simple restart of the development server or clearing cache can fix mysterious issues!