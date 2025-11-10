import React, { useState } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import { Search, Close } from '@mui/icons-material';
import type { StorefrontModuleConfig } from '../../../types/storefront';

interface SearchFilterPreviewProps {
  module: StorefrontModuleConfig;
  storeData?: any;
}

const SearchFilterPreview: React.FC<SearchFilterPreviewProps> = ({
  module,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  const settings = (module.settings as Record<string, unknown>) || {};
  const layout = (settings?.layout as string) || 'industrial';
  const searchPlaceholder =
    (settings?.searchPlaceholder as string) || 'Search products...';
  const showFilters = settings?.showFilters !== false;

  const categories = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Herbs'];

  const handleClearFilters = () => {
    setSearchQuery('');
    setPriceRange({ min: 0, max: 1000 });
  };

  if (layout === 'industrial') {
    return (
      <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
        <TextField
          fullWidth
          placeholder={searchPlaceholder as string}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size='small'
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />

        {showFilters && (
          <>
            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 600, mt: 2, mb: 1 }}
            >
              Categories
            </Typography>
            <Stack
              direction='row'
              spacing={1}
              sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}
            >
              {categories.map((cat) => (
                <Chip key={cat} label={cat} variant='outlined' size='small' />
              ))}
            </Stack>

            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
              Price Range
            </Typography>
            <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
              <TextField
                type='number'
                size='small'
                label='Min'
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, min: Number(e.target.value) })
                }
                sx={{ flex: 1 }}
              />
              <Typography sx={{ py: 1 }}>to</Typography>
              <TextField
                type='number'
                size='small'
                label='Max'
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, max: Number(e.target.value) })
                }
                sx={{ flex: 1 }}
              />
            </Stack>

            <Button
              fullWidth
              variant='outlined'
              size='small'
              startIcon={<Close />}
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </>
        )}

        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ mt: 2, display: 'block' }}
        >
          Showing 1-12 of 234 results
        </Typography>
      </Paper>
    );
  }

  if (layout === 'minimal') {
    return (
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          placeholder={searchPlaceholder as string}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size='small'
          sx={{ mb: 2 }}
        />

        {showFilters && (
          <Stack spacing={1}>
            {categories.map((cat) => (
              <Button key={cat} size='small' variant='outlined' fullWidth>
                {cat}
              </Button>
            ))}
          </Stack>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600 }}>
        Find Your Products
      </Typography>

      <TextField
        fullWidth
        placeholder={searchPlaceholder as string}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        size='small'
        sx={{ mb: 2 }}
      />

      {showFilters && (
        <>
          <Typography
            variant='caption'
            sx={{ fontWeight: 600, display: 'block', mt: 2, mb: 1 }}
          >
            Filter by Category
          </Typography>
          <Stack spacing={0.5}>
            {categories.map((cat) => (
              <Typography key={cat} variant='body2' sx={{ py: 0.5 }}>
                ☐ {cat}
              </Typography>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
};

export default SearchFilterPreview;
