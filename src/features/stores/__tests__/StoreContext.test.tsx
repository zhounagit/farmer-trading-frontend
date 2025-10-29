import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StoreProvider, useStore, useUserStores, useStoreById } from '../contexts/StoreContext';
import { AuthProvider } from '../../../contexts/AuthContext';

// Mock child component to test hooks
const TestComponent = () => {
  const { state, actions } = useStore();
  const userStores = useUserStores();
  const storeById = useStoreById(1);

  return (
    <div>
      <div data-testid="stores-count">{state.stores.length}</div>
      <div data-testid="user-stores-count">{userStores.stores.length}</div>
      <div data-testid="store-by-id">{storeById.store ? 'found' : 'not-found'}</div>
      <div data-testid="loading-stores">{state.isLoadingStores.toString()}</div>
      <button onClick={() => actions.setStores([{ storeId: 1, storeName: 'Test Store' } as any])}>
        Add Store
      </button>
    </div>
  );
};

// Mock AuthProvider for testing
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
);

describe('StoreContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide initial state', () => {
    render(
      <MockAuthProvider>
        <StoreProvider>
          <TestComponent />
        </StoreProvider>
      </MockAuthProvider>
    );

    expect(screen.getByTestId('stores-count')).toHaveTextContent('0');
    expect(screen.getByTestId('user-stores-count')).toHaveTextContent('0');
    expect(screen.getByTestId('store-by-id')).toHaveTextContent('not-found');
    expect(screen.getByTestId('loading-stores')).toHaveTextContent('false');
  });

  it('should update state when actions are called', async () => {
    render(
      <MockAuthProvider>
        <StoreProvider>
          <TestComponent />
        </StoreProvider>
      </MockAuthProvider>
    );

    const addButton = screen.getByText('Add Store');
    addButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('stores-count')).toHaveTextContent('1');
      expect(screen.getByTestId('user-stores-count')).toHaveTextContent('1');
    });
  });

  it('should throw error when useStore is used outside provider', () => {
    // Suppress console error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useStore must be used within a StoreProvider');

    consoleError.mockRestore();
  });

  it('should handle useStoreById hook correctly', () => {
    render(
      <MockAuthProvider>
        <StoreProvider>
          <TestComponent />
        </StoreProvider>
      </MockAuthProvider>
    );

    // Initially no store with ID 1
    expect(screen.getByTestId('store-by-id')).toHaveTextContent('not-found');
  });
});
