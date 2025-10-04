import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  Paper,
  Avatar,
  Rating,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Container,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ShoppingCart,
  Favorite,
  Star,
  LocationOn,
  Phone,
  Email,
  Facebook,
  Instagram,
  Twitter,
  Search,
  LocalShipping,
  Assignment,
  AccessTime,
  CheckCircle,
  Category,
  Store,
  ArrowForward,
  FavoriteBorder,
  Share,
  CompareArrows,
  YouTube,
  LinkedIn,
  Pinterest,
} from '@mui/icons-material';
import { generateThemeCSS } from '../../../types/themes';
import type { StorefrontTheme } from '../../../types/themes';

interface EnhancedThemePreviewProps {
  theme: StorefrontTheme;
  previewMode?: 'full' | 'compact' | 'split';
  showMockData?: boolean;
  realStoreData?: any;
  onApplyTheme?: () => void;
  className?: string;
}

const EnhancedThemePreview: React.FC<EnhancedThemePreviewProps> = ({
  theme,
  previewMode = 'full',
  showMockData = true,
  realStoreData = null,
  onApplyTheme,
  className,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isHovering, setIsHovering] = useState<string | null>(null);

  // Generate CSS variables for the theme
  const themeCSS = generateThemeCSS(theme);

  // Enhanced mock data based on theme category
  const getMockDataForTheme = () => {
    switch (theme.category) {
      case 'industrial':
        return {
          storeName: 'Industrial Supply Co.',
          tagline: 'Professional Equipment for Serious Operations',
          products: [
            {
              id: 1,
              name: 'Heavy-Duty Tractor Parts',
              price: '$249.99',
              sku: 'SKU: IND-2024-001',
              image: '/api/placeholder/300/300',
              rating: 4.7,
              reviews: 142,
              inStock: true,
              category: 'Equipment',
            },
            {
              id: 2,
              name: 'Industrial Grade Seeds',
              price: '$89.99/50lb',
              sku: 'SKU: IND-2024-002',
              image: '/api/placeholder/300/300',
              rating: 4.9,
              reviews: 89,
              inStock: true,
              category: 'Seeds',
            },
            {
              id: 3,
              name: 'Commercial Fertilizer',
              price: '$149.99',
              sku: 'SKU: IND-2024-003',
              image: '/api/placeholder/300/300',
              rating: 4.8,
              reviews: 256,
              inStock: false,
              category: 'Chemicals',
            },
          ],
          categories: ['Equipment', 'Seeds', 'Chemicals', 'Tools', 'Safety Gear'],
        };

      case 'rustic':
        return {
          storeName: 'Sunshine Family Farm',
          tagline: 'From Our Family to Yours - Fresh, Local, Organic',
          products: [
            {
              id: 1,
              name: 'Farm Fresh Eggs',
              price: '$6.00/dozen',
              description: 'Free-range, organic eggs from happy hens',
              image: '/api/placeholder/300/300',
              rating: 5.0,
              reviews: 45,
              badge: 'Organic',
              category: 'Dairy & Eggs',
            },
            {
              id: 2,
              name: 'Heirloom Tomatoes',
              price: '$4.50/lb',
              description: 'Hand-picked this morning',
              image: '/api/placeholder/300/300',
              rating: 4.9,
              reviews: 38,
              badge: 'Just Picked',
              category: 'Vegetables',
            },
            {
              id: 3,
              name: 'Raw Wildflower Honey',
              price: '$12.00/jar',
              description: 'Pure, unfiltered honey from our hives',
              image: '/api/placeholder/300/300',
              rating: 5.0,
              reviews: 67,
              badge: 'Bestseller',
              category: 'Pantry',
            },
          ],
          categories: ['Vegetables', 'Fruits', 'Dairy & Eggs', 'Pantry', 'Flowers'],
        };

      case 'gallery':
        return {
          storeName: 'Artisan Craft Studio',
          tagline: 'Handcrafted with Love and Passion',
          products: [
            {
              id: 1,
              name: 'Hand-Thrown Ceramic Vase',
              price: '$185.00',
              artist: 'Sarah Mitchell',
              medium: 'Stoneware, Wood Ash Glaze',
              dimensions: '12" H x 6" W',
              image: '/api/placeholder/400/400',
              year: '2024',
              category: 'Ceramics',
            },
            {
              id: 2,
              name: 'Abstract Landscape #7',
              price: '$450.00',
              artist: 'James Chen',
              medium: 'Oil on Canvas',
              dimensions: '24" x 36"',
              image: '/api/placeholder/400/400',
              year: '2024',
              category: 'Paintings',
            },
            {
              id: 3,
              name: 'Woven Wall Hanging',
              price: '$320.00',
              artist: 'Maria Rodriguez',
              medium: 'Natural Fibers',
              dimensions: '36" x 48"',
              image: '/api/placeholder/400/400',
              year: '2024',
              category: 'Textiles',
            },
          ],
          categories: ['Paintings', 'Ceramics', 'Sculptures', 'Textiles', 'Photography'],
        };

      case 'minimalist':
        return {
          storeName: 'Pure Essentials',
          tagline: 'Simple. Clean. Essential.',
          products: [
            {
              id: 1,
              name: 'Essential Oil Set',
              price: '$45',
              image: '/api/placeholder/300/300',
              category: 'Wellness',
            },
            {
              id: 2,
              name: 'Bamboo Kitchen Set',
              price: '$89',
              image: '/api/placeholder/300/300',
              category: 'Home',
            },
            {
              id: 3,
              name: 'Organic Cotton Tote',
              price: '$28',
              image: '/api/placeholder/300/300',
              category: 'Accessories',
            },
          ],
          categories: ['Wellness', 'Home', 'Accessories'],
        };

      case 'bold':
        return {
          storeName: 'BOLD SUPPLY',
          tagline: 'MAKE A STATEMENT',
          products: [
            {
              id: 1,
              name: 'BLACK SERIES PRO',
              price: '$299',
              image: '/api/placeholder/300/300',
              badge: 'LIMITED',
              category: 'GEAR',
            },
            {
              id: 2,
              name: 'NEON COLLECTION',
              price: '$189',
              image: '/api/placeholder/300/300',
              badge: 'NEW DROP',
              category: 'APPAREL',
            },
            {
              id: 3,
              name: 'CHROME EDITION',
              price: '$399',
              image: '/api/placeholder/300/300',
              badge: 'EXCLUSIVE',
              category: 'PREMIUM',
            },
          ],
          categories: ['GEAR', 'APPAREL', 'PREMIUM', 'ACCESSORIES'],
        };

      case 'luxe':
        return {
          storeName: 'Maison de Luxe',
          tagline: 'Curated Excellence',
          products: [
            {
              id: 1,
              name: 'Artisanal Truffle Collection',
              price: '$285',
              description: 'Hand-selected European truffles',
              image: '/api/placeholder/400/400',
              category: 'Gourmet',
              exclusive: true,
            },
            {
              id: 2,
              name: 'Reserve Caviar Selection',
              price: '$450',
              description: 'Premium Ossetra caviar',
              image: '/api/placeholder/400/400',
              category: 'Delicacies',
              exclusive: true,
            },
            {
              id: 3,
              name: 'Vintage Wine Collection',
              price: '$1,200',
              description: 'Rare vintage from private cellars',
              image: '/api/placeholder/400/400',
              category: 'Wine & Spirits',
              exclusive: true,
            },
          ],
          categories: ['Gourmet', 'Delicacies', 'Wine & Spirits', 'Gift Sets'],
        };

      case 'vintage':
        return {
          storeName: "Grandma's Pantry",
          tagline: 'Timeless Recipes, Classic Quality',
          products: [
            {
              id: 1,
              name: 'Classic Strawberry Jam',
              price: '$8.50',
              description: 'Made from Grandma\'s secret recipe',
              image: '/api/placeholder/300/300',
              year: 'Est. 1952',
              category: 'Preserves',
            },
            {
              id: 2,
              name: 'Old-Fashioned Pickles',
              price: '$6.75',
              description: 'Crisp and tangy, just like the old days',
              image: '/api/placeholder/300/300',
              year: 'Since 1948',
              category: 'Pickled Goods',
            },
            {
              id: 3,
              name: 'Heritage Apple Butter',
              price: '$9.25',
              description: 'Slow-cooked perfection',
              image: '/api/placeholder/300/300',
              year: 'Original Recipe',
              category: 'Spreads',
            },
          ],
          categories: ['Preserves', 'Pickled Goods', 'Spreads', 'Baked Goods'],
        };

      default: // vibrant/playful
        return {
          storeName: 'Happy Harvest Market',
          tagline: '🌈 Fun Food for Happy People! 🎉',
          products: [
            {
              id: 1,
              name: 'Rainbow Veggie Box',
              price: '$25.00',
              description: 'A colorful mix of seasonal veggies!',
              image: '/api/placeholder/300/300',
              rating: 5.0,
              reviews: 89,
              badge: '🌟 Popular!',
              category: 'Veggie Boxes',
            },
            {
              id: 2,
              name: 'Sunshine Smoothie Kit',
              price: '$18.00',
              description: 'Everything you need for amazing smoothies!',
              image: '/api/placeholder/300/300',
              rating: 4.9,
              reviews: 125,
              badge: '☀️ New!',
              category: 'Meal Kits',
            },
            {
              id: 3,
              name: 'Party Fruit Platter',
              price: '$35.00',
              description: 'Perfect for celebrations!',
              image: '/api/placeholder/300/300',
              rating: 5.0,
              reviews: 56,
              badge: '🎊 Party Time!',
              category: 'Party Platters',
            },
          ],
          categories: ['Veggie Boxes', 'Meal Kits', 'Party Platters', 'Snacks', 'Drinks'],
        };
    }
  };

  const mockData = showMockData ? getMockDataForTheme() : realStoreData;

  // Render product card based on theme style
  const renderProductCard = (product: any) => {
    const handleHover = (productId: any) => setIsHovering(productId);
    const handleLeave = () => setIsHovering(null);

    switch (theme.category) {
      case 'gallery':
        return (
          <Card
            key={product.id}
            sx={{
              backgroundColor: 'var(--theme-surface)',
              border: '1px solid var(--theme-border)',
              borderRadius: 'var(--theme-radius-md)',
              overflow: 'hidden',
              transition: 'var(--theme-transition-normal)',
              transform: isHovering === product.id ? 'scale(1.02)' : 'scale(1)',
              boxShadow: isHovering === product.id ? 'var(--theme-shadow-lg)' : 'var(--theme-shadow-sm)',
            }}
            onMouseEnter={() => handleHover(product.id)}
            onMouseLeave={handleLeave}
          >
            <CardMedia
              component="img"
              height="300"
              image={product.image}
              alt={product.name}
            />
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'var(--theme-font-primary)', mb: 1 }}>
                {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {product.artist} • {product.year}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {product.medium}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {product.dimensions}
              </Typography>
              <Typography variant="h6" sx={{ color: 'var(--theme-primary)', fontWeight: 'bold' }}>
                {product.price}
              </Typography>
            </CardContent>
          </Card>
        );

      case 'industrial':
        return (
          <Card
            key={product.id}
            sx={{
              backgroundColor: 'var(--theme-surface)',
              border: '2px solid var(--theme-border)',
              borderRadius: 'var(--theme-radius-sm)',
              overflow: 'hidden',
              transition: 'var(--theme-transition-fast)',
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
              />
              {!product.inStock && (
                <Chip
                  label="OUT OF STOCK"
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              )}
            </Box>
            <CardContent>
              <Typography variant="caption" sx={{ color: 'var(--theme-text-muted)' }}>
                {product.sku}
              </Typography>
              <Typography variant="h6" sx={{ fontFamily: 'var(--theme-font-primary)', fontWeight: 'bold', mb: 1 }}>
                {product.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={product.rating} precision={0.1} size="small" readOnly />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  ({product.reviews} reviews)
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ color: 'var(--theme-primary)', fontWeight: 'bold', mb: 2 }}>
                {product.price}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                disabled={!product.inStock}
                sx={{
                  backgroundColor: 'var(--theme-primary)',
                  '&:hover': {
                    backgroundColor: 'var(--theme-accent)',
                  },
                }}
              >
                {product.inStock ? 'ADD TO QUOTE' : 'OUT OF STOCK'}
              </Button>
            </CardContent>
          </Card>
        );

      case 'minimalist':
        return (
          <Card
            key={product.id}
            elevation={0}
            sx={{
              backgroundColor: 'transparent',
              textAlign: 'center',
            }}
          >
            <CardMedia
              component="img"
              image={product.image}
              alt={product.name}
              sx={{
                borderRadius: 'var(--theme-radius-sm)',
                mb: 2,
              }}
            />
            <Typography variant="body1" sx={{ fontFamily: 'var(--theme-font-primary)', mb: 0.5 }}>
              {product.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
              {product.price}
            </Typography>
          </Card>
        );

      case 'bold':
        return (
          <Card
            key={product.id}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              border: '3px solid #fff',
              borderRadius: 0,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <CardMedia
              component="img"
              height="250"
              image={product.image}
              alt={product.name}
              sx={{
                filter: 'contrast(1.2)',
              }}
            />
            {product.badge && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: 'var(--theme-accent)',
                  color: '#000',
                  px: 2,
                  py: 1,
                  fontWeight: 'bold',
                }}
              >
                {product.badge}
              </Box>
            )}
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                {product.name}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {product.price}
              </Typography>
            </CardContent>
          </Card>
        );

      default:
        // Rustic, vibrant, and other styles
        return (
          <Card
            key={product.id}
            sx={{
              backgroundColor: 'var(--theme-surface)',
              border: '1px solid var(--theme-border)',
              borderRadius: 'var(--theme-radius-lg)',
              overflow: 'hidden',
              transition: 'var(--theme-transition-normal)',
              transform: isHovering === product.id ? 'translateY(-4px)' : 'translateY(0)',
              boxShadow: isHovering === product.id ? 'var(--theme-shadow-lg)' : 'var(--theme-shadow-md)',
            }}
            onMouseEnter={() => handleHover(product.id)}
            onMouseLeave={handleLeave}
          >
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
              />
              {product.badge && (
                <Chip
                  label={product.badge}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    backgroundColor: 'var(--theme-accent)',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              )}
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  '&:hover': {
                    backgroundColor: 'var(--theme-accent)',
                    color: 'white',
                  },
                }}
                size="small"
              >
                <FavoriteBorder />
              </IconButton>
            </Box>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'var(--theme-font-primary)', mb: 1 }}>
                {product.name}
              </Typography>
              {product.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {product.description}
                </Typography>
              )}
              {product.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={product.rating} precision={0.1} size="small" readOnly />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    ({product.reviews})
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="h6" sx={{ color: 'var(--theme-primary)', fontWeight: 'bold' }}>
                  {product.price}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: 'var(--theme-primary)',
                    borderRadius: 'var(--theme-radius-lg)',
                    '&:hover': {
                      backgroundColor: 'var(--theme-accent)',
                    },
                  }}
                  endIcon={<ShoppingCart />}
                >
                  Add
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
    }
  };

  const renderHeader = () => (
    <Box
      sx={{
        backgroundColor: 'var(--theme-surface)',
        borderBottom: '1px solid var(--theme-border)',
        p: 2,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Store sx={{ fontSize: 32, color: 'var(--theme-primary)' }} />
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'var(--theme-font-primary)',
                  fontWeight: 'bold',
                  color: 'var(--theme-text-primary)',
                }}
              >
                {mockData.storeName}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'var(--theme-text-secondary)',
                  fontFamily: 'var(--theme-font-secondary)',
                }}
              >
                {mockData.tagline}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small">
              <Search />
            </IconButton>
            <IconButton size="small">
              <Badge badgeContent={3} color="primary">
                <ShoppingCart />
              </Badge>
            </IconButton>
            <IconButton size="small">
              <Favorite />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );

  const renderHeroBanner = () => (
    <Box
      sx={{
        height: theme.category === 'minimalist' ? 300 : 400,
        background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.accent}20)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          zIndex: 1,
          px: 3,
        }}
      >
        <Typography
          variant={theme.category === 'bold' ? 'h2' : 'h3'}
          sx={{
            fontFamily: 'var(--theme-font-primary)',
            fontWeight: theme.category === 'bold' ? 900 : 'bold',
            color: 'var(--theme-text-primary)',
            mb: 2,
          }}
        >
          {theme.category === 'minimalist' ? 'Welcome' : `Welcome to ${mockData.storeName}`}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'var(--theme-font-secondary)',
            color: 'var(--theme-text-secondary)',
            mb: 3,
          }}
        >
          {mockData.tagline}
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: 'var(--theme-primary)',
            borderRadius: 'var(--theme-radius-lg)',
            px: 4,
            py: 1.5,
            '&:hover': {
              backgroundColor: 'var(--theme-accent)',
            },
          }}
        >
          Shop Now
        </Button>
      </Box>
    </Box>
  );

  const renderCategories = () => (
    <Box sx={{ py: 4 }}>
      <Typography
        variant="h5"
        sx={{
          fontFamily: 'var(--theme-font-primary)',
          fontWeight: 'bold',
          mb: 3,
          textAlign: theme.category === 'minimalist' ? 'left' : 'center',
        }}
      >
        {theme.category === 'bold' ? 'CATEGORIES' : 'Shop by Category'}
      </Typography>
      <Grid container spacing={2}>
        {mockData.categories.map((category: string) => (
          <Grid item xs={6} sm={4} md={2.4} key={category}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                backgroundColor: 'var(--theme-surface)',
                border: `1px solid var(--theme-border)`,
                borderRadius: 'var(--theme-radius-md)',
                cursor: 'pointer',
                transition: 'var(--theme-transition-fast)',
                '&:hover': {
                  backgroundColor: 'var(--theme-primary)',
                  color: 'white',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Category sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="body2" sx={{ fontFamily: 'var(--theme-font-primary)' }}>
                {category}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderFooter = () => (
    <Box
      sx={{
        backgroundColor: 'var(--theme-surface)',
        borderTop: '1px solid var(--theme-border)',
        mt: 4,
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontFamily: 'var(--theme-font-primary)', mb: 2 }}>
              Contact Us
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Phone fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="(555) 123-4567" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Email fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="hello@farm.com" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationOn fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="123 Farm Road, Rural Town" />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontFamily: 'var(--theme-font-primary)', mb: 2 }}>
              Store Hours
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Monday - Friday: 9:00 AM - 6:00 PM
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Saturday: 9:00 AM - 4:00 PM
            </Typography>
            <Typography variant="body2">
              Sunday: Closed
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontFamily: 'var(--theme-font-primary)', mb: 2 }}>
              Follow Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: 'var(--theme-primary)' }}>
                <Facebook />
              </IconButton>
              <IconButton size="small" sx={{ color: 'var(--theme-primary)' }}>
                <Instagram />
              </IconButton>
              <IconButton size="small" sx={{ color: 'var(--theme-primary)' }}>
                <Twitter />
              </IconButton>
              <IconButton size="small" sx={{ color: 'var(--theme-primary)' }}>
                <YouTube />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );

  if (previewMode === 'compact') {
    return (
      <Box className={className}>
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
        <Box
          sx={{
            backgroundColor: 'var(--theme-background)',
            color: 'var(--theme-text-primary)',
            fontFamily: 'var(--theme-font-primary)',
            borderRadius: 'var(--theme-radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--theme-shadow-lg)',
          }}
        >
          {renderHeader()}
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <Grid container spacing={3}>
              {mockData.products.slice(0, 3).map((product: any) => (
                <Grid item xs={12} sm={4} key={product.id}>
                  {renderProductCard(product)}
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={className}>
      {/* Inject theme CSS */}
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />

      <Box
        sx={{
          backgroundColor: 'var(--theme-background)',
          color: 'var(
