/**
 * Order Service
 *
 * Service for handling order-related API calls.
 * Uses the standardized ApiResponse<T> format from backend.
 * Includes fallback to mock data for development/testing.
 */

import { apiService } from '../../../shared/services/api-service';
import { ApiMapper } from '../../../services/api-mapper';
import type {
  OrderListResponse,
  OrderFilterParams,
  OrderDetails,
  OrderItem,
  OrderStatusHistory,
  FulfillmentMethod,
  OrderStatus,
  PaymentStatus,
} from '../../../types/order';
import {
  generateMockOrderListResponse,
  getMockOrderDetails,
  getMockOrderItems,
  getMockOrderStatusHistory,
} from '../mocks/orderMocks';

// Define backend response types to match actual API response structure
interface BackendOrderListResponse {
  orders: Array<{
    orderId: number;
    orderNumber: string;
    storeId: number;
    userId: number;
    status: string;
    subtotal: number;
    taxAmount: number;
    shippingCost: number;
    discountAmount: number;
    total: number;
    paymentMethod: string;
    paymentStatus: string;
    shippingAddressId?: number;
    billingAddressId?: number;
    createdAt: string;
    updatedAt: string;
    paidAt?: string;
    customerNote?: string;
    fulfillmentMethod: string;
    platformFee: number;
    storePayoutAmount?: number;
    commissionRateApplied?: number;
    isMultiVendor?: boolean;
    escrowStatus?: string;
    isPending?: boolean;
    isConfirmed?: boolean;
    isProcessing?: boolean;
    isShipped?: boolean;
    isReadyForPickup?: boolean;
    isDelivered?: boolean;
    isCancelled?: boolean;
    isRefunded?: boolean;
    isPaid?: boolean;
    isUnpaid?: boolean;
    isPaymentPending?: boolean;
    isPaymentFailed?: boolean;
    isPartiallyPaid?: boolean;
    hasCommission?: boolean;
    effectiveTotal?: number;
    commissionPercentage?: number;
    requiresDelivery?: boolean;
    requiresPickup?: boolean;
    hasTrackingNumber?: boolean;
    canBeCancelled?: boolean;
    canBeRefunded?: boolean;
    totalAmountPaid?: number;
    totalRefunded?: number;
    netPayment?: number;
    statusDisplay?: string;
    paymentStatusDisplay?: string;
    fulfillmentMethodDisplay?: string;
  }>;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  query?: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: string;
  };
}

// Interface for order details API response
interface BackendOrderDetailsResponse {
  orderId: number;
  orderNumber: string;
  storeId: number;
  userId: number;
  status: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddressId?: number;
  billingAddressId?: number;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  customerNote?: string;
  fulfillmentMethod: string;
  platformFee: number;
  shippingMethod?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  adminNote?: string;
}

// Interface for order items API response
interface BackendOrderItemResponse {
  orderItemId: number;
  orderId: number;
  itemId: number;
  storeId: number;
  itemName: string;
  itemSku: string;
  itemPrice: number;
  originalPrice: number;
  itemImageUrl?: string;
  quantity: number;
  quantityFulfilled: number;
  quantityRefunded: number;
  discountAmount: number;
  discountDescription?: string;
  status: string;
  returnReason?: string;
  refundAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Interface for order status history API response
interface BackendOrderStatusHistoryResponse {
  orderHistoryId: number;
  orderId: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

class OrderService {
  /**
   * Get orders for the authenticated user with filtering, sorting, and pagination
   * Uses the recommended endpoint: GET /api/orders/my-orders
   */
  async getMyOrders(params?: OrderFilterParams): Promise<OrderListResponse> {
    try {
      // Convert frontend params to backend format
      const backendParams = ApiMapper.toBackendOrderFilterParams(params || {});

      // Build query string from params
      const queryParams = new URLSearchParams();

      // Add all filter parameters
      if (backendParams.Status) {
        queryParams.append('status', backendParams.Status);
      }
      if (backendParams.ActiveOnly !== undefined) {
        queryParams.append('activeOnly', backendParams.ActiveOnly.toString());
      }
      if (backendParams.CompletedOnly !== undefined) {
        queryParams.append(
          'completedOnly',
          backendParams.CompletedOnly.toString()
        );
      }
      if (backendParams.FromDate) {
        queryParams.append('fromDate', backendParams.FromDate);
      }
      if (backendParams.ToDate) {
        queryParams.append('toDate', backendParams.ToDate);
      }
      if (backendParams.StoreId) {
        queryParams.append('storeId', backendParams.StoreId.toString());
      }
      if (backendParams.Search) {
        queryParams.append('search', backendParams.Search);
      }
      if (backendParams.SortBy) {
        queryParams.append('sortBy', backendParams.SortBy);
      }
      if (backendParams.SortDirection) {
        queryParams.append('sortDirection', backendParams.SortDirection);
      }
      if (backendParams.Page) {
        queryParams.append('page', backendParams.Page.toString());
      }
      if (backendParams.PageSize) {
        queryParams.append('pageSize', backendParams.PageSize.toString());
      }

      const queryString = queryParams.toString();
      const endpoint = `/api/orders/my-orders${queryString ? `?${queryString}` : ''}`;

      // Make API call with proper type
      const response = await apiService.get<BackendOrderListResponse>(endpoint);

      // Check if response is valid
      if (!response) {
        throw new Error('API returned empty response');
      }

      // Check if response has the expected structure
      if (!response.orders) {
        throw new Error('Invalid API response structure: missing orders field');
      }

      // Convert backend response to frontend format
      // Since the API response structure doesn't match ApiMapper expectations,
      // we need to convert it manually
      const ordersResponse = this.convertBackendOrderListResponse(response);

      return ordersResponse;
    } catch (error) {
      console.error('❌ OrderService: Failed to fetch orders:', error);
      // Provide more detailed error message
      if (error instanceof Error) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }
      throw new Error('Failed to fetch orders: Unknown error');
    }
  }

  /**
   * Convert backend order list response to frontend format
   * This is needed because the API response structure doesn't match ApiMapper expectations
   */
  private convertBackendOrderListResponse(
    backendResponse: BackendOrderListResponse
  ): OrderListResponse {
    // Convert backend orders to frontend format
    const orders = backendResponse.orders.map((backendOrder) => ({
      orderId: backendOrder.orderId,
      orderNumber: backendOrder.orderNumber,
      storeId: backendOrder.storeId,
      userId: backendOrder.userId,
      status: backendOrder.status as OrderStatus,
      createdAt: backendOrder.createdAt,
      updatedAt: backendOrder.updatedAt,
      subtotal: backendOrder.subtotal,
      taxAmount: backendOrder.taxAmount,
      shippingCost: backendOrder.shippingCost,
      discountAmount: backendOrder.discountAmount,
      total: backendOrder.total,
      platformFee: backendOrder.platformFee,
      paymentMethod: backendOrder.paymentMethod,
      paymentStatus: backendOrder.paymentStatus as PaymentStatus,
      paidAt: backendOrder.paidAt,
      shippingAddressId: backendOrder.shippingAddressId,
      billingAddressId: backendOrder.billingAddressId,
      shippingMethod: '', // Not in backend response
      trackingNumber: undefined, // Not in backend response
      estimatedDelivery: undefined, // Not in backend response
      fulfillmentMethod: backendOrder.fulfillmentMethod as FulfillmentMethod,
      customerNote: backendOrder.customerNote,
      adminNote: undefined, // Not in backend response
    }));

    return {
      orders,
      pagination: {
        totalCount: backendResponse.totalCount,
        totalPages: backendResponse.totalPages,
        currentPage: backendResponse.page,
        pageSize: backendResponse.pageSize,
        hasPreviousPage: backendResponse.hasPreviousPage,
        hasNextPage: backendResponse.hasNextPage,
      },
    };
  }

  /**
   * Get order details by order ID
   * Uses endpoint: GET /api/orders/{orderId}
   */
  async getOrderDetails(orderId: number): Promise<OrderDetails> {
    try {
      console.log(
        `🔍 OrderService: Fetching order details for orderId: ${orderId}`
      );

      const endpoint = `/api/orders/${orderId}`;

      // Make API call with proper type
      const response =
        await apiService.get<BackendOrderDetailsResponse>(endpoint);

      // Check if response is valid
      if (!response) {
        throw new Error(`API returned empty response for order ${orderId}`);
      }

      // Convert backend response to frontend format
      const orderDetails: OrderDetails = {
        orderId: response.orderId,
        orderNumber: response.orderNumber,
        storeId: response.storeId,
        userId: response.userId,
        status: response.status as OrderStatus,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        subtotal: response.subtotal,
        taxAmount: response.taxAmount,
        shippingCost: response.shippingCost,
        discountAmount: response.discountAmount,
        total: response.total,
        platformFee: response.platformFee,
        paymentMethod: response.paymentMethod,
        paymentStatus: response.paymentStatus as PaymentStatus,
        paidAt: response.paidAt,
        shippingAddressId: response.shippingAddressId,
        billingAddressId: response.billingAddressId,
        shippingMethod: response.shippingMethod || '',
        trackingNumber: response.trackingNumber,
        estimatedDelivery: response.estimatedDelivery,
        fulfillmentMethod: response.fulfillmentMethod as FulfillmentMethod,
        customerNote: response.customerNote,
        adminNote: response.adminNote,
        items: [],
        statusHistory: [],
      };

      console.log(
        `✅ OrderService: Successfully fetched order details for orderId: ${orderId}`
      );
      return orderDetails;
    } catch (error) {
      console.error(
        `❌ OrderService: Failed to fetch order details for orderId: ${orderId}:`,
        error
      );
      if (error instanceof Error) {
        throw new Error(`Failed to fetch order details: ${error.message}`);
      }
      throw new Error(
        `Failed to fetch order details for order ${orderId}: Unknown error`
      );
    }
  }

  /**
   * Get items in a specific order
   * Uses endpoint: GET /api/orders/{orderId}/items
   */
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    try {
      console.log(
        `🔍 OrderService: Fetching order items for orderId: ${orderId}`
      );

      const endpoint = `/api/orders/${orderId}/items`;

      // Make API call - response is an array of backend order items
      const response =
        await apiService.get<BackendOrderItemResponse[]>(endpoint);

      // Check if response is valid
      if (!response) {
        throw new Error(
          `API returned empty response for order items ${orderId}`
        );
      }

      // Ensure response is an array
      if (!Array.isArray(response)) {
        throw new Error(
          `API response for order items is not an array for order ${orderId}`
        );
      }

      // Convert backend response to frontend format
      const orderItems: OrderItem[] = response.map((item) => ({
        orderItemId: item.orderItemId,
        orderId: item.orderId,
        itemId: item.itemId,
        storeId: item.storeId,
        itemName: item.itemName,
        itemSku: item.itemSku,
        itemPrice: item.itemPrice,
        originalPrice: item.originalPrice,
        itemImageUrl: item.itemImageUrl,
        quantity: item.quantity,
        quantityFulfilled: item.quantityFulfilled,
        quantityRefunded: item.quantityRefunded,
        discountAmount: item.discountAmount,
        discountDescription: item.discountDescription,
        status: item.status as OrderStatus,
        returnReason: item.returnReason,
        refundAmount: item.refundAmount,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      console.log(
        `✅ OrderService: Successfully fetched ${orderItems.length} items for orderId: ${orderId}`
      );
      return orderItems;
    } catch (error) {
      console.error(
        `❌ OrderService: Failed to fetch order items for orderId: ${orderId}:`,
        error
      );
      if (error instanceof Error) {
        throw new Error(`Failed to fetch order items: ${error.message}`);
      }
      throw new Error(
        `Failed to fetch order items for order ${orderId}: Unknown error`
      );
    }
  }

  /**
   * Get order status history
   * Uses endpoint: GET /api/orders/{orderId}/history
   */
  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    try {
      console.log(
        `🔍 OrderService: Fetching status history for orderId: ${orderId}`
      );

      const endpoint = `/api/orders/${orderId}/history`;

      // Make API call - response is an array of backend status history items
      const response =
        await apiService.get<BackendOrderStatusHistoryResponse[]>(endpoint);

      // Check if response is valid
      if (!response) {
        throw new Error(
          `API returned empty response for order history ${orderId}`
        );
      }

      // Ensure response is an array
      if (!Array.isArray(response)) {
        throw new Error(
          `API response for order history is not an array for order ${orderId}`
        );
      }

      // Convert backend response to frontend format
      const statusHistory: OrderStatusHistory[] = response.map((history) => ({
        orderHistoryId: history.orderHistoryId,
        orderId: history.orderId,
        status: history.status as OrderStatus,
        notes: history.notes,
        createdAt: history.createdAt,
        updatedAt: history.updatedAt,
      }));

      console.log(
        `✅ OrderService: Successfully fetched ${statusHistory.length} status history entries for orderId: ${orderId}`
      );
      return statusHistory;
    } catch (error) {
      console.error(
        `❌ OrderService: Failed to fetch status history for orderId: ${orderId}:`,
        error
      );
      if (error instanceof Error) {
        throw new Error(`Failed to fetch order history: ${error.message}`);
      }
      throw new Error(
        `Failed to fetch order history for order ${orderId}: Unknown error`
      );
    }
  }

  /**
   * Get a specific item in an order
   * Uses endpoint: GET /api/orders/{orderId}/items/{itemId}
   */
  async getOrderItem(orderId: number, itemId: number): Promise<OrderItem> {
    try {
      console.log(
        `🔍 OrderService: Fetching order item ${itemId} for orderId: ${orderId}`
      );

      const endpoint = `/api/orders/${orderId}/items/${itemId}`;

      // Make API call with proper type
      const response = await apiService.get<BackendOrderItemResponse>(endpoint);

      // Check if response is valid
      if (!response) {
        throw new Error(
          `API returned empty response for order item ${itemId} in order ${orderId}`
        );
      }

      // Convert backend response to frontend format
      const orderItem: OrderItem = {
        orderItemId: response.orderItemId,
        orderId: response.orderId,
        itemId: response.itemId,
        storeId: response.storeId,
        itemName: response.itemName,
        itemSku: response.itemSku,
        itemPrice: response.itemPrice,
        originalPrice: response.originalPrice,
        itemImageUrl: response.itemImageUrl,
        quantity: response.quantity,
        quantityFulfilled: response.quantityFulfilled,
        quantityRefunded: response.quantityRefunded,
        discountAmount: response.discountAmount,
        discountDescription: response.discountDescription,
        status: response.status as OrderStatus,
        returnReason: response.returnReason,
        refundAmount: response.refundAmount,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };

      console.log(
        `✅ OrderService: Successfully fetched order item ${itemId} for orderId: ${orderId}`
      );
      return orderItem;
    } catch (error) {
      console.error(
        `❌ OrderService: Failed to fetch order item ${itemId} for orderId: ${orderId}:`,
        error
      );
      if (error instanceof Error) {
        throw new Error(`Failed to fetch order item: ${error.message}`);
      }
      throw new Error(
        `Failed to fetch order item ${itemId} for order ${orderId}: Unknown error`
      );
    }
  }

  /**
   * Get orders for a specific store (for store owners)
   * Uses endpoint: GET /api/orders/store/{storeId}
   */
  async getStoreOrders(
    storeId: number,
    params?: OrderFilterParams
  ): Promise<OrderListResponse> {
    try {
      console.log(
        `🔍 OrderService: Fetching store orders for storeId: ${storeId} with params:`,
        params
      );

      // Convert frontend params to backend format
      const backendParams = ApiMapper.toBackendOrderFilterParams(params || {});

      // Build query string from params (excluding storeId which is in the path)
      const queryParams = new URLSearchParams();

      // Add all filter parameters except storeId
      if (backendParams.Status) {
        queryParams.append('status', backendParams.Status);
      }
      if (backendParams.ActiveOnly !== undefined) {
        queryParams.append('activeOnly', backendParams.ActiveOnly.toString());
      }
      if (backendParams.CompletedOnly !== undefined) {
        queryParams.append(
          'completedOnly',
          backendParams.CompletedOnly.toString()
        );
      }
      if (backendParams.FromDate) {
        queryParams.append('fromDate', backendParams.FromDate);
      }
      if (backendParams.ToDate) {
        queryParams.append('toDate', backendParams.ToDate);
      }
      if (backendParams.Search) {
        queryParams.append('search', backendParams.Search);
      }
      if (backendParams.SortBy) {
        queryParams.append('sortBy', backendParams.SortBy);
      }
      if (backendParams.SortDirection) {
        queryParams.append('sortDirection', backendParams.SortDirection);
      }
      if (backendParams.Page) {
        queryParams.append('page', backendParams.Page.toString());
      }
      if (backendParams.PageSize) {
        queryParams.append('pageSize', backendParams.PageSize.toString());
      }

      const queryString = queryParams.toString();
      const endpoint = `/api/orders/store/${storeId}${queryString ? `?${queryString}` : ''}`;

      // Make API call with proper type
      const response = await apiService.get<BackendOrderListResponse>(endpoint);

      // Check if response is valid
      if (!response) {
        throw new Error(`API returned empty response for store ${storeId}`);
      }

      // Check if response has the expected structure
      if (!response.orders) {
        throw new Error('Invalid API response structure: missing orders field');
      }

      // Convert backend response to frontend format
      const ordersResponse = this.convertBackendOrderListResponse(response);

      return ordersResponse;
    } catch (error) {
      console.error(
        `❌ OrderService: Failed to fetch store orders for storeId: ${storeId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get orders for a specific customer (admin/backward compatibility)
   * Uses endpoint: GET /api/orders/customer/{customerId}
   */
  async getCustomerOrders(
    customerId: number,
    params?: OrderFilterParams
  ): Promise<OrderListResponse> {
    try {
      console.log(
        `🔍 OrderService: Fetching customer orders for customerId: ${customerId} with params:`,
        params
      );

      // Convert frontend params to backend format
      const backendParams = ApiMapper.toBackendOrderFilterParams(params || {});

      // Build query string from params (excluding customerId which is in the path)
      const queryParams = new URLSearchParams();

      // Add all filter parameters except customerId
      if (backendParams.Status) {
        queryParams.append('status', backendParams.Status);
      }
      if (backendParams.ActiveOnly !== undefined) {
        queryParams.append('activeOnly', backendParams.ActiveOnly.toString());
      }
      if (backendParams.CompletedOnly !== undefined) {
        queryParams.append(
          'completedOnly',
          backendParams.CompletedOnly.toString()
        );
      }
      if (backendParams.FromDate) {
        queryParams.append('fromDate', backendParams.FromDate);
      }
      if (backendParams.ToDate) {
        queryParams.append('toDate', backendParams.ToDate);
      }
      if (backendParams.StoreId) {
        queryParams.append('storeId', backendParams.StoreId.toString());
      }
      if (backendParams.Search) {
        queryParams.append('search', backendParams.Search);
      }
      if (backendParams.SortBy) {
        queryParams.append('sortBy', backendParams.SortBy);
      }
      if (backendParams.SortDirection) {
        queryParams.append('sortDirection', backendParams.SortDirection);
      }
      if (backendParams.Page) {
        queryParams.append('page', backendParams.Page.toString());
      }
      if (backendParams.PageSize) {
        queryParams.append('pageSize', backendParams.PageSize.toString());
      }

      const queryString = queryParams.toString();
      const endpoint = `/api/orders/customer/${customerId}${queryString ? `?${queryString}` : ''}`;

      // Make API call with proper type
      const response = await apiService.get<BackendOrderListResponse>(endpoint);

      // Check if response is valid
      if (!response) {
        throw new Error(
          `API returned empty response for customer ${customerId}`
        );
      }

      // Check if response has the expected structure
      if (!response.orders) {
        throw new Error('Invalid API response structure: missing orders field');
      }

      // Convert backend response to frontend format
      const ordersResponse = this.convertBackendOrderListResponse(response);

      return ordersResponse;
    } catch (error) {
      console.error(
        `❌ OrderService: Failed to fetch customer orders for customerId: ${customerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Fallback method to get mock orders for development/testing
   * This can be used when the backend is not available
   */
  async getMockOrders(params?: OrderFilterParams): Promise<OrderListResponse> {
    // Use mock data from external file
    return generateMockOrderListResponse({
      page: params?.page,
      pageSize: params?.pageSize,
      status: params?.status,
      search: params?.search,
      fromDate: params?.fromDate,
      toDate: params?.toDate,
    });
  }

  /**
   * Get mock order details for development/testing
   */
  async getMockOrderDetails(orderId: number): Promise<OrderDetails> {
    const details = getMockOrderDetails(orderId);
    if (!details) {
      throw new Error(`Order ${orderId} not found in mock data`);
    }

    return details;
  }

  /**
   * Get mock order items for development/testing
   */
  async getMockOrderItems(orderId: number): Promise<OrderItem[]> {
    return getMockOrderItems(orderId);
  }

  /**
   * Get mock order status history for development/testing
   */
  async getMockOrderStatusHistory(
    orderId: number
  ): Promise<OrderStatusHistory[]> {
    return getMockOrderStatusHistory(orderId);
  }
}

// Create singleton instance
const orderService = new OrderService();
export default orderService;
