// Types for the Open Your Shop multi-step form flow

export interface StoreCreationRequest {
  storeName: string;
  description: string;
  storeCreatorEmail: string;
  createdAt: string;
}

export interface StoreCreationResponse {
  store_id: number;
}

export interface AddressCreationRequest {
  storeId: number;
  addressType: string;
  locationName: string;
  contactPhone: string;
  streetLine: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary: boolean;
  createdAt: string;
  isActive: boolean;
}

export interface AddressCreationResponse {
  address_id: number;
}

export interface OpenHoursRequest {
  storeId: number;
  openHours: DaySchedule[];
}

export interface DaySchedule {
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  openTime: string | null; // "HH:MM:SS" format
  closeTime: string | null; // "HH:MM:SS" format
  isClosed: boolean;
}

export interface PaymentMethodsRequest {
  storeId: number;
  paymentMethodNames: string[];
}

// Form data types for each step
export interface StoreBasicsFormData {
  storeName: string;
  description: string;
}

export interface AddressFormData {
  locationName: string;
  contactPhone: string;
  streetLine: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface LocationLogisticsFormData {
  businessAddress: AddressFormData;
  sellingMethods: SellingMethod[];
  farmgateAddress?: AddressFormData;
  farmgateSameAsBusinessAddress?: boolean;
  deliveryRadiusMi?: number;
  pickupPointAddress?: AddressFormData;
  pickupPointNickname?: string;
}

export interface StoreHoursFormData {
  [key: string]: {
    isOpen: boolean;
    openTime?: string; // "HH:MM" format
    closeTime?: string; // "HH:MM" format
  };
}

export interface PaymentMethodsFormData {
  selectedMethods: string[];
}

export interface BrandingFormData {
  logoFile?: File;
  bannerFile?: File;
  galleryFiles?: File[];
}

// Combined form state
export interface OpenShopFormState {
  currentStep: number;
  storeId?: number;
  storeBasics: StoreBasicsFormData;
  locationLogistics: LocationLogisticsFormData;
  storeHours: StoreHoursFormData;
  paymentMethods: PaymentMethodsFormData;
  branding: BrandingFormData;
  agreedToTerms: boolean;
}

// Enums and constants
export type SellingMethod =
  | 'on-farm-pickup'
  | 'local-delivery'
  | 'farmers-market';

export const SELLING_METHODS: Array<{
  value: SellingMethod;
  label: string;
  description: string;
}> = [
  {
    value: 'on-farm-pickup',
    label: 'On-Farm Pickup',
    description: 'Customers come to me',
  },
  {
    value: 'local-delivery',
    label: 'Local Delivery',
    description: 'I deliver to customers',
  },
  {
    value: 'farmers-market',
    label: "I sell at a Farmers' Market or other pickup point",
    description: 'Market or pickup point sales',
  },
];

export const PAYMENT_METHODS_OPTIONS = [
  'Cash',
  'Credit Card',
  'Bank Transfer',
  'Mobile Payment',
];

export const DAYS_OF_WEEK_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export const STEP_NAMES = [
  'Store Basics',
  'Location & Logistics',
  'Store Policies',
  'Branding & Visuals',
  'Review & Submit',
];

// Form validation schemas
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface StepValidation {
  isValid: boolean;
  errors: FormErrors;
}

// Step component props
export interface StepProps {
  formState: OpenShopFormState;
  updateFormState: (updates: Partial<OpenShopFormState>) => void;
  onNext: () => void;
  onPrevious?: () => void;
  isLoading?: boolean;
}

// API response types
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea';
}

export interface CheckboxFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}
