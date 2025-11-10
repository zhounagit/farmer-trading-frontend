import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
} from '@mui/material';
import { Email, Check } from '@mui/icons-material';
import type { StorefrontModuleConfig } from '../../../types/storefront';

interface NewsletterPreviewProps {
  module: StorefrontModuleConfig;
}

const NewsletterPreview: React.FC<NewsletterPreviewProps> = ({ module }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const settings = (module.settings as Record<string, unknown>) || {};
  const title = (settings?.title as string) || 'Stay Updated';
  const description =
    (settings?.description as string) ||
    'Get notified about new products and seasonal updates';
  const placeholder = (settings?.placeholder as string) || 'Enter your email';
  const buttonText = (settings?.buttonText as string) || 'Subscribe';
  const confirmationMessage =
    (settings?.confirmationMessage as string) || 'Thanks for subscribing!';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter an email address');
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitted(true);
    setEmail('');

    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  if (submitted) {
    return (
      <Alert severity='success' icon={<Check />}>
        {confirmationMessage}
      </Alert>
    );
  }

  return (
    <Card sx={{ backgroundColor: '#f9f9f9' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Email sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
          <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {description}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && <Alert severity='error'>{(error as string) || ''}</Alert>}

            <TextField
              fullWidth
              type='email'
              placeholder={placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size='small'
              variant='outlined'
              required
            />

            <Button
              type='submit'
              variant='contained'
              fullWidth
              disabled={!email}
            >
              {(buttonText as string) || 'Subscribe'}
            </Button>

            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ textAlign: 'center' }}
            >
              We respect your privacy. Unsubscribe at any time.
            </Typography>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsletterPreview;
