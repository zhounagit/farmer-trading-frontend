export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  accessToken: string;
  refreshToken?: string;
  expires: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: string;
  phone?: string;
  referralCode?: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
  email: string;
  accessToken: string;
  expires: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: string;
  phone?: string;
  referralCode?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}
