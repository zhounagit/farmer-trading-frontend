import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Grid,
  Chip,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AccountBalance,
  Security,
  Payment,
  Schedule,
  VerifiedUser,
  Warning,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

// Types for payment and banking data
export interface BankAccountInfo {
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  bankName: string;
  isVerified: boolean;
}

export interface TaxInfo {
  taxId: string;
  taxIdType: 'ssn' | 'ein';
  businessName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface PaymentBankingData {
  bankAccount?: BankAccountInfo;
  taxInfo?: TaxInfo;
  lastPayoutDate?: string;
  nextPayoutDate?: string;
  availableBalance: number;
  pendingBalance: number;
}

interface PaymentBankingProps {
  userId: string;
  onSave?: (data: PaymentBankingData) => void;
  onError?: (error: string) => void;
}

const PaymentBanking: React.FC<PaymentBankingProps> = ({
  userId,
  onSave,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showTaxId, setShowTaxId] = useState(false);
  const [data, setData] = useState<PaymentBankingData>({
    availableBalance: 0,
    pendingBalance: 0,
  });

  // Form states
  const [bankAccount, setBankAccount] = useState<Partial<BankAccountInfo>>({});
  const [taxInfo, setTaxInfo] = useState<Partial<TaxInfo>>({});

  // Load payment data on component mount
  const loadPaymentData = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await apiService.get(`/api/users/${userId}/payment-banking`);
      // setData(response.data);

      // Mock data for demonstration
      setTimeout(() => {
        setData({
          bankAccount: {
            accountHolderName: 'John Doe',
            accountNumber: '****6789',
            routingNumber: '021000021',
            accountType: 'checking',
            bankName: 'Chase Bank',
            isVerified: true,
          },
          taxInfo: {
            taxId: '***-**-1234',
            taxIdType: 'ssn',
            businessName: 'John Doe Store',
            address: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
            },
          },
          lastPayoutDate: '2024-01-15',
          nextPayoutDate: '2024-01-22',
          availableBalance: 1250.75,
          pendingBalance: 350.25,
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading payment data:', error);
      onError?.('Failed to load payment information');
      setLoading(false);
    }
  }, [userId, onError]);

  useEffect(() => {
    loadPaymentData();
  }, [loadPaymentData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate required fields
      if (
        !bankAccount.accountHolderName ||
        !bankAccount.accountNumber ||
        !bankAccount.routingNumber
      ) {
        toast.error('Please fill in all required bank account fields');
        setSaving(false);
        return;
      }

      if (!taxInfo.taxId) {
        toast.error('Please provide your tax identification number');
        setSaving(false);
        return;
      }

      // TODO: Replace with actual API call
      // await apiService.put(`/api/users/${userId}/payment-banking`, {
      //   bankAccount,
      //   taxInfo,
      //   payoutPreferences,
      // });

      // Update local state
      const updatedData: PaymentBankingData = {
        ...data,
        bankAccount: bankAccount as BankAccountInfo,
        taxInfo: taxInfo as TaxInfo,
      };

      setData(updatedData);
      onSave?.(updatedData);
      toast.success('Payment settings saved successfully');
    } catch (error) {
      console.error('Error saving payment data:', error);
      onError?.('Failed to save payment information');
      toast.error('Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const handleBankAccountChange = (
    field: keyof BankAccountInfo,
    value: string
  ) => {
    setBankAccount((prev) => ({ ...prev, [field]: value }));
  };

  const handleTaxInfoChange = (field: keyof TaxInfo, value: string) => {
    setTaxInfo((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Payment & Banking
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Set up your bank account to receive payments from store sales or
        referral commissions. Your payouts will be automatically processed
        according to platform policies.
      </Typography>

      {/* Balance Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            sx={{
              p: 3,
              bgcolor: 'success.light',
              color: 'success.contrastText',
            }}
          >
            <Typography variant='h6' gutterBottom>
              Available Balance
            </Typography>
            <Typography variant='h4' fontWeight='bold'>
              {formatCurrency(data.availableBalance)}
            </Typography>
            <Typography variant='body2'>Ready for payout</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            sx={{ p: 3, bgcolor: 'info.light', color: 'info.contrastText' }}
          >
            <Typography variant='h6' gutterBottom>
              Pending Balance
            </Typography>
            <Typography variant='h4' fontWeight='bold'>
              {formatCurrency(data.pendingBalance)}
            </Typography>
            <Typography variant='body2'>Processing transactions</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Bank Account Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display='flex' alignItems='center' sx={{ mb: 3 }}>
            <AccountBalance sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant='h6'>Payout Account</Typography>
            {data.bankAccount?.isVerified && (
              <Chip
                icon={<VerifiedUser />}
                label='Verified'
                color='success'
                size='small'
                sx={{ ml: 2 }}
              />
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Account Holder Name'
                value={
                  bankAccount.accountHolderName ||
                  data.bankAccount?.accountHolderName ||
                  ''
                }
                onChange={(e) =>
                  handleBankAccountChange('accountHolderName', e.target.value)
                }
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Bank Name'
                value={bankAccount.bankName || data.bankAccount?.bankName || ''}
                onChange={(e) =>
                  handleBankAccountChange('bankName', e.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Account Number'
                type={showAccountNumber ? 'text' : 'password'}
                value={
                  bankAccount.accountNumber ||
                  data.bankAccount?.accountNumber ||
                  ''
                }
                onChange={(e) =>
                  handleBankAccountChange('accountNumber', e.target.value)
                }
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        onClick={() => setShowAccountNumber(!showAccountNumber)}
                        edge='end'
                      >
                        {showAccountNumber ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Routing Number'
                value={
                  bankAccount.routingNumber ||
                  data.bankAccount?.routingNumber ||
                  ''
                }
                onChange={(e) =>
                  handleBankAccountChange('routingNumber', e.target.value)
                }
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      bankAccount.accountType === 'savings' ||
                      data.bankAccount?.accountType === 'savings'
                    }
                    onChange={(e) =>
                      handleBankAccountChange(
                        'accountType',
                        e.target.checked ? 'savings' : 'checking'
                      )
                    }
                  />
                }
                label='Savings Account'
              />
            </Grid>
          </Grid>

          <Alert severity='info' sx={{ mt: 2 }}>
            <Security sx={{ mr: 1 }} />
            Your payout account information is encrypted and stored securely.
            This account will be used for all your payouts, including store
            sales and referral commissions.
          </Alert>
        </CardContent>
      </Card>

      {/* Tax Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display='flex' alignItems='center' sx={{ mb: 3 }}>
            <Payment sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant='h6'>Tax Information</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Tax ID (SSN/EIN)'
                type={showTaxId ? 'text' : 'password'}
                value={taxInfo.taxId || data.taxInfo?.taxId || ''}
                onChange={(e) => handleTaxInfoChange('taxId', e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        onClick={() => setShowTaxId(!showTaxId)}
                        edge='end'
                      >
                        {showTaxId ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Business Name (if applicable)'
                value={taxInfo.businessName || data.taxInfo?.businessName || ''}
                onChange={(e) =>
                  handleTaxInfoChange('businessName', e.target.value)
                }
              />
            </Grid>
          </Grid>

          <Alert severity='warning' sx={{ mt: 2 }}>
            <Warning sx={{ mr: 1 }} />
            Required for tax reporting purposes. We are required to collect this
            information for IRS reporting.
          </Alert>
        </CardContent>
      </Card>

      {/* Payout Preferences */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display='flex' alignItems='center' sx={{ mb: 3 }}>
            <Schedule sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant='h6'>Payout Information</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Payout preferences are managed by platform policy to ensure
                consistent processing for all users.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Payout Method'
                value='Bank Transfer'
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Payment />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Payout Frequency'
                value='Weekly'
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Schedule />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant='body2' color='text.secondary'>
                • Store owners receive payouts when customer orders are
                completed and funds are released from escrow
                <br />
                • Referral commissions are paid out automatically based on
                successful referral transactions
                <br />• All payouts follow platform security and verification
                processes
              </Typography>
            </Grid>
          </Grid>

          {data.nextPayoutDate && (
            <Alert severity='info' sx={{ mt: 2 }}>
              Next store payout:{' '}
              {new Date(data.nextPayoutDate).toLocaleDateString()}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert severity='success' sx={{ mb: 3 }}>
        <Security sx={{ mr: 1 }} />
        All store payout information is encrypted and stored securely. We use
        bank-level security measures to protect your store earnings data.
      </Alert>

      {/* Save Button */}
      <Box display='flex' justifyContent='flex-end'>
        <Button
          variant='contained'
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : null}
        >
          {saving ? 'Saving...' : 'Save Payment & Banking Settings'}
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentBanking;
