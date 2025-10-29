import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
} from '@mui/material';
import {
  Add,
  Delete,
  Settings,
  DragIndicator,
  ViewModule,
  Category,
  Inventory,
  ContactMail,
  Star,
  Image,
  Schedule,
  LocationOn,
} from '@mui/icons-material';
import { Card, Button, Stack } from '../../../../shared/components';
import ModuleConfiguration from './ModuleConfiguration';
import type {
  StorefrontModuleConfig,
  StorefrontModuleType,
  ModuleTemplate,
} from '../../../../types/storefront';

export interface ModuleSectionProps {
  modules: StorefrontModuleConfig[];
  onModulesChange: (modules: StorefrontModuleConfig[]) => void;
  selectedModuleId: string | null;
  onModuleSelect: (id: string | null) => void;
  showAddDialog: boolean;
  onShowAddDialog: (show: boolean) => void;
  availableTemplates: ModuleTemplate[];
  loading?: boolean;
  showConfiguration?: boolean;
  onShowConfiguration?: (show: boolean) => void;
}

const ModuleSection: React.FC<ModuleSectionProps> = ({
  modules,
  onModulesChange,
  selectedModuleId,
  onModuleSelect,
  showAddDialog,
  onShowAddDialog,
  availableTemplates,
  loading = false,
  showConfiguration = false,
  onShowConfiguration,
}) => {
  const handleAddModule = (template: ModuleTemplate) => {
    const newModule: StorefrontModuleConfig = {
      id: `module-${Date.now()}`,
      type: template.type,
      title: template.name,
      enabled: true,
      order: modules.length,
      config: template.defaultConfig || {},
    };

    onModulesChange([...modules, newModule]);
    onShowAddDialog(false);
  };

  const handleDeleteModule = (moduleId: string) => {
    const updatedModules = modules
      .filter((m) => m.id !== moduleId)
      .map((module, index) => ({ ...module, order: index }));

    onModulesChange(updatedModules);

    if (selectedModuleId === moduleId) {
      onModuleSelect(null);
    }
  };

  const handleToggleModule = (moduleId: string) => {
    const updatedModules = modules.map((module) =>
      module.id === moduleId ? { ...module, enabled: !module.enabled } : module
    );
    onModulesChange(updatedModules);
  };

  const handleMoveModule = (moduleId: string, direction: 'up' | 'down') => {
    const currentIndex = modules.findIndex((m) => m.id === moduleId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= modules.length) return;

    const updatedModules = [...modules];
    const [movedModule] = updatedModules.splice(currentIndex, 1);
    updatedModules.splice(newIndex, 0, movedModule);

    // Update order values
    const finalModules = updatedModules.map((module, index) => ({
      ...module,
      order: index,
    }));

    onModulesChange(finalModules);
  };

  const getModuleIcon = (type: StorefrontModuleType) => {
    switch (type) {
      case 'hero-banner':
        return <Image />;
      case 'featured-products':
        return <Star />;
      case 'product-grid':
        return <Category />;
      case 'contact-info':
        return <ContactMail />;
      case 'business-hours':
        return <Schedule />;
      case 'location-map':
        return <LocationOn />;
      case 'inventory-showcase':
        return <Inventory />;
      default:
        return <ViewModule />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Section Header */}
        <Box>
          <Stack
            direction='row'
            spacing={2}
            alignItems='center'
            justifyContent='space-between'
          >
            <Box>
              <Stack
                direction='row'
                spacing={2}
                alignItems='center'
                sx={{ mb: 1 }}
              >
                <ViewModule color='primary' />
                <Typography variant='h6' fontWeight={600}>
                  Storefront Modules
                </Typography>
              </Stack>
              <Typography variant='body2' color='text.secondary'>
                Add and configure modules to customize your storefront layout.
              </Typography>
            </Box>
            <Button
              variant='primary'
              startIcon={<Add />}
              onClick={() => onShowAddDialog(true)}
              disabled={loading}
            >
              Add Module
            </Button>
          </Stack>
        </Box>

        {/* Current Modules */}
        <Card title='Active Modules' variant='outlined'>
          {modules.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                color: 'text.secondary',
              }}
            >
              <ViewModule sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
              <Typography variant='h6' gutterBottom>
                No modules added yet
              </Typography>
              <Typography variant='body2' sx={{ mb: 3 }}>
                Add modules to customize your storefront layout and showcase
                your products.
              </Typography>
              <Button
                variant='primary'
                startIcon={<Add />}
                onClick={() => onShowAddDialog(true)}
              >
                Add Your First Module
              </Button>
            </Box>
          ) : (
            <Stack spacing={2}>
              {modules
                .sort((a, b) => a.order - b.order)
                .map((module, index) => (
                  <Paper
                    key={module.id}
                    sx={{
                      p: 2,
                      border: selectedModuleId === module.id ? 2 : 1,
                      borderColor:
                        selectedModuleId === module.id
                          ? 'primary.main'
                          : 'divider',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    }}
                    onClick={() =>
                      onModuleSelect(
                        selectedModuleId === module.id ? null : module.id
                      )
                    }
                  >
                    <Stack direction='row' alignItems='center' spacing={2}>
                      {/* Drag Handle */}
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                        }}
                      >
                        <Tooltip title='Move up'>
                          <IconButton
                            size='small'
                            disabled={index === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveModule(module.id, 'up');
                            }}
                          >
                            <DragIndicator
                              sx={{ transform: 'rotate(-90deg)' }}
                            />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Move down'>
                          <IconButton
                            size='small'
                            disabled={index === modules.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveModule(module.id, 'down');
                            }}
                          >
                            <DragIndicator
                              sx={{ transform: 'rotate(90deg)' }}
                            />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Module Icon */}
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor: module.enabled
                            ? 'primary.light'
                            : 'grey.300',
                          color: module.enabled ? 'primary.dark' : 'grey.600',
                        }}
                      >
                        {getModuleIcon(module.type)}
                      </Box>

                      {/* Module Info */}
                      <Box flex={1}>
                        <Typography variant='subtitle1' fontWeight={600}>
                          {module.title}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {module.type} • Order: {module.order + 1}
                        </Typography>
                      </Box>

                      {/* Module Actions */}
                      <Stack direction='row' spacing={1}>
                        <Tooltip title={module.enabled ? 'Disable' : 'Enable'}>
                          <Button
                            variant={module.enabled ? 'outline' : 'ghost'}
                            size='small'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleModule(module.id);
                            }}
                          >
                            {module.enabled ? 'Enabled' : 'Disabled'}
                          </Button>
                        </Tooltip>
                        <Tooltip title='Configure'>
                          <IconButton
                            size='small'
                            onClick={(e) => {
                              e.stopPropagation();
                              onModuleSelect(module.id);
                              onShowConfiguration?.(true);
                            }}
                          >
                            <Settings />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Delete'>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteModule(module.id);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
            </Stack>
          )}
        </Card>
      </Stack>

      {/* Add Module Dialog */}
      <Dialog
        open={showAddDialog}
        onClose={() => onShowAddDialog(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          <Stack direction='row' spacing={2} alignItems='center'>
            <Add />
            <Typography variant='h6'>Add Module</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Choose a module type to add to your storefront. You can configure
            and customize it after adding.
          </Typography>

          <Grid container spacing={2}>
            {availableTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.type}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.light',
                    },
                  }}
                  onClick={() => handleAddModule(template)}
                >
                  <Box
                    sx={{
                      p: 1,
                      mb: 2,
                      display: 'inline-flex',
                      borderRadius: 1,
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                    }}
                  >
                    {getModuleIcon(template.type)}
                  </Box>
                  <Typography variant='subtitle2' fontWeight={600} gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {template.description}
                  </Typography>
                  {template.premium && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant='caption' color='secondary.main'>
                        Premium Feature
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant='ghost' onClick={() => onShowAddDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Module Configuration Panel */}
      {showConfiguration && selectedModuleId && onShowConfiguration && (
        <ModuleConfiguration
          module={modules.find((m) => m.id === selectedModuleId) || null}
          onClose={() => {
            onShowConfiguration(false);
            onModuleSelect(null);
          }}
          onSave={(updatedModule) => {
            const updatedModules = modules.map((m) =>
              m.id === updatedModule.id ? updatedModule : m
            );
            onModulesChange(updatedModules);
            onShowConfiguration(false);
            onModuleSelect(null);
          }}
          onReset={() => {
            // Reset functionality can be implemented here
          }}
        />
      )}
    </Box>
  );
};

export default ModuleSection;
