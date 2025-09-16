import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Settings,
  AttachMoney,
  Error,
  Info,
  Person,
  Store,
  Security,
  Warning,
  Refresh,
  FilterList,
} from '@mui/icons-material';

export interface ActivityLogItem {
  id: string | number;
  timestamp: string;
  action: string;
  type:
    | 'store_approval'
    | 'commission_update'
    | 'payout_processed'
    | 'support_ticket'
    | 'verification_submitted'
    | 'user_registration'
    | 'security_event'
    | 'system_alert';
  userId?: string;
  userName?: string;
  metadata?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface AdminActivityLogProps {
  activities: ActivityLogItem[];
  loading?: boolean;
  onRefresh?: () => void;
  onFilter?: () => void;
  maxItems?: number;
  title?: string;
}

const getActivityIcon = (type: string, severity?: string) => {
  const iconProps = {
    fontSize: 'small' as const,
    ...(severity === 'critical' && { color: 'error' as const }),
    ...(severity === 'high' && { color: 'warning' as const }),
    ...(severity === 'medium' && { color: 'info' as const }),
    ...((!severity || severity === 'low') && { color: 'success' as const }),
  };

  switch (type) {
    case 'store_approval':
      return <CheckCircle {...iconProps} />;
    case 'commission_update':
      return <Settings {...iconProps} />;
    case 'payout_processed':
      return <AttachMoney {...iconProps} />;
    case 'support_ticket':
      return <Error {...iconProps} />;
    case 'verification_submitted':
      return <Info {...iconProps} />;
    case 'user_registration':
      return <Person {...iconProps} />;
    case 'store':
      return <Store {...iconProps} />;
    case 'security_event':
      return <Security {...iconProps} />;
    case 'system_alert':
      return <Warning {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
};

const getSeverityChip = (severity?: string) => {
  if (!severity || severity === 'low') return null;

  const config = {
    critical: { color: 'error' as const, label: 'CRITICAL' },
    high: { color: 'warning' as const, label: 'HIGH' },
    medium: { color: 'info' as const, label: 'MEDIUM' },
  };

  const severityConfig = config[severity as keyof typeof config];
  if (!severityConfig) return null;

  return (
    <Chip
      size='small'
      label={severityConfig.label}
      color={severityConfig.color}
      variant='filled'
      sx={{
        height: 20,
        fontSize: '0.65rem',
        fontWeight: 700,
      }}
    />
  );
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

const AdminActivityLog: React.FC<AdminActivityLogProps> = ({
  activities,
  loading = false,
  onRefresh,
  onFilter,
  maxItems = 10,
  title = 'Recent Activity & Audit Log',
}) => {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6' fontWeight={600}>
            {title}
          </Typography>
          <Box display='flex' gap={1}>
            {onFilter && (
              <Tooltip title='Filter activities'>
                <IconButton size='small' onClick={onFilter}>
                  <FilterList fontSize='small' />
                </IconButton>
              </Tooltip>
            )}
            {onRefresh && (
              <Tooltip title='Refresh activities'>
                <IconButton size='small' onClick={onRefresh} disabled={loading}>
                  <Refresh
                    fontSize='small'
                    sx={{
                      animation: loading ? 'spin 1s linear infinite' : 'none',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {activities.length === 0 ? (
          <Box
            display='flex'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            py={4}
            color='text.secondary'
          >
            <Info sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant='body2'>
              No recent activity to display
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ py: 0 }}>
            {displayedActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem
                  sx={{
                    px: 0,
                    py: 1,
                    alignItems: 'flex-start',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                    {getActivityIcon(activity.type, activity.severity)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display='flex' alignItems='center' gap={1} mb={0.5}>
                        <Typography
                          variant='body2'
                          fontWeight={500}
                          sx={{ flex: 1, lineHeight: 1.4 }}
                        >
                          {activity.action}
                        </Typography>
                        {getSeverityChip(activity.severity)}
                      </Box>
                    }
                    secondary={
                      <Box display='flex' alignItems='center' gap={1}>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ fontWeight: 500 }}
                        >
                          {formatTimestamp(activity.timestamp)}
                        </Typography>
                        {activity.userName && (
                          <>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              •
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              by {activity.userName}
                            </Typography>
                          </>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < displayedActivities.length - 1 && (
                  <Divider sx={{ my: 0.5 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>

      {activities.length > maxItems && (
        <Box
          sx={{
            p: 2,
            pt: 0,
            borderTop: '1px solid',
            borderTopColor: 'divider',
            mt: 'auto',
          }}
        >
          <Typography
            variant='caption'
            color='text.secondary'
            textAlign='center'
            display='block'
          >
            Showing {maxItems} of {activities.length} activities
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default AdminActivityLog;
