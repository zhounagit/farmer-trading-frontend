import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Switch,
  TextField,
  FormControlLabel,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from '@mui/material';
import {
  Close,
  Settings,
  Save,
  RestartAlt,
  ExpandMore,
  Palette,
  Visibility,
  Code,
} from '@mui/icons-material';
import { Card, Button, Stack, Input } from '../../../../shared/components';
import Select from '../../../../shared/components/ui/Select';
import type {
  StorefrontModuleConfig,
  StorefrontModuleType,
} from '../../../../types/storefront';

export interface ModuleConfigurationProps {
  module: StorefrontModuleConfig | null;
  onClose: () => void;
  onSave: (moduleConfig: StorefrontModuleConfig) => void;
  onReset?: () => void;
}

interface ModuleConfigField {
  key: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'boolean'
    | 'select'
    | 'color'
    | 'slider'
    | 'textarea';
  description?: string;
  options?: Array<{ value: string | number; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  required?: boolean;
  category?: 'layout' | 'content' | 'style' | 'behavior';
}

const getModuleFields = (
  moduleType: StorefrontModuleType
): ModuleConfigField[] => {
  const commonFields: ModuleConfigField[] = [
    {
      key: 'title',
      label: 'Module Title',
      type: 'text',
      description: 'Display title for this module section',
      category: 'content',
      required: true,
    },
    {
      key: 'showTitle',
      label: 'Show Title',
      type: 'boolean',
      description: 'Whether to display the module title',
      category: 'layout',
      defaultValue: true,
    },
  ];

  switch (moduleType) {
    case 'hero-banner':
      return [
        ...commonFields,
        {
          key: 'subtitle',
          label: 'Subtitle',
          type: 'text',
          description: 'Optional subtitle text',
          category: 'content',
        },
        {
          key: 'backgroundImage',
          label: 'Background Image URL',
          type: 'text',
          description: 'URL for the background image',
          category: 'style',
        },
        {
          key: 'overlayOpacity',
          label: 'Overlay Opacity',
          type: 'slider',
          description: 'Darkness of the overlay on the background image',
          category: 'style',
          min: 0,
          max: 1,
          step: 0.1,
          defaultValue: 0.4,
        },
        {
          key: 'textAlign',
          label: 'Text Alignment',
          type: 'select',
          description: 'How to align the text content',
          category: 'layout',
          options: [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ],
          defaultValue: 'center',
        },
        {
          key: 'showButton',
          label: 'Show Call-to-Action Button',
          type: 'boolean',
          description: 'Display a button in the hero section',
          category: 'content',
          defaultValue: true,
        },
        {
          key: 'buttonText',
          label: 'Button Text',
          type: 'text',
          description: 'Text to display on the button',
          category: 'content',
          defaultValue: 'Shop Now',
        },
        {
          key: 'height',
          label: 'Banner Height',
          type: 'select',
          description: 'Height of the hero banner',
          category: 'layout',
          options: [
            { value: 'small', label: 'Small (300px)' },
            { value: 'medium', label: 'Medium (400px)' },
            { value: 'large', label: 'Large (500px)' },
            { value: 'fullscreen', label: 'Full Screen' },
          ],
          defaultValue: 'medium',
        },
      ];

    case 'featured-products':
      return [
        ...commonFields,
        {
          key: 'maxItems',
          label: 'Maximum Products',
          type: 'number',
          description: 'Number of products to display',
          category: 'content',
          min: 1,
          max: 12,
          defaultValue: 4,
        },
        {
          key: 'showPrices',
          label: 'Show Prices',
          type: 'boolean',
          description: 'Display product prices',
          category: 'content',
          defaultValue: true,
        },
        {
          key: 'showDescription',
          label: 'Show Descriptions',
          type: 'boolean',
          description: 'Display product descriptions',
          category: 'content',
          defaultValue: false,
        },
        {
          key: 'layout',
          label: 'Layout Style',
          type: 'select',
          description: 'How to arrange the products',
          category: 'layout',
          options: [
            { value: 'grid', label: 'Grid' },
            { value: 'carousel', label: 'Carousel' },
            { value: 'list', label: 'List' },
          ],
          defaultValue: 'grid',
        },
        {
          key: 'columns',
          label: 'Columns (Desktop)',
          type: 'slider',
          description: 'Number of columns on desktop',
          category: 'layout',
          min: 1,
          max: 6,
          step: 1,
          defaultValue: 4,
        },
      ];

    case 'contact-info':
      return [
        ...commonFields,
        {
          key: 'showPhone',
          label: 'Show Phone Number',
          type: 'boolean',
          description: 'Display store phone number',
          category: 'content',
          defaultValue: true,
        },
        {
          key: 'showEmail',
          label: 'Show Email',
          type: 'boolean',
          description: 'Display store email address',
          category: 'content',
          defaultValue: true,
        },
        {
          key: 'showAddress',
          label: 'Show Address',
          type: 'boolean',
          description: 'Display store address',
          category: 'content',
          defaultValue: true,
        },
        {
          key: 'showSocialMedia',
          label: 'Show Social Media Links',
          type: 'boolean',
          description: 'Display social media icons and links',
          category: 'content',
          defaultValue: false,
        },
        {
          key: 'layout',
          label: 'Layout Style',
          type: 'select',
          description: 'How to display the contact information',
          category: 'layout',
          options: [
            { value: 'horizontal', label: 'Horizontal' },
            { value: 'vertical', label: 'Vertical' },
            { value: 'cards', label: 'Card Layout' },
          ],
          defaultValue: 'horizontal',
        },
      ];

    case 'business-hours':
      return [
        ...commonFields,
        {
          key: 'format',
          label: 'Time Format',
          type: 'select',
          description: 'How to display the time',
          category: 'content',
          options: [
            { value: '12-hour', label: '12 Hour (AM/PM)' },
            { value: '24-hour', label: '24 Hour' },
          ],
          defaultValue: '12-hour',
        },
        {
          key: 'showCurrentStatus',
          label: 'Show Current Status',
          type: 'boolean',
          description: 'Display "Open Now" or "Closed" indicator',
          category: 'content',
          defaultValue: true,
        },
        {
          key: 'compactView',
          label: 'Compact View',
          type: 'boolean',
          description: 'Use a more condensed layout',
          category: 'layout',
          defaultValue: false,
        },
      ];

    case 'location-map':
      return [
        ...commonFields,
        {
          key: 'zoom',
          label: 'Map Zoom Level',
          type: 'slider',
          description: 'How close to zoom in on the location',
          category: 'layout',
          min: 8,
          max: 18,
          step: 1,
          defaultValue: 15,
        },
        {
          key: 'showDirections',
          label: 'Show Directions Button',
          type: 'boolean',
          description: 'Display a "Get Directions" button',
          category: 'content',
          defaultValue: true,
        },
        {
          key: 'mapHeight',
          label: 'Map Height',
          type: 'select',
          description: 'Height of the map display',
          category: 'layout',
          options: [
            { value: 'small', label: 'Small (200px)' },
            { value: 'medium', label: 'Medium (300px)' },
            { value: 'large', label: 'Large (400px)' },
          ],
          defaultValue: 'medium',
        },
        {
          key: 'showSatelliteView',
          label: 'Enable Satellite View',
          type: 'boolean',
          description: 'Allow switching to satellite imagery',
          category: 'behavior',
          defaultValue: false,
        },
      ];

    case 'inventory-showcase':
      return [
        ...commonFields,
        {
          key: 'maxItems',
          label: 'Maximum Items',
          type: 'number',
          description: 'Number of inventory items to display',
          category: 'content',
          min: 1,
          max: 20,
          defaultValue: 8,
        },
        {
          key: 'showStock',
          label: 'Show Stock Levels',
          type: 'boolean',
          description: 'Display available quantity',
          category: 'content',
          defaultValue: true,
        },
        {
          key: 'autoUpdate',
          label: 'Auto Update',
          type: 'boolean',
          description: 'Automatically refresh inventory data',
          category: 'behavior',
          defaultValue: true,
        },
        {
          key: 'updateInterval',
          label: 'Update Interval (minutes)',
          type: 'number',
          description: 'How often to refresh the data',
          category: 'behavior',
          min: 1,
          max: 60,
          defaultValue: 5,
        },
        {
          key: 'showOutOfStock',
          label: 'Show Out of Stock Items',
          type: 'boolean',
          description: 'Include items with zero inventory',
          category: 'content',
          defaultValue: false,
        },
      ];

    default:
      return commonFields;
  }
};

const ModuleConfiguration: React.FC<ModuleConfigurationProps> = ({
  module,
  onClose,
  onSave,
  onReset,
}) => {
  const [config, setConfig] = useState<Record<string, any>>(
    module?.config || {}
  );
  const [hasChanges, setHasChanges] = useState(false);

  if (!module) return null;

  const fields = getModuleFields(module.type);
  const categorizedFields = fields.reduce(
    (acc, field) => {
      const category = field.category || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(field);
      return acc;
    },
    {} as Record<string, ModuleConfigField[]>
  );

  const handleFieldChange = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    const updatedModule: StorefrontModuleConfig = {
      ...module,
      config: {
        ...module.config,
        ...config,
      },
    };
    onSave(updatedModule);
    setHasChanges(false);
  };

  const handleReset = () => {
    setConfig(module.config || {});
    setHasChanges(false);
    onReset?.();
  };

  const renderField = (field: ModuleConfigField) => {
    const value = config[field.key] ?? field.defaultValue;

    switch (field.type) {
      case 'text':
      case 'textarea':
        return (
          <Input
            label={field.label}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            helperText={field.description}
            required={field.required}
            multiline={field.type === 'textarea'}
            rows={field.type === 'textarea' ? 3 : undefined}
          />
        );

      case 'number':
        return (
          <Input
            type='number'
            label={field.label}
            value={value || field.defaultValue || 0}
            onChange={(e) =>
              handleFieldChange(field.key, parseInt(e.target.value))
            }
            helperText={field.description}
            inputProps={{ min: field.min, max: field.max }}
          />
        );

      case 'boolean':
        return (
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={value || false}
                  onChange={(e) =>
                    handleFieldChange(field.key, e.target.checked)
                  }
                />
              }
              label={field.label}
            />
            {field.description && (
              <Typography
                variant='caption'
                color='text.secondary'
                display='block'
              >
                {field.description}
              </Typography>
            )}
          </Box>
        );

      case 'select':
        return (
          <Select
            label={field.label}
            value={value || field.defaultValue || ''}
            onChange={(newValue) => handleFieldChange(field.key, newValue)}
            options={field.options || []}
            helperText={field.description}
          />
        );

      case 'slider':
        return (
          <Box>
            <Typography variant='body2' gutterBottom>
              {field.label}: {value ?? field.defaultValue}
            </Typography>
            <Slider
              value={value ?? field.defaultValue}
              onChange={(_, newValue) => handleFieldChange(field.key, newValue)}
              min={field.min}
              max={field.max}
              step={field.step}
              valueLabelDisplay='auto'
            />
            {field.description && (
              <Typography variant='caption' color='text.secondary'>
                {field.description}
              </Typography>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'layout':
        return <Layout fontSize='small' />;
      case 'content':
        return <Code fontSize='small' />;
      case 'style':
        return <Palette fontSize='small' />;
      case 'behavior':
        return <Settings fontSize='small' />;
      default:
        return <Settings fontSize='small' />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'layout':
        return 'Layout & Display';
      case 'content':
        return 'Content Settings';
      case 'style':
        return 'Visual Style';
      case 'behavior':
        return 'Behavior & Functionality';
      default:
        return 'General Settings';
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 400,
        height: '100vh',
        bgcolor: 'background.paper',
        borderLeft: 1,
        borderColor: 'divider',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant='h6' fontWeight={600}>
            Configure Module
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {module.title} ({module.type})
          </Typography>
        </Box>
        <Tooltip title='Close'>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Stack spacing={3}>
          {hasChanges && (
            <Alert severity='info' sx={{ mb: 2 }}>
              You have unsaved changes. Don't forget to save your configuration.
            </Alert>
          )}

          {Object.entries(categorizedFields).map(
            ([category, categoryFields]) => (
              <Accordion key={category} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Stack direction='row' spacing={1} alignItems='center'>
                    {getCategoryIcon(category)}
                    <Typography variant='subtitle1' fontWeight={600}>
                      {getCategoryTitle(category)}
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={3}>
                    {categoryFields.map((field) => (
                      <Box key={field.key}>{renderField(field)}</Box>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )
          )}
        </Stack>
      </Box>

      {/* Actions */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'grey.50',
        }}
      >
        <Stack direction='row' spacing={2}>
          <Button
            variant='outline'
            startIcon={<RestartAlt />}
            onClick={handleReset}
            disabled={!hasChanges}
            fullWidth
          >
            Reset
          </Button>
          <Button
            variant='primary'
            startIcon={<Save />}
            onClick={handleSave}
            disabled={!hasChanges}
            fullWidth
          >
            Save Changes
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default ModuleConfiguration;
