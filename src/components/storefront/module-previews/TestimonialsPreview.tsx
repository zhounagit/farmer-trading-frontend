import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  Stack,
  IconButton,
  Avatar,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import type { StorefrontModuleConfig } from '../../../types/storefront';

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  text: string;
  date: string;
  avatar: string;
}

interface TestimonialsPreviewProps {
  module: StorefrontModuleConfig;
}

const TestimonialsPreview: React.FC<TestimonialsPreviewProps> = ({
  module,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const settings = (module.settings as Record<string, unknown>) || {};
  const displayStyle = (settings?.displayStyle as string) || 'carousel';
  const showRatings = settings?.showRatings !== false;
  const maxTestimonials = (settings?.maxTestimonials as number) || 5;

  const mockTestimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      rating: 5,
      text: 'Excellent quality products and fast delivery. Highly recommended!',
      date: '2 weeks ago',
      avatar: 'SJ',
    },
    {
      id: 2,
      name: 'Michael Chen',
      rating: 5,
      text: "Best organic produce I've found. Fresh and delicious every time.",
      date: '1 month ago',
      avatar: 'MC',
    },
    {
      id: 3,
      name: 'Emma Williams',
      rating: 4,
      text: 'Great products. Prices are reasonable and quality is consistent.',
      date: '1 month ago',
      avatar: 'EW',
    },
  ];

  const testimonials = mockTestimonials.slice(0, maxTestimonials);

  const handlePrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  if (testimonials.length === 0) {
    return (
      <Typography color='text.secondary' sx={{ p: 2 }}>
        No testimonials available
      </Typography>
    );
  }

  if (displayStyle === 'carousel') {
    const current = testimonials[currentIndex];
    return (
      <Card sx={{ backgroundColor: '#f9f9f9' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant='body1' sx={{ mb: 2, fontStyle: 'italic' }}>
            "{current.text}"
          </Typography>

          <Stack spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
              {current.avatar}
            </Avatar>
            <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
              {current.name}
            </Typography>
            {showRatings && (
              <Rating value={current.rating} readOnly size='small' />
            )}
            <Typography variant='caption' color='text.secondary'>
              {current.date}
            </Typography>
          </Stack>

          <Stack
            direction='row'
            spacing={1}
            sx={{ justifyContent: 'center', mt: 3 }}
          >
            <IconButton size='small' onClick={handlePrevious}>
              <ChevronLeft />
            </IconButton>
            <Typography variant='caption' color='text.secondary' sx={{ py: 1 }}>
              {currentIndex + 1} / {testimonials.length}
            </Typography>
            <IconButton size='small' onClick={handleNext}>
              <ChevronRight />
            </IconButton>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (displayStyle === 'grid') {
    return (
      <Stack spacing={2}>
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} sx={{ p: 2 }}>
            <Stack spacing={1}>
              {showRatings && (
                <Rating value={testimonial.rating} readOnly size='small' />
              )}
              <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
                "{testimonial.text}"
              </Typography>
              <Stack direction='row' spacing={1} alignItems='center'>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem',
                  }}
                >
                  {testimonial.avatar}
                </Avatar>
                <Box>
                  <Typography variant='caption' sx={{ fontWeight: 600 }}>
                    {testimonial.name}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {testimonial.date}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <Box sx={{ p: 2, backgroundColor: 'primary.light', borderRadius: 1 }}>
      <Typography variant='body2' sx={{ fontStyle: 'italic', mb: 2 }}>
        "{testimonials[currentIndex].text}"
      </Typography>
      <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
        {testimonials[currentIndex].name}
      </Typography>
    </Box>
  );
};

export default TestimonialsPreview;
