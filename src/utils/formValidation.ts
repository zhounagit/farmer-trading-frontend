// Form validation utilities for Open Shop forms

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export class FormValidator {
  static validateField(value: unknown, rule: ValidationRule): string | null {
    // Check required
    if (
      rule.required &&
      (!value || (typeof value === 'string' && !value.trim()))
    ) {
      return 'This field is required';
    }

    // If value is empty and not required, skip other validations
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null;
    }

    // Check minimum length
    if (rule.minLength && String(value).length < rule.minLength) {
      return `Must be at least ${rule.minLength} characters`;
    }

    // Check maximum length
    if (rule.maxLength && String(value).length > rule.maxLength) {
      return `Must be no more than ${rule.maxLength} characters`;
    }

    // Check pattern
    if (rule.pattern && !rule.pattern.test(String(value))) {
      return 'Invalid format';
    }

    // Check custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }

  static validateForm(
    data: any,
    rules: ValidationRules
  ): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    Object.keys(rules).forEach((fieldName) => {
      const fieldValue = this.getNestedValue(data, fieldName);
      const rule = rules[fieldName];
      const error = this.validateField(fieldValue, rule);

      if (error) {
        errors[fieldName] = error;
      }
    });

    return errors;
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}

// Common validation rules
export const commonValidations = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    },
  },

  phone: {
    pattern: /^\+?[\d\s\-()]+$/,
    custom: (value: string) => {
      if (value && !/^\+?[\d\s\-()]+$/.test(value)) {
        return 'Please enter a valid phone number';
      }
      return null;
    },
  },

  zipCode: {
    pattern: /^\d{5}(-\d{4})?$/,
    custom: (value: string) => {
      if (value && !/^\d{5}(-\d{4})?$/.test(value)) {
        return 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
      }
      return null;
    },
  },

  url: {
    pattern: /^https?:\/\/.+/,
    custom: (value: string) => {
      if (value && !/^https?:\/\/.+/.test(value)) {
        return 'Please enter a valid URL starting with http:// or https://';
      }
      return null;
    },
  },

  storeName: {
    required: true,
    minLength: 3,
    maxLength: 100,
    custom: (value: string) => {
      if (value && value.trim().length < 3) {
        return 'Store name must be at least 3 characters';
      }
      if ((value && /^\s/.test(value)) || /\s$/.test(value)) {
        return 'Store name cannot start or end with spaces';
      }
      return null;
    },
  },

  description: {
    required: true,
    minLength: 20,
    maxLength: 1000,
  },

  locationName: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },

  streetAddress: {
    required: true,
    minLength: 5,
    maxLength: 200,
  },

  city: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-'\.]+$/,
    custom: (value: string) => {
      if (value && !/^[a-zA-Z\s\-'\.]+$/.test(value)) {
        return 'City name can only contain letters, spaces, hyphens, apostrophes, and periods';
      }
      return null;
    },
  },

  state: {
    required: true,
    minLength: 2,
    maxLength: 2,
    pattern: /^[A-Z]{2}$/,
    custom: (value: string) => {
      if (value && !/^[A-Z]{2}$/.test(value)) {
        return 'Please enter a valid 2-letter state code (e.g., CA, NY)';
      }
      return null;
    },
  },
};

// Store Basics validation rules
export const storeBasicsValidation: ValidationRules = {
  'storeBasics.storeName': commonValidations.storeName,
  'storeBasics.description': commonValidations.description,
};

// Business Address validation rules
export const businessAddressValidation: ValidationRules = {
  'locationLogistics.businessAddress.locationName':
    commonValidations.locationName,
  'locationLogistics.businessAddress.contactPhone': {
    ...commonValidations.phone,
    required: true,
  },
  'locationLogistics.businessAddress.streetAddress':
    commonValidations.streetAddress,
  'locationLogistics.businessAddress.city': commonValidations.city,
  'locationLogistics.businessAddress.state': commonValidations.state,
  'locationLogistics.businessAddress.zipCode': {
    ...commonValidations.zipCode,
    required: true,
  },
};

// Farmgate Address validation rules (conditional)
export const farmgateAddressValidation: ValidationRules = {
  'locationLogistics.farmgateAddress.locationName':
    commonValidations.locationName,
  'locationLogistics.farmgateAddress.contactPhone': {
    ...commonValidations.phone,
    required: true,
  },
  'locationLogistics.farmgateAddress.streetAddress':
    commonValidations.streetAddress,
  'locationLogistics.farmgateAddress.city': commonValidations.city,
  'locationLogistics.farmgateAddress.state': commonValidations.state,
  'locationLogistics.farmgateAddress.zipCode': {
    ...commonValidations.zipCode,
    required: true,
  },
};

// Pickup Point Address validation rules (conditional)
export const pickupPointAddressValidation: ValidationRules = {
  'locationLogistics.pickupPointAddress.locationName':
    commonValidations.locationName,
  'locationLogistics.pickupPointAddress.contactPhone': {
    ...commonValidations.phone,
    required: true,
  },
  'locationLogistics.pickupPointAddress.streetAddress':
    commonValidations.streetAddress,
  'locationLogistics.pickupPointAddress.city': commonValidations.city,
  'locationLogistics.pickupPointAddress.state': commonValidations.state,
  'locationLogistics.pickupPointAddress.zipCode': {
    ...commonValidations.zipCode,
    required: true,
  },
};

// Store Hours validation
export const storeHoursValidation = {
  validateStoreHours: (storeHours: any): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};

    // Check if at least one day is open
    const hasOpenDays = Object.entries(storeHours).some(
      ([_, dayData]: [string, any]) => dayData.isOpen
    );

    if (!hasOpenDays) {
      errors.storeHours = 'Your store must be open at least one day per week';
    }

    // Validate individual days
    Object.entries(storeHours).forEach(([day, dayData]: [string, any]) => {
      if (dayData.isOpen) {
        if (!dayData.openTime) {
          errors[`${day}OpenTime`] = 'Opening time is required';
        }
        if (!dayData.closeTime) {
          errors[`${day}CloseTime`] = 'Closing time is required';
        }

        // Check if close time is after open time
        if (dayData.openTime && dayData.closeTime) {
          const openTime = new Date(`2000-01-01T${dayData.openTime}:00`);
          const closeTime = new Date(`2000-01-01T${dayData.closeTime}:00`);

          if (openTime >= closeTime) {
            errors[`${day}Time`] = 'Closing time must be after opening time';
          }
        }
      }
    });

    return errors;
  },
};

// Payment Methods validation
export const paymentMethodsValidation = {
  validatePaymentMethods: (
    selectedMethods: string[]
  ): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};

    if (!selectedMethods || selectedMethods.length === 0) {
      errors.paymentMethods = 'Please select at least one payment method';
    }

    return errors;
  },
};

// Selling Methods validation
export const sellingMethodsValidation = {
  validateSellingMethods: (
    selectedMethods: string[]
  ): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};

    if (!selectedMethods || selectedMethods.length === 0) {
      errors.sellingMethods = 'Please select at least one selling method';
    }

    return errors;
  },
};

// File validation utilities
export const fileValidation = {
  validateImageFile: (
    file: File,
    options: {
      maxSize?: number;
      allowedTypes?: string[];
      minWidth?: number;
      minHeight?: number;
      maxWidth?: number;
      maxHeight?: number;
      aspectRatio?: number;
      aspectRatioTolerance?: number;
    } = {}
  ): Promise<string | null> => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      aspectRatio,
      aspectRatioTolerance = 0.1,
    } = options;

    return new Promise((resolve) => {
      // Check file size
      if (file.size > maxSize) {
        resolve(
          `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
        );
        return;
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        resolve('Only JPEG, PNG, and WebP images are allowed');
        return;
      }

      // Check image dimensions
      const img = new Image();
      img.onload = () => {
        if (minWidth && img.width < minWidth) {
          resolve(`Image width must be at least ${minWidth}px`);
          return;
        }
        if (minHeight && img.height < minHeight) {
          resolve(`Image height must be at least ${minHeight}px`);
          return;
        }
        if (maxWidth && img.width > maxWidth) {
          resolve(`Image width must be no more than ${maxWidth}px`);
          return;
        }
        if (maxHeight && img.height > maxHeight) {
          resolve(`Image height must be no more than ${maxHeight}px`);
          return;
        }

        // Check aspect ratio
        if (aspectRatio) {
          const fileAspectRatio = img.width / img.height;
          const difference = Math.abs(fileAspectRatio - aspectRatio);
          if (difference > aspectRatioTolerance) {
            resolve(
              `Image aspect ratio should be approximately ${aspectRatio.toFixed(1)}:1`
            );
            return;
          }
        }

        resolve(null);
      };

      img.onerror = () => {
        resolve('Invalid image file');
      };

      img.src = URL.createObjectURL(file);
    });
  },

  validateMultipleFiles: async (
    files: File[],
    options: any = {}
  ): Promise<{ [key: number]: string }> => {
    const errors: { [key: number]: string } = {};
    const promises = files.map((file, index) =>
      fileValidation.validateImageFile(file, options).then((error) => {
        if (error) {
          errors[index] = error;
        }
      })
    );

    await Promise.all(promises);
    return errors;
  },
};

// Complete form validation
export const validateOpenShopForm = {
  validateStep: (
    stepNumber: number,
    formState: any
  ): { [key: string]: string } => {
    let errors: { [key: string]: string } = {};

    switch (stepNumber) {
      case 0: // Store Basics
        errors = FormValidator.validateForm(formState, storeBasicsValidation);
        break;

      case 1: // Location & Logistics
        // Business address (always required)
        errors = {
          ...errors,
          ...FormValidator.validateForm(formState, businessAddressValidation),
        };

        // Selling methods
        errors = {
          ...errors,
          ...sellingMethodsValidation.validateSellingMethods(
            formState.locationLogistics?.sellingMethods || []
          ),
        };

        // Conditional validations based on selling methods
        const sellingMethods =
          formState.locationLogistics?.sellingMethods || [];

        // No pickup location validation needed - farmgate addresses are no longer used
        // Producer stores use processor partner locations, independent stores use business address

        if (sellingMethods.includes('local-delivery')) {
          if (
            !formState.locationLogistics?.deliveryRadiusMi ||
            formState.locationLogistics.deliveryRadiusMi <= 0
          ) {
            errors.deliveryRadius = 'Please specify delivery radius';
          }
        }

        // No pickup point validation needed - farmgate addresses are no longer used
        break;

      case 2: // Store Policies
        // Store hours validation
        errors = {
          ...errors,
          ...storeHoursValidation.validateStoreHours(
            formState.storeHours || {}
          ),
        };

        // Payment methods validation
        errors = {
          ...errors,
          ...paymentMethodsValidation.validatePaymentMethods(
            formState.paymentMethods?.selectedMethods || []
          ),
        };
        break;

      case 3: // Branding (optional, no validation required)
        break;

      case 4: // Review & Submit
        if (!formState.agreedToTerms) {
          errors.agreedToTerms = 'You must agree to the terms and conditions';
        }
        break;

      default:
        break;
    }

    return errors;
  },

  validateAllSteps: (formState: any): { [key: string]: string } => {
    let allErrors: { [key: string]: string } = {};

    for (let step = 0; step <= 4; step++) {
      const stepErrors = validateOpenShopForm.validateStep(step, formState);
      allErrors = { ...allErrors, ...stepErrors };
    }

    return allErrors;
  },
};
