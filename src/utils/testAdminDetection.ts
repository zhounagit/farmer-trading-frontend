// Test utility to verify admin detection works with various userType formats
import { isAdminUser, checkUserType, normalizeUserType } from './userTypeUtils';

export interface TestCase {
  userType: string | undefined;
  expected: boolean;
  description: string;
}

export const adminDetectionTestCases: TestCase[] = [
  { userType: 'Admin', expected: true, description: 'Capitalized Admin' },
  { userType: 'admin', expected: true, description: 'Lowercase admin' },
  { userType: 'ADMIN', expected: true, description: 'Uppercase ADMIN' },
  { userType: 'administrator', expected: true, description: 'Administrator' },
  {
    userType: 'Administrator',
    expected: true,
    description: 'Capitalized Administrator',
  },
  { userType: 'superuser', expected: true, description: 'Superuser' },
  {
    userType: 'super_user',
    expected: true,
    description: 'Super user with underscore',
  },
  { userType: 'customer', expected: false, description: 'Customer' },
  {
    userType: 'Customer',
    expected: false,
    description: 'Capitalized Customer',
  },
  { userType: 'store_owner', expected: false, description: 'Store owner' },
  {
    userType: 'Store_Owner',
    expected: false,
    description: 'Capitalized Store owner',
  },
  { userType: undefined, expected: false, description: 'Undefined userType' },
  { userType: '', expected: false, description: 'Empty string' },
  { userType: 'random_role', expected: false, description: 'Random role' },
];

export const runAdminDetectionTests = (): {
  passed: number;
  failed: number;
  results: any[];
} => {
  const results = [];
  let passed = 0;
  let failed = 0;

  console.log('🧪 Running Admin Detection Tests...\n');

  for (const testCase of adminDetectionTestCases) {
    const result = isAdminUser(testCase.userType);
    const success = result === testCase.expected;

    if (success) {
      passed++;
      console.log(`✅ ${testCase.description}: PASSED`);
    } else {
      failed++;
      console.log(`❌ ${testCase.description}: FAILED`);
      console.log(`   Expected: ${testCase.expected}, Got: ${result}`);
    }

    results.push({
      description: testCase.description,
      userType: testCase.userType,
      expected: testCase.expected,
      actual: result,
      passed: success,
    });
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

  // Additional detailed tests
  console.log('🔍 Detailed Type Analysis:');

  const detailedTests = [
    'Admin',
    'admin',
    'customer',
    'Customer',
    'store_owner',
  ];
  for (const userType of detailedTests) {
    const normalized = normalizeUserType(userType);
    const typeCheck = checkUserType(userType);
    const isAdmin = isAdminUser(userType);

    console.log(`\n${userType}:`);
    console.log(`  Normalized: ${normalized}`);
    console.log(`  IsAdmin: ${typeCheck.isAdmin}`);
    console.log(`  IsCustomer: ${typeCheck.isCustomer}`);
    console.log(`  IsStoreOwner: ${typeCheck.isStoreOwner}`);
    console.log(`  Direct isAdminUser: ${isAdmin}`);
  }

  return { passed, failed, results };
};

// Test specific scenarios that might occur in the app
export const testUserMenuVisibility = (
  userType: string | undefined
): {
  showMyStores: boolean;
  showAdminDashboard: boolean;
  showOpenYourShop: boolean;
  dashboardPath: string;
} => {
  const isAdmin = isAdminUser(userType);
  const typeCheck = checkUserType(userType);

  return {
    showMyStores: typeCheck.isStoreOwner && !isAdmin,
    showAdminDashboard: isAdmin,
    showOpenYourShop: !isAdmin,
    dashboardPath: isAdmin ? '/admin/dashboard' : '/dashboard',
  };
};

// Test dashboard tab configuration
export const testDashboardTabs = (
  userType: string | undefined,
  hasStore?: boolean
): {
  tabCount: number;
  hasStoreOverview: boolean;
  hasBrandingVisuals: boolean;
  userCategory: string;
} => {
  const isAdmin = isAdminUser(userType);
  const typeCheck = checkUserType(userType, hasStore);

  let tabCount = 4; // Base tabs: Overview, Orders, Referral, Profile
  let hasStoreOverview = false;
  let hasBrandingVisuals = false;
  let userCategory = 'customer';

  if (typeCheck.isStoreOwner && !isAdmin) {
    tabCount = 6; // Add Store Overview and Branding & Visuals
    hasStoreOverview = true;
    hasBrandingVisuals = true;
    userCategory = 'store_owner';
  } else if (isAdmin) {
    tabCount = 4; // Admin gets basic tabs only
    userCategory = 'admin';
  }

  return {
    tabCount,
    hasStoreOverview,
    hasBrandingVisuals,
    userCategory,
  };
};

// Quick test runner for browser console
export const quickTest = () => {
  console.clear();
  console.log('🚀 Quick Admin Detection Test');
  console.log('=============================');

  // Test the problematic case
  const testUserType = 'Admin';
  console.log(`\nTesting userType: "${testUserType}"`);
  console.log(`isAdminUser result: ${isAdminUser(testUserType)}`);

  // Test menu visibility
  const menuTest = testUserMenuVisibility(testUserType);
  console.log('\nMenu Visibility:');
  console.log(`  Show My Stores: ${menuTest.showMyStores}`);
  console.log(`  Show Admin Dashboard: ${menuTest.showAdminDashboard}`);
  console.log(`  Show Open Your Shop: ${menuTest.showOpenYourShop}`);
  console.log(`  Dashboard Path: ${menuTest.dashboardPath}`);

  // Test dashboard tabs
  const tabTest = testDashboardTabs(testUserType);
  console.log('\nDashboard Tabs:');
  console.log(`  Tab Count: ${tabTest.tabCount}`);
  console.log(`  Has Store Overview: ${tabTest.hasStoreOverview}`);
  console.log(`  Has Branding & Visuals: ${tabTest.hasBrandingVisuals}`);
  console.log(`  User Category: ${tabTest.userCategory}`);

  return {
    isAdmin: isAdminUser(testUserType),
    menuVisibility: menuTest,
    dashboardConfig: tabTest,
  };
};

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testAdminDetection = quickTest;
  (window as any).runAdminDetectionTests = runAdminDetectionTests;
}
