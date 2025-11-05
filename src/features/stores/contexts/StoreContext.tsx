/**
 * Store Context - Global state management for stores feature
 * Follows established patterns from AuthContext and other features
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import type {
  Store,
  StoreAddress,
  StoreCategory,
  StoreImage,
} from '../../../shared/types/store';
import type { StoreError } from '../hooks/useStoreErrorHandler';

// Store state types
export interface StoreState {
  // User's stores
  stores: Store[];
  selectedStore: Store | null;

  // Store creation state
  isCreatingStore: boolean;
  storeCreationError: StoreError | null;

  // Store management state
  isUpdatingStore: boolean;
  storeUpdateError: StoreError | null;

  // Store data
  storeAddresses: Map<number, StoreAddress[]>; // storeId -> addresses
  storeCategories: Map<number, StoreCategory[]>; // storeId -> categories
  storeImages: Map<number, StoreImage[]>; // storeId -> images

  // Loading states
  isLoadingStores: boolean;
  isLoadingStoreDetails: Set<number>; // storeIds being loaded

  // Error states
  storesError: StoreError | null;
  storeDetailsError: Map<number, StoreError>; // storeId -> error
}

// Store actions
export type StoreAction =
  | { type: 'SET_STORES'; payload: Store[] }
  | { type: 'SET_SELECTED_STORE'; payload: Store | null }
  | { type: 'ADD_STORE'; payload: Store }
  | { type: 'UPDATE_STORE'; payload: Store }
  | { type: 'DELETE_STORE'; payload: number }
  | {
      type: 'SET_STORE_ADDRESSES';
      payload: { storeId: number; addresses: StoreAddress[] };
    }
  | {
      type: 'SET_STORE_CATEGORIES';
      payload: { storeId: number; categories: StoreCategory[] };
    }
  | {
      type: 'SET_STORE_IMAGES';
      payload: { storeId: number; images: StoreImage[] };
    }
  | { type: 'SET_LOADING_STORES'; payload: boolean }
  | {
      type: 'SET_LOADING_STORE_DETAILS';
      payload: { storeId: number; loading: boolean };
    }
  | { type: 'SET_STORES_ERROR'; payload: StoreError | null }
  | {
      type: 'SET_STORE_DETAILS_ERROR';
      payload: { storeId: number; error: StoreError | null };
    }
  | { type: 'SET_CREATING_STORE'; payload: boolean }
  | { type: 'SET_STORE_CREATION_ERROR'; payload: StoreError | null }
  | { type: 'SET_UPDATING_STORE'; payload: boolean }
  | { type: 'SET_STORE_UPDATE_ERROR'; payload: StoreError | null }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: StoreState = {
  stores: [],
  selectedStore: null,
  isCreatingStore: false,
  storeCreationError: null,
  isUpdatingStore: false,
  storeUpdateError: null,
  storeAddresses: new Map(),
  storeCategories: new Map(),
  storeImages: new Map(),
  isLoadingStores: false,
  isLoadingStoreDetails: new Set(),
  storesError: null,
  storeDetailsError: new Map(),
};

// Store context
const StoreContext = createContext<{
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
  actions: StoreActions;
} | null>(null);

// Reducer function
function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'SET_STORES':
      return {
        ...state,
        stores: action.payload,
        storesError: null,
      };

    case 'SET_SELECTED_STORE':
      return {
        ...state,
        selectedStore: action.payload,
      };

    case 'ADD_STORE':
      return {
        ...state,
        stores: [...state.stores, action.payload],
        storeCreationError: null,
      };

    case 'UPDATE_STORE':
      return {
        ...state,
        stores: state.stores.map((store) =>
          store.storeId === action.payload.storeId ? action.payload : store
        ),
        selectedStore:
          state.selectedStore?.storeId === action.payload.storeId
            ? action.payload
            : state.selectedStore,
        storeUpdateError: null,
      };

    case 'DELETE_STORE':
      return {
        ...state,
        stores: state.stores.filter(
          (store) => store.storeId !== action.payload
        ),
        selectedStore:
          state.selectedStore?.storeId === action.payload
            ? null
            : state.selectedStore,
        storeAddresses: new Map(
          [...state.storeAddresses].filter(
            ([storeId]) => storeId !== action.payload
          )
        ),
        storeCategories: new Map(
          [...state.storeCategories].filter(
            ([storeId]) => storeId !== action.payload
          )
        ),
        storeImages: new Map(
          [...state.storeImages].filter(
            ([storeId]) => storeId !== action.payload
          )
        ),
      };

    case 'SET_STORE_ADDRESSES':
      return {
        ...state,
        storeAddresses: new Map(state.storeAddresses).set(
          action.payload.storeId,
          action.payload.addresses
        ),
      };

    case 'SET_STORE_CATEGORIES':
      return {
        ...state,
        storeCategories: new Map(state.storeCategories).set(
          action.payload.storeId,
          action.payload.categories
        ),
      };

    case 'SET_STORE_IMAGES':
      return {
        ...state,
        storeImages: new Map(state.storeImages).set(
          action.payload.storeId,
          action.payload.images
        ),
      };

    case 'SET_LOADING_STORES':
      return {
        ...state,
        isLoadingStores: action.payload,
        storesError: action.payload ? null : state.storesError,
      };

    case 'SET_LOADING_STORE_DETAILS':
      const newLoadingStoreDetails = new Set(state.isLoadingStoreDetails);
      if (action.payload.loading) {
        newLoadingStoreDetails.add(action.payload.storeId);
      } else {
        newLoadingStoreDetails.delete(action.payload.storeId);
      }
      return {
        ...state,
        isLoadingStoreDetails: newLoadingStoreDetails,
      };

    case 'SET_STORES_ERROR':
      return {
        ...state,
        storesError: action.payload,
        isLoadingStores: false,
      };

    case 'SET_STORE_DETAILS_ERROR':
      const newStoreDetailsError = new Map(state.storeDetailsError);
      if (action.payload.error) {
        newStoreDetailsError.set(action.payload.storeId, action.payload.error);
      } else {
        newStoreDetailsError.delete(action.payload.storeId);
      }
      return {
        ...state,
        storeDetailsError: newStoreDetailsError,
      };

    case 'SET_CREATING_STORE':
      return {
        ...state,
        isCreatingStore: action.payload,
        storeCreationError: action.payload ? null : state.storeCreationError,
      };

    case 'SET_STORE_CREATION_ERROR':
      return {
        ...state,
        storeCreationError: action.payload,
        isCreatingStore: false,
      };

    case 'SET_UPDATING_STORE':
      return {
        ...state,
        isUpdatingStore: action.payload,
        storeUpdateError: action.payload ? null : state.storeUpdateError,
      };

    case 'SET_STORE_UPDATE_ERROR':
      return {
        ...state,
        storeUpdateError: action.payload,
        isUpdatingStore: false,
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        storesError: null,
        storeCreationError: null,
        storeUpdateError: null,
        storeDetailsError: new Map(),
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Action creators
export interface StoreActions {
  setStores: (stores: Store[]) => void;
  setSelectedStore: (store: Store | null) => void;
  addStore: (store: Store) => void;
  updateStore: (store: Store) => void;
  deleteStore: (storeId: number) => void;
  setStoreAddresses: (storeId: number, addresses: StoreAddress[]) => void;
  setStoreCategories: (storeId: number, categories: StoreCategory[]) => void;
  setStoreImages: (storeId: number, images: StoreImage[]) => void;
  setLoadingStores: (loading: boolean) => void;
  setLoadingStoreDetails: (storeId: number, loading: boolean) => void;
  setStoresError: (error: StoreError | null) => void;
  setStoreDetailsError: (storeId: number, error: StoreError | null) => void;
  setCreatingStore: (creating: boolean) => void;
  setStoreCreationError: (error: StoreError | null) => void;
  setUpdatingStore: (updating: boolean) => void;
  setStoreUpdateError: (error: StoreError | null) => void;
  clearErrors: () => void;
  resetState: () => void;
}

// Store provider props
interface StoreProviderProps {
  children: ReactNode;
}

// Store provider component
export function StoreProvider({ children }: StoreProviderProps) {
  const [state, dispatch] = useReducer(storeReducer, initialState);
  const { user } = useAuth();

  // Action creators
  const actions: StoreActions = {
    setStores: useCallback((stores: Store[]) => {
      dispatch({ type: 'SET_STORES', payload: stores });
    }, []),

    setSelectedStore: useCallback((store: Store | null) => {
      dispatch({ type: 'SET_SELECTED_STORE', payload: store });
    }, []),

    addStore: useCallback((store: Store) => {
      dispatch({ type: 'ADD_STORE', payload: store });
    }, []),

    updateStore: useCallback((store: Store) => {
      dispatch({ type: 'UPDATE_STORE', payload: store });
    }, []),

    deleteStore: useCallback((storeId: number) => {
      dispatch({ type: 'DELETE_STORE', payload: storeId });
    }, []),

    setStoreAddresses: useCallback(
      (storeId: number, addresses: StoreAddress[]) => {
        dispatch({
          type: 'SET_STORE_ADDRESSES',
          payload: { storeId, addresses },
        });
      },
      []
    ),

    setStoreCategories: useCallback(
      (storeId: number, categories: StoreCategory[]) => {
        dispatch({
          type: 'SET_STORE_CATEGORIES',
          payload: { storeId, categories },
        });
      },
      []
    ),

    setStoreImages: useCallback((storeId: number, images: StoreImage[]) => {
      dispatch({ type: 'SET_STORE_IMAGES', payload: { storeId, images } });
    }, []),

    setLoadingStores: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING_STORES', payload: loading });
    }, []),

    setLoadingStoreDetails: useCallback((storeId: number, loading: boolean) => {
      dispatch({
        type: 'SET_LOADING_STORE_DETAILS',
        payload: { storeId, loading },
      });
    }, []),

    setStoresError: useCallback((error: StoreError | null) => {
      dispatch({ type: 'SET_STORES_ERROR', payload: error });
    }, []),

    setStoreDetailsError: useCallback(
      (storeId: number, error: StoreError | null) => {
        dispatch({
          type: 'SET_STORE_DETAILS_ERROR',
          payload: { storeId, error },
        });
      },
      []
    ),

    setCreatingStore: useCallback((creating: boolean) => {
      dispatch({ type: 'SET_CREATING_STORE', payload: creating });
    }, []),

    setStoreCreationError: useCallback((error: StoreError | null) => {
      dispatch({ type: 'SET_STORE_CREATION_ERROR', payload: error });
    }, []),

    setUpdatingStore: useCallback((updating: boolean) => {
      dispatch({ type: 'SET_UPDATING_STORE', payload: updating });
    }, []),

    setStoreUpdateError: useCallback((error: StoreError | null) => {
      dispatch({ type: 'SET_STORE_UPDATE_ERROR', payload: error });
    }, []),

    clearErrors: useCallback(() => {
      dispatch({ type: 'CLEAR_ERRORS' });
    }, []),

    resetState: useCallback(() => {
      dispatch({ type: 'RESET_STATE' });
    }, []),
  };

  // Reset state when user changes
  React.useEffect(() => {
    if (!user?.userId) {
      actions.resetState();
    }
  }, [user?.userId, actions]);

  const contextValue = React.useMemo(
    () => ({
      state,
      dispatch,
      actions,
    }),
    [state, actions]
  );

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
}

// Hook to use store context
export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

// Hook to get store by ID
export function useStoreById(storeId: number) {
  const { state } = useStore();

  const store = state.stores.find((s) => s.storeId === storeId) || null;
  const addresses = state.storeAddresses.get(storeId) || [];
  const categories = state.storeCategories.get(storeId) || [];
  const images = state.storeImages.get(storeId) || [];
  const isLoading = state.isLoadingStoreDetails.has(storeId);
  const error = state.storeDetailsError.get(storeId) || null;

  return {
    store,
    addresses,
    categories,
    images,
    isLoading,
    error,
  };
}

// Hook to get user's stores
export function useUserStores() {
  const { state } = useStore();

  return {
    stores: state.stores,
    isLoading: state.isLoadingStores,
    error: state.storesError,
  };
}

export default StoreContext;
