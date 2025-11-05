import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Drawer,
  IconButton,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  Checkbox,
  FormGroup,
  Divider,
  Paper,
  Skeleton,
  Alert,
  Badge,
  Stack,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList,
  ViewList,
  GridView,
  Close,
  Store,
  Category,
  TrendingUp,
  LocalOffer,
} from '@mui/icons-material';
import { debounce } from '@/utils/debounce';
import Header from '../../../components/layout/Header';
import StorefrontApiService, {
  type SearchResult,
  type SearchFacets,
  type SearchSuggestion,
} from '../services/storefront.api';
import { imageUtils } from '@/utils/api';

interface SearchFilters {
  category?: string;
  location?: string;
  store?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  entityTypes: string[];
}

const UnifiedSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [facets, setFacets] = useState<SearchFacets>({
    categories: [],
    stores: [],
    locations: [],
    priceRange: { min: 0, max: 1000, avgPrice: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popularTerms, setPopularTerms] = useState<string[]>([]);

  // Pagination and display
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');

  // Filters
  const [filters, setFilters] = useState<SearchFilters>({
    entityTypes: ['product'],
  });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [searchTimeMs, setSearchTimeMs] = useState(0);

  // Initialize from URL parameters
  useEffect(() => {
    const queryFromUrl = searchParams.get('q') || searchParams.get('search');
    const categoryFromUrl = searchParams.get('category');
    const locationFromUrl = searchParams.get('location');
    const storeFromUrl = searchParams.get('store');
    const sortFromUrl = searchParams.get('sort');
    const pageFromUrl = searchParams.get('page');
    const entityTypesFromUrl = searchParams.get('entityTypes');

    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
    }

    if (categoryFromUrl || locationFromUrl || storeFromUrl) {
      setFilters((prev) => ({
        ...prev,
        category: categoryFromUrl || undefined,
        location: locationFromUrl || undefined,
        store: storeFromUrl || undefined,
      }));
    }

    if (sortFromUrl) {
      setSortBy(sortFromUrl);
    }

    if (pageFromUrl && !isNaN(Number(pageFromUrl))) {
      setCurrentPage(Number(pageFromUrl));
    }

    if (entityTypesFromUrl) {
      const types = entityTypesFromUrl.split(',');
      setFilters((prev) => ({ ...prev, entityTypes: types }));
    }
  }, [searchParams]);

  // Load popular search terms
  useEffect(() => {
    const loadPopularTerms = async () => {
      try {
        const response = await StorefrontApiService.getPopularSearchTerms(10);
        setPopularTerms(response.terms);
      } catch (error) {
        console.error('Failed to load popular search terms:', error);
        // Set empty terms on error to prevent UI issues
        setPopularTerms([]);
      }
    };

    loadPopularTerms();
  }, []);

  // Debounced search suggestions
  const debouncedGetSuggestions = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.trim().length < 2) {
          setSuggestions([]);
          return;
        }

        try {
          const response = await StorefrontApiService.getSearchSuggestions({
            query: query.trim(),
            limit: 8,
            entityTypes: filters.entityTypes,
          });
          setSuggestions(response.suggestions);
        } catch (error) {
          console.error('Failed to get search suggestions:', error);
          setSuggestions([]);
        }
      }, 300),
    [filters.entityTypes]
  );

  // Handle search input change
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      debouncedGetSuggestions(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Perform search
  const performSearch = async () => {
    if (!searchQuery.trim() && !hasActiveFilters()) {
      return;
    }

    setLoading(true);
    setError(null);
    setShowSuggestions(false);

    try {
      const response = await StorefrontApiService.unifiedSearch({
        query: searchQuery.trim() || undefined,
        category: filters.category,
        location: filters.location,
        store: filters.store,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        inStock: filters.inStock,
        sortBy,
        entityTypes: filters.entityTypes,
        page: currentPage,
        limit: 20,
      });

      setResults(response.results);
      setFacets(response.facets);
      setTotalResults(response.total);
      setTotalPages(response.totalPages);
      setSearchTimeMs(response.searchTimeMs);

      // Update URL
      updateSearchParams();
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again.');
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  // Update URL parameters
  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (filters.category) params.set('category', filters.category);
    if (filters.location) params.set('location', filters.location);
    if (filters.store) params.set('store', filters.store);
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    if (currentPage !== 1) params.set('page', currentPage.toString());
    if (
      filters.entityTypes.length !== 1 ||
      filters.entityTypes[0] !== 'product'
    ) {
      params.set('entityTypes', filters.entityTypes.join(','));
    }

    setSearchParams(params);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return !!(
      filters.category ||
      filters.location ||
      filters.store ||
      filters.priceMin ||
      filters.priceMax ||
      filters.inStock ||
      filters.entityTypes.length !== 1 ||
      filters.entityTypes[0] !== 'product'
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ entityTypes: ['product'] });
    setCurrentPage(1);
  };

  // Execute search when dependencies change
  useEffect(() => {
    if (searchQuery.trim() || hasActiveFilters()) {
      performSearch();
    }
  }, [searchQuery, filters, sortBy, currentPage]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);

    // If it's a store or category, navigate directly
    if (suggestion.type === 'store' && suggestion.id) {
      navigate(`/storefront/${suggestion.id}`);
      return;
    }

    if (suggestion.type === 'category') {
      setFilters((prev) => ({ ...prev, category: suggestion.text }));
    }
  };

  // Handle popular term click
  const handlePopularTermClick = (term: string) => {
    setSearchQuery(term);
    setShowSuggestions(false);
  };

  // Render search result card
  const renderSearchResult = (result: SearchResult, index: number) => {
    const isProduct = result.type === 'product';
    const isStore = result.type === 'store';
    const isCategory = result.type === 'category';

    return (
      <Grid
        key={`${result.type}-${result.id}-${index}`}
        size={{
          xs: 12,
          sm: viewMode === 'grid' ? 6 : 12,
          md: viewMode === 'grid' ? 4 : 12,
        }}
      >
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: viewMode === 'list' ? 'row' : 'column',
            transition: 'all 0.2s ease-in-out',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            },
          }}
          onClick={() => {
            if (isStore) {
              navigate(`/store/${result.id}`);
            } else if (isProduct) {
              navigate(`/product/${result.id}`, {
                state: {
                  from: location.pathname + location.search,
                  backLabel: 'Back to Search Results',
                },
              });
            } else if (isCategory) {
              setFilters((prev) => ({ ...prev, category: result.title }));
            }
          }}
        >
          {result.imageUrl && (
            <CardMedia
              component='img'
              sx={{
                width: viewMode === 'list' ? 120 : '100%',
                height: viewMode === 'list' ? 120 : 200,
                objectFit: 'cover',
              }}
              image={imageUtils.getImageUrl(result.imageUrl)}
              alt={result.title}
            />
          )}

          <CardContent sx={{ flex: 1, p: 2 }}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isProduct && (
                  <LocalOffer
                    sx={{ color: 'primary.main', fontSize: '1rem' }}
                  />
                )}
                {isStore && (
                  <Store sx={{ color: 'secondary.main', fontSize: '1rem' }} />
                )}
                {isCategory && (
                  <Category sx={{ color: 'info.main', fontSize: '1rem' }} />
                )}

                <Chip
                  label={result.type}
                  size='small'
                  variant='outlined'
                  color={isProduct ? 'primary' : isStore ? 'secondary' : 'info'}
                />
              </Box>

              <Typography variant='h6' component='h3' sx={{ fontWeight: 600 }}>
                {result.title}
              </Typography>

              {result.description && (
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {result.description}
                </Typography>
              )}

              <Stack
                direction='row'
                spacing={1}
                sx={{ flexWrap: 'wrap' }}
              ></Stack>

              {isProduct && result.price && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant='h6'
                    color='primary.main'
                    sx={{ fontWeight: 600 }}
                  >
                    ${result.price}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  // Render filter drawer
  const renderFilterDrawer = () => (
    <Drawer
      anchor='right'
      open={filterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: 350,
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
        <Typography variant='h6'>Filters</Typography>
        <IconButton onClick={() => setFilterDrawerOpen(false)}>
          <Close />
        </IconButton>
      </Box>

      <Stack spacing={3}>
        {/* Entity Types */}
        <FormControl>
          <FormLabel>Search In</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.entityTypes.includes('product')}
                  onChange={(e) => {
                    const types = e.target.checked
                      ? [...filters.entityTypes, 'product']
                      : filters.entityTypes.filter((t) => t !== 'product');
                    setFilters((prev) => ({ ...prev, entityTypes: types }));
                  }}
                />
              }
              label='Products'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.entityTypes.includes('store')}
                  onChange={(e) => {
                    const types = e.target.checked
                      ? [...filters.entityTypes, 'store']
                      : filters.entityTypes.filter((t) => t !== 'store');
                    setFilters((prev) => ({ ...prev, entityTypes: types }));
                  }}
                />
              }
              label='Stores'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.entityTypes.includes('category')}
                  onChange={(e) => {
                    const types = e.target.checked
                      ? [...filters.entityTypes, 'category']
                      : filters.entityTypes.filter((t) => t !== 'category');
                    setFilters((prev) => ({ ...prev, entityTypes: types }));
                  }}
                />
              }
              label='Categories'
            />
          </FormGroup>
        </FormControl>

        <Divider />

        {/* Category Filter */}
        {facets.categories.length > 0 && (
          <FormControl>
            <FormLabel>Category</FormLabel>
            <RadioGroup
              value={filters.category || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  category: e.target.value || undefined,
                }))
              }
            >
              <FormControlLabel
                value=''
                control={<Radio />}
                label='All Categories'
              />
              {facets.categories.slice(0, 10).map((category) => (
                <FormControlLabel
                  key={category.value}
                  value={category.value}
                  control={<Radio />}
                  label={
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <span>{category.label}</span>
                      <Chip label={category.count} size='small' />
                    </Box>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>
        )}

        {/* Price Range */}
        {facets.priceRange.max > 0 && (
          <FormControl>
            <FormLabel>Price Range</FormLabel>
            <Box sx={{ px: 1, mt: 2 }}>
              <Slider
                value={[
                  filters.priceMin || facets.priceRange.min,
                  filters.priceMax || facets.priceRange.max,
                ]}
                onChange={(_, newValue) => {
                  const [min, max] = newValue as number[];
                  setFilters((prev) => ({
                    ...prev,
                    priceMin: min,
                    priceMax: max,
                  }));
                }}
                valueLabelDisplay='auto'
                min={facets.priceRange.min}
                max={facets.priceRange.max}
                step={1}
                valueLabelFormat={(value) => `$${value}`}
              />
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}
              >
                <Typography variant='caption'>
                  ${filters.priceMin || facets.priceRange.min}
                </Typography>
                <Typography variant='caption'>
                  ${filters.priceMax || facets.priceRange.max}
                </Typography>
              </Box>
            </Box>
          </FormControl>
        )}

        {/* In Stock Filter */}
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.inStock === true}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  inStock: e.target.checked || undefined,
                }))
              }
            />
          }
          label='In Stock Only'
        />

        <Divider />

        <Button
          variant='outlined'
          onClick={clearFilters}
          disabled={!hasActiveFilters()}
          fullWidth
        >
          Clear All Filters
        </Button>
      </Stack>
    </Drawer>
  );

  return (
    <Box>
      <Header onLoginClick={() => navigate('/login')} />
      <Container maxWidth='xl' sx={{ py: 3 }}>
        {/* Search Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems='center'>
            <div>
              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    fullWidth
                    placeholder='Search for products, stores, categories...'
                    value={searchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        performSearch();
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position='end'>
                          <IconButton onClick={() => setSearchQuery('')}>
                            <Close />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Search Suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <Paper
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        maxHeight: 400,
                        overflow: 'auto',
                        mt: 1,
                      }}
                    >
                      {suggestions.map((suggestion, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion.type === 'product' && (
                            <LocalOffer color='primary' />
                          )}
                          {suggestion.type === 'store' && (
                            <Store color='secondary' />
                          )}
                          {suggestion.type === 'category' && (
                            <Category color='info' />
                          )}

                          <Box sx={{ flex: 1 }}>
                            <Typography variant='body1'>
                              {suggestion.text}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Paper>
                  )}
                </Box>
              </Grid>
            </div>

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Stack direction='row' spacing={1} justifyContent='flex-end'>
                <Button
                  variant='outlined'
                  startIcon={<FilterList />}
                  onClick={() => setFilterDrawerOpen(true)}
                  sx={{ minWidth: 120 }}
                >
                  Filters
                  {hasActiveFilters() && (
                    <Badge
                      badgeContent=' '
                      color='primary'
                      variant='dot'
                      sx={{ ml: 1 }}
                    />
                  )}
                </Button>

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, newMode) => newMode && setViewMode(newMode)}
                  size='small'
                >
                  <ToggleButton value='grid'>
                    <GridView />
                  </ToggleButton>
                  <ToggleButton value='list'>
                    <ViewList />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Grid>
          </Grid>

          {/* Popular Search Terms */}
          {!searchQuery && popularTerms.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Popular searches:
              </Typography>
              <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap' }}>
                {popularTerms.slice(0, 8).map((term) => (
                  <Chip
                    key={term}
                    label={term}
                    variant='outlined'
                    size='small'
                    clickable
                    onClick={() => handlePopularTermClick(term)}
                    icon={<TrendingUp />}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Search Results Header */}
        {(searchQuery || hasActiveFilters()) && (
          <Box sx={{ mb: 3 }}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant='h5' gutterBottom>
                  Search Results
                  {searchQuery && (
                    <Typography component='span' color='primary.main'>
                      {' '}
                      for "{searchQuery}"
                    </Typography>
                  )}
                </Typography>

                <Typography variant='body2' color='text.secondary'>
                  {loading ? (
                    'Searching...'
                  ) : (
                    <>
                      {totalResults} results found
                      {searchTimeMs > 0 && ` in ${searchTimeMs}ms`}
                    </>
                  )}
                </Typography>
              </Box>

              <FormControl size='small' sx={{ minWidth: 160 }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  <option value='relevance'>Most Relevant</option>
                  <option value='price-low'>Price: Low to High</option>
                  <option value='price-high'>Price: High to Low</option>
                  <option value='rating'>Highest Rated</option>
                </select>
              </FormControl>
            </Stack>

            {/* Active Filters */}
            {hasActiveFilters() && (
              <Stack
                direction='row'
                spacing={1}
                sx={{ flexWrap: 'wrap', mb: 2 }}
              >
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mr: 1 }}
                >
                  Active filters:
                </Typography>

                {filters.category && (
                  <Chip
                    label={`Category: ${filters.category}`}
                    onDelete={() =>
                      setFilters((prev) => ({ ...prev, category: undefined }))
                    }
                    size='small'
                  />
                )}

                {filters.location && (
                  <Chip
                    label={`Location: ${filters.location}`}
                    onDelete={() =>
                      setFilters((prev) => ({ ...prev, location: undefined }))
                    }
                    size='small'
                  />
                )}

                {filters.store && (
                  <Chip
                    label={`Store: ${filters.store}`}
                    onDelete={() =>
                      setFilters((prev) => ({ ...prev, store: undefined }))
                    }
                    size='small'
                  />
                )}

                {(filters.priceMin || filters.priceMax) && (
                  <Chip
                    label={`Price: $${filters.priceMin || 0} - $${filters.priceMax || '∞'}`}
                    onDelete={() =>
                      setFilters((prev) => ({
                        ...prev,
                        priceMin: undefined,
                        priceMax: undefined,
                      }))
                    }
                    size='small'
                  />
                )}

                {filters.inStock && (
                  <Chip
                    label='In Stock'
                    onDelete={() =>
                      setFilters((prev) => ({ ...prev, inStock: undefined }))
                    }
                    size='small'
                  />
                )}

                {filters.entityTypes.length < 3 && (
                  <Chip
                    label={`Types: ${filters.entityTypes.join(', ')}`}
                    onDelete={() =>
                      setFilters((prev) => ({
                        ...prev,
                        entityTypes: ['product'],
                      }))
                    }
                    size='small'
                  />
                )}

                <Button
                  variant='text'
                  size='small'
                  onClick={clearFilters}
                  sx={{ ml: 1 }}
                >
                  Clear All
                </Button>
              </Stack>
            )}
          </Box>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Search Results */}
        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index}>
                <Grid
                  size={{
                    xs: 12,
                    sm: viewMode === 'grid' ? 6 : 12,
                    md: viewMode === 'grid' ? 4 : 12,
                  }}
                >
                  <Card>
                    <Skeleton variant='rectangular' height={200} />
                    <CardContent>
                      <Skeleton variant='text' />
                      <Skeleton variant='text' width='60%' />
                    </CardContent>
                  </Card>
                </Grid>
              </div>
            ))}
          </Grid>
        ) : results.length > 0 ? (
          <>
            <Grid container spacing={3}>
              {results.map((result, index) =>
                renderSearchResult(result, index)
              )}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  color='primary'
                  size='large'
                />
              </Box>
            )}
          </>
        ) : searchQuery || hasActiveFilters() ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant='h6' gutterBottom>
              No results found
            </Typography>
            <Typography variant='body1' color='text.secondary' gutterBottom>
              Try adjusting your search terms or filters
            </Typography>
            <Button variant='outlined' onClick={clearFilters} sx={{ mt: 2 }}>
              Clear Filters
            </Button>
          </Paper>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant='h6' gutterBottom>
              Start your search
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Enter a search term or try one of the popular searches above
            </Typography>
          </Paper>
        )}

        {/* Filter Drawer */}
        {renderFilterDrawer()}
      </Container>
    </Box>
  );
};

export default UnifiedSearchPage;
