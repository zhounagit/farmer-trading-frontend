import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  Drawer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Select,
  MenuItem,
  Slider,
  Chip,
  InputAdornment,
  Dialog,
  DialogContent,
  Fade,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import type {
  StorefrontModule,
  PublicStorefront,
} from '@/features/storefront/types/public-storefront';

interface SearchFilterModuleProps {
  module: StorefrontModule;
  storefront: PublicStorefront;
  onSearchChange?: (searchTerm: string) => void;
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  priceRange: [number, number];
  categories: string[];
  brands: string[];
  availability: string[];
  sortBy: string;
}

const SearchFilterModule: React.FC<SearchFilterModuleProps> = ({
  module,
  storefront,
  onSearchChange,
}) => {
  const settings = module.settings || {};

  // Module settings
  const layout = (settings.layout as string) || 'industrial'; // industrial, farm, artist, minimalist, brutalist, luxe, playful, vintage
  const searchPlaceholder =
    (settings.searchPlaceholder as string) || 'Search products...';
  const showFilters = (settings.showFilters as boolean) !== false;
  const showSorting = (settings.showSorting as boolean) !== false;
  const persistentSearch = (settings.persistentSearch as boolean) !== false;

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000],
    categories: [],
    brands: [],
    availability: [],
    sortBy: 'relevance',
  });

  // Mock data - in real implementation, this would come from props/API
  const mockCategories = ['Vegetables', 'Fruits', 'Grains', 'Herbs', 'Dairy'];
  const mockBrands = ['Fresh Farm Co', 'Organic Valley', 'Local Harvest'];
  const mockAvailability = ['In Stock', 'Low Stock', 'Pre-order'];
  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);

    // Debug logging
    console.log('🔍 DEBUG - SearchFilterModule search term changed:', {
      searchTerm: newSearchTerm,
      storefrontProducts: storefront.products?.length || 0,
      sampleProduct: storefront.products?.[0] || null,
    });

    // Enhanced product filtering with better search criteria
    if (newSearchTerm) {
      const products = storefront.products || [];
      const query = newSearchTerm.toLowerCase();
      const filtered = products.filter((product: any) => {
        // Multi-field search with relevance scoring
        const searchFields = [
          product.productName,
          product.itemName,
          product.name,
          product.description,
          product.sku,
          product.categories?.map((cat: any) => cat.name).join(' '),
        ].filter(Boolean);

        return searchFields.some((field) =>
          field?.toLowerCase().includes(query)
        );
      });

      console.log('🔍 DEBUG - SearchFilterModule filtered results:', {
        originalCount: products.length,
        filteredCount: filtered.length,
        searchTerm: newSearchTerm,
        query,
      });

      // Communicate filtered results to parent component
      if (onSearchChange) {
        onSearchChange(newSearchTerm);
      }
    } else {
      // Clear search - show all products
      if (onSearchChange) {
        onSearchChange('');
      }
    }
  };

  const handleFilterChange = (
    filterType: keyof FilterState,
    value: string[] | [number, number] | string | number[]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 1000],
      categories: [],
      brands: [],
      availability: [],
      sortBy: 'relevance',
    });
  };

  const getActiveFilterCount = () => {
    return (
      filters.categories.length +
      filters.brands.length +
      filters.availability.length +
      (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000 ? 1 : 0)
    );
  };

  // Style-specific components
  const renderIndustrialLayout = () => (
    <Box
      sx={{
        backgroundColor: '#F8FAFC',
        py: 2,
        position: persistentSearch ? 'sticky' : 'static',
        top: 0,
        zIndex: 100,
        borderBottom: '2px solid #E2E8F0',
      }}
    >
      <Container maxWidth='xl'>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            fullWidth
            variant='outlined'
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && onSearchChange) {
                onSearchChange(searchTerm);
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon sx={{ color: '#64748B' }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position='end'>
                  <IconButton
                    size='small'
                    onClick={() => {
                      setSearchTerm('');
                      if (onSearchChange) {
                        onSearchChange('');
                      }
                    }}
                  >
                    <CloseIcon sx={{ color: '#64748B' }} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#CBD5E1' },
                  '&:hover fieldset': { borderColor: '#94A3B8' },
                  '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
                },
              },
            }}
          />

          {showFilters && (
            <Button
              variant='outlined'
              startIcon={<TuneIcon />}
              onClick={() => setFiltersOpen(true)}
              sx={{
                minWidth: '160px',
                backgroundColor: 'white',
                borderColor: '#CBD5E1',
                color: '#374151',
                '&:hover': { borderColor: '#94A3B8' },
              }}
            >
              Filter & Sort
              {getActiveFilterCount() > 0 && (
                <Chip
                  size='small'
                  label={getActiveFilterCount()}
                  sx={{
                    ml: 1,
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    minWidth: '20px',
                  }}
                />
              )}
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );

  const renderFarmLayout = () => (
    <Container maxWidth='xl' sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Always-visible sidebar */}
        <Box sx={{ width: 280, display: { xs: 'none', md: 'block' } }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: '#FEF7ED',
              border: '1px solid #FED7AA',
              borderRadius: '12px',
            }}
          >
            <Typography
              variant='h6'
              gutterBottom
              sx={{ color: '#9A3412', fontWeight: 600 }}
            >
              Find Your Fresh Favorites
            </Typography>

            <TextField
              fullWidth
              variant='outlined'
              placeholder='Search our harvest...'
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && onSearchChange) {
                  onSearchChange(searchTerm);
                }
              }}
              size='small'
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon sx={{ color: '#A3A3A3' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position='end'>
                    <IconButton
                      size='small'
                      onClick={() => {
                        setSearchTerm('');
                        if (onSearchChange) {
                          onSearchChange('');
                        }
                      }}
                    >
                      <CloseIcon sx={{ color: '#A3A3A3' }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {showFilters && (
              <>
                <Typography
                  variant='subtitle2'
                  gutterBottom
                  sx={{ color: '#7C2D12', fontWeight: 600 }}
                >
                  🌱 Harvest Type
                </Typography>
                <FormGroup sx={{ mb: 2 }}>
                  {mockCategories.map((category) => (
                    <FormControlLabel
                      key={category}
                      control={
                        <Checkbox
                          checked={filters.categories.includes(category)}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...filters.categories, category]
                              : filters.categories.filter(
                                  (c) => c !== category
                                );
                            handleFilterChange('categories', newCategories);
                          }}
                          sx={{ '&.Mui-checked': { color: '#DC2626' } }}
                        />
                      }
                      label={category}
                    />
                  ))}
                </FormGroup>

                <Typography
                  variant='subtitle2'
                  gutterBottom
                  sx={{ color: '#7C2D12', fontWeight: 600 }}
                >
                  🚜 Farm Source
                </Typography>
                <FormGroup sx={{ mb: 2 }}>
                  {mockBrands.map((brand) => (
                    <FormControlLabel
                      key={brand}
                      control={
                        <Checkbox
                          checked={filters.brands.includes(brand)}
                          onChange={(e) => {
                            const newBrands = e.target.checked
                              ? [...filters.brands, brand]
                              : filters.brands.filter((b) => b !== brand);
                            handleFilterChange('brands', newBrands);
                          }}
                          sx={{ '&.Mui-checked': { color: '#DC2626' } }}
                        />
                      }
                      label={brand}
                    />
                  ))}
                </FormGroup>
              </>
            )}
          </Paper>
        </Box>

        {/* Main content area indicator */}
        <Box sx={{ flex: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            Search results and products would appear here...
          </Typography>
        </Box>
      </Box>
    </Container>
  );

  const renderArtistLayout = () => (
    <Box sx={{ position: 'relative' }}>
      {/* Minimalist search icon */}
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <IconButton
          onClick={() => setSearchExpanded(true)}
          sx={{
            backgroundColor: 'rgba(0,0,0,0.05)',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' },
          }}
        >
          <SearchIcon />
        </IconButton>
      </Box>

      {/* Overlay search */}
      <Dialog
        open={searchExpanded}
        onClose={() => setSearchExpanded(false)}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            p: 4,
          },
        }}
      >
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TextField
              fullWidth
              variant='standard'
              placeholder='Discover art...'
              value={searchTerm}
              onChange={handleSearchChange}
              autoFocus
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: '2rem',
                  '& input': { textAlign: 'center' },
                },
              }}
            />
            <IconButton onClick={() => setSearchExpanded(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {showFilters && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Button variant='text' size='small'>
                Medium
              </Button>
              <Button variant='text' size='small'>
                Size
              </Button>
              <Button variant='text' size='small'>
                Color
              </Button>
              <Button variant='text' size='small'>
                Price
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );

  const renderMinimalistLayout = () => (
    <Container maxWidth='xl' sx={{ py: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <TextField
          variant='standard'
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon sx={{ color: '#9CA3AF', fontSize: '1.2rem' }} />
              </InputAdornment>
            ),
            sx: {
              borderBottom: '1px solid #E5E7EB',
              '&:hover': { borderBottomColor: '#D1D5DB' },
              '&.Mui-focused': { borderBottomColor: '#6B7280' },
            },
          }}
          sx={{ minWidth: '300px' }}
        />

        {showSorting && (
          <FormControl variant='standard' sx={{ minWidth: 120 }}>
            <Select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              disableUnderline
              sx={{
                '&:before, &:after': { display: 'none' },
                '& .MuiSelect-select': { color: '#6B7280' },
              }}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {showFilters && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {mockCategories.map((category) => (
            <Button
              key={category}
              variant='text'
              size='small'
              onClick={() => {
                const newCategories = filters.categories.includes(category)
                  ? filters.categories.filter((c) => c !== category)
                  : [...filters.categories, category];
                handleFilterChange('categories', newCategories);
              }}
              sx={{
                textDecoration: filters.categories.includes(category)
                  ? 'underline'
                  : 'none',
                color: filters.categories.includes(category)
                  ? '#000'
                  : '#6B7280',
                textTransform: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {category}
            </Button>
          ))}
        </Box>
      )}
    </Container>
  );

  const renderBrutalistLayout = () => (
    <Container maxWidth='xl' sx={{ py: 3 }}>
      <Box sx={{ border: '4px solid #000', p: 3, backgroundColor: '#FFF' }}>
        <TextField
          fullWidth
          variant='outlined'
          placeholder={searchPlaceholder.toUpperCase()}
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            sx: {
              fontFamily: 'monospace',
              backgroundColor: '#F0F0F0',
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#000', borderWidth: '2px' },
                '&:hover fieldset': { borderColor: '#000' },
                '&.Mui-focused fieldset': { borderColor: '#000' },
              },
            },
          }}
          sx={{ mb: 3 }}
        />

        {showFilters && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 2,
              p: 2,
              backgroundColor: '#E0E0E0',
              border: '2px solid #000',
            }}
          >
            <Box>
              <Typography
                variant='h6'
                sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
              >
                CATEGORY
              </Typography>
              <FormGroup>
                {mockCategories.map((category) => (
                  <FormControlLabel
                    key={category}
                    control={
                      <Checkbox
                        checked={filters.categories.includes(category)}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...filters.categories, category]
                            : filters.categories.filter((c) => c !== category);
                          handleFilterChange('categories', newCategories);
                        }}
                        sx={{
                          color: '#000',
                          '&.Mui-checked': { color: '#000' },
                        }}
                      />
                    }
                    label={category.toUpperCase()}
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontFamily: 'monospace',
                      },
                    }}
                  />
                ))}
              </FormGroup>
            </Box>

            <Box>
              <Typography
                variant='h6'
                sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
              >
                PRICE
              </Typography>
              <Box sx={{ px: 2, py: 1 }}>
                <Slider
                  value={filters.priceRange}
                  onChange={(_, newValue) =>
                    handleFilterChange(
                      'priceRange',
                      newValue as [number, number]
                    )
                  }
                  valueLabelDisplay='auto'
                  min={0}
                  max={1000}
                  sx={{
                    color: '#000',
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#000',
                      border: '2px solid #FFF',
                      '&:hover, &.Mui-focusVisible': { boxShadow: 'none' },
                    },
                    '& .MuiSlider-track': { backgroundColor: '#000' },
                    '& .MuiSlider-rail': { backgroundColor: '#CCC' },
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );

  const renderLuxeLayout = () => (
    <Box>
      {/* Elegant header with search icon */}
      <Container maxWidth='xl' sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton
            onClick={() => setSearchExpanded(true)}
            sx={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '50%',
              p: 2,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.05)',
                transform: 'scale(1.05)',
                transition: 'all 0.2s ease',
              },
            }}
          >
            <SearchIcon sx={{ fontSize: '1.5rem' }} />
          </IconButton>
        </Box>
      </Container>

      {/* Elegant overlay */}
      <Dialog
        open={searchExpanded}
        onClose={() => setSearchExpanded(false)}
        maxWidth='sm'
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            p: 4,
          },
        }}
      >
        <DialogContent>
          <TextField
            fullWidth
            variant='standard'
            placeholder='Search our collection...'
            value={searchTerm}
            onChange={handleSearchChange}
            autoFocus
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: '1.5rem',
                fontWeight: 300,
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                pb: 1,
              },
            }}
            sx={{ mb: 4 }}
          />

          {showFilters && (
            <Box sx={{ pt: 2, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <Button
                fullWidth
                variant='outlined'
                startIcon={<TuneIcon />}
                onClick={() => setFiltersOpen(true)}
                sx={{
                  borderColor: 'rgba(0,0,0,0.1)',
                  color: '#333',
                  textTransform: 'none',
                  py: 1.5,
                  '&:hover': {
                    borderColor: 'rgba(0,0,0,0.2)',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                  },
                }}
              >
                Refine Search
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );

  // Common filter drawer for layouts that use it
  const renderFilterDrawer = () => (
    <Drawer
      anchor='right'
      open={filtersOpen}
      onClose={() => setFiltersOpen(false)}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          p: 3,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h6'>Filters & Sorting</Typography>
        <IconButton onClick={() => setFiltersOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Sort Options */}
      {showSorting && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant='subtitle1'>Sort By</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth>
              <Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Price Range */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant='subtitle1'>Price Range</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 1 }}>
            <Slider
              value={filters.priceRange}
              onChange={(_, newValue) =>
                handleFilterChange('priceRange', newValue as [number, number])
              }
              valueLabelDisplay='auto'
              min={0}
              max={1000}
              marks={[
                { value: 0, label: '$0' },
                { value: 500, label: '$500' },
                { value: 1000, label: '$1000' },
              ]}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Categories */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant='subtitle1'>Categories</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {mockCategories.map((category) => (
              <FormControlLabel
                key={category}
                control={
                  <Checkbox
                    checked={filters.categories.includes(category)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...filters.categories, category]
                        : filters.categories.filter((c) => c !== category);
                      handleFilterChange('categories', newCategories);
                    }}
                  />
                }
                label={category}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Availability */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant='subtitle1'>Availability</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {mockAvailability.map((status) => (
              <FormControlLabel
                key={status}
                control={
                  <Checkbox
                    checked={filters.availability.includes(status)}
                    onChange={(e) => {
                      const newAvailability = e.target.checked
                        ? [...filters.availability, status]
                        : filters.availability.filter((s) => s !== status);
                      handleFilterChange('availability', newAvailability);
                    }}
                  />
                }
                label={status}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Clear Filters */}
      <Box sx={{ mt: 3 }}>
        <Button
          fullWidth
          variant='outlined'
          onClick={clearFilters}
          disabled={getActiveFilterCount() === 0}
        >
          Clear All Filters ({getActiveFilterCount()})
        </Button>
      </Box>
    </Drawer>
  );

  // Render based on layout setting
  const renderLayout = () => {
    switch (layout) {
      case 'farm':
        return renderFarmLayout();
      case 'artist':
        return renderArtistLayout();
      case 'minimalist':
        return renderMinimalistLayout();
      case 'brutalist':
        return renderBrutalistLayout();
      case 'luxe':
        return renderLuxeLayout();
      case 'industrial':
      default:
        return renderIndustrialLayout();
    }
  };

  return (
    <Box>
      {renderLayout()}
      {renderFilterDrawer()}
    </Box>
  );
};

export default SearchFilterModule;
