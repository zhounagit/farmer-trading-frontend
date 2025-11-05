import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/shared/services/api-service';
import { API_ENDPOINTS } from '@/shared/types/api-contracts';
import type { UserPreferences } from '@/shared/types/api-contracts';
import { useAuth } from '@/contexts/AuthContext';

import Header from '@/components/layout/Header';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Person as PersonIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import ProfilePictureUpload from '@/components/user/ProfilePictureUpload';
import AccountInfo from './AccountInfo';
import PaymentBanking from './payment-banking/PaymentBanking';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`account-settings-tabpanel-${index}`}
      aria-labelledby={`account-settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AccountSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    refreshUserProfile,
    userPreferences,
    isLoadingPreferences,
    loadUserPreferences,
    updateUserPreferences,
  } = useAuth();

  const [tabValue, setTabValue] = useState(0);

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>(
    'idle'
  );

  const [settings, setSettings] = useState<{
    notifications: {
      emailUpdates: boolean;
      pushNotifications: boolean;
      marketingEmails: boolean;
    };
    privacy: {
      showEmail: boolean;
      allowMessages: boolean;
    };
    appearance: {
      theme: 'auto' | 'light' | 'dark';
    };
    language: {
      language: string;
      timezone: string;
    };
    referralCredits: {
      handling: 'platform_purchases' | 'bank_transfer';
    };
  } | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Map AuthContext preferences to UI settings when preferences change
  useEffect(() => {
    if (!userPreferences) {
      // Load preferences if not loaded yet
      if (user && !isLoadingPreferences) {
        loadUserPreferences();
      }
      return;
    }

    // Map backend preferences to UI settings
    setSettings({
      notifications: {
        emailUpdates: userPreferences.notifications.email,
        pushNotifications: userPreferences.notifications.push,
        marketingEmails: userPreferences.notifications.marketing,
      },
      privacy: {
        showEmail: userPreferences.privacy.showEmail,
        allowMessages: userPreferences.privacy.allowMessages,
      },
      appearance: {
        theme: userPreferences.display.theme,
      },
      language: {
        language: userPreferences.display.language,
        timezone: userPreferences.display.timezone,
      },
      referralCredits: {
        handling: userPreferences.referralCredits.handling as
          | 'platform_purchases'
          | 'bank_transfer',
      },
    });
  }, [userPreferences, user, isLoadingPreferences, loadUserPreferences]);

  const handleNotificationChange = (setting: string, value: boolean) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: {
          ...prev.notifications,
          [setting]: value,
        },
      };
    });
  };

  const handlePrivacyChange = (setting: string, value: string | boolean) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        privacy: {
          ...prev.privacy,
          [setting]: value,
        },
      };
    });
  };

  const handleAppearanceChange = (setting: string, value: string) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        appearance: {
          ...prev.appearance,
          [setting]: value,
        },
      };
    });
  };

  const handleLanguageChange = (setting: string, value: string) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        language: {
          ...prev.language,
          [setting]: value,
        },
      };
    });
  };

  const handleReferralCreditsChange = (setting: string, value: string) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        referralCredits: {
          ...prev.referralCredits,
          [setting]: value,
        },
      };
    });
  };

  const saveSettings = async () => {
    if (!user || !settings) return;

    try {
      setLoading(true);
      setSaveStatus('idle');

      const updateRequest: UserPreferences = {
        notifications: {
          email: settings.notifications.emailUpdates,
          push: settings.notifications.pushNotifications,
          sms: false, // Not currently used in UI
          marketing: settings.notifications.marketingEmails,
        },
        privacy: {
          showEmail: settings.privacy.showEmail,
          showPhone: false, // Not currently used in UI
          allowMessages: settings.privacy.allowMessages,
        },
        display: {
          theme: settings.appearance.theme,
          language: settings.language.language,
          timezone: settings.language.timezone,
        },
        referralCredits: {
          handling: settings.referralCredits.handling,
        },
      };

      await apiService.put<UserPreferences>(
        API_ENDPOINTS.USERS.PREFERENCES_UPDATE(parseInt(user.userId)),
        updateRequest
      );

      // Update AuthContext preferences with new data
      const updatedPreferences = {
        notifications: {
          email: settings.notifications.emailUpdates,
          push: settings.notifications.pushNotifications,
          sms: false,
          marketing: settings.notifications.marketingEmails,
        },
        privacy: {
          showEmail: settings.privacy.showEmail,
          showPhone: false,
          allowMessages: settings.privacy.allowMessages,
        },
        display: {
          theme: settings.appearance.theme,
          language: settings.language.language,
          timezone: settings.language.timezone,
        },
        referralCredits: {
          handling: settings.referralCredits.handling,
        },
      };
      updateUserPreferences(updatedPreferences);

      // Update header privacy settings immediately without API call
      const updatePrivacyFn = (
        window as typeof window & {
          updatePrivacySettingsImmediately?: (showEmail: boolean) => void;
        }
      ).updatePrivacySettingsImmediately;

      if (updatePrivacyFn) {
        updatePrivacyFn(settings.privacy.showEmail);
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <Box>
      <Header onLoginClick={handleLoginClick} />
      <Container maxWidth='lg' sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant='h4' component='h1' gutterBottom>
            Account Settings
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Manage your account preferences and privacy settings
          </Typography>
        </Box>

        {saveStatus === 'success' && (
          <Alert severity='success' sx={{ mb: 3 }}>
            Settings saved successfully!
          </Alert>
        )}

        {saveStatus === 'error' && (
          <Alert severity='error' sx={{ mb: 3 }}>
            Failed to save settings. Please try again.
          </Alert>
        )}

        {isLoadingPreferences && (
          <Alert severity='info' sx={{ mb: 3 }}>
            Loading your preferences...
          </Alert>
        )}

        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label='account settings tabs'
            >
              <Tab
                icon={<PersonIcon />}
                iconPosition='start'
                label='Profile'
                id='account-settings-tab-0'
              />
              <Tab
                icon={<NotificationsIcon />}
                iconPosition='start'
                label='Notifications & Privacy'
                id='account-settings-tab-1'
              />
              <Tab
                icon={<PaletteIcon />}
                iconPosition='start'
                label='Display'
                id='account-settings-tab-2'
              />
              <Tab
                icon={<AccountBalanceIcon />}
                iconPosition='start'
                label='Store Payouts & Banking'
                id='account-settings-tab-3'
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Typography variant='h6' gutterBottom>
              Profile Settings
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              Update your personal information and account preferences.
            </Typography>

            {/* Profile Picture Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant='subtitle1' gutterBottom>
                Profile Picture
              </Typography>
              <ProfilePictureUpload
                size='large'
                editable={true}
                showUploadButton={true}
                onUploadSuccess={(url) => {
                  console.log('Profile picture uploaded successfully:', url);
                  // Reset Header profile picture state to show the new photo
                  const resetFn = (
                    window as typeof window & {
                      resetHeaderProfilePictureState?: () => void;
                    }
                  ).resetHeaderProfilePictureState;
                  if (resetFn) {
                    resetFn();
                  }
                  // Force refresh user profile to ensure synchronization
                  if (refreshUserProfile) {
                    refreshUserProfile();
                  }
                }}
                onUploadError={(error) => {
                  console.error('Profile picture upload failed:', error);
                }}
              />
            </Box>

            {/* Account Information Section */}
            <Box sx={{ mt: 4 }}>
              <AccountInfo
                onDataChange={() => {
                  // Trigger any necessary updates when account data changes
                  console.log('Account information updated');
                }}
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant='h6' gutterBottom>
              Notification & Privacy Preferences
            </Typography>

            {/* Notifications Section */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant='subtitle1'
                gutterBottom
                sx={{ mt: 2, mb: 2 }}
              >
                Notifications
              </Typography>
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings?.notifications.emailUpdates ?? false}
                      onChange={(e) =>
                        handleNotificationChange(
                          'emailUpdates',
                          e.target.checked
                        )
                      }
                      disabled={isLoadingPreferences}
                    />
                  }
                  label='Email notifications'
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={
                        settings?.notifications.pushNotifications ?? false
                      }
                      onChange={(e) =>
                        handleNotificationChange(
                          'pushNotifications',
                          e.target.checked
                        )
                      }
                      disabled={isLoadingPreferences}
                    />
                  }
                  label='Push notifications'
                />
              </Box>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings?.notifications.marketingEmails ?? false}
                      onChange={(e) =>
                        handleNotificationChange(
                          'marketingEmails',
                          e.target.checked
                        )
                      }
                      disabled={isLoadingPreferences}
                    />
                  }
                  label='Marketing emails'
                />
              </Box>
            </Box>

            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 4 }}>
              {/* Privacy Section */}
              <Typography variant='subtitle1' gutterBottom sx={{ mb: 2 }}>
                Privacy Settings
              </Typography>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings?.privacy.showEmail ?? false}
                      onChange={(e) => {
                        handlePrivacyChange('showEmail', e.target.checked);
                      }}
                      disabled={isLoadingPreferences}
                    />
                  }
                  label='Show email in profile'
                />
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mt: 1 }}
                >
                  Controls whether your email is visible in your profile menu
                </Typography>
              </Box>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings?.privacy.allowMessages ?? false}
                      onChange={(e) => {
                        handlePrivacyChange('allowMessages', e.target.checked);
                      }}
                      disabled={isLoadingPreferences}
                    />
                  }
                  label='Allow direct messages'
                />
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mt: 1 }}
                >
                  {user?.userType === 'store_owner'
                    ? 'Allow customers to message you about orders and products'
                    : 'Allow store owners to message you about orders and products'}
                </Typography>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant='h6' gutterBottom>
              Display Settings
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              Customize your visual preferences and regional settings.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings?.appearance.theme ?? 'auto'}
                    label='Theme'
                    onChange={(e) =>
                      handleAppearanceChange('theme', e.target.value)
                    }
                    disabled={isLoadingPreferences}
                  >
                    <MenuItem value='auto'>Auto (System)</MenuItem>
                    <MenuItem value='light'>Light</MenuItem>
                    <MenuItem value='dark'>Dark</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings?.language.language ?? 'en'}
                    label='Language'
                    onChange={(e) =>
                      handleLanguageChange('language', e.target.value)
                    }
                    disabled={isLoadingPreferences}
                  >
                    <MenuItem value='en'>English</MenuItem>
                    <MenuItem value='es'>Español</MenuItem>
                    <MenuItem value='fr'>Français</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={settings?.language.timezone ?? 'UTC'}
                    label='Timezone'
                    onChange={(e) =>
                      handleLanguageChange('timezone', e.target.value)
                    }
                    disabled={isLoadingPreferences}
                  >
                    <MenuItem value='UTC'>UTC</MenuItem>
                    <MenuItem value='America/New_York'>Eastern Time</MenuItem>
                    <MenuItem value='America/Chicago'>Central Time</MenuItem>
                    <MenuItem value='America/Los_Angeles'>
                      Pacific Time
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Card>
              <CardContent>
                <Typography variant='body2' color='text.secondary'>
                  Theme changes will be applied immediately. Language and
                  timezone settings will affect how dates and times are
                  displayed.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box sx={{ mb: 4 }}>
              {/* Referral Credits Section */}
              <Typography variant='h6' gutterBottom>
                Referral Credits Handling
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Choose how you want to use your referral credits earnings.
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Referral Credits Handling</InputLabel>
                <Select
                  value={settings?.referralCredits.handling ?? 'bank_transfer'}
                  label='Referral Credits Handling'
                  onChange={(e) =>
                    handleReferralCreditsChange('handling', e.target.value)
                  }
                  disabled={isLoadingPreferences}
                >
                  <MenuItem value='bank_transfer'>
                    Bank Transfer Monthly
                  </MenuItem>
                  <MenuItem value='platform_purchases'>
                    Platform Purchases
                  </MenuItem>
                </Select>
              </FormControl>

              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant='body2' color='text.secondary'>
                    {settings?.referralCredits.handling === 'bank_transfer'
                      ? 'Your referral credits will be automatically transferred to your bank account at the end of each month.'
                      : 'Your referral credits will be automatically applied to your future platform purchases during checkout.'}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 4 }}>
              {/* Banking & Payment Section */}
              <PaymentBanking
                userId={user?.userId || ''}
                onSave={(data) => {
                  console.log('Payment settings saved:', data);
                }}
                onError={(error) => {
                  console.error('Payment settings error:', error);
                }}
              />
            </Box>
          </TabPanel>
        </Paper>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant='contained'
            onClick={saveSettings}
            disabled={loading || isLoadingPreferences || !settings}
            size='large'
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default AccountSettingsPage;
