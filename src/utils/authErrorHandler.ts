import toast from 'react-hot-toast';

export interface AuthError extends Error {
  name: 'AuthenticationError';
}

export const isAuthError = (error: unknown): error is AuthError => {
  return error instanceof Error && error.name === 'AuthenticationError';
};

export const handleAuthError = (error: unknown, navigate?: (path: string) => void) => {
  if (isAuthError(error)) {
    console.warn('Authentication error detected:', error.message);

    // Clear any remaining authentication data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Show user-friendly message
    toast.error('Your session has expired. Please log in again.');

    // Navigate to login if navigate function is provided
    if (navigate) {
      setTimeout(() => {
        navigate('/login');
      }, 1500); // Small delay to allow toast to show
    } else {
      // Fallback to window location if no navigate function
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }

    return true; // Indicates the error was handled
  }

  return false; // Not an auth error, let other handlers deal with it
};

export const createAuthError = (message: string): AuthError => {
  const error = new Error(message) as AuthError;
  error.name = 'AuthenticationError';
  return error;
};

// Hook for React components to handle auth errors
export const useAuthErrorHandler = () => {
  return {
    handleAuthError: (error: unknown, navigate?: (path: string) => void) =>
      handleAuthError(error, navigate),
    isAuthError,
  };
};
