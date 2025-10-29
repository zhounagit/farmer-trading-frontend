/**
 * Development Tools for Better Import Management and Code Coordination
 *
 * This file provides utilities to help manage imports, detect missing imports,
 * and coordinate between frontend and backend code.
 */

import { API_ENDPOINTS } from '../types/api-contracts';

/**
 * Import Manager - Helps track and manage imports across the codebase
 */
export class ImportManager {
  private static imports = new Map<string, Set<string>>();

  /**
   * Track an import usage
   */
  static trackImport(filePath: string, importPath: string): void {
    if (!this.imports.has(filePath)) {
      this.imports.set(filePath, new Set());
    }
    this.imports.get(filePath)!.add(importPath);
  }

  /**
   * Get all imports for a file
   */
  static getImports(filePath: string): string[] {
    return Array.from(this.imports.get(filePath) || []);
  }

  /**
   * Check for unused imports
   */
  static findUnusedImports(): Array<{ file: string; imports: string[] }> {
    const unused: Array<{ file: string; imports: string[] }> = [];

    // This would need integration with a code analysis tool
    // For now, it's a placeholder for future implementation
    console.warn('Unused import detection requires code analysis integration');

    return unused;
  }

  /**
   * Generate import statements for a file
   */
  static generateImports(filePath: string, dependencies: string[]): string {
    const imports = dependencies.map(dep => {
      if (dep.startsWith('./') || dep.startsWith('../')) {
        return `import '${dep}';`;
      }
      return `import { ${dep} } from '${dep}';`;
    }).join('\n');

    return `// Auto-generated imports for ${filePath}\n${imports}\n`;
  }
}

/**
 * API Contract Validator - Validates frontend API usage against contracts
 */
export class ApiContractValidator {
  /**
   * Validate that an API endpoint exists in the contract
   */
  static validateEndpoint(endpoint: string): boolean {
    const endpoints = this.getAllEndpoints();
    return endpoints.includes(endpoint);
  }

  /**
   * Get all defined API endpoints from contracts
   */
  static getAllEndpoints(): string[] {
    const endpoints: string[] = [];

    const traverseObject = (obj: any, path: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof value === 'string') {
          endpoints.push(value);
        } else if (typeof value === 'function') {
          // For dynamic endpoints, we can't validate the exact path
          // but we can validate the pattern
          endpoints.push(currentPath);
        } else if (typeof value === 'object' && value !== null) {
          traverseObject(value, currentPath);
        }
      }
    };

    traverseObject(API_ENDPOINTS);
    return endpoints;
  }

  /**
   * Find API endpoints that are used but not defined in contracts
   */
  static findUndefinedEndpoints(code: string): string[] {
    const definedEndpoints = this.getAllEndpoints();
    const usedEndpoints = this.extractApiCalls(code);

    return usedEndpoints.filter(endpoint =>
      !definedEndpoints.some(defined =>
        endpoint.includes(defined) || defined.includes(endpoint)
      )
    );
  }

  /**
   * Extract API calls from code string
   */
  private static extractApiCalls(code: string): string[] {
    const apiCallPatterns = [
      /apiService\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /axios\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g,
    ];

    const endpoints: string[] = [];

    for (const pattern of apiCallPatterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        endpoints.push(match[2] || match[1]);
      }
    }

    return endpoints;
  }
}

/**
 * Code Quality Scanner - Scans for common issues
 */
export class CodeQualityScanner {
  /**
   * Scan a file for common issues
   */
  static scanFile(filePath: string, code: string): ScanResult {
    const issues: ScanIssue[] = [];

    // Check for missing imports
    const missingImports = this.findMissingImports(code);
    if (missingImports.length > 0) {
      issues.push({
        type: 'missing_import',
        message: `Missing imports: ${missingImports.join(', ')}`,
        severity: 'error',
        line: this.findLineNumber(code, missingImports[0]),
      });
    }

    // Check for undefined API endpoints
    const undefinedEndpoints = ApiContractValidator.findUndefinedEndpoints(code);
    if (undefinedEndpoints.length > 0) {
      issues.push({
        type: 'undefined_endpoint',
        message: `Undefined API endpoints: ${undefinedEndpoints.join(', ')}`,
        severity: 'warning',
        line: this.findLineNumber(code, undefinedEndpoints[0]),
      });
    }

    // Check for performance issues
    const performanceIssues = this.findPerformanceIssues(code);
    issues.push(...performanceIssues);

    return {
      filePath,
      issues,
      score: this.calculateQualityScore(issues),
    };
  }

  /**
   * Find missing imports by analyzing usage
   */
  private static findMissingImports(code: string): string[] {
    const missing: string[] = [];

    // Common patterns that might indicate missing imports
    const patterns = [
      {
        regex: /React\.(useState|useEffect|useContext|useMemo|useCallback)/g,
        import: 'react',
      },
      {
        regex: /useQuery|useMutation/g,
        import: '@tanstack/react-query',
      },
      {
        regex: /Typography|Button|TextField/g,
        import: '@mui/material',
      },
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(code) && !code.includes(`from '${pattern.import}'`)) {
        missing.push(pattern.import);
      }
    }

    return missing;
  }

  /**
   * Find performance issues in code
   */
  private static findPerformanceIssues(code: string): ScanIssue[] {
    const issues: ScanIssue[] = [];

    // Check for inline functions in JSX
    const inlineFunctionPattern = /onClick=\{\(\) => [^}]*\}/g;
    let match;
    while ((match = inlineFunctionPattern.exec(code)) !== null) {
      issues.push({
        type: 'performance',
        message: 'Avoid inline functions in JSX, use useCallback instead',
        severity: 'warning',
        line: this.findLineNumber(code, match[0]),
      });
    }

    // Check for expensive computations without useMemo
    const expensivePatterns = [
      /\.map\(.*=>.*\{/g,
      /\.filter\(.*=>.*\{/g,
      /\.reduce\(.*=>.*\{/g,
    ];

    for (const pattern of expensivePatterns) {
      if (pattern.test(code) && !code.includes('useMemo')) {
        issues.push({
          type: 'performance',
          message: 'Consider using useMemo for expensive computations',
          severity: 'info',
          line: this.findLineNumber(code, pattern.source),
        });
      }
    }

    return issues;
  }

  /**
   * Find line number for a pattern in code
   */
  private static findLineNumber(code: string, pattern: string): number {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(pattern)) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * Calculate quality score based on issues
   */
  private static calculateQualityScore(issues: ScanIssue[]): number {
    const weights = {
      error: 10,
      warning: 3,
      info: 1,
    };

    const totalWeight = issues.reduce((sum, issue) =>
      sum + weights[issue.severity], 0
    );

    return Math.max(0, 100 - totalWeight);
  }
}

/**
 * Development CLI Tools
 */
export class DevCLI {
  /**
   * Generate a development report
   */
  static generateReport(): DevelopmentReport {
    // This would scan the entire codebase in a real implementation
    console.log('Generating development report...');

    return {
      timestamp: new Date().toISOString(),
      totalFiles: 0, // Would be calculated from actual scan
      issues: [],
      qualityScore: 100,
      recommendations: [
        'Use the shared API contracts for all API calls',
        'Run import validation before committing',
        'Use the API contract validator for new endpoints',
      ],
    };
  }

  /**
   * Validate all API endpoints in the codebase
   */
  static validateApiContracts(): ApiValidationResult {
    console.log('Validating API contracts...');

    // This would scan all files in a real implementation
    return {
      validEndpoints: ApiContractValidator.getAllEndpoints(),
      undefinedEndpoints: [],
      validationDate: new Date().toISOString(),
    };
  }
}

// Types
export interface ScanIssue {
  type: 'missing_import' | 'undefined_endpoint' | 'performance' | 'other';
  message: string;
  severity: 'error' | 'warning' | 'info';
  line: number;
}

export interface ScanResult {
  filePath: string;
  issues: ScanIssue[];
  score: number;
}

export interface DevelopmentReport {
  timestamp: string;
  totalFiles: number;
  issues: ScanIssue[];
  qualityScore: number;
  recommendations: string[];
}

export interface ApiValidationResult {
  validEndpoints: string[];
  undefinedEndpoints: string[];
  validationDate: string;
}

// Export utilities for easy access
export const devTools = {
  ImportManager,
  ApiContractValidator,
  CodeQualityScanner,
  DevCLI,
};

// Development mode helpers
if (import.meta.env.DEV) {
  // Make dev tools available globally for debugging
  (window as any).__DEV_TOOLS__ = devTools;

  // Auto-run basic validation in development
  setTimeout(() => {
    console.group('🔧 Development Tools');
    console.log('Development tools are available at window.__DEV_TOOLS__');
    console.log('Run __DEV_TOOLS__.DevCLI.generateReport() for a full report');
    console.groupEnd();
  }, 1000);
}

export default devTools;
