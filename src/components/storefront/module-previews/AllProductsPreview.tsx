import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Stack,
} from '@mui/material';
import type { StorefrontModuleConfig } from '../../../types/storefront';
import type { Store } from '../../../shared/types/store';

interface AllProductsPreviewProps {
  module: StorefrontModuleConfig;
  storeData: Store | null;
}

const AllProductsPreview: React.FC<AllProductsPreviewProps> = ({
  storeData,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [currentPage]);

  if (!storeData) {
    return <Alert severity='warning'>Store information not available</Alert>;
  }

  // Mock products for preview
  const mockProducts = [
    {
      id: 1,
      name: 'Fresh Tomatoes',
      price: 4.99,
      description: 'Organic red tomatoes',
    },
    {
      id: 2,
      name: 'Carrots',
      price: 3.49,
      description: 'Fresh orange carrots',
    },
    { id: 3, name: 'Lettuce', price: 2.99, description: 'Crisp green lettuce' },
    { id: 4, name: 'Peppers', price: 5.99, description: 'Mixed color peppers' },
    {
      id: 5,
      name: 'Broccoli',
      price: 4.49,
      description: 'Fresh green broccoli',
    },
    { id: 6, name: 'Spinach', price: 3.99, description: 'Organic spinach' },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 2,
          mb: 3,
        }}
      >
        {mockProducts.map((product) => (
          <Card key={product.id}>
            <CardContent>
              <Typography variant='subtitle2' noWrap sx={{ fontWeight: 600 }}>
                {product.name}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                {product.description}
              </Typography>
              <Typography variant='h6' color='primary' sx={{ fontWeight: 600 }}>
                ${product.price.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Stack direction='row' spacing={1} sx={{ justifyContent: 'center' }}>
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </Button>
        <Typography sx={{ py: 1, px: 2 }}>Page {currentPage}</Typography>
        <Button onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
      </Stack>
    </Box>
  );
};

export default AllProductsPreview;
