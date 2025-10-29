import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorePoliciesStep } from '../components/steps';
import type { StepProps } from '../services/open-shop.types';

// Mock dependencies
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { userId: 1, email: 'test@example.com' },
  }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../services/open-shop.api', () => ({
  default: {
    setOpenHours: vi.fn(),
    setPaymentMethods: vi.fn(),
  },
}));

const mockOpenShopApi = await import('../services/open-shop.api');

describe('StorePoliciesStep', () => {
  const mockStepProps: StepProps = {
    formState: {
      currentStep: 2,
      storeBasics: {
        storeName: 'Test Store',
        description: 'Test Description',
        categories: [],
      },
      locationLogistics: {
        businessAddress: {
          locationName: '',
          contactPhone: '',
          contactEmail: '',
          streetAddress: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          pickupInstructions: '',
          sameAsBusinessAddress: false,
        },
        sellingMethods: [],
      },
      storeHours: {
        sunday: { isOpen: false },
        monday: { isOpen: false },
        tuesday: { isOpen: false },
        wednesday: { isOpen: false },
        thursday: { isOpen: false },
        friday: { isOpen: false },
        saturday: { isOpen: false },
      },
      paymentMethods: {
        selectedMethods: [],
      },
      branding: {
        logoFile: undefined,
        bannerFile: undefined,
        galleryFiles: [],
        logoUrl: undefined,
        bannerUrl: undefined,
        galleryUrls: [],
      },
      agreedToTerms: false,
      storeId: 123,
    },
    updateFormState: vi.fn(),
    onNext: vi.fn(),
    onPrevious: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render store policies step with all sections', () => {
    render(<StorePoliciesStep {...mockStepProps} />);

    expect(screen.getByText('Store Policies')).toBeInTheDocument();
    expect(
      screen.getByText('Set up your store hours and accepted payment methods.')
    ).toBeInTheDocument();

    // Check for store hours section
    expect(screen.getByText('Store Opening Hours')).toBeInTheDocument();
    expect(
      screen.getByText('Set your operating hours for each day of the week.')
    ).toBeInTheDocument();

    // Check for payment methods section
    expect(screen.getByText('Accepted Payment Methods')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Select all payment methods you accept (at least one required).'
      )
    ).toBeInTheDocument();

    // Check for all days of the week
    expect(screen.getByText('Sunday')).toBeInTheDocument();
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
    expect(screen.getByText('Wednesday')).toBeInTheDocument();
    expect(screen.getByText('Thursday')).toBeInTheDocument();
    expect(screen.getByText('Friday')).toBeInTheDocument();
    expect(screen.getByText('Saturday')).toBeInTheDocument();
  });

  it('should toggle day open/closed state when switch is clicked', () => {
    render(<StorePoliciesStep {...mockStepProps} />);

    const mondaySwitch = screen.getByLabelText('Monday');
    fireEvent.click(mondaySwitch);

    expect(mockStepProps.updateFormState).toHaveBeenCalledWith({
      storeHours: {
        ...mockStepProps.formState.storeHours,
        monday: {
          isOpen: true,
          openTime: '09:00',
          closeTime: '17:00',
        },
      },
    });
  });

  it('should update open time when time input changes', () => {
    const formStateWithOpenDay = {
      ...mockStepProps.formState,
      storeHours: {
        ...mockStepProps.formState.storeHours,
        monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      },
    };

    render(
      <StorePoliciesStep {...mockStepProps} formState={formStateWithOpenDay} />
    );

    const openTimeInput = screen.getByLabelText('Opens');
    fireEvent.change(openTimeInput, { target: { value: '10:00' } });

    expect(mockStepProps.updateFormState).toHaveBeenCalledWith({
      storeHours: {
        ...formStateWithOpenDay.storeHours,
        monday: {
          isOpen: true,
          openTime: '10:00',
          closeTime: '17:00',
        },
      },
    });
  });

  it('should update close time when time input changes', () => {
    const formStateWithOpenDay = {
      ...mockStepProps.formState,
      storeHours: {
        ...mockStepProps.formState.storeHours,
        monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      },
    };

    render(
      <StorePoliciesStep {...mockStepProps} formState={formStateWithOpenDay} />
    );

    const closeTimeInput = screen.getByLabelText('Closes');
    fireEvent.change(closeTimeInput, { target: { value: '18:00' } });

    expect(mockStepProps.updateFormState).toHaveBeenCalledWith({
      storeHours: {
        ...formStateWithOpenDay.storeHours,
        monday: {
          isOpen: true,
          openTime: '09:00',
          closeTime: '18:00',
        },
      },
    });
  });

  it('should toggle payment method when checkbox is clicked', () => {
    render(<StorePoliciesStep {...mockStepProps} />);

    const cashCheckbox = screen.getByLabelText('Cash');
    fireEvent.click(cashCheckbox);

    expect(mockStepProps.updateFormState).toHaveBeenCalledWith({
      paymentMethods: {
        selectedMethods: ['Cash'],
      },
    });
  });

  it('should show validation error when no days are open', async () => {
    render(<StorePoliciesStep {...mockStepProps} />);

    const continueButton = screen.getByText('Continue to Branding');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText('Please set hours for at least one day')
      ).toBeInTheDocument();
    });
  });

  it('should show validation error when no payment methods are selected', async () => {
    const formStateWithOpenHours = {
      ...mockStepProps.formState,
      storeHours: {
        ...mockStepProps.formState.storeHours,
        monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      },
    };

    render(
      <StorePoliciesStep
        {...mockStepProps}
        formState={formStateWithOpenHours}
      />
    );

    const continueButton = screen.getByText('Continue to Branding');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText('Please select at least one payment method')
      ).toBeInTheDocument();
    });
  });

  it('should submit successfully when form is valid', async () => {
    const formStateWithValidData = {
      ...mockStepProps.formState,
      storeHours: {
        ...mockStepProps.formState.storeHours,
        monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      },
      paymentMethods: {
        selectedMethods: ['Cash', 'Credit Card'],
      },
    };

    (mockOpenShopApi.default.setOpenHours as any).mockResolvedValue({});
    (mockOpenShopApi.default.setPaymentMethods as any).mockResolvedValue({});

    render(
      <StorePoliciesStep
        {...mockStepProps}
        formState={formStateWithValidData}
      />
    );

    const continueButton = screen.getByText('Continue to Branding');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockOpenShopApi.default.setOpenHours).toHaveBeenCalledWith({
        storeId: 123,
        openHours: expect.arrayContaining([
          expect.objectContaining({
            dayOfWeek: 1,
            openTime: '09:00:00',
            closeTime: '17:00:00',
            isClosed: false,
          }),
        ]),
      });

      expect(mockOpenShopApi.default.setPaymentMethods).toHaveBeenCalledWith({
        storeId: 123,
        paymentMethodNames: ['Cash', 'Credit Card'],
      });

      expect(mockStepProps.onNext).toHaveBeenCalled();
    });
  });

  it('should handle API errors gracefully', async () => {
    const formStateWithValidData = {
      ...mockStepProps.formState,
      storeHours: {
        ...mockStepProps.formState.storeHours,
        monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      },
      paymentMethods: {
        selectedMethods: ['Cash'],
      },
    };

    const mockError = new Error('API Error');
    (mockOpenShopApi.default.setOpenHours as any).mockRejectedValue(mockError);

    render(
      <StorePoliciesStep
        {...mockStepProps}
        formState={formStateWithValidData}
      />
    );

    const continueButton = screen.getByText('Continue to Branding');
    fireEvent.click(continueButton);

    await waitFor(() => {
      const toast = require('react-hot-toast');
      expect(toast.default.error).toHaveBeenCalledWith('API Error');
    });
  });

  it('should navigate back when back button is clicked', () => {
    render(<StorePoliciesStep {...mockStepProps} />);

    const backButton = screen.getByText('Back to Location');
    fireEvent.click(backButton);

    expect(mockStepProps.onPrevious).toHaveBeenCalled();
  });

  it('should show error when close time is before open time', async () => {
    const formStateWithInvalidTimes = {
      ...mockStepProps.formState,
      storeHours: {
        ...mockStepProps.formState.storeHours,
        monday: { isOpen: true, openTime: '17:00', closeTime: '09:00' },
      },
      paymentMethods: {
        selectedMethods: ['Cash'],
      },
    };

    render(
      <StorePoliciesStep
        {...mockStepProps}
        formState={formStateWithInvalidTimes}
      />
    );

    const continueButton = screen.getByText('Continue to Branding');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText('Monday: Close time must be after open time')
      ).toBeInTheDocument();
    });
  });

  it('should show error when store ID is missing', async () => {
    const formStateWithoutStoreId = {
      ...mockStepProps.formState,
      storeId: undefined,
      storeHours: {
        ...mockStepProps.formState.storeHours,
        monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      },
      paymentMethods: {
        selectedMethods: ['Cash'],
      },
    };

    render(
      <StorePoliciesStep
        {...mockStepProps}
        formState={formStateWithoutStoreId}
      />
    );

    const continueButton = screen.getByText('Continue to Branding');
    fireEvent.click(continueButton);

    await waitFor(() => {
      const toast = require('react-hot-toast');
      expect(toast.default.error).toHaveBeenCalledWith(
        'Store ID not found. Please go back to Step 1.'
      );
    });
  });
});
