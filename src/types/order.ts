/**
 * Order Types
 *
 * Defines types for order management functionality.
 * Follows frontend naming convention (camelCase).
 */

// Order status values from backend
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'ready_for_pickup'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

// Payment status values from backend
export type PaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'failed'
  | 'refunded';

// Fulfillment method values
export type FulfillmentMethod =
  | 'delivery'
  | 'pickup'
  | 'farmgate';

// Order item model
export interface OrderItem {
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
  status: OrderStatus;
  returnReason?: string;
  refundAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Order model
export interface Order {
  orderId: number;
  orderNumber: string;
  storeId: number;
  userId?: number;
  guestId?: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;

  // Financial information
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  platformFee: number;

  // Payment information
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paidAt?: string;

  // Shipping/Delivery information
  shippingAddressId?: number;
  billingAddressId?: number;
  shippingMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;

  // Fulfillment
  fulfillmentMethod: FulfillmentMethod;

  // Notes
  customerNote?: string;
  adminNote?: string;
}

// Order status history entry
export interface OrderStatusHistory {
  orderHistoryId: number;
  orderId: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Order list response with pagination
export interface OrderListResponse {
  orders: Order[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

// Filter parameters for orders
export interface OrderFilterParams {
  status?: OrderStatus | OrderStatus[];
  activeOnly?: boolean;
  completedOnly?: boolean;
  fromDate?: string; // ISO date string
  toDate?: string; // ISO date string
  storeId?: number;
  search?: string;
  sortBy?: 'created_at' | 'total' | 'status' | 'order_number' | 'updated_at';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Order details with related data
export interface OrderDetails extends Order {
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  shippingAddress?: any; // Will be populated from address service
  billingAddress?: any; // Will be populated from address service
}

// Order summary for list views
export interface OrderSummary {
  orderId: number;
  orderNumber: string;
  createdAt: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  itemCount: number;
  storeName?: string;
}
