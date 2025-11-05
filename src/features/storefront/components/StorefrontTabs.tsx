import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import { Palette, ViewModule, Visibility } from '@mui/icons-material';
import ThemeSection from './sections/ThemeSection';
import ModuleSection from './sections/ModuleSection';
import PreviewSection from './sections/PreviewSection';
import type {
  StorefrontModuleConfig,
  StorefrontPreviewMode,
  ModuleTemplate,
} from '../../../types/storefront';
import type { StorefrontTheme } from '../../../types/themes';
import type { Store } from '../../../shared/types/store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`storefront-tabpanel-${index}`}
      aria-labelledby={`storefront-tab-${index}`}
      style={{ height: '100%' }}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
}

export interface StorefrontTabsProps {
  activeTab: number;
  onTabChange: (tab: number) => void;

  // Store data
  storeData: Store | null;

  // Theme props
  selectedTheme: StorefrontTheme;
  availableThemes: StorefrontTheme[];
  onThemeChange: (theme: StorefrontTheme) => void;

  // Module props
  modules: StorefrontModuleConfig[];
  onModulesChange: (modules: StorefrontModuleConfig[]) => void;
  selectedModuleId: string | null;
  onModuleSelect: (id: string | null) => void;
  showAddModuleDialog: boolean;
  onShowAddModuleDialog: (show: boolean) => void;
  availableTemplates: ModuleTemplate[];

  // Preview props
  previewMode: StorefrontPreviewMode;
  onPreviewModeChange: (mode: StorefrontPreviewMode) => void;

  loading?: boolean;
}

const StorefrontTabs: React.FC<StorefrontTabsProps> = ({
  activeTab,
  onTabChange,
  storeData,
  selectedTheme,
  availableThemes,
  onThemeChange,
  modules,
  onModulesChange,
  selectedModuleId,
  onModuleSelect,
  showAddModuleDialog,
  onShowAddModuleDialog,
  availableTemplates,
  previewMode,
  onPreviewModeChange,
  loading = false,
}) => {
  const [showModuleConfiguration, setShowModuleConfiguration] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    onTabChange(newValue);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tab Navigation */}
      <Paper
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant='fullWidth'
          indicatorColor='primary'
          textColor='primary'
          sx={{
            minHeight: 64,
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
            },
          }}
        >
          <Tab
            icon={<Palette />}
            iconPosition='start'
            label='Theme & Design'
            id='storefront-tab-0'
            aria-controls='storefront-tabpanel-0'
          />
          <Tab
            icon={<ViewModule />}
            iconPosition='start'
            label='Layout & Modules'
            id='storefront-tab-1'
            aria-controls='storefront-tabpanel-1'
          />
          <Tab
            icon={<Visibility />}
            iconPosition='start'
            label='Preview'
            id='storefront-tab-2'
            aria-controls='storefront-tabpanel-2'
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <TabPanel value={activeTab} index={0}>
          <ThemeSection
            selectedTheme={selectedTheme}
            availableThemes={availableThemes}
            onThemeChange={onThemeChange}
            isLivePreview={previewMode.isLivePreview}
            onLivePreviewToggle={(enabled) =>
              onPreviewModeChange({
                ...previewMode,
                isLivePreview: enabled,
              })
            }
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ModuleSection
            modules={modules}
            onModulesChange={onModulesChange}
            selectedModuleId={selectedModuleId}
            onModuleSelect={onModuleSelect}
            showAddDialog={showAddModuleDialog}
            onShowAddDialog={onShowAddModuleDialog}
            availableTemplates={availableTemplates}
            loading={loading}
            showConfiguration={showModuleConfiguration}
            onShowConfiguration={setShowModuleConfiguration}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <PreviewSection
            storeData={storeData}
            selectedTheme={selectedTheme}
            modules={modules}
            previewMode={previewMode}
            onPreviewModeChange={onPreviewModeChange}
            loading={loading}
          />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default StorefrontTabs;
