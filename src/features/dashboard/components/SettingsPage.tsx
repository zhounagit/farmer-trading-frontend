import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>(
    'idle'
  );

  const [settings, setSettings] = useState({
    notifications: {
      emailUpdates: true,
      pushNotifications: true,
      marketingEmails: false,
    },
    privacy: {
      profileVisibility: 'private',
      showEmail: false,
      allowMessages: true,
    },
    appearance: {
      theme: 'auto',
    },
    language: {
      language: 'en',
      timezone: 'UTC',
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNotificationChange = (setting: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [setting]: value,
      },
    }));
  };

  const handlePrivacyChange = (setting: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [setting]: value,
      },
    }));
  };

  const handleAppearanceChange = (setting: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [setting]: value,
      },
    }));
  };

  const handleLanguageChange = (setting: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      language: {
        ...prev.language,
        [setting]: value,
      },
    }));
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setSaveStatus('idle');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {/* Navigation Header */}
      <Box sx={{ mb: 4 }}>
        {/* Breadcrumb Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <Button
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Home
          </Button>
          <Typography variant='body2' color='text.secondary'>
            /
          </Typography>
          <Button
            onClick={() => navigate('/dashboard')}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Dashboard
          </Button>
          <Typography variant='body2' color='text.secondary'>
            /
          </Typography>
          <Typography variant='body2' color='text.primary' fontWeight={600}>
            Settings
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ textTransform: 'none' }}
            variant='outlined'
          >
            Back
          </Button>
          <Button
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ textTransform: 'none' }}
            variant='outlined'
          >
            Dashboard
          </Button>
        </Box>

        <Typography variant='h4' component='h1' gutterBottom>
          Settings
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

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label='settings tabs'
          >
            <Tab
              icon={<NotificationsIcon />}
              iconPosition='start'
              label='Notifications'
              id='settings-tab-0'
            />
            <Tab
              icon={<SecurityIcon />}
              iconPosition='start'
              label='Privacy'
              id='settings-tab-1'
            />
            <Tab
              icon={<PaletteIcon />}
              iconPosition='start'
              label='Appearance'
              id='settings-tab-2'
            />
            <Tab
              icon={<LanguageIcon />}
              iconPosition='start'
              label='Language & Region'
              id='settings-tab-3'
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant='h6' gutterBottom>
            Notification Preferences
          </Typography>
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.emailUpdates}
                  onChange={(e) =>
                    handleNotificationChange('emailUpdates', e.target.checked)
                  }
                />
              }
              label='Email notifications'
            />
          </Box>
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onChange={(e) =>
                    handleNotificationChange(
                      'pushNotifications',
                      e.target.checked
                    )
                  }
                />
              }
              label='Push notifications'
            />
          </Box>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.marketingEmails}
                  onChange={(e) =>
                    handleNotificationChange(
                      'marketingEmails',
                      e.target.checked
                    )
                  }
                />
              }
              label='Marketing emails'
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant='h6' gutterBottom>
            Privacy Settings
          </Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Profile Visibility</InputLabel>
            <Select
              value={settings.privacy.profileVisibility}
              label='Profile Visibility'
              onChange={(e) =>
                handlePrivacyChange('profileVisibility', e.target.value)
              }
            >
              <MenuItem value='public'>Public</MenuItem>
              <MenuItem value='private'>Private</MenuItem>
              <MenuItem value='contacts_only'>Contacts Only</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.privacy.showEmail}
                  onChange={(e) =>
                    handlePrivacyChange('showEmail', e.target.checked)
                  }
                />
              }
              label='Show email in profile'
            />
          </Box>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.privacy.allowMessages}
                  onChange={(e) =>
                    handlePrivacyChange('allowMessages', e.target.checked)
                  }
                />
              }
              label='Allow direct messages'
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant='h6' gutterBottom>
            Appearance Settings
          </Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Theme</InputLabel>
            <Select
              value={settings.appearance.theme}
              label='Theme'
              onChange={(e) => handleAppearanceChange('theme', e.target.value)}
            >
              <MenuItem value='auto'>Auto (System)</MenuItem>
              <MenuItem value='light'>Light</MenuItem>
              <MenuItem value='dark'>Dark</MenuItem>
            </Select>
          </FormControl>

          <Card>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                Theme changes will be applied immediately.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language.language}
                  label='Language'
                  onChange={(e) =>
                    handleLanguageChange('language', e.target.value)
                  }
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
                  value={settings.language.timezone}
                  label='Timezone'
                  onChange={(e) =>
                    handleLanguageChange('timezone', e.target.value)
                  }
                >
                  <MenuItem value='UTC'>UTC</MenuItem>
                  <MenuItem value='America/New_York'>Eastern Time</MenuItem>
                  <MenuItem value='America/Chicago'>Central Time</MenuItem>
                  <MenuItem value='America/Los_Angeles'>Pacific Time</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </TabPanel>
      </Paper>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant='contained'
          onClick={saveSettings}
          disabled={loading}
          size='large'
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </Container>
  );
};

export default SettingsPage;
