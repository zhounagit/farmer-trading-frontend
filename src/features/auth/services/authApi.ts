import { apiClient } from '../../../shared/services/apiClient';
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  PasswordResetResponse,
  EmailVerificationRequest,
  PhoneVerificationRequest,
  ResendVerificationRequest,
  UpdateProfileRequest,
  UpdatePreferencesRequest,
  ProfilePictureUploadResponse,
  Session,
  TwoFactorSetupRequest,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  TwoFactorLoginRequest,
  DeactivateAccountRequest,
  DeleteAccountRequest,
} from '../../../shared/types/auth';
import type { ApiResponse } from '../../../shared/types/api';

export class AuthApiService {
  private static readonly BASE_PATH = '/auth';
  private static readonly USERS_PATH = '/api/users';

  // Authentication
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      `${this.BASE_PATH}/login`,
      credentials
    );
    return response;
  }

  static async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
      `${this.BASE_PATH}/register`,
      userData
    );
    return response;
  }

  static async logout(data?: LogoutRequest): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      `${this.BASE_PATH}/logout`,
      data
    );
    return response;
  }

  static async refreshToken(
    data: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(
      `${this.BASE_PATH}/refresh`,
      data
    );
    return response;
  }

  // Password Management
  static async changePassword(
    data: ChangePasswordRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      `${this.BASE_PATH}/change-password`,
      data
    );
    return response;
  }

  static async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      `${this.BASE_PATH}/forgot-password`,
      data
    );
    return response;
  }

  static async resetPassword(
    data: ResetPasswordRequest
  ): Promise<PasswordResetResponse> {
    const response = await apiClient.post<PasswordResetResponse>(
      `${this.BASE_PATH}/reset-password`,
      data
    );
    return response;
  }

  // Email/Phone Verification
  static async verifyEmail(
    data: EmailVerificationRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      `${this.BASE_PATH}/verify-email`,
      data
    );
    return response;
  }

  static async verifyPhone(
    data: PhoneVerificationRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      `${this.BASE_PATH}/verify-phone`,
      data
    );
    return response;
  }

  static async resendVerification(
    data: ResendVerificationRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      `${this.BASE_PATH}/resend-verification`,
      data
    );
    return response;
  }

  // Profile Management
  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(`${this.BASE_PATH}/me`);
    return response;
  }

  static async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<User>(
      `${this.BASE_PATH}/profile`,
      data
    );
    return response;
  }

  static async updatePreferences(
    data: UpdatePreferencesRequest
  ): Promise<User> {
    const response = await apiClient.put<User>(
      `${this.BASE_PATH}/preferences`,
      data
    );
    return response;
  }

  static async uploadProfilePicture(
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<ProfilePictureUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.upload<ProfilePictureUploadResponse>(
      `${this.BASE_PATH}/profile-picture`,
      formData,
      onUploadProgress
    );
    return response;
  }

  static async deleteProfilePicture(): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `${this.BASE_PATH}/profile-picture`
    );
    return response;
  }

  // Session Management
  static async getSessions(): Promise<Session[]> {
    const response = await apiClient.get<Session[]>(
      `${this.BASE_PATH}/sessions`
    );
    return response;
  }

  static async revokeSession(sessionId: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `${this.BASE_PATH}/sessions/${sessionId}`
    );
    return response;
  }

  static async revokeAllSessions(
    excludeCurrent: boolean = true
  ): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `${this.BASE_PATH}/sessions?excludeCurrent=${excludeCurrent}`
    );
    return response;
  }

  // Two-Factor Authentication
  static async setupTwoFactor(
    data: TwoFactorSetupRequest
  ): Promise<TwoFactorSetupResponse> {
    const response = await apiClient.post<TwoFactorSetupResponse>(
      `${this.BASE_PATH}/2fa/setup`,
      data
    );
    return response;
  }

  static async verifyTwoFactorSetup(
    data: TwoFactorVerifyRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      `${this.BASE_PATH}/2fa/verify-setup`,
      data
    );
    return response;
  }

  static async disableTwoFactor(password: string): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      `${this.BASE_PATH}/2fa/disable`,
      { password }
    );
    return response;
  }

  static async loginWithTwoFactor(
    data: TwoFactorLoginRequest
  ): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      `${this.BASE_PATH}/2fa/login`,
      data
    );
    return response;
  }

  static async generateBackupCodes(): Promise<{ backupCodes: string[] }> {
    const response = await apiClient.post<{ backupCodes: string[] }>(
      `${this.BASE_PATH}/2fa/backup-codes`
    );
    return response;
  }

  // Account Management
  static async deactivateAccount(
    data: DeactivateAccountRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      `${this.BASE_PATH}/deactivate`,
      data
    );
    return response;
  }

  static async deleteAccount(data: DeleteAccountRequest): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `${this.BASE_PATH}/account`,
      {
        data,
      }
    );
    return response;
  }

  // User Lookup (for public profiles, etc.)
  static async getUserById(userId: number): Promise<User> {
    const response = await apiClient.get<User>(`${this.USERS_PATH}/${userId}`);
    return response;
  }

  static async getUserByUsername(username: string): Promise<User> {
    const response = await apiClient.get<User>(
      `${this.USERS_PATH}/username/${username}`
    );
    return response;
  }

  // Validation helpers
  static async checkUsernameAvailability(
    username: string
  ): Promise<{ available: boolean }> {
    const response = await apiClient.get<{ available: boolean }>(
      `${this.BASE_PATH}/check-username?username=${encodeURIComponent(username)}`
    );
    return response;
  }

  static async checkEmailAvailability(
    email: string
  ): Promise<{ available: boolean }> {
    const response = await apiClient.get<{ available: boolean }>(
      `${this.BASE_PATH}/check-email?email=${encodeURIComponent(email)}`
    );
    return response;
  }

  // Utility methods
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  static getTokenExpirationDate(token: string): Date | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }

  static getUserFromToken(token: string): Partial<User> | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: parseInt(payload.sub),
        email: payload.email,
        username: payload.username,
        role: payload.role,
      };
    } catch {
      return null;
    }
  }
}

export default AuthApiService;
