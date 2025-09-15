// Test utility for dashboard metric labels
// This file helps test the dynamic metric labels functionality

import { getDashboardMetricLabels } from './userTypeUtils';

export interface TestUserScenario {
  name: string;
  userType: string;
  hasStore?: boolean;
  expectedSpentLabel: string;
  expectedDescription: string;
  expectedIcon: string;
  expectedValue: string;
}

/**
 * Test scenarios for different user types and dashboard metrics
 */
export const dashboardMetricTestScenarios: TestUserScenario[] = [
  {
    name: 'Customer User',
    userType: 'customer',
    hasStore: false,
    expectedSpentLabel: 'Total Referral Credit',
    expectedDescription: 'Credits earned from referrals',
    expectedIcon: 'AccountBalanceWallet',
    expectedValue: '$45'
  },
  {
    name: 'Store Owner User',
    userType: 'store_owner',
    hasStore: true,
    expectedSpentLabel: 'Total Transactions',
    expectedDescription: 'Total transaction volume from your store',
    expectedIcon: 'TrendingUp',
    expectedValue: '$2,340'
  },
  {
    name: 'Customer with Store (should show store owner metrics)',
    userType: 'customer',
    hasStore: true,
    expectedSpentLabel: 'Total Transactions',
    expectedDescription: 'Total transaction volume from your store',
    expectedIcon: 'TrendingUp',
    expectedValue: '$2,340'
  },
  {
    name: 'Store Owner without hasStore flag',
    userType: 'store_owner',
    hasStore: false,
    expectedSpentLabel: 'Total Transactions',
    expectedDescription: 'Total transaction volume from your store',
    expectedIcon: 'TrendingUp',
    expectedValue: '$2,340'
  },
  {
    name: 'Admin User',
    userType: 'admin',
    hasStore: false,
    expectedSpentLabel: 'Total Spent',
    expectedDescription: 'Total amount spent on platform',
    expectedIcon: 'MonetizationOn',
    expectedValue: '$234'
  },
  {
    name: 'Undefined User Type (defaults to customer)',
    userType: undefined as any,
    hasStore: false,
    expectedSpentLabel: 'Total Referral Credit',
    expectedDescription: 'Credits earned from referrals',
    expectedIcon: 'AccountBalanceWallet',
    expectedValue: '$45'
  },
  {
    name: 'Legacy Store Owner Format',
    userType: 'storeowner',
    hasStore: true,
    expectedSpentLabel: 'Total Transactions',
    expectedDescription: 'Total transaction volume from your store',
    expectedIcon: 'TrendingUp',
    expectedValue: '$2,340'
  },
  {
    name: 'Shop Owner Variation',
    userType: 'shop_owner',
    hasStore: true,
    expectedSpentLabel: 'Total Transactions',
    expectedDescription: 'Total transaction volume from your store',
    expectedIcon: 'TrendingUp',
    expectedValue: '$2,340'
  }
];

/**
 * Run tests for dashboard metric labels
 */
export const testDashboardMetricLabels = (): void => {
  console.log('🧪 Testing Dashboard Metric Labels...');
  console.log('==========================================');

  let passedTests = 0;
  let failedTests = 0;

  dashboardMetricTestScenarios.forEach((scenario, index) => {
    console.log(`\n${index + 1}. Testing: ${scenario.name}`);

    const result = getDashboardMetricLabels(scenario.userType, scenario.hasStore);

    const spentLabelMatch = result.spentLabel === scenario.expectedSpentLabel;
    const descriptionMatch = result.spentDescription === scenario.expectedDescription;

    if (spentLabelMatch && descriptionMatch) {
      console.log('  ✅ PASS');
      console.log(`     Spent Label: "${result.spentLabel}"`);
      console.log(`     Description: "${result.spentDescription}"`);
      passedTests++;
    } else {
      console.log('  ❌ FAIL');
      console.log(`     Expected Spent Label: "${scenario.expectedSpentLabel}"`);
      console.log(`     Actual Spent Label: "${result.spentLabel}"`);
      console.log(`     Expected Description: "${scenario.expectedDescription}"`);
      console.log(`     Actual Description: "${result.spentDescription}"`);
      failedTests++;
    }

    console.log(`     User Type: ${scenario.userType}, Has Store: ${scenario.hasStore}`);
  });

  console.log('\n==========================================');
  console.log(`📊 Test Results: ${passedTests} passed, ${failedTests} failed`);

  if (failedTests === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check implementation.');
  }
};

/**
 * Get expected values for testing in components
 */
export const getExpectedMetricsForUserType = (
  userType: string | undefined,
  hasStore?: boolean
): TestUserScenario => {
  // Find matching scenario or default
  const matchingScenario = dashboardMetricTestScenarios.find(
    scenario =>
      scenario.userType === userType &&
      scenario.hasStore === hasStore
  );

  if (matchingScenario) {
    return matchingScenario;
  }

  // Fallback logic
  if (userType === 'store_owner' || hasStore) {
    return dashboardMetricTestScenarios.find(s => s.name === 'Store Owner User')!;
  }

  return dashboardMetricTestScenarios.find(s => s.name === 'Customer User')!;
};

/**
 * Test a specific user type scenario
 */
export const testSpecificUserType = (
  userType: string | undefined,
  hasStore?: boolean
): void => {
  console.log(`🔍 Testing specific user type: ${userType}, hasStore: ${hasStore}`);

  const result = getDashboardMetricLabels(userType, hasStore);
  const expected = getExpectedMetricsForUserType(userType, hasStore);

  console.log('Results:', {
    userType,
    hasStore,
    result,
    expected: {
      spentLabel: expected.expectedSpentLabel,
      description: expected.expectedDescription
    },
    matches: {
      spentLabel: result.spentLabel === expected.expectedSpentLabel,
      description: result.spentDescription === expected.expectedDescription
    }
  });
};

/**
 * Mock user data for testing
 */
export const mockUserData = {
  customer: {
    userId: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    userType: 'customer',
    hasStore: false
  },
  storeOwner: {
    userId: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    userType: 'store_owner',
    hasStore: true
  },
  admin: {
    userId: 3,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    userType: 'admin',
    hasStore: false
  }
};

/**
 * Console commands for manual testing
 * Run these in browser console to test the functionality
 */
export const consoleTestCommands = {
  runAllTests: 'testDashboardMetricLabels()',
  testCustomer: 'testSpecificUserType("customer", false)',
  testStoreOwner: 'testSpecificUserType("store_owner", true)',
  testAdmin: 'testSpecificUserType("admin", false)',
  testCustomerWithStore: 'testSpecificUserType("customer", true)',
};

// Export test functions to window for console access (development only)
if (process.env.NODE_ENV === 'development') {
  (window as any).testDashboardMetricLabels = testDashboardMetricLabels;
  (window as any).testSpecificUserType = testSpecificUserType;
  (window as any).getExpectedMetricsForUserType = getExpectedMetricsForUserType;
}
