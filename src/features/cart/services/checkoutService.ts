/**
 * Checkout Service
 *
 * Provides checkout functionality integration with backend APIs.
 * Follows existing service patterns and uses ApiMapper for type conversion.
 */

import { apiService } from '../../../shared/services/api-service';
import { ApiMapper } from '../../../services/api-mapper';

// Frontend types (camelCase)
export interface CheckoutRequest {
  userId?: number;
  guestId?: number;
  cartId?: number;
  shippingAddressId?: number;
  billingAddressId?: number;
  paymentMethod: string;
  fulfillmentMethod: string;
  customerNote?: string;
  isTaxExempt: boolean;
  exemptionType?: string;
  customerTaxId?: string;
  paymentDetails?: PaymentDetails;
  pickupLocationId?: number;
  pickupTime?: string;
  deliveryWindowStart?: string;
  deliveryWindowEnd?: string;
  deliveryInstructions?: string;
  deliveryTimeSlot?: string;
  // Guest address details (alternative to address IDs)
  shippingAddress?: GuestAddressDetails;
  billingAddress?: GuestAddressDetails;
}

export interface PaymentDetails {
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardholderName: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface GuestAddressDetails {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

export interface CheckoutResponse {
  orderId: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  paymentResult?: PaymentResult;
  taxCalculation?: TaxCalculationResult;
  createdAt: string;
}

export interface PaymentResult {
  transactionId: string;
  status: string;
  gatewayTransactionId: string;
  success: boolean;
}

export interface TaxCalculationResult {
  taxableAmount: number;
  taxAmount: number;
  taxRate: number;
  taxType: string;
  jurisdictions?: unknown[];
}

export interface CheckoutValidationRequest {
  userId?: number;
  guestId?: number;
  cartId?: number;
  shippingAddressId?: number;
  billingAddressId?: number;
  paymentMethod: string;
  fulfillmentMethod: string;
}

export interface CheckoutValidationResponse {
  isValid: boolean;
  errors: ValidationError[];
  totals: CheckoutTotals;
  taxCalculation?: TaxCalculationResult;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface CheckoutTotals {
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
}

// Backend types (PascalCase)
interface BackendCheckoutRequest {
  UserId?: number;
  GuestId?: number;
  CartId?: number;
  ShippingAddressId?: number;
  BillingAddressId?: number;
  PaymentMethod: string;
  FulfillmentMethod: string;
  CustomerNote?: string;
  IsTaxExempt: boolean;
  ExemptionType?: string;
  CustomerTaxId?: string;
  PaymentDetails?: BackendPaymentDetails;
  PickupLocationId?: number;
  PickupTime?: string;
  DeliveryWindowStart?: string;
  DeliveryWindowEnd?: string;
  DeliveryInstructions?: string;
  DeliveryTimeSlot?: string;
  // Guest address details (alternative to address IDs)
  ShippingAddress?: BackendGuestAddressDetails;
  BillingAddress?: BackendGuestAddressDetails;
}

interface BackendPaymentDetails {
  CardNumber: string;
  ExpiryMonth: number;
  ExpiryYear: number;
  Cvv: string;
  CardholderName: string;
  CustomerEmail?: string;
  CustomerPhone?: string;
}

interface BackendGuestAddressDetails {
  StreetAddress: string;
  City: string;
  State: string;
  ZipCode: string;
  Country: string;
  FirstName?: string;
  LastName?: string;
  Phone?: string;
  Email?: string;
}

interface BackendCheckoutResponse {
  OrderId: number;
  OrderNumber: string;
  Status: string;
  PaymentStatus: string;
  Subtotal: number;
  TaxAmount: number;
  ShippingCost: number;
  DiscountAmount: number;
  Total: number;
  PaymentResult?: BackendPaymentResult;
  TaxCalculation?: BackendTaxCalculationResult;
  CreatedAt: string;
}

interface BackendPaymentResult {
  TransactionId: string;
  Status: string;
  GatewayTransactionId: string;
  Success: boolean;
}

interface BackendTaxCalculationResult {
  TaxableAmount: number;
  TaxAmount: number;
  TaxRate: number;
  TaxType: string;
  Jurisdictions?: unknown[];
}

interface BackendCheckoutValidationRequest {
  UserId?: number;
  GuestId?: number;
  CartId?: number;
  ShippingAddressId?: number;
  BillingAddressId?: number;
  PaymentMethod: string;
  FulfillmentMethod: string;
}

interface BackendCheckoutValidationResponse {
  IsValid: boolean;
  Errors: BackendValidationError[];
  Totals: BackendCheckoutTotals;
  TaxCalculation?: BackendTaxCalculationResult;
}

interface BackendValidationError {
  Field: string;
  Message: string;
  Code?: string;
}

interface BackendCheckoutTotals {
  Subtotal: number;
  TaxAmount: number;
  ShippingCost: number;
  DiscountAmount: number;
  Total: number;
}

export class CheckoutService {
  /**
   * Process complete checkout flow
   */
  async processCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
    const backendRequest: BackendCheckoutRequest =
      ApiMapper.toPascalCase(request);

    const response = await apiService.post<BackendCheckoutResponse>(
      '/api/checkout',
      backendRequest
    );

    return ApiMapper.toCamelCase<CheckoutResponse>(response);
  }

  /**
   * Validate checkout prerequisites
   */
  async validateCheckout(
    request: CheckoutValidationRequest
  ): Promise<CheckoutValidationResponse> {
    const backendRequest: BackendCheckoutValidationRequest =
      ApiMapper.toPascalCase(request);

    const response = await apiService.post<BackendCheckoutValidationResponse>(
      '/api/checkout/validate',
      backendRequest
    );

    return ApiMapper.toCamelCase<CheckoutValidationResponse>(response);
  }

  /**
   * Calculate checkout totals including tax and shipping
   */
  async getCheckoutTotals(
    cartId?: number,
    shippingAddressId?: number,
    billingAddressId?: number,
    customerId?: number,
    guestId?: number
  ): Promise<CheckoutTotals> {
    const params = new URLSearchParams();
    if (cartId) params.append('cartId', cartId.toString());
    if (shippingAddressId)
      params.append('shippingAddressId', shippingAddressId.toString());
    if (billingAddressId)
      params.append('billingAddressId', billingAddressId.toString());
    if (customerId) params.append('customerId', customerId.toString());
    if (guestId) params.append('guestId', guestId.toString());

    const response = await apiService.get<BackendCheckoutTotals>(
      `/api/checkout/totals?${params.toString()}`
    );

    return ApiMapper.toCamelCase<CheckoutTotals>(response);
  }

  /**
   * Calculate tax for checkout preview
   */
  async getTaxPreview(
    cartId?: number,
    shippingAddressId?: number,
    billingAddressId?: number,
    customerId?: number,
    guestId?: number
  ): Promise<TaxCalculationResult> {
    const params = new URLSearchParams();
    if (cartId) params.append('cartId', cartId.toString());
    if (shippingAddressId)
      params.append('shippingAddressId', shippingAddressId.toString());
    if (billingAddressId)
      params.append('billingAddressId', billingAddressId.toString());
    if (customerId) params.append('customerId', customerId.toString());
    if (guestId) params.append('guestId', guestId.toString());

    const response = await apiService.get<BackendTaxCalculationResult>(
      `/api/checkout/tax-preview?${params.toString()}`
    );

    return ApiMapper.toCamelCase<TaxCalculationResult>(response);
  }
}

// Export singleton instance
export const checkoutService = new CheckoutService();

// Default export for convenience
export default checkoutService;
