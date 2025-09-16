import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Pending,
  AccountBalance,
  Warning,
  GetApp,
  People,
  Store,
  Assessment,
  Settings,
  TrendingUp,
} from '@mui/icons-material';

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
  variant: 'contained' | 'outlined';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  onClick: () => void;
  description?: string;
  urgent?: boolean;
}

interface AdminQuickActionsProps {
  actions?: QuickAction[];
  loading?: boolean;
  title?: string;
}

const defaultActions: QuickAction[] = [
  {
    id: 'review-applications',
    label: 'Review Applications',
    icon: <Pending />,
    count: 5,
    variant: 'contained',
    color: 'warning',
    onClick: () => {},
    description: 'Pending store applications',
    urgent: true,
  },
  {
    id: 'process-payouts',
    label: 'Process Payouts',
    icon: <AccountBalance />,
    count: 3,
    variant: 'contained',
    color: 'info',
    onClick: () => {},
    description: 'Withdrawal requests awaiting processing',
    urgent: true,
  },
  {
    id: 'view-disputes',
    label: 'View Disputes',
    icon: <Warning />,
    count: 2,
    variant: 'contained',
    color: 'error',
    onClick: () => {},
    description: 'Customer disputes requiring attention',
    urgent: true,
  },
  {
    id: 'generate-report',
    label: 'Generate Report',
    icon: <GetApp />,
    variant: 'outlined',
    color: 'primary',
    onClick: () => {},
    description: 'Create platform analytics report',
  },
  {
    id: 'manage-users',
    label: 'Manage Users',
    icon: <People />,
    variant: 'outlined',
    color: 'primary',
    onClick: () => {},
    description: 'User account management',
  },
  {
    id: 'store-overview',
    label: 'Store Overview',
    icon: <Store />,
    variant: 'outlined',
    color: 'primary',
    onClick: () => {},
    description: 'View all registered stores',
  },
  {
    id: 'analytics-dashboard',
    label: 'Analytics Dashboard',
    icon: <Assessment />,
    variant: 'outlined',
    color: 'primary',
    onClick: () => {},
    description: 'Detailed platform analytics',
  },
  {
    id: 'system-settings',
    label: 'System Settings',
    icon: <Settings />,
    variant: 'outlined',
    color: 'primary',
    onClick: () => {},
    description: 'Platform configuration',
  },
];

const AdminQuickActions: React.FC<AdminQuickActionsProps> = ({
  actions = defaultActions,
  loading = false,
  title = 'Quick Actions',
}) => {
  const urgentActions = actions.filter((action) => action.urgent);
  const regularActions = actions.filter((action) => !action.urgent);

  const renderActionButton = (
    action: QuickAction,
    fullWidth: boolean = true
  ) => {
    const buttonContent = (
      <Button
        key={action.id}
        variant={action.variant}
        color={action.color}
        fullWidth={fullWidth}
        onClick={action.onClick}
        disabled={loading}
        startIcon={
          action.count ? (
            <Badge
              badgeContent={action.count}
              color={action.color === 'error' ? 'error' : 'secondary'}
              max={99}
            >
              {action.icon}
            </Badge>
          ) : (
            action.icon
          )
        }
        sx={{
          justifyContent: 'flex-start',
          textAlign: 'left',
          py: 1.5,
          px: 2,
          height: 'auto',
          textTransform: 'none',
          fontWeight: 600,
          ...(action.urgent && {
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.8 },
              '100%': { opacity: 1 },
            },
          }),
        }}
      >
        <Box sx={{ ml: 1 }}>
          {action.label}
          {action.count && ` (${action.count})`}
        </Box>
      </Button>
    );

    if (action.description) {
      return (
        <Tooltip
          key={action.id}
          title={action.description}
          placement='right'
          arrow
        >
          <span>{buttonContent}</span>
        </Tooltip>
      );
    }

    return buttonContent;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          mb={2}
        >
          <Typography variant='h6' fontWeight={600}>
            {title}
          </Typography>
          {urgentActions.length > 0 && (
            <Badge
              badgeContent={urgentActions.reduce(
                (sum, action) => sum + (action.count || 1),
                0
              )}
              color='error'
              max={99}
            >
              <Warning color='error' />
            </Badge>
          )}
        </Box>

        <Box display='flex' flexDirection='column' gap={1.5}>
          {/* Urgent Actions Section */}
          {urgentActions.length > 0 && (
            <>
              <Typography
                variant='subtitle2'
                color='error.main'
                fontWeight={700}
                sx={{ mb: 1 }}
              >
                🚨 Urgent Actions Required
              </Typography>
              {urgentActions.map((action) => renderActionButton(action))}

              {regularActions.length > 0 && (
                <Box sx={{ my: 1 }}>
                  <Typography
                    variant='subtitle2'
                    color='text.secondary'
                    fontWeight={600}
                  >
                    Other Actions
                  </Typography>
                </Box>
              )}
            </>
          )}

          {/* Regular Actions */}
          {regularActions.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1,
              }}
            >
              {regularActions.map((action) => (
                <Box key={action.id}>{renderActionButton(action)}</Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Additional Quick Stats */}
        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: '1px solid',
            borderTopColor: 'divider',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 2,
              textAlign: 'center',
            }}
          >
            <Box>
              <Typography variant='h6' color='primary.main' fontWeight={700}>
                {urgentActions.reduce(
                  (sum, action) => sum + (action.count || 0),
                  0
                )}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Urgent Items
              </Typography>
            </Box>
            <Box>
              <Typography variant='h6' color='success.main' fontWeight={700}>
                {actions.length}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Quick Actions
              </Typography>
            </Box>
            <Box>
              <TrendingUp color='info' />
              <Typography
                variant='caption'
                color='text.secondary'
                display='block'
              >
                Efficiency
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AdminQuickActions;
