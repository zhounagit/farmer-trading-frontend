import { apiClient } from '@/shared/services/apiClient';
import { apiService } from '@/shared/services/api-service';

// Type guard to check if response is wrapped in ApiResponse
function isApiResponse<T extends { status?: string }>(
  response: T | ApiResponse<T>
): response is ApiResponse<T> {
  return (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    'success' in response
  );
}

// Helper to extract Partnership from either direct or wrapped response
function extractPartnership(
  response: Partnership | ApiResponse<Partnership>
): Partnership {
  if (isApiResponse<Partnership>(response)) {
    const partnership = response.data;
    if (!partnership) {
      throw new Error('Partnership data is null or undefined');
    }
    return partnership;
  }
  return response;
}

// Enhanced Partnership interfaces with comprehensive types
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

export interface ApiResponse<T> {
  data?: T;
  success: boolean;
  message?: string;
  errors?: unknown[];
  meta?: unknown;
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
  includeInactive?: boolean;
  sortBy?: 'distance' | 'name' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface EnhancedPotentialPartner {
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
  rating?: number;
  reviewCount?: number;
  responseTime?: string;
  specialties?: string[];
  certifications?: string[];
  businessHours?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
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
  private logOperation(operation: string, details?: unknown): void {
    console.log(`🤝 PartnershipsAPI: ${operation}`, details || '');
  }

  private logError(operation: string, error: unknown): void {
    console.error(`❌ PartnershipsAPI: Error in ${operation}:`, error);
  }

  // Enhanced partnership management with dual API support
  async getPartnershipById(id: number): Promise<Partnership | null> {
    try {
      this.logOperation('Fetching partnership by ID', { partnershipId: id });

      const response = await apiClient.get<Partnership>(
        `/api/partnerships/${id}`
      );

      this.logOperation('Partnership fetched successfully', {
        partnershipId: response.partnershipId,
        status: response.status,
      });

      return response || null;
    } catch (error: unknown) {
      this.logError('getPartnershipById', error);
      throw error;
    }
  }

  // Enhanced partnerships retrieval with comprehensive filtering
  async getPartnershipsByStoreId(
    storeId: number,
    request: Omit<GetPartnershipsRequest, 'storeId'> = {}
  ): Promise<PartnershipsResponse | null> {
    try {
      this.logOperation('Fetching partnerships by store ID', {
        storeId,
        request,
      });

      const params = new URLSearchParams();
      if (request.status) params.append('status', request.status);
      if (request.partnerType)
        params.append('partnerType', request.partnerType);
      if (request.page) params.append('page', request.page.toString());
      if (request.pageSize)
        params.append('pageSize', request.pageSize.toString());

      const url = `/api/partnerships/store/${storeId}?${params.toString()}`;
      console.log(`🔍 PartnershipsAPI: Making request to ${url}`);

      const response =
        await apiClient.get<ApiResponse<PartnershipsResponse>>(url);

      console.log(`📡 PartnershipsAPI: Raw response received:`, response);

      // Handle wrapped response structure: { data: { partnerships: [...] }, success: true, message: "..." }
      const partnershipsData: PartnershipsResponse | undefined =
        (response as unknown as { data?: PartnershipsResponse })?.data ||
        (response as unknown as PartnershipsResponse);

      console.log(
        `📡 PartnershipsAPI: Extracted partnerships data:`,
        partnershipsData
      );

      this.logOperation('Partnerships fetched successfully', {
        storeId,
        count: partnershipsData?.partnerships?.length || 0,
        hasData: !!partnershipsData,
        partnerships: partnershipsData?.partnerships,
      });

      return partnershipsData || null;
    } catch (error: unknown) {
      console.error(
        `❌ PartnershipsAPI: Error fetching partnerships for store ${storeId}:`,
        error
      );
      this.logError('getPartnershipsByStoreId', error);
      // Enhanced fallback response
      return {
        partnerships: [],
        totalCount: 0,
        page: 1,
        pageSize: 20,
      };
    }
  }

  // Enhanced partnership creation with validation and logging
  async createPartnership(
    request: CreatePartnershipRequest
  ): Promise<Partnership> {
    try {
      this.logOperation('Creating new partnership', {
        producerStoreId: request.producerStoreId,
        processorStoreId: request.processorStoreId,
        initiatedByStoreId: request.initiatedByStoreId,
      });

      const response = await apiClient.post<Partnership>(
        '/api/partnerships',
        request
      );

      this.logOperation('Partnership created successfully', {
        partnershipId: response.partnershipId,
        status: response.status,
      });

      return response;
    } catch (error: unknown) {
      this.logError('createPartnership', error);
      throw error;
    }
  }

  // Enhanced partnership update with comprehensive error handling
  async updatePartnership(
    request: UpdatePartnershipRequest
  ): Promise<Partnership> {
    try {
      this.logOperation('Updating partnership', {
        partnershipId: request.partnershipId,
        status: request.status,
      });

      const response = await apiClient.put<ApiResponse<Partnership>>(
        `/api/partnerships/${request.partnershipId}`,
        request
      );

      const partnership = response.data;
      if (!partnership) {
        throw new Error('Partnership update failed - no data returned');
      }

      this.logOperation('Partnership updated successfully', {
        partnershipId: request.partnershipId,
        newStatus: partnership.status,
      });

      return partnership;
    } catch (error: unknown) {
      this.logError('updatePartnership', error);
      throw error;
    }
  }

  // Enhanced partnership approval with dual API support
  async approvePartnership(
    partnershipId: number,
    approvedByUserId: number
  ): Promise<Partnership> {
    try {
      this.logOperation('Approving partnership', {
        partnershipId,
        approvedByUserId,
      });

      // Try primary API first, fallback to secondary if needed
      let response: Partnership | ApiResponse<Partnership>;
      try {
        response = await apiClient.post<Partnership>(
          `/api/partnerships/${partnershipId}/approve`,
          {
            partnershipId,
            approve: true,
            approvedByUserId,
          }
        );
      } catch (primaryError) {
        this.logError('Primary approval API failed', primaryError);
        // Fallback to alternative API
        response = await apiService.post<ApiResponse<Partnership>>(
          `/api/partnerships/${partnershipId}/approve`,
          {
            partnershipId,
            approve: true,
            approvedByUserId,
          }
        );
      }

      const partnership = extractPartnership(response);

      this.logOperation('Partnership approved successfully', {
        partnershipId,
        newStatus: partnership.status,
      });

      return partnership;
    } catch (error: unknown) {
      this.logError('approvePartnership', error);
      throw error;
    }
  }

  // Enhanced partnership rejection with comprehensive logging
  async rejectPartnership(
    partnershipId: number,
    storeId: number,
    reason?: string
  ): Promise<void> {
    try {
      this.logOperation('Rejecting partnership', {
        partnershipId,
        storeId,
        reason,
      });

      await apiClient.post(`/api/partnerships/${partnershipId}/decline`, {
        storeId,
        reason,
      });

      this.logOperation('Partnership rejected successfully', {
        partnershipId,
        storeId,
      });
    } catch (error: unknown) {
      this.logError('rejectPartnership', error);
      throw error;
    }
  }

  // Enhanced partnership termination with dual API support
  async terminatePartnership(
    partnershipId: number,
    reason?: string
  ): Promise<void> {
    try {
      this.logOperation('Terminating partnership', {
        partnershipId,
        reason,
      });

      // Try primary API first, fallback to secondary if needed
      try {
        await apiClient.post(`/api/partnerships/${partnershipId}/terminate`, {
          reason,
        });
      } catch (primaryError) {
        this.logError('Primary termination API failed', primaryError);
        // Fallback to alternative API
        await apiService.post(`/api/partnerships/${partnershipId}/terminate`, {
          reason,
        });
      }

      this.logOperation('Partnership terminated successfully', {
        partnershipId,
      });
    } catch (error: unknown) {
      this.logError('terminatePartnership', error);
      throw error;
    }
  }

  // Enhanced partnership reactivation with dual API support
  async reactivatePartnership(
    partnershipId: number,
    storeId: number
  ): Promise<Partnership> {
    try {
      this.logOperation('Reactivating partnership', {
        partnershipId,
        storeId,
      });

      // Try primary API first, fallback to secondary if needed
      let response: Partnership | ApiResponse<Partnership>;
      try {
        response = await apiClient.post<Partnership>(
          `/api/partnerships/${partnershipId}/reactivate`,
          { storeId }
        );
      } catch (primaryError) {
        this.logError('Primary reactivation API failed', primaryError);
        // Fallback to alternative API
        response = await apiService.post<ApiResponse<Partnership>>(
          `/api/partnerships/${partnershipId}/reactivate`,
          { storeId }
        );
      }

      const partnership = extractPartnership(response);

      this.logOperation('Partnership reactivated successfully', {
        partnershipId,
        newStatus: partnership.status,
      });

      return partnership;
    } catch (error: unknown) {
      this.logError('reactivatePartnership', error);
      throw error;
    }
  }

  // Enhanced partner search with dual API support and advanced filtering
  async searchPotentialPartners(
    request: SearchPartnersRequest
  ): Promise<EnhancedPotentialPartner[]> {
    try {
      this.logOperation('Searching potential partners', {
        storeId: request.storeId,
        radiusMiles: request.radiusMiles,
        partnerType: request.partnerType,
        searchTerm: request.searchTerm,
      });

      const params = new URLSearchParams();
      if (request.radiusMiles)
        params.append('radiusMiles', request.radiusMiles.toString());
      if (request.partnerType)
        params.append('partnerType', request.partnerType);
      if (request.searchTerm) params.append('searchTerm', request.searchTerm);
      if (request.page) params.append('page', request.page.toString());
      if (request.pageSize)
        params.append('pageSize', request.pageSize.toString());
      if (request.includeInactive !== undefined)
        params.append('includeInactive', request.includeInactive.toString());
      if (request.sortBy) params.append('sortBy', request.sortBy);
      if (request.sortOrder) params.append('sortOrder', request.sortOrder);

      // Enhanced search with dual API support
      let partnersList: EnhancedPotentialPartner[] = [];
      try {
        // Try primary API first
        const response = await apiClient.get<EnhancedPotentialPartner[]>(
          `/api/partnerships/store/${request.storeId}/potential-partners?${params.toString()}`
        );
        partnersList = response;
      } catch (primaryError) {
        this.logError('Primary search API failed', primaryError);
        // Fallback to alternative API service
        const response = await apiService.get<
          ApiResponse<EnhancedPotentialPartner[]>
        >(
          `/api/partnerships/store/${request.storeId}/potential-partners?${params.toString()}`
        );
        partnersList = response.data || [];
      }

      console.log('🔍 Raw API response:', partnersList);
      console.log('🔍 Response data:', partnersList);

      this.logOperation('Partner search completed successfully', {
        resultCount: partnersList.length,
        storeId: request.storeId,
      });

      return partnersList;
    } catch (error: unknown) {
      this.logError('searchPotentialPartners', error);
      // Enhanced fallback with empty array
      return [];
    }
  }

  // Enhanced JSON parsing with comprehensive error handling
  parsePartnershipTerms(termsJson?: string): PartnershipTerms | null {
    if (!termsJson) return null;
    try {
      const parsed = JSON.parse(termsJson);
      this.logOperation('Partnership terms parsed successfully');
      return parsed;
    } catch (error: unknown) {
      this.logError('parsePartnershipTerms', error);
      return null;
    }
  }

  parseDeliveryArrangements(
    arrangementsJson?: string
  ): DeliveryArrangements | null {
    if (!arrangementsJson) return null;
    try {
      const parsed = JSON.parse(arrangementsJson);
      this.logOperation('Delivery arrangements parsed successfully');
      return parsed;
    } catch (error: unknown) {
      this.logError('parseDeliveryArrangements', error);
      return null;
    }
  }

  // Enhanced status display with comprehensive mapping
  getStatusDisplayText(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Pending Approval',
      active: 'Active',
      inactive: 'Inactive',
      terminated: 'Terminated',
      expired: 'Expired',
      suspended: 'Suspended',
      under_review: 'Under Review',
    };

    const displayText = statusMap[status] || status;
    this.logOperation('Status display text resolved', { status, displayText });
    return displayText;
  }

  // Enhanced status color mapping with comprehensive coverage
  getStatusColor(
    status: string
  ): 'success' | 'warning' | 'error' | 'default' | 'info' {
    const colorMap: Record<
      string,
      'success' | 'warning' | 'error' | 'default' | 'info'
    > = {
      active: 'success',
      pending: 'warning',
      terminated: 'error',
      expired: 'error',
      suspended: 'warning',
      under_review: 'info',
      inactive: 'default',
    };

    const color = colorMap[status] || 'default';
    this.logOperation('Status color resolved', { status, color });
    return color;
  }
}

export const partnershipsApi = new PartnershipsApiService();
export { PartnershipsApiService };
export default partnershipsApi;
