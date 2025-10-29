// Core API Response Types
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  code: string;
  status?: number;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Common Request Types
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, unknown>;
}

// File Upload Types
export interface FileUploadRequest {
  file: File;
  fileName?: string;
  description?: string;
}

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface ImageUploadResponse extends FileUploadResponse {
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}

// Common Entity Base Types
export interface BaseEntity {
  id: string | number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | number;
  updatedBy?: string | number;
}

// Status Types
export type ApprovalStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'suspended';
export type ActiveStatus = 'active' | 'inactive' | 'archived';

// Address Types
export interface Address {
  id?: number;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

// Contact Information
export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
}

// Business Hours
export interface BusinessHours {
  dayOfWeek: number; // 0-6, Sunday to Saturday
  openTime?: string; // HH:MM format
  closeTime?: string; // HH:MM format
  isClosed: boolean;
  isAllDay?: boolean;
}

// Image/Media Types
export interface MediaItem {
  id: number;
  url: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Common Query Options
export interface QueryOptions {
  include?: string[]; // Relations to include
  fields?: string[]; // Specific fields to return
  cache?: boolean;
  timeout?: number;
}

// Validation Error Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ValidationErrorResponse {
  message: string;
  errors: ValidationError[];
}

// API Configuration Types
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// Request Context (for logging/debugging)
export interface RequestContext {
  requestId: string;
  userId?: string | number;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  timestamp: string;
}

// Health Check Response
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version?: string;
  uptime?: number;
  dependencies?: {
    [serviceName: string]: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
  };
}
