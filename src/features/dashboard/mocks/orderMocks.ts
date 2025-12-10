/**
 * Mock Order Data for Development and Testing
 *
 * This file contains comprehensive mock order data that can be used:
 * 1. For development when backend APIs are not available
 * 2. For testing UI components
 * 3. As documentation of expected data structures
 * 4. For demo purposes
 */

import type {
  Order,
  OrderItem,
  OrderStatusHistory,
  OrderListResponse,
} from '../../../types/order';

/**
 * Comprehensive mock orders with various statuses and scenarios
 */
export const mockOrders: Order[] = [
  {
    orderId: 1,
    orderNumber: 'ORD-2024-001',
    storeId: 101,
    userId: 1,
    status: 'delivered',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    subtotal: 45.99,
    taxAmount: 3.68,
    shippingCost: 5.99,
    discountAmount: 5.0,
    total: 50.66,
    platformFee: 1.0,
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    paidAt: '2024-01-15T10:35:00Z',
    shippingMethod: 'standard',
    trackingNumber: 'TRK123456789',
    estimatedDelivery: '2024-01-18T23:59:59Z',
    fulfillmentMethod: 'delivery',
    customerNote: 'Please leave at front door',
  },
  {
    orderId: 2,
    orderNumber: 'ORD-2024-002',
    storeId: 102,
    userId: 1,
    status: 'processing',
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T09:15:00Z',
    subtotal: 32.5,
    taxAmount: 2.6,
    shippingCost: 0.0,
    discountAmount: 0.0,
    total: 35.1,
    platformFee: 0.65,
    paymentMethod: 'paypal',
    paymentStatus: 'paid',
    paidAt: '2024-01-20T09:20:00Z',
    shippingMethod: 'pickup',
    fulfillmentMethod: 'pickup',
  },
  {
    orderId: 3,
    orderNumber: 'ORD-2024-003',
    storeId: 103,
    userId: 1,
    status: 'shipped',
    createdAt: '2024-01-18T14:20:00Z',
    updatedAt: '2024-01-19T11:30:00Z',
    subtotal: 89.99,
    taxAmount: 7.2,
    shippingCost: 8.99,
    discountAmount: 10.0,
    total: 96.18,
    platformFee: 1.8,
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    paidAt: '2024-01-18T14:25:00Z',
    shippingMethod: 'express',
    trackingNumber: 'TRK987654321',
    estimatedDelivery: '2024-01-22T23:59:59Z',
    fulfillmentMethod: 'delivery',
  },
  {
    orderId: 4,
    orderNumber: 'ORD-2024-004',
    storeId: 101,
    userId: 1,
    status: 'pending',
    createdAt: '2024-01-22T16:45:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
    subtotal: 24.99,
    taxAmount: 2.0,
    shippingCost: 5.99,
    discountAmount: 0.0,
    total: 32.98,
    platformFee: 0.5,
    paymentMethod: 'credit_card',
    paymentStatus: 'pending',
    shippingMethod: 'standard',
    fulfillmentMethod: 'delivery',
  },
  {
    orderId: 5,
    orderNumber: 'ORD-2024-005',
    storeId: 104,
    userId: 1,
    status: 'cancelled',
    createdAt: '2024-01-10T11:30:00Z',
    updatedAt: '2024-01-12T09:15:00Z',
    subtotal: 67.5,
    taxAmount: 5.4,
    shippingCost: 0.0,
    discountAmount: 0.0,
    total: 72.9,
    platformFee: 1.35,
    paymentMethod: 'credit_card',
    paymentStatus: 'refunded',
    shippingMethod: 'pickup',
    fulfillmentMethod: 'pickup',
  },
  {
    orderId: 6,
    orderNumber: 'ORD-2024-006',
    storeId: 105,
    userId: 1,
    status: 'confirmed',
    createdAt: '2024-01-25T13:20:00Z',
    updatedAt: '2024-01-25T13:20:00Z',
    subtotal: 120.75,
    taxAmount: 9.66,
    shippingCost: 12.99,
    discountAmount: 15.0,
    total: 128.4,
    platformFee: 2.42,
    paymentMethod: 'apple_pay',
    paymentStatus: 'paid',
    paidAt: '2024-01-25T13:25:00Z',
    shippingMethod: 'express',
    fulfillmentMethod: 'delivery',
    customerNote: 'Gift wrapping requested',
  },
  {
    orderId: 7,
    orderNumber: 'ORD-2024-007',
    storeId: 106,
    userId: 1,
    status: 'ready_for_pickup',
    createdAt: '2024-01-23T08:45:00Z',
    updatedAt: '2024-01-24T10:30:00Z',
    subtotal: 55.25,
    taxAmount: 4.42,
    shippingCost: 0.0,
    discountAmount: 5.0,
    total: 54.67,
    platformFee: 1.11,
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    paidAt: '2024-01-23T08:50:00Z',
    shippingMethod: 'pickup',
    fulfillmentMethod: 'pickup',
  },
  {
    orderId: 8,
    orderNumber: 'ORD-2024-008',
    storeId: 107,
    userId: 1,
    status: 'refunded',
    createdAt: '2024-01-05T14:10:00Z',
    updatedAt: '2024-01-08T16:20:00Z',
    subtotal: 42.99,
    taxAmount: 3.44,
    shippingCost: 5.99,
    discountAmount: 0.0,
    total: 52.42,
    platformFee: 0.86,
    paymentMethod: 'credit_card',
    paymentStatus: 'refunded',
    paidAt: '2024-01-05T14:15:00Z',
    shippingMethod: 'standard',
    fulfillmentMethod: 'delivery',
  },
  {
    orderId: 9,
    orderNumber: 'ORD-2024-009',
    storeId: 108,
    userId: 1,
    status: 'delivered',
    createdAt: '2024-01-28T11:05:00Z',
    updatedAt: '2024-01-30T09:15:00Z',
    subtotal: 78.5,
    taxAmount: 6.28,
    shippingCost: 0.0,
    discountAmount: 8.0,
    total: 76.78,
    platformFee: 1.57,
    paymentMethod: 'google_pay',
    paymentStatus: 'paid',
    paidAt: '2024-01-28T11:10:00Z',
    shippingMethod: 'pickup',
    fulfillmentMethod: 'pickup',
  },
  {
    orderId: 10,
    orderNumber: 'ORD-2024-010',
    storeId: 109,
    userId: 1,
    status: 'processing',
    createdAt: '2024-01-30T15:40:00Z',
    updatedAt: '2024-01-30T15:40:00Z',
    subtotal: 33.25,
    taxAmount: 2.66,
    shippingCost: 7.99,
    discountAmount: 3.0,
    total: 40.9,
    platformFee: 0.67,
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    paidAt: '2024-01-30T15:45:00Z',
    shippingMethod: 'standard',
    fulfillmentMethod: 'delivery',
  },
];

/**
 * Mock order items for detailed order views
 */
export const mockOrderItems: OrderItem[] = [
  {
    orderItemId: 1,
    orderId: 1,
    itemId: 1001,
    storeId: 101,
    itemName: 'Organic Tomatoes',
    itemSku: 'TOM-ORG-001',
    itemPrice: 4.99,
    originalPrice: 5.99,
    itemImageUrl: 'https://example.com/images/tomatoes.jpg',
    quantity: 3,
    quantityFulfilled: 3,
    quantityRefunded: 0,
    discountAmount: 1.0,
    discountDescription: 'Seasonal discount',
    status: 'delivered',
    returnReason: undefined,
    refundAmount: 0,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-18T14:45:00Z',
  },
  {
    orderItemId: 2,
    orderId: 1,
    itemId: 1002,
    storeId: 101,
    itemName: 'Fresh Basil',
    itemSku: 'BAS-FRS-001',
    itemPrice: 3.99,
    originalPrice: 3.99,
    itemImageUrl: 'https://example.com/images/basil.jpg',
    quantity: 2,
    quantityFulfilled: 2,
    quantityRefunded: 0,
    discountAmount: 0,
    discountDescription: undefined,
    status: 'delivered',
    returnReason: undefined,
    refundAmount: 0,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-18T14:45:00Z',
  },
  {
    orderItemId: 3,
    orderId: 2,
    itemId: 2001,
    storeId: 102,
    itemName: 'Artisanal Cheese',
    itemSku: 'CHE-ART-001',
    itemPrice: 12.5,
    originalPrice: 12.5,
    itemImageUrl: 'https://example.com/images/cheese.jpg',
    quantity: 1,
    quantityFulfilled: 0,
    quantityRefunded: 0,
    discountAmount: 0,
    discountDescription: undefined,
    status: 'processing',
    returnReason: undefined,
    refundAmount: 0,
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T09:15:00Z',
  },
  {
    orderItemId: 4,
    orderId: 3,
    itemId: 3001,
    storeId: 103,
    itemName: 'Premium Olive Oil',
    itemSku: 'OIL-PRM-001',
    itemPrice: 24.99,
    originalPrice: 29.99,
    itemImageUrl: 'https://example.com/images/olive-oil.jpg',
    quantity: 2,
    quantityFulfilled: 2,
    quantityRefunded: 0,
    discountAmount: 5.0,
    discountDescription: 'Bulk discount',
    status: 'shipped',
    returnReason: undefined,
    refundAmount: 0,
    createdAt: '2024-01-18T14:20:00Z',
    updatedAt: '2024-01-19T11:30:00Z',
  },
  {
    orderItemId: 5,
    orderId: 3,
    itemId: 3002,
    storeId: 103,
    itemName: 'Balsamic Vinegar',
    itemSku: 'VIN-BAL-001',
    itemPrice: 19.99,
    originalPrice: 19.99,
    itemImageUrl: 'https://example.com/images/vinegar.jpg',
    quantity: 1,
    quantityFulfilled: 1,
    quantityRefunded: 0,
    discountAmount: 0,
    discountDescription: undefined,
    status: 'shipped',
    returnReason: undefined,
    refundAmount: 0,
    createdAt: '2024-01-18T14:20:00Z',
    updatedAt: '2024-01-19T11:30:00Z',
  },
];

/**
 * Mock order status history for tracking
 */
export const mockOrderStatusHistory: OrderStatusHistory[] = [
  {
    orderHistoryId: 1,
    orderId: 1,
    status: 'pending',
    notes: 'Order placed successfully',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    orderHistoryId: 2,
    orderId: 1,
    status: 'confirmed',
    notes: 'Payment confirmed, order being processed',
    createdAt: '2024-01-15T10:35:00Z',
    updatedAt: '2024-01-15T10:35:00Z',
  },
  {
    orderHistoryId: 3,
    orderId: 1,
    status: 'processing',
    notes: 'Items being prepared for shipment',
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
  },
  {
    orderHistoryId: 4,
    orderId: 1,
    status: 'shipped',
    notes: 'Order shipped via standard delivery',
    createdAt: '2024-01-17T14:20:00Z',
    updatedAt: '2024-01-17T14:20:00Z',
  },
  {
    orderHistoryId: 5,
    orderId: 1,
    status: 'delivered',
    notes: 'Order delivered successfully',
    createdAt: '2024-01-18T14:45:00Z',
    updatedAt: '2024-01-18T14:45:00Z',
  },
];

/**
 * Generate a mock order list response with pagination
 */
export function generateMockOrderListResponse(params?: {
  page?: number;
  pageSize?: number;
  status?: string | string[];
  search?: string;
  fromDate?: string;
  toDate?: string;
}): OrderListResponse {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;

  // Start with all mock orders
  let filteredOrders = [...mockOrders];

  // Apply status filter
  if (params?.status) {
    const statusFilter = Array.isArray(params.status)
      ? params.status
      : [params.status];
    filteredOrders = filteredOrders.filter((order) =>
      statusFilter.includes(order.status)
    );
  }

  // Apply search filter
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(searchLower) ||
        (order.customerNote &&
          order.customerNote.toLowerCase().includes(searchLower))
    );
  }

  // Apply date range filter
  if (params?.fromDate || params?.toDate) {
    filteredOrders = filteredOrders.filter((order) => {
      const orderDate = new Date(order.createdAt).getTime();
      const fromDate = params.fromDate
        ? new Date(params.fromDate).getTime()
        : 0;
      const toDate = params.toDate
        ? new Date(params.toDate).getTime()
        : Date.now();
      return orderDate >= fromDate && orderDate <= toDate;
    });
  }

  // Apply pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const totalCount = filteredOrders.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    orders: paginatedOrders,
    pagination: {
      totalCount,
      totalPages,
      currentPage: page,
      pageSize,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
}

/**
 * Get mock order details by order ID
 */
export function getMockOrderDetails(orderId: number) {
  const order = mockOrders.find((o) => o.orderId === orderId);
  if (!order) {
    return null;
  }

  const items = mockOrderItems.filter((item) => item.orderId === orderId);
  const statusHistory = mockOrderStatusHistory.filter(
    (history) => history.orderId === orderId
  );

  return {
    ...order,
    items,
    statusHistory,
    shippingAddress: undefined, // Would come from address service
    billingAddress: undefined, // Would come from address service
  };
}

/**
 * Get mock order items by order ID
 */
export function getMockOrderItems(orderId: number): OrderItem[] {
  return mockOrderItems.filter((item) => item.orderId === orderId);
}

/**
 * Get mock order status history by order ID
 */
export function getMockOrderStatusHistory(
  orderId: number
): OrderStatusHistory[] {
  return mockOrderStatusHistory.filter(
    (history) => history.orderId === orderId
  );
}

/**
 * Get mock order statistics for dashboard
 */
export function getMockOrderStats() {
  const totalOrders = mockOrders.length;
  const activeOrders = mockOrders.filter((order) =>
    [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'ready_for_pickup',
    ].includes(order.status)
  ).length;
  const totalSpent = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const averageOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;

  return {
    totalOrders,
    activeOrders,
    totalSpent,
    averageOrder,
  };
}

/**
 * Export all mock data for easy importing
 */
export default {
  mockOrders,
  mockOrderItems,
  mockOrderStatusHistory,
  generateMockOrderListResponse,
  getMockOrderDetails,
  getMockOrderItems,
  getMockOrderStatusHistory,
  getMockOrderStats,
};
