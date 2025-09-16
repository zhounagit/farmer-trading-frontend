import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  People,
  Store,
} from '@mui/icons-material';

interface KPIData {
  value: number;
  change: number;
  label: string;
  format?: 'currency' | 'number' | 'percentage';
}

interface AdminKPICardsProps {
  kpis: Record<string, KPIData>;
  loading?: boolean;
  onCardClick?: (key: string) => void;
}

const getKPIIcon = (key: string) => {
  switch (key) {
    case 'gmv':
    case 'revenue':
    case 'aov':
      return <AttachMoney />;
    case 'orders':
      return <ShoppingCart />;
    case 'customers':
      return <People />;
    case 'stores':
      return <Store />;
    default:
      return <TrendingUp />;
  }
};

const formatKPIValue = (value: number, format?: string): string => {
  switch (format) {
    case 'currency':
      return `$${value.toLocaleString()}`;
    case 'percentage':
      return `${value.toFixed(2)}%`;
    case 'number':
    default:
      return value.toLocaleString();
  }
};

const AdminKPICards: React.FC<AdminKPICardsProps> = ({
  kpis,
  loading = false,
  onCardClick,
}) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(6, 1fr)',
        },
        gap: 3,
      }}
    >
      {Object.entries(kpis).map(([key, kpi]) => (
        <Card
          key={key}
          sx={{
            height: '100%',
            cursor: onCardClick ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
            '&:hover': onCardClick
              ? {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                }
              : {},
            opacity: loading ? 0.7 : 1,
          }}
          onClick={() => onCardClick?.(key)}
        >
          <CardContent>
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='start'
              mb={1}
            >
              <Box display='flex' alignItems='center' gap={1}>
                <Box
                  sx={{
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {getKPIIcon(key)}
                </Box>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  fontWeight={600}
                >
                  {kpi.label}
                </Typography>
              </Box>
              <Chip
                size='small'
                label={`${kpi.change > 0 ? '+' : ''}${kpi.change}%`}
                color={kpi.change > 0 ? 'success' : 'error'}
                variant='filled'
                icon={kpi.change > 0 ? <TrendingUp /> : <TrendingDown />}
              />
            </Box>

            <Typography variant='h4' fontWeight={700} color='primary' mb={1}>
              {formatKPIValue(kpi.value, kpi.format)}
            </Typography>

            <Box display='flex' alignItems='center'>
              <Typography variant='caption' color='text.secondary'>
                vs last period
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default AdminKPICards;
