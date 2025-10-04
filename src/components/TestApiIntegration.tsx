import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  LinearProgress,
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import OpenShopApiService from '../services/open-shop.api';

const TestApiIntegration: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [testStoreId] = useState(1); // Use a test store ID

  const handleTestLogoUpload = async () => {
    // Create a test file
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.fillText('LOGO', 30, 55);
    }

    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error('Failed to create test file');
        return;
      }

      const testFile = new File([blob], 'test-logo.png', { type: 'image/png' });

      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Testing logo upload
        const result = await OpenShopApiService.uploadLogo(
          testStoreId,
          testFile,
          (progress) => {
            // Upload progress tracked
            setUploadProgress(progress);
          }
        );

        // Upload completed successfully
        toast.success('Logo uploaded successfully!');

        // Display result
        // Logo URL available in result.fileUrl
      } catch (error) {
        // Upload error occurred
        toast.error(
          `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }, 'image/png');
  };

  const handleTestBannerUpload = async () => {
    // Create a test banner file
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#2196F3';
      ctx.fillRect(0, 0, 300, 100);
      ctx.fillStyle = '#fff';
      ctx.font = '20px Arial';
      ctx.fillText('BANNER', 110, 55);
    }

    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error('Failed to create test file');
        return;
      }

      const testFile = new File([blob], 'test-banner.png', {
        type: 'image/png',
      });

      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Testing banner upload
        const result = await OpenShopApiService.uploadBanner(
          testStoreId,
          testFile,
          (progress) => {
            // Upload progress tracked
            setUploadProgress(progress);
          }
        );

        // Upload completed successfully
        toast.success('Banner uploaded successfully!');

        // Display result
        // Banner URL available in result.fileUrl
      } catch (error) {
        // Upload error occurred
        toast.error(
          `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }, 'image/png');
  };

  const handleTestGalleryUpload = async () => {
    // Create multiple test gallery files
    const files: File[] = [];

    for (let i = 0; i < 3; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = `hsl(${i * 120}, 70%, 50%)`;
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText(`GALLERY ${i + 1}`, 60, 105);
      }

      await new Promise<void>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            files.push(
              new File([blob], `test-gallery-${i + 1}.png`, {
                type: 'image/png',
              })
            );
          }
          resolve();
        }, 'image/png');
      });
    }

    if (files.length === 0) {
      toast.error('Failed to create test files');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Testing gallery upload
      const result = await OpenShopApiService.uploadGalleryImages(
        testStoreId,
        files,
        (progress) => {
          // Upload progress tracked
          setUploadProgress(progress);
        }
      );

      // Upload completed successfully
      toast.success('Gallery images uploaded successfully!');

      // Display results
      // All gallery images uploaded successfully
    } catch (error) {
      // Upload error occurred
      toast.error(
        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant='h4' gutterBottom>
        API Integration Test
      </Typography>

      <Alert severity='info' sx={{ mb: 4 }}>
        This component tests the branding API integration. Check the browser
        console for detailed logs. Test store ID: {testStoreId}
      </Alert>

      <Paper sx={{ p: 3 }}>
        <Typography variant='h6' gutterBottom>
          Test Upload Functions
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <Button
            variant='contained'
            startIcon={<UploadIcon />}
            onClick={handleTestLogoUpload}
            disabled={isUploading}
            color='primary'
          >
            Test Logo Upload
          </Button>

          <Button
            variant='contained'
            startIcon={<UploadIcon />}
            onClick={handleTestBannerUpload}
            disabled={isUploading}
            color='secondary'
          >
            Test Banner Upload
          </Button>

          <Button
            variant='contained'
            startIcon={<UploadIcon />}
            onClick={handleTestGalleryUpload}
            disabled={isUploading}
            color='success'
          >
            Test Gallery Upload (3 images)
          </Button>
        </Box>

        {isUploading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' gutterBottom>
              Uploading... {uploadProgress}%
            </Typography>
            <LinearProgress
              variant='determinate'
              value={uploadProgress}
              sx={{ borderRadius: 1 }}
            />
          </Box>
        )}

        <Typography variant='body2' color='text.secondary'>
          API Endpoints being tested:
        </Typography>
        <Typography variant='body2' color='text.secondary' component='div'>
          • POST /api/stores/{testStoreId}/upload-logo
          <br />• POST /api/stores/{testStoreId}/upload-banner
          <br />• POST /api/stores/{testStoreId}/upload-gallery
        </Typography>
      </Paper>
    </Box>
  );
};

export default TestApiIntegration;
