import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  LocalOffer,
  Gavel,
  TrendingUp,
  TrendingDown,
  AccessTime,
  CheckCircle,
  Cancel,
  Message,
  Send,
  Notifications,
} from '@mui/icons-material';

// Type definitions for future implementation
interface PriceOffer {
  id: string;
  productId: number;
  productName: string;
  productImage: string;
  buyerId: number;
  buyerName: string;
  buyerAvatar?: string;
  sellerId: number;
  originalPrice: number;
  offeredPrice: number;
  currentPrice: number;
  quantity: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  lastActivity: Date;
}

interface NegotiationMessage {
  id: string;
  senderId: number;
  senderName: string;
  senderType: 'buyer' | 'seller';
  message: string;
  priceOffer?: number;
  timestamp: Date;
  type: 'message' | 'offer' | 'counter_offer' | 'acceptance' | 'rejection';
}

// Mock data for demonstration
const mockOffers: PriceOffer[] = [
  {
    id: 'offer-1',
    productId: 1,
    productName: 'Organic Heirloom Tomatoes',
    productImage: '/api/placeholder/100/100',
    buyerId: 101,
    buyerName: 'Restaurant Plaza',
    buyerAvatar: '/api/placeholder/40/40',
    sellerId: 201,
    originalPrice: 4.99,
    offeredPrice: 4.25,
    currentPrice: 4.6,
    quantity: 50,
    message:
      'Looking for weekly supply for our restaurant. Can you do $4.25/lb for 50lbs weekly?',
    status: 'countered',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: 'offer-2',
    productId: 2,
    productName: 'Free-Range Farm Eggs',
    productImage: '/api/placeholder/100/100',
    buyerId: 102,
    buyerName: 'Sarah Johnson',
    sellerId: 201,
    originalPrice: 6.0,
    offeredPrice: 5.5,
    currentPrice: 5.5,
    quantity: 5,
    message: 'Regular customer, would like bulk pricing for 5 dozen',
    status: 'pending',
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
];

const mockNegotiationMessages: NegotiationMessage[] = [
  {
    id: 'msg-1',
    senderId: 101,
    senderName: 'Restaurant Plaza',
    senderType: 'buyer',
    message:
      'Looking for weekly supply for our restaurant. Can you do $4.25/lb for 50lbs weekly?',
    priceOffer: 4.25,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'offer',
  },
  {
    id: 'msg-2',
    senderId: 201,
    senderName: 'Sunshine Farm',
    senderType: 'seller',
    message:
      'Thank you for your interest! For that volume, I can offer $4.60/lb. These are premium organic tomatoes.',
    priceOffer: 4.6,
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'counter_offer',
  },
];

// Component for making an offer on a product
export const MakeOfferButton: React.FC<{
  productId: number;
  productName: string;
  originalPrice: number;
  onOfferSubmitted?: (offer: Partial<PriceOffer>) => void;
}> = ({ productId, productName, originalPrice, onOfferSubmitted }) => {
  const [open, setOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    const offer: Partial<PriceOffer> = {
      productId,
      productName,
      originalPrice,
      offeredPrice: parseFloat(offerPrice),
      quantity: parseInt(quantity),
      message,
      status: 'pending',
    };

    onOfferSubmitted?.(offer);
    setOpen(false);
    setOfferPrice('');
    setQuantity('1');
    setMessage('');
  };

  const discountPercentage = offerPrice
    ? Math.round(
        ((originalPrice - parseFloat(offerPrice)) / originalPrice) * 100
      )
    : 0;

  return (
    <>
      <Button
        variant='outlined'
        startIcon={<LocalOffer />}
        onClick={() => setOpen(true)}
        sx={{
          borderColor: 'var(--theme-accent, #059669)',
          color: 'var(--theme-accent, #059669)',
          '&:hover': {
            backgroundColor: 'var(--theme-surface, #f0fdf4)',
          },
        }}
      >
        Make Offer
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalOffer color='primary' />
            <Typography variant='h6'>Make an Offer</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' gutterBottom>
            {productName}
          </Typography>
          <Typography variant='h6' gutterBottom>
            Original Price: ${originalPrice.toFixed(2)}
          </Typography>

          <TextField
            fullWidth
            label='Your Offer Price'
            type='number'
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            inputProps={{ step: 0.01, min: 0.01 }}
            sx={{ mb: 2 }}
            helperText={
              discountPercentage > 0
                ? `${discountPercentage}% discount from original price`
                : ''
            }
          />

          <TextField
            fullWidth
            label='Quantity'
            type='number'
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{ min: 1 }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label='Message (Optional)'
            multiline
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Explain your offer, mention bulk discounts, regular orders, etc.'
            sx={{ mb: 2 }}
          />

          {offerPrice && (
            <Alert severity='info' sx={{ mb: 2 }}>
              <Typography variant='body2'>
                Total: $
                {(parseFloat(offerPrice) * parseInt(quantity || '1')).toFixed(
                  2
                )}
                ({quantity} × ${parseFloat(offerPrice).toFixed(2)})
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant='contained'
            onClick={handleSubmit}
            disabled={!offerPrice || parseFloat(offerPrice) <= 0}
          >
            Submit Offer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Component showing all active negotiations for a seller
export const NegotiationDashboard: React.FC<{
  offers?: PriceOffer[];
  onAcceptOffer?: (offerId: string) => void;
  onRejectOffer?: (offerId: string) => void;
  onCounterOffer?: (
    offerId: string,
    newPrice: number,
    message?: string
  ) => void;
}> = ({
  offers = mockOffers,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer,
}) => {
  const [selectedOffer, setSelectedOffer] = useState<PriceOffer | null>(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  const getStatusColor = (status: PriceOffer['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'countered':
        return 'info';
      case 'expired':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: PriceOffer['status']) => {
    switch (status) {
      case 'pending':
        return <AccessTime />;
      case 'accepted':
        return <CheckCircle />;
      case 'rejected':
        return <Cancel />;
      case 'countered':
        return <Gavel />;
      case 'expired':
        return <AccessTime />;
      default:
        return <LocalOffer />;
    }
  };

  const timeUntilExpiry = (expiresAt: Date) => {
    const hours = Math.ceil(
      (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)
    );
    return hours > 0 ? `${hours}h remaining` : 'Expired';
  };

  const handleCounterOffer = (offer: PriceOffer) => {
    if (counterPrice && parseFloat(counterPrice) > 0) {
      onCounterOffer?.(offer.id, parseFloat(counterPrice), counterMessage);
      setCounterPrice('');
      setCounterMessage('');
      setSelectedOffer(null);
    }
  };

  return (
    <Box>
      <Typography
        variant='h5'
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <Gavel />
        Price Negotiations
        <Badge
          badgeContent={offers.filter((o) => o.status === 'pending').length}
          color='primary'
        >
          <Notifications />
        </Badge>
      </Typography>

      <div>
        {offers.map((offer) => (
          <Card key={offer.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar src={offer.productImage} alt={offer.productName}>
                    {offer.productName[0]}
                  </Avatar>
                  <Box>
                    <Typography variant='h6'>{offer.productName}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      from {offer.buyerName} • {offer.quantity} units
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={offer.status.toUpperCase()}
                  color={getStatusColor(offer.status)}
                  icon={getStatusIcon(offer.status)}
                  size='small'
                />
              </Box>

              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}
              >
                <Typography variant='body2'>
                  Original: <strong>${offer.originalPrice.toFixed(2)}</strong>
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  {offer.offeredPrice < offer.originalPrice ? (
                    <TrendingDown color='error' />
                  ) : (
                    <TrendingUp color='success' />
                  )}
                  Offered: <strong>${offer.offeredPrice.toFixed(2)}</strong>
                </Typography>
                {offer.status === 'countered' && (
                  <Typography variant='body2' color='primary'>
                    Current: <strong>${offer.currentPrice.toFixed(2)}</strong>
                  </Typography>
                )}
              </Box>

              {offer.message && (
                <Alert severity='info' sx={{ mb: 2 }}>
                  <Typography variant='body2'>"{offer.message}"</Typography>
                </Alert>
              )}

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant='caption' color='text.secondary'>
                  {timeUntilExpiry(offer.expiresAt)}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Total Value: $
                  {(offer.currentPrice * offer.quantity).toFixed(2)}
                </Typography>
              </Box>

              {offer.status === 'pending' || offer.status === 'countered' ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size='small'
                    variant='contained'
                    color='success'
                    onClick={() => onAcceptOffer?.(offer.id)}
                  >
                    Accept $
                    {offer.status === 'countered'
                      ? offer.currentPrice.toFixed(2)
                      : offer.offeredPrice.toFixed(2)}
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    onClick={() => setSelectedOffer(offer)}
                  >
                    Counter Offer
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    color='error'
                    onClick={() => onRejectOffer?.(offer.id)}
                  >
                    Decline
                  </Button>
                  <IconButton size='small' title='View conversation'>
                    <Message />
                  </IconButton>
                </Box>
              ) : (
                <LinearProgress
                  variant='determinate'
                  value={offer.status === 'accepted' ? 100 : 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Counter Offer Dialog */}
      <Dialog
        open={selectedOffer !== null}
        onClose={() => setSelectedOffer(null)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Counter Offer</DialogTitle>
        <DialogContent>
          {selectedOffer && (
            <>
              <Typography variant='body2' gutterBottom>
                {selectedOffer.productName} • {selectedOffer.quantity} units
              </Typography>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Their offer: ${selectedOffer.offeredPrice.toFixed(2)}
              </Typography>

              <TextField
                fullWidth
                label='Your Counter Offer'
                type='number'
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
                inputProps={{ step: 0.01, min: 0.01 }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label='Message (Optional)'
                multiline
                rows={3}
                value={counterMessage}
                onChange={(e) => setCounterMessage(e.target.value)}
                placeholder='Explain your counter offer...'
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedOffer(null)}>Cancel</Button>
          <Button
            variant='contained'
            onClick={() => selectedOffer && handleCounterOffer(selectedOffer)}
            disabled={!counterPrice || parseFloat(counterPrice) <= 0}
          >
            Send Counter Offer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Component showing negotiation history/chat
export const NegotiationChat: React.FC<{
  messages?: NegotiationMessage[];
  currentUserId: number;
  onSendMessage?: (message: string, priceOffer?: number) => void;
}> = ({
  messages = mockNegotiationMessages,
  currentUserId = 201,
  onSendMessage,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [newOffer, setNewOffer] = useState('');

  const handleSend = () => {
    if (newMessage.trim() || newOffer) {
      onSendMessage?.(newMessage, newOffer ? parseFloat(newOffer) : undefined);
      setNewMessage('');
      setNewOffer('');
    }
  };

  return (
    <Box>
      <Typography
        variant='h6'
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <Message />
        Negotiation History
      </Typography>

      <Box
        sx={{
          maxHeight: 400,
          overflow: 'auto',
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 1,
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              justifyContent:
                msg.senderId === currentUserId ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Card
              sx={{
                maxWidth: '70%',
                backgroundColor:
                  msg.senderId === currentUserId ? 'primary.light' : 'grey.100',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant='caption' color='text.secondary'>
                  {msg.senderName} • {msg.timestamp.toLocaleTimeString()}
                </Typography>
                {msg.priceOffer && (
                  <Chip
                    label={`$${msg.priceOffer.toFixed(2)}`}
                    size='small'
                    color='primary'
                    sx={{ ml: 1, mb: 1 }}
                  />
                )}
                <Typography variant='body2' sx={{ mt: 1 }}>
                  {msg.message}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder='Type your message...'
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <TextField
          label='Price Offer'
          type='number'
          value={newOffer}
          onChange={(e) => setNewOffer(e.target.value)}
          inputProps={{ step: 0.01, min: 0 }}
          sx={{ width: 120 }}
        />
        <IconButton
          color='primary'
          onClick={handleSend}
          disabled={!newMessage.trim() && !newOffer}
        >
          <Send />
        </IconButton>
      </Box>
    </Box>
  );
};

// Main component that ties everything together
export const PriceNegotiationSystem: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        🚧 Future Feature: Price Negotiation System
      </Typography>

      <Alert severity='info' sx={{ mb: 3 }}>
        <Typography variant='body2'>
          This is a mockup of the planned price negotiation feature. It will
          allow buyers to make offers and negotiate prices with sellers in
          real-time.
        </Typography>
      </Alert>

      <Box sx={{ display: 'grid', gap: 3 }}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              1. Make Offer Button (Buyer View)
            </Typography>
            <MakeOfferButton
              productId={1}
              productName='Organic Heirloom Tomatoes'
              originalPrice={4.99}
              onOfferSubmitted={(offer) =>
                console.log('Offer submitted:', offer)
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              2. Negotiation Dashboard (Seller View)
            </Typography>
            <NegotiationDashboard
              onAcceptOffer={(id) => console.log('Accepted offer:', id)}
              onRejectOffer={(id) => console.log('Rejected offer:', id)}
              onCounterOffer={(id, price, msg) =>
                console.log('Counter offer:', { id, price, msg })
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              3. Negotiation Chat
            </Typography>
            <NegotiationChat
              currentUserId={201}
              onSendMessage={(msg, price) =>
                console.log('Sent message:', { msg, price })
              }
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PriceNegotiationSystem;
