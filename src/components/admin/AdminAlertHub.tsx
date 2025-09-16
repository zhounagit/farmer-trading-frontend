import React from 'react';
import {
  Paper,
  Typography,
  Alert,
  AlertTitle,
  Button,
  Box,
  Badge,
  IconButton,
} from '@mui/material';
import {
  Warning,
  Pending,
  Error,
  Info,
  AttachMoney,
  Support,
  Refresh,
} from '@mui/icons-material';

export interface AlertItem {
  id: string | number;
  type: 'pending' | 'withdrawal' | 'support' | 'system' | 'security';
  title: string;
  count: number;
  value?: number;
  description: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AdminAlertHubProps {
  alerts: AlertItem[];
  loading?: boolean;
  onRefresh?: () => void;
  lastUpdated?: Date;
}

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'pending':
      return <Pending />;
    case 'withdrawal':
      return <AttachMoney />;
    case 'support':
      return <Support />;
    case 'system':
      return <Error />;
    case 'security':
      return <Warning />;
    default:
      return <Info />;
  }
};

const AdminAlertHub: React.FC<AdminAlertHubProps> = ({
  alerts,
  loading = false,
  onRefresh,
  lastUpdated,
}) => {
  const totalAlerts = alerts.reduce((sum, alert) => sum + alert.count, 0);
  const criticalAlerts = alerts.filter(
    (alert) => alert.severity === 'error'
  ).length;

  return (
    <Paper
      sx={{
        p: 3,
        mb: 4,
        bgcolor: totalAlerts > 0 ? '#fff3e0' : '#f3f4f6',
        border: totalAlerts > 0 ? '2px solid #ff9800' : '1px solid #e0e0e0',
        borderRadius: 2,
        position: 'relative',
      }}
    >
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={2}
      >
        <Box display='flex' alignItems='center' gap={2}>
          <Badge
            badgeContent={totalAlerts}
            color={criticalAlerts > 0 ? 'error' : 'warning'}
            max={99}
          >
            <Warning
              sx={{
                fontSize: 32,
                color: totalAlerts > 0 ? '#e65100' : '#757575',
              }}
            />
          </Badge>
          <Box>
            <Typography
              variant='h6'
              gutterBottom
              color={totalAlerts > 0 ? '#e65100' : '#424242'}
              fontWeight={600}
            >
              🚨 Alert Center - Urgent Items Requiring Attention
            </Typography>
            {lastUpdated && (
              <Typography variant='caption' color='text.secondary'>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        </Box>

        {onRefresh && (
          <IconButton
            onClick={onRefresh}
            disabled={loading}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            <Refresh
              sx={{
                animation: loading ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': {
                    transform: 'rotate(0deg)',
                  },
                  '100%': {
                    transform: 'rotate(360deg)',
                  },
                },
              }}
            />
          </IconButton>
        )}
      </Box>

      {alerts.length === 0 ? (
        <Alert severity='success' sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
          <AlertTitle>All Clear!</AlertTitle>
          No urgent items requiring attention at this time.
        </Alert>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
          }}
        >
          {alerts.map((alert) => (
            <Box key={alert.id} sx={{ flex: 1, minWidth: 0 }}>
              <Alert
                severity={alert.severity}
                icon={getAlertIcon(alert.type)}
                action={
                  alert.action ? (
                    <Button
                      size='small'
                      variant='outlined'
                      onClick={alert.action.onClick}
                      sx={{
                        borderColor: 'currentColor',
                        color: 'inherit',
                        '&:hover': {
                          borderColor: 'currentColor',
                          bgcolor: 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      {alert.action.label}
                    </Button>
                  ) : (
                    <Button size='small' variant='outlined'>
                      Review
                    </Button>
                  )
                }
                sx={{
                  height: '100%',
                  '& .MuiAlert-message': {
                    width: '100%',
                  },
                }}
              >
                <AlertTitle>
                  <Box
                    display='flex'
                    alignItems='center'
                    justifyContent='space-between'
                  >
                    <span>{alert.title}</span>
                    <Badge
                      badgeContent={alert.count}
                      color={alert.severity === 'error' ? 'error' : 'primary'}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  {alert.value && (
                    <Typography variant='subtitle2' fontWeight={500} mt={0.5}>
                      Total Value: ${alert.value.toLocaleString()}
                    </Typography>
                  )}
                </AlertTitle>
                <Typography variant='body2'>{alert.description}</Typography>
              </Alert>
            </Box>
          ))}
        </Box>
      )}

      {/* Summary Stats */}
      {alerts.length > 0 && (
        <Box
          mt={2}
          pt={2}
          sx={{
            borderTop: '1px solid',
            borderTopColor: 'divider',
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Box textAlign='center'>
            <Typography variant='h6' color='error.main' fontWeight={700}>
              {criticalAlerts}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Critical
            </Typography>
          </Box>
          <Box textAlign='center'>
            <Typography variant='h6' color='warning.main' fontWeight={700}>
              {alerts.filter((a) => a.severity === 'warning').length}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Warning
            </Typography>
          </Box>
          <Box textAlign='center'>
            <Typography variant='h6' color='primary.main' fontWeight={700}>
              {totalAlerts}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Total Items
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default AdminAlertHub;
