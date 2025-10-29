/**
 * Global E2E Test Teardown
 * Provides comprehensive cleanup after end-to-end testing
 */

import { FullConfig } from '@playwright/test';
import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  const startTime = performance.now();
  console.log('🧹 Starting E2E test environment teardown...');

  try {
    // Generate test report summary
    await generateTestSummary();

    // Clean up test artifacts
    await cleanupTestArtifacts();

    // Generate performance report
    await generatePerformanceReport();

    // Clean up temporary files
    await cleanupTempFiles();

    // Archive test results if in CI
    if (process.env.CI) {
      await archiveTestResults();
    }

    console.log('✅ Global E2E teardown completed successfully');

  } catch (error) {
    console.error('❌ Global E2E teardown failed:', error);
    // Don't throw the error to avoid failing the test suite
  }

  const teardownTime = performance.now() - startTime;
  console.log(`⏱️  Teardown completed in ${teardownTime.toFixed(2)}ms`);
}

/**
 * Generate test summary report
 */
async function generateTestSummary() {
  console.log('📊 Generating test summary...');

  try {
    const testResultsPath = './test-results/e2e-results.json';

    if (fs.existsSync(testResultsPath)) {
      const results = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));

      const summary = {
        timestamp: new Date().toISOString(),
        totalTests: results.stats?.total || 0,
        passed: results.stats?.passed || 0,
        failed: results.stats?.failed || 0,
        skipped: results.stats?.skipped || 0,
        duration: results.stats?.duration || 0,
        projects: results.config?.projects?.map((p: any) => p.name) || [],
        environment: {
          node: process.version,
          platform: process.platform,
          arch: process.arch,
          ci: !!process.env.CI,
        },
      };

      // Write summary to file
      const summaryPath = './test-results/test-summary.json';
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

      // Log summary to console
      console.log('📈 Test Summary:');
      console.log(`  Total Tests: ${summary.totalTests}`);
      console.log(`  Passed: ${summary.passed}`);
      console.log(`  Failed: ${summary.failed}`);
      console.log(`  Skipped: ${summary.skipped}`);
      console.log(`  Duration: ${(summary.duration / 1000).toFixed(2)}s`);
      console.log(`  Success Rate: ${((summary.passed / summary.totalTests) * 100).toFixed(2)}%`);

      // Generate failure report if there are failures
      if (summary.failed > 0) {
        await generateFailureReport(results);
      }

    } else {
      console.log('⚠️  Test results file not found, skipping summary generation');
    }

  } catch (error) {
    console.warn('⚠️  Failed to generate test summary:', error.message);
  }
}

/**
 * Generate failure report for debugging
 */
async function generateFailureReport(results: any) {
  console.log('🔍 Generating failure report...');

  try {
    const failures = results.suites
      ?.flatMap((suite: any) => suite.specs || [])
      ?.flatMap((spec: any) => spec.tests || [])
      ?.filter((test: any) => test.results?.[0]?.status === 'failed')
      ?.map((test: any) => ({
        title: test.title,
        error: test.results?.[0]?.error?.message || 'Unknown error',
        duration: test.results?.[0]?.duration || 0,
        retry: test.results?.[0]?.retry || 0,
      })) || [];

    if (failures.length > 0) {
      const failureReport = {
        timestamp: new Date().toISOString(),
        totalFailures: failures.length,
        failures: failures,
      };

      fs.writeFileSync('./test-results/failure-report.json', JSON.stringify(failureReport, null, 2));

      console.log('📛 Test Failures:');
      failures.forEach((failure: any, index: number) => {
        console.log(`  ${index + 1}. ${failure.title}`);
        console.log(`     Error: ${failure.error}`);
        console.log(`     Duration: ${failure.duration}ms`);
        if (failure.retry > 0) {
          console.log(`     Retries: ${failure.retry}`);
        }
      });
    }

  } catch (error) {
    console.warn('⚠️  Failed to generate failure report:', error.message);
  }
}

/**
 * Clean up test artifacts
 */
async function cleanupTestArtifacts() {
  console.log('🗑️  Cleaning up test artifacts...');

  try {
    const artifactsToClean = [
      './test-results/screenshots',
      './test-results/videos',
      './test-results/traces',
    ];

    // Only clean up if not in CI (we want to keep artifacts in CI for debugging)
    if (!process.env.CI) {
      for (const artifactPath of artifactsToClean) {
        if (fs.existsSync(artifactPath)) {
          const files = fs.readdirSync(artifactPath);
          const oldFiles = files.filter(file => {
            const filePath = path.join(artifactPath, file);
            const stats = fs.statSync(filePath);
            const ageInDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
            return ageInDays > 7; // Keep files for 7 days
          });

          oldFiles.forEach(file => {
            const filePath = path.join(artifactPath, file);
            fs.unlinkSync(filePath);
          });

          console.log(`🧹 Cleaned up ${oldFiles.length} old files from ${artifactPath}`);
        }
      }
    } else {
      console.log('ℹ️  Skipping artifact cleanup in CI environment');
    }

  } catch (error) {
    console.warn('⚠️  Failed to clean up test artifacts:', error.message);
  }
}

/**
 * Generate performance report
 */
async function generatePerformanceReport() {
  console.log('⚡ Generating performance report...');

  try {
    // Check if there are any performance test results
    const perfResultsPath = './test-results/performance-metrics.json';

    if (fs.existsSync(perfResultsPath)) {
      const perfResults = JSON.parse(fs.readFileSync(perfResultsPath, 'utf8'));

      const performanceReport = {
        timestamp: new Date().toISOString(),
        summary: {
          totalTests: perfResults.length,
          averageLoadTime: perfResults.reduce((sum: number, test: any) => sum + test.loadTime, 0) / perfResults.length,
          averageFCP: perfResults.reduce((sum: number, test: any) => sum + (test.fcp || 0), 0) / perfResults.length,
          averageLCP: perfResults.reduce((sum: number, test: any) => sum + (test.lcp || 0), 0) / perfResults.length,
        },
        details: perfResults,
        recommendations: generatePerformanceRecommendations(perfResults),
      };

      fs.writeFileSync('./test-results/performance-report.json', JSON.stringify(performanceReport, null, 2));

      console.log('📊 Performance Summary:');
      console.log(`  Average Load Time: ${performanceReport.summary.averageLoadTime.toFixed(2)}ms`);
      console.log(`  Average FCP: ${performanceReport.summary.averageFCP.toFixed(2)}ms`);
      console.log(`  Average LCP: ${performanceReport.summary.averageLCP.toFixed(2)}ms`);

      if (performanceReport.recommendations.length > 0) {
        console.log('💡 Performance Recommendations:');
        performanceReport.recommendations.forEach((rec: string, index: number) => {
          console.log(`  ${index + 1}. ${rec}`);
        });
      }

    } else {
      console.log('ℹ️  No performance metrics found, skipping performance report');
    }

  } catch (error) {
    console.warn('⚠️  Failed to generate performance report:', error.message);
  }
}

/**
 * Generate performance recommendations
 */
function generatePerformanceRecommendations(perfResults: any[]): string[] {
  const recommendations = [];

  const avgLoadTime = perfResults.reduce((sum, test) => sum + test.loadTime, 0) / perfResults.length;
  const avgFCP = perfResults.reduce((sum, test) => sum + (test.fcp || 0), 0) / perfResults.length;
  const avgLCP = perfResults.reduce((sum, test) => sum + (test.lcp || 0), 0) / perfResults.length;

  if (avgLoadTime > 3000) {
    recommendations.push('Consider optimizing initial bundle size - average load time exceeds 3 seconds');
  }

  if (avgFCP > 1800) {
    recommendations.push('First Contentful Paint is slow - consider preloading critical resources');
  }

  if (avgLCP > 2500) {
    recommendations.push('Largest Contentful Paint is slow - optimize your largest page elements');
  }

  const slowTests = perfResults.filter(test => test.loadTime > 5000);
  if (slowTests.length > 0) {
    recommendations.push(`${slowTests.length} tests had load times over 5 seconds - investigate these pages`);
  }

  return recommendations;
}

/**
 * Clean up temporary files
 */
async function cleanupTempFiles() {
  console.log('🧼 Cleaning up temporary files...');

  try {
    const tempDirs = [
      './tmp',
      './.temp',
      './test-temp',
    ];

    tempDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`🗑️  Removed temporary directory: ${dir}`);
      }
    });

    // Clean up any .tmp files
    const currentDir = './';
    const files = fs.readdirSync(currentDir);
    const tmpFiles = files.filter(file => file.endsWith('.tmp') || file.startsWith('temp_'));

    tmpFiles.forEach(file => {
      fs.unlinkSync(path.join(currentDir, file));
      console.log(`🗑️  Removed temporary file: ${file}`);
    });

  } catch (error) {
    console.warn('⚠️  Failed to clean up temporary files:', error.message);
  }
}

/**
 * Archive test results for CI
 */
async function archiveTestResults() {
  console.log('📦 Archiving test results for CI...');

  try {
    const archiveName = `test-results-${Date.now()}.tar.gz`;
    const { execSync } = require('child_process');

    // Create tar archive of test results
    execSync(`tar -czf ${archiveName} test-results/`, { stdio: 'inherit' });

    console.log(`📦 Test results archived as ${archiveName}`);

    // Set GitHub Actions output if available
    if (process.env.GITHUB_ACTIONS) {
      execSync(`echo "test-archive=${archiveName}" >> $GITHUB_OUTPUT`);
    }

  } catch (error) {
    console.warn('⚠️  Failed to archive test results:', error.message);
  }
}

/**
 * Log system information for debugging
 */
async function logSystemInfo() {
  console.log('💻 System Information:');
  console.log(`  Node.js: ${process.version}`);
  console.log(`  Platform: ${process.platform}`);
  console.log(`  Architecture: ${process.arch}`);
  console.log(`  Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  console.log(`  Uptime: ${Math.round(process.uptime())}s`);

  if (process.env.CI) {
    console.log(`  CI: ${process.env.CI}`);
    console.log(`  GitHub Actions: ${process.env.GITHUB_ACTIONS || 'false'}`);
  }
}

/**
 * Send notifications if configured
 */
async function sendNotifications() {
  if (!process.env.CI) return;

  console.log('📢 Checking for notification configuration...');

  try {
    // Check if we have Slack webhook configured
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;

    if (slackWebhook) {
      // Read test summary
      const summaryPath = './test-results/test-summary.json';

      if (fs.existsSync(summaryPath)) {
        const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

        const message = {
          text: `E2E Test Results`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*E2E Test Results*\n✅ Passed: ${summary.passed}\n❌ Failed: ${summary.failed}\n⏭️ Skipped: ${summary.skipped}\n⏱️ Duration: ${(summary.duration / 1000).toFixed(2)}s`
              }
            }
          ]
        };

        // Send notification (would require actual HTTP request in real implementation)
        console.log('📬 Would send Slack notification:', JSON.stringify(message, null, 2));
      }
    }

    // Check for other notification services (Discord, Teams, etc.)
    // Implementation would depend on your notification requirements

  } catch (error) {
    console.warn('⚠️  Failed to send notifications:', error.message);
  }
}

export default globalTeardown;
