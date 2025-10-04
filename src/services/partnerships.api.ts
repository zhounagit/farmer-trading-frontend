import { apiService } from './api';
import { authApi } from '../utils/api';

// Partnership interfaces
export interface Partnership {
  partnershipId: number;
  producerStoreId: number;
  producerStoreName: string;
  processorStoreId: number;
  processorStoreName: string;
  status: 'pending' | 'active' | 'inactive' | 'terminated';
  initiatedByStoreId: number;
  initiatedByStoreName: string;
  partnershipTerms?: string;
  deliveryArrangements?: string;
  producerApprovedAt?: string;
  producerApprovedBy?: number;
  processorApprovedAt?: string;
  processorApprovedBy?: number;
  createdAt: string;
  activatedAt?: string;
  terminatedAt?: string;
  terminatedByStoreId?: number;
  terminationReason?: string;
  isActive: boolean;
  isPending: boolean;
  isTerminated: boolean;
  isMutuallyApproved: boolean;
}

export interface PartnershipTerms {
  services?: string[];
  pricing?: {
    cuttingPrice?: number;
    wrappingPrice?: number;
    smokingPrice?: number;
    customServices?: { name: string; price: number }[];
  };
  minimumOrder?: number;
  leadTime?: string;
  paymentTerms?: string;
  notes?: string;
}

export interface DeliveryArrangements {
  method: 'pickup' | 'delivery' | 'both';
  pickupLocation?: string;
  deliveryRadius?: number;
  deliveryFee?: number;
  schedule?: string;
  notes?: string;
}

export interface PartnershipsResponse {
  partnerships: Partnership[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreatePartnershipRequest {
  producerStoreId: number;
  processorStoreId: number;
  initiatedByStoreId: number;
  partnershipTerms?: string;
  deliveryArrangements?: string;
}

export interface UpdatePartnershipRequest {
  partnershipId: number;
  status?: string;
  partnershipTerms?: string;
  deliveryArrangements?: string;
  terminationReason?: string;
}

export interface SearchPartnersRequest {
  storeId: number;
  radiusMiles?: number;
  partnerType?: 'producer' | 'processor';
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

export interface AddressInfo {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  formattedAddress: string;
}

export interface PotentialPartner {
  storeId: number;
  storeName: string;
  storeType: string;
  description?: string;
  address?: AddressInfo;
  distanceMiles: number;
  canProduce: boolean;
  canProcess: boolean;
  logoUrl?: string;
  partnershipRadiusMi: number;
  autoAcceptPartnerships: boolean;
  existingPartnershipStatus?: string;
  existingPartnershipId?: number;
  canPartnerWith: boolean;
  cannotPartnerReason?: string;
}

export interface GetPartnershipsRequest {
  storeId: number;
  status?: string;
  partnerType?: 'producer' | 'processor';
  page?: number;
  pageSize?: number;
}

class PartnershipsApiService {
  // Get partnership by ID
  async getPartnershipById(id: number): Promise<Partnership> {
    const response = await apiService.get<{
      success: boolean;
      data: Partnership;
      message: string;
    }>(`/api/partnerships/${id}`);
    return response.data;
  }

  // Get partnerships for a specific store
  async getPartnershipsByStoreId(
    request: GetPartnershipsRequest
  ): Promise<PartnershipsResponse> {
    const params = new URLSearchParams();
    if (request.status) params.append('status', request.status);
    if (request.partnerType) params.append('partnerType', request.partnerType);
    if (request.page) params.append('page', request.page.toString());
    if (request.pageSize)
      params.append('pageSize', request.pageSize.toString());

    const response = await apiService.get<{
      success: boolean;
      data: PartnershipsResponse;
      message: string;
    }>(`/api/partnerships/store/${request.storeId}?${params.toString()}`);
    return response.data;
  }

  // Create a new partnership
  async createPartnership(
    request: CreatePartnershipRequest
  ): Promise<Partnership> {
    const response = await apiService.post<{
      success: boolean;
      data: Partnership;
      message: string;
    }>('/api/partnerships', request);
    return response.data;
  }

  // Update partnership
  async updatePartnership(
    request: UpdatePartnershipRequest
  ): Promise<Partnership> {
    const response = await apiService.put<{
      success: boolean;
      data: Partnership;
      message: string;
    }>(`/api/partnerships/${request.partnershipId}`, request);
    return response.data;
  }

  // Approve partnership
  async approvePartnership(
    partnershipId: number,
    approvedByUserId: number
  ): Promise<Partnership> {
    const response = await apiService.post<{
      success: boolean;
      data: Partnership;
      message: string;
    }>(`/api/partnerships/${partnershipId}/approve`, {
      partnershipId,
      approve: true,
      approvedByUserId,
    });
    return response.data;
  }

  // Reject partnership
  async rejectPartnership(
    partnershipId: number,
    storeId: number,
    reason?: string
  ): Promise<void> {
    const response = await apiService.post<{
      success: boolean;
      message: string;
    }>(`/api/partnerships/${partnershipId}/decline`, {
      storeId,
      reason,
    });
  }

  // Terminate partnership
  async terminatePartnership(
    partnershipId: number,
    reason?: string
  ): Promise<Partnership> {
    const response = await apiService.post<{
      success: boolean;
      data: Partnership;
      message: string;
    }>(`/api/partnerships/${partnershipId}/terminate`, { reason });
    return response.data;
  }

  // Search for potential partners
  async searchPotentialPartners(
    request: SearchPartnersRequest
  ): Promise<PotentialPartner[]> {
    const params = new URLSearchParams();
    if (request.radiusMiles)
      params.append('radiusMiles', request.radiusMiles.toString());
    if (request.partnerType) params.append('partnerType', request.partnerType);
    if (request.searchTerm) params.append('searchTerm', request.searchTerm);
    if (request.page) params.append('page', request.page.toString());
    if (request.pageSize)
      params.append('pageSize', request.pageSize.toString());

    // Use the bulletproof authenticated API service for potential partners search

    try {
      const response = await authApi.get(
        `/api/stores/${request.storeId}/potential-partners?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      // Fallback to apiService if authApi fails
      const directResponse = await apiService.get(
        `/api/stores/${request.storeId}/potential-partners?${params.toString()}`
      );
      return directResponse.data;
    }
  }

  // Helper methods to parse JSON fields
  parsePartnershipTerms(termsJson?: string): PartnershipTerms | null {
    if (!termsJson) return null;
    try {
      return JSON.parse(termsJson);
    } catch {
      return null;
    }
  }

  parseDeliveryArrangements(
    arrangementsJson?: string
  ): DeliveryArrangements | null {
    if (!arrangementsJson) return null;
    try {
      return JSON.parse(arrangementsJson);
    } catch {
      return null;
    }
  }

  // Helper to get partnership status display text
  getStatusDisplayText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'terminated':
        return 'Terminated';
      default:
        return status;
    }
  }

  // Helper to get partnership status color
  getStatusColor(status: string): 'success' | 'warning' | 'error' | 'default' {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'terminated':
        return 'error';
      default:
        return 'default';
    }
  }
}

export const partnershipsApi = new PartnershipsApiService();
export default partnershipsApi;
