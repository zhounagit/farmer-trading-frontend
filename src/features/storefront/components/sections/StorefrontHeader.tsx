import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Publish,
  Phone,
  Tablet,
  Computer,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Button, Stack } from '../../../../shared/components';
import type { StorefrontPreviewMode } from '../../../../types/storefront';

export interface StorefrontHeaderProps {
  storeId?: string;
  storeName?: string;
  previewMode: StorefrontPreviewMode;
  onPreviewModeChange: (mode: StorefrontPreviewMode) => void;
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
}

const StorefrontHeader: React.FC<StorefrontHeaderProps> = ({
  storeId,
  storeName,
  previewMode,
  onPreviewModeChange,
  isSaving,
  isDirty,
  onSave,
  onPublish,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/stores/${storeId}`);
  };

  const handleDeviceChange = (device: 'desktop' | 'tablet' | 'mobile') => {
    onPreviewModeChange({
      ...previewMode,
      device,
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Left section - Back button and title */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Tooltip title="Back to store">
          <IconButton onClick={handleBack} size="large">
            <ArrowBack />
          </IconButton>
        </Tooltip>

        <Box>
          <Typography variant="h5" fontWeight={600}>
            Customize Storefront
          </Typography>
          {storeName && (
            <Typography variant="body2" color="text.secondary">
              {storeName}
            </Typography>
          )}
        </Box>
      </Stack>

      {/* Center section - Device preview toggle */}
      <Stack direction="row" spacing={1}>
        <Tooltip title="Desktop preview">
          <IconButton
            onClick={() => handleDeviceChange('desktop')}
            color={previewMode.device === 'desktop' ? 'primary' : 'default'}
            sx={{
              border: previewMode.device === 'desktop' ? 2 : 1,
              borderColor: previewMode.device === 'desktop' ? 'primary.main' : 'divider',
            }}
          >
            <Computer />
          </IconButton>
        </Tooltip>

        <Tooltip title="Tablet preview">
          <IconButton
            onClick={() => handleDeviceChange('tablet')}
            color={previewMode.device === 'tablet' ? 'primary' : 'default'}
            sx={{
              border: previewMode.device === 'tablet' ? 2 : 1,
              borderColor: previewMode.device === 'tablet' ? 'primary.main' : 'divider',
            }}
          >
            <Tablet />
          </IconButton>
        </Tooltip>

        <Tooltip title="Mobile preview">
          <IconButton
            onClick={() => handleDeviceChange('mobile')}
            color={previewMode.device === 'mobile' ? 'primary' : 'default'}
            sx={{
              border: previewMode.device === 'mobile' ? 2 : 1,
              borderColor: previewMode.device === 'mobile' ? 'primary.main' : 'divider',
            }}
          >
            <Phone />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Right section - Action buttons */}
      <Stack direction="row" spacing={2}>
        <Button
          variant="outline"
          startIcon={<Save />}
          loading={isSaving}
          disabled={!isDirty}
          onClick={onSave}
        >
          Save Changes
        </Button>

        <Button
          variant="primary"
          startIcon={<Publish />}
          loading={isSaving}
          onClick={onPublish}
        >
          Publish
        </Button>
      </Stack>
    </Box>
  );
};

export default StorefrontHeader;
