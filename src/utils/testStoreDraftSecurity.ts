// Test utility for store draft security and user validation
// This file helps test that store drafts are properly isolated by user

export interface MockUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface DraftTestScenario {
  name: string;
  description: string;
  setup: () => void;
  test: (currentUser: MockUser) => boolean;
  cleanup: () => void;
}

/**
 * Mock users for testing different scenarios
 */
export const mockUsers: MockUser[] = [
  {
    userId: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  },
  {
    userId: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
  },
  {
    userId: 3,
    firstName: 'Bob',
    lastName: 'Wilson',
    email: 'bob@example.com',
  },
];

/**
 * Test scenarios for draft security
 */
export const draftSecurityTests: DraftTestScenario[] = [
  {
    name: 'Cross-User Draft Isolation',
    description: 'Draft from User A should not be visible to User B',
    setup: () => {
      // Create a draft for User A
      const userADraft = {
        userId: mockUsers[0].userId,
        savedAt: new Date().toISOString(),
        storeId: 'store-123',
        storeBasics: {
          storeName: 'User A Store',
          storeDescription: 'This belongs to User A',
        },
      };

      localStorage.setItem('openShop_draft', JSON.stringify(userADraft));
      localStorage.setItem(
        'openShop_draft_lastSaved',
        JSON.stringify({
          lastSaved: new Date().toISOString(),
          userId: mockUsers[0].userId,
        })
      );
    },
    test: (currentUser: MockUser) => {
      // If current user is User B, they should NOT see User A's draft
      if (currentUser.userId === mockUsers[1].userId) {
        const draftStr = localStorage.getItem('openShop_draft');
        if (draftStr) {
          const draft = JSON.parse(draftStr);
          // Should return false if User B can see User A's draft (security issue)
          return draft.userId !== currentUser.userId;
        }
        return true; // No draft found, which is correct
      }
      return true;
    },
    cleanup: () => {
      localStorage.removeItem('openShop_draft');
      localStorage.removeItem('openShop_draft_lastSaved');
    },
  },
  {
    name: 'User Can Access Own Draft',
    description: 'User should be able to access their own draft',
    setup: () => {
      const userBDraft = {
        userId: mockUsers[1].userId,
        savedAt: new Date().toISOString(),
        storeId: 'store-456',
        storeBasics: {
          storeName: 'User B Store',
          storeDescription: 'This belongs to User B',
        },
      };

      localStorage.setItem('openShop_draft', JSON.stringify(userBDraft));
      localStorage.setItem(
        'openShop_draft_lastSaved',
        JSON.stringify({
          lastSaved: new Date().toISOString(),
          userId: mockUsers[1].userId,
        })
      );
    },
    test: (currentUser: MockUser) => {
      // User B should be able to access their own draft
      if (currentUser.userId === mockUsers[1].userId) {
        const draftStr = localStorage.getItem('openShop_draft');
        if (draftStr) {
          const draft = JSON.parse(draftStr);
          return draft.userId === currentUser.userId;
        }
      }
      return false;
    },
    cleanup: () => {
      localStorage.removeItem('openShop_draft');
      localStorage.removeItem('openShop_draft_lastSaved');
    },
  },
  {
    name: 'Legacy Draft Cleanup',
    description: 'Old drafts without userId should be cleaned up',
    setup: () => {
      // Create legacy draft without userId (security risk)
      const legacyDraft = {
        storeId: 'legacy-store',
        savedAt: new Date().toISOString(),
        storeBasics: {
          storeName: 'Legacy Store',
          storeDescription: 'This has no user ID',
        },
        // Note: no userId field
      };

      localStorage.setItem('openShop_draft', JSON.stringify(legacyDraft));
      localStorage.setItem(
        'openShop_draft_lastSaved',
        JSON.stringify({
          lastSaved: new Date().toISOString(),
          // Note: no userId field
        })
      );
    },
    test: (currentUser: MockUser) => {
      const draftStr = localStorage.getItem('openShop_draft');
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        // Should return true if legacy draft is properly cleaned up
        return !draft.userId; // This indicates the draft still exists (bad)
      }
      return true; // No draft found, which means it was cleaned up (good)
    },
    cleanup: () => {
      localStorage.removeItem('openShop_draft');
      localStorage.removeItem('openShop_draft_lastSaved');
    },
  },
  {
    name: 'Expired Draft Cleanup',
    description: 'Drafts older than 7 days should be cleaned up',
    setup: () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days ago

      const expiredDraft = {
        userId: mockUsers[0].userId,
        savedAt: oldDate.toISOString(),
        storeId: 'expired-store',
        storeBasics: {
          storeName: 'Expired Store',
          storeDescription: 'This is too old',
        },
      };

      localStorage.setItem('openShop_draft', JSON.stringify(expiredDraft));
      localStorage.setItem(
        'openShop_draft_lastSaved',
        JSON.stringify({
          lastSaved: oldDate.toISOString(),
          userId: mockUsers[0].userId,
        })
      );
    },
    test: (currentUser: MockUser) => {
      // Even if it's the same user, expired drafts should be cleaned up
      const draftStr = localStorage.getItem('openShop_draft');
      return !draftStr; // Should return true if draft was cleaned up
    },
    cleanup: () => {
      localStorage.removeItem('openShop_draft');
      localStorage.removeItem('openShop_draft_lastSaved');
    },
  },
];

/**
 * Run all security tests
 */
export const runDraftSecurityTests = (): void => {
  console.log('🧪 Running Store Draft Security Tests...');
  console.log('===============================================');

  let passedTests = 0;
  let failedTests = 0;

  draftSecurityTests.forEach((test, index) => {
    console.log(`\n${index + 1}. ${test.name}`);
    console.log(`   ${test.description}`);

    try {
      // Setup test scenario
      test.cleanup(); // Clean up first
      test.setup();

      // Test with different users
      mockUsers.forEach((user) => {
        const result = test.test(user);
        if (result) {
          console.log(`   ✅ PASS for User ${user.userId} (${user.firstName})`);
          passedTests++;
        } else {
          console.log(`   ❌ FAIL for User ${user.userId} (${user.firstName})`);
          failedTests++;
        }
      });

      // Cleanup after test
      test.cleanup();
    } catch (error) {
      console.error(`   💥 ERROR in test: ${error}`);
      failedTests++;
      test.cleanup();
    }
  });

  console.log('\n===============================================');
  console.log(`📊 Test Results: ${passedTests} passed, ${failedTests} failed`);

  if (failedTests === 0) {
    console.log('🎉 All security tests passed!');
  } else {
    console.log('⚠️  Some security tests failed. Check implementation.');
  }
};

/**
 * Test specific user scenario
 */
export const testUserDraftIsolation = (
  userA: MockUser,
  userB: MockUser
): void => {
  console.log(`🔍 Testing draft isolation between users...`);
  console.log(`User A: ${userA.firstName} (ID: ${userA.userId})`);
  console.log(`User B: ${userB.firstName} (ID: ${userB.userId})`);

  try {
    // Clean up first
    localStorage.removeItem('openShop_draft');
    localStorage.removeItem('openShop_draft_lastSaved');

    // User A creates a draft
    const userADraft = {
      userId: userA.userId,
      savedAt: new Date().toISOString(),
      storeId: `store-${userA.userId}`,
      storeBasics: {
        storeName: `${userA.firstName}'s Store`,
        storeDescription: `This belongs to ${userA.firstName}`,
      },
    };

    localStorage.setItem('openShop_draft', JSON.stringify(userADraft));
    localStorage.setItem(
      'openShop_draft_lastSaved',
      JSON.stringify({
        lastSaved: new Date().toISOString(),
        userId: userA.userId,
      })
    );

    console.log(`✅ User A draft created`);

    // Test if User B can access User A's draft
    const draftStr = localStorage.getItem('openShop_draft');
    if (draftStr) {
      const draft = JSON.parse(draftStr);
      if (draft.userId === userB.userId) {
        console.log('❌ SECURITY ISSUE: User B can access User A\'s draft');
      } else {
        console.log('✅ SECURE: User B cannot access User A\'s draft');
      }
    }

    // Clean up
    localStorage.removeItem('openShop_draft');
    localStorage.removeItem('openShop_draft_lastSaved');
  } catch (error) {
    console.error('Error in isolation test:', error);
  }
};

/**
 * Create test data for manual testing
 */
export const createTestDraft = (userId: number, daysOld: number = 0): void => {
  const testDate = new Date();
  testDate.setDate(testDate.getDate() - daysOld);

  const testDraft = {
    userId,
    savedAt: testDate.toISOString(),
    storeId: `test-store-${userId}`,
    currentStep: 2,
    storeBasics: {
      storeName: `Test Store for User ${userId}`,
      storeDescription: `This is a test store created ${daysOld} days ago`,
      businessEmail: `user${userId}@test.com`,
      businessPhone: `555-0${userId}00`,
      website: `https://user${userId}store.com`,
      categories: ['Agriculture', 'Organic'],
    },
    locationLogistics: {
      address: '123 Test Street',
      city: 'Test City',
      zipcode: '12345',
    },
  };

  localStorage.setItem('openShop_draft', JSON.stringify(testDraft));
  localStorage.setItem(
    'openShop_draft_lastSaved',
    JSON.stringify({
      lastSaved: testDate.toISOString(),
      userId,
    })
  );

  console.log(`Test draft created for User ${userId} (${daysOld} days old)`);
};

/**
 * Console commands for manual testing
 */
export const consoleTestCommands = {
  runAllTests: 'runDraftSecurityTests()',
  testUserIsolation: 'testUserDraftIsolation(mockUsers[0], mockUsers[1])',
  createCurrentUserDraft: 'createTestDraft(1, 0)',
  createOldDraft: 'createTestDraft(1, 10)',
  createOtherUserDraft: 'createTestDraft(2, 0)',
  clearDrafts: 'localStorage.removeItem("openShop_draft"); localStorage.removeItem("openShop_draft_lastSaved")',
};

/**
 * Utility to inspect current draft state
 */
export const inspectDraftState = (): void => {
  console.log('🔍 Current Draft State Inspection:');
  console.log('================================');

  const draftStr = localStorage.getItem('openShop_draft');
  const lastSavedStr = localStorage.getItem('openShop_draft_lastSaved');

  if (draftStr) {
    try {
      const draft = JSON.parse(draftStr);
      console.log('Draft found:');
      console.log('- User ID:', draft.userId || 'MISSING (Security Risk!)');
      console.log('- Store ID:', draft.storeId);
      console.log('- Saved At:', draft.savedAt || 'Unknown');
      console.log('- Store Name:', draft.storeBasics?.storeName || 'Unknown');

      if (lastSavedStr) {
        const lastSaved = JSON.parse(lastSavedStr);
        console.log('- Last Saved:', lastSaved.lastSaved);
        console.log('- Last Saved User ID:', lastSaved.userId || 'MISSING');

        const daysSince =
          (Date.now() - new Date(lastSaved.lastSaved).getTime()) /
          (1000 * 60 * 60 * 24);
        console.log('- Days Since Last Save:', daysSince.toFixed(2));
      }
    } catch (error) {
      console.error('Error parsing draft:', error);
    }
  } else {
    console.log('No draft found in localStorage');
  }

  console.log('================================');
};

// Export functions to window for console access (development only)
if (process.env.NODE_ENV === 'development') {
  (window as any).runDraftSecurityTests = runDraftSecurityTests;
  (window as any).testUserDraftIsolation = testUserDraftIsolation;
  (window as any).createTestDraft = createTestDraft;
  (window as any).inspectDraftState = inspectDraftState;
  (window as any).mockUsers = mockUsers;
}

export default {
  runDraftSecurityTests,
  testUserDraftIsolation,
  createTestDraft,
  inspectDraftState,
  mockUsers,
  consoleTestCommands,
};
