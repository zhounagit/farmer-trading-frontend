import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  Tabs,
  Tab,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
} from '@mui/material';
import {
  Palette,
  TextFormat,
  Layout,
  Tune,
  RestoreOutlined,
  Save,
  Preview,
  ExpandMore,
  ColorLens,
  FormatSize,
  AspectRatio,
  Animation,
  Help,
} from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';
import {
  AVAILABLE_THEMES,
  getThemeById,
  generateThemeCSS,
} from '../../types/themes';
import type { StorefrontTheme } from '../../types/themes';
import ThemePreview from './ThemePreview';
import ThemeSelector from './ThemeSelector';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`theme-tabpanel-${index}`}
      aria-labelledby={`theme-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

interface ThemeCustomizerProps {
  selectedThemeId?: string;
  onThemeChange: (theme: StorefrontTheme) => void;
  onSave?: (customizedTheme: StorefrontTheme) => void;
  disabled?: boolean;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  selectedThemeId,
  onThemeChange,
  onSave,
  disabled = false,
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<StorefrontTheme | null>(
    null
  );
  const [customizedTheme, setCustomizedTheme] =
    useState<StorefrontTheme | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize theme
  useEffect(() => {
    if (selectedThemeId) {
      const theme = getThemeById(selectedThemeId);
      if (theme) {
        setSelectedTheme(theme);
        setCustomizedTheme({ ...theme });
      }
    }
  }, [selectedThemeId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleThemeSelect = (theme: StorefrontTheme) => {
    setSelectedTheme(theme);
    setCustomizedTheme({ ...theme });
    setHasUnsavedChanges(false);
    onThemeChange(theme);
  };

  const handleColorChange = (colorKey: string, newColor: string) => {
    if (!customizedTheme) return;

    const updatedTheme = { ...customizedTheme };

    // Handle nested color properties
    if (colorKey.includes('.')) {
      const [parent, child] = colorKey.split('.');
      if (parent === 'text' && typeof updatedTheme.colors.text === 'object') {
        updatedTheme.colors.text = {
          ...updatedTheme.colors.text,
          [child]: newColor,
        };
      }
    } else {
      updatedTheme.colors = {
        ...updatedTheme.colors,
        [colorKey]: newColor,
      };
    }

    setCustomizedTheme(updatedTheme);
    setHasUnsavedChanges(true);
    onThemeChange(updatedTheme);
  };

  const handleTypographyChange = (property: string, value: any) => {
    if (!customizedTheme) return;

    const updatedTheme = { ...customizedTheme };

    if (property.includes('.')) {
      const [parent, child] = property.split('.');
      if (parent === 'fontFamily') {
        updatedTheme.typography.fontFamily = {
          ...updatedTheme.typography.fontFamily,
          [child]: value,
        };
      } else if (parent === 'fontWeight') {
        updatedTheme.typography.fontWeight = {
          ...updatedTheme.typography.fontWeight,
          [child]: value,
        };
      }
    } else {
      updatedTheme.typography = {
        ...updatedTheme.typography,
        [property]: value,
      };
    }

    setCustomizedTheme(updatedTheme);
    setHasUnsavedChanges(true);
    onThemeChange(updatedTheme);
  };

  const handleLayoutChange = (property: string, value: any) => {
    if (!customizedTheme) return;

    const updatedTheme = { ...customizedTheme };

    if (property.includes('.')) {
      const [parent, child] = property.split('.');
      if (parent === 'borderRadius') {
        updatedTheme.layout.borderRadius = {
          ...updatedTheme.layout.borderRadius,
          [child]: value,
        };
      }
    } else {
      updatedTheme.layout = {
        ...updatedTheme.layout,
        [property]: value,
      };
    }

    setCustomizedTheme(updatedTheme);
    setHasUnsavedChanges(true);
    onThemeChange(updatedTheme);
  };

  const handleEffectsChange = (property: string, value: any) => {
    if (!customizedTheme) return;

    const updatedTheme = { ...customizedTheme };

    if (property.includes('.')) {
      const [parent, child] = property.split('.');
      if (parent === 'boxShadow') {
        updatedTheme.effects.boxShadow = {
          ...updatedTheme.effects.boxShadow,
          [child]: value,
        };
      } else if (parent === 'transition') {
        updatedTheme.effects.transition = {
          ...updatedTheme.effects.transition,
          [child]: value,
        };
      }
    }

    setCustomizedTheme(updatedTheme);
    setHasUnsavedChanges(true);
    onThemeChange(updatedTheme);
  };

  const handleResetToOriginal = () => {
    if (selectedTheme) {
      setCustomizedTheme({ ...selectedTheme });
      setHasUnsavedChanges(false);
      onThemeChange(selectedTheme);
    }
  };

  const handleSave = () => {
    if (customizedTheme && onSave) {
      onSave(customizedTheme);
      setHasUnsavedChanges(false);
    }
  };

  const fontOptions = [
    'Inter, sans-serif',
    'Roboto, sans-serif',
    'Poppins, sans-serif',
    'Open Sans, sans-serif',
    'Lato, sans-serif',
    'Montserrat, sans-serif',
    'Merriweather, serif',
    'Georgia, serif',
    'Times New Roman, serif',
    'Playfair Display, serif',
  ];

  const spacingOptions = [
    { value: 'compact', label: 'Compact' },
    { value: 'normal', label: 'Normal' },
    { value: 'spacious', label: 'Spacious' },
  ];

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h5' sx={{ fontWeight: 600 }}>
          Theme Customization
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {hasUnsavedChanges && (
            <Button
              startIcon={<RestoreOutlined />}
              onClick={handleResetToOriginal}
              disabled={disabled}
            >
              Reset
            </Button>
          )}
          <Button
            startIcon={<Save />}
            variant='contained'
            onClick={handleSave}
            disabled={disabled || !hasUnsavedChanges}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      {hasUnsavedChanges && (
        <Alert severity='info' sx={{ mb: 3 }}>
          You have unsaved changes. Don't forget to save your customizations!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Customization Panel */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Tabs value={currentTab} onChange={handleTabChange}>
                <Tab
                  icon={<Palette />}
                  label='Theme'
                  id='theme-tab-0'
                  aria-controls='theme-tabpanel-0'
                />
                <Tab
                  icon={<ColorLens />}
                  label='Colors'
                  id='theme-tab-1'
                  aria-controls='theme-tabpanel-1'
                />
                <Tab
                  icon={<TextFormat />}
                  label='Typography'
                  id='theme-tab-2'
                  aria-controls='theme-tabpanel-2'
                />
                <Tab
                  icon={<Layout />}
                  label='Layout'
                  id='theme-tab-3'
                  aria-controls='theme-tabpanel-3'
                />
              </Tabs>

              {/* Theme Selection Tab */}
              <TabPanel value={currentTab} index={0}>
                <ThemeSelector
                  selectedThemeId={selectedTheme?.id}
                  onThemeSelect={handleThemeSelect}
                  disabled={disabled}
                />
              </TabPanel>

              {/* Colors Tab */}
              <TabPanel value={currentTab} index={1}>
                {customizedTheme && (
                  <Box>
                    <Typography variant='h6' gutterBottom>
                      Color Palette
                    </Typography>

                    {/* Primary Colors */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Primary Colors</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          {['primary', 'secondary', 'accent'].map((color) => (
                            <Box
                              key={color}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  backgroundColor: customizedTheme.colors[
                                    color as keyof typeof customizedTheme.colors
                                  ] as string,
                                  borderRadius: 1,
                                  border: '1px solid #e0e0e0',
                                  cursor: 'pointer',
                                }}
                                onClick={() =>
                                  setShowColorPicker(
                                    showColorPicker === color ? null : color
                                  )
                                }
                              />
                              <Typography
                                sx={{
                                  minWidth: 80,
                                  textTransform: 'capitalize',
                                }}
                              >
                                {color}
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                {
                                  customizedTheme.colors[
                                    color as keyof typeof customizedTheme.colors
                                  ] as string
                                }
                              </Typography>
                              {showColorPicker === color && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    zIndex: 1000,
                                    mt: 2,
                                  }}
                                >
                                  <HexColorPicker
                                    color={
                                      customizedTheme.colors[
                                        color as keyof typeof customizedTheme.colors
                                      ] as string
                                    }
                                    onChange={(newColor) =>
                                      handleColorChange(color, newColor)
                                    }
                                  />
                                  <Button
                                    size='small'
                                    onClick={() => setShowColorPicker(null)}
                                    sx={{ mt: 1, width: '100%' }}
                                  >
                                    Done
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>

                    {/* Background Colors */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Background Colors</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          {['background', 'surface'].map((color) => (
                            <Box
                              key={color}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  backgroundColor: customizedTheme.colors[
                                    color as keyof typeof customizedTheme.colors
                                  ] as string,
                                  borderRadius: 1,
                                  border: '1px solid #e0e0e0',
                                  cursor: 'pointer',
                                }}
                                onClick={() =>
                                  setShowColorPicker(
                                    showColorPicker === color ? null : color
                                  )
                                }
                              />
                              <Typography
                                sx={{
                                  minWidth: 80,
                                  textTransform: 'capitalize',
                                }}
                              >
                                {color}
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                {
                                  customizedTheme.colors[
                                    color as keyof typeof customizedTheme.colors
                                  ] as string
                                }
                              </Typography>
                              {showColorPicker === color && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    zIndex: 1000,
                                    mt: 2,
                                  }}
                                >
                                  <HexColorPicker
                                    color={
                                      customizedTheme.colors[
                                        color as keyof typeof customizedTheme.colors
                                      ] as string
                                    }
                                    onChange={(newColor) =>
                                      handleColorChange(color, newColor)
                                    }
                                  />
                                  <Button
                                    size='small'
                                    onClick={() => setShowColorPicker(null)}
                                    sx={{ mt: 1, width: '100%' }}
                                  >
                                    Done
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>

                    {/* Text Colors */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Text Colors</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          {Object.entries(customizedTheme.colors.text).map(
                            ([textType, textColor]) => (
                              <Box
                                key={textType}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    backgroundColor: textColor,
                                    borderRadius: 1,
                                    border: '1px solid #e0e0e0',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() =>
                                    setShowColorPicker(
                                      showColorPicker === `text.${textType}`
                                        ? null
                                        : `text.${textType}`
                                    )
                                  }
                                />
                                <Typography
                                  sx={{
                                    minWidth: 80,
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {textType}
                                </Typography>
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                >
                                  {textColor}
                                </Typography>
                                {showColorPicker === `text.${textType}` && (
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      zIndex: 1000,
                                      mt: 2,
                                    }}
                                  >
                                    <HexColorPicker
                                      color={textColor}
                                      onChange={(newColor) =>
                                        handleColorChange(
                                          `text.${textType}`,
                                          newColor
                                        )
                                      }
                                    />
                                    <Button
                                      size='small'
                                      onClick={() => setShowColorPicker(null)}
                                      sx={{ mt: 1, width: '100%' }}
                                    >
                                      Done
                                    </Button>
                                  </Box>
                                )}
                              </Box>
                            )
                          )}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                )}
              </TabPanel>

              {/* Typography Tab */}
              <TabPanel value={currentTab} index={2}>
                {customizedTheme && (
                  <Box>
                    <Typography variant='h6' gutterBottom>
                      Typography Settings
                    </Typography>

                    <Stack spacing={3}>
                      {/* Font Families */}
                      <FormControl fullWidth>
                        <InputLabel>Primary Font</InputLabel>
                        <Select
                          value={customizedTheme.typography.fontFamily.primary}
                          onChange={(e) =>
                            handleTypographyChange(
                              'fontFamily.primary',
                              e.target.value
                            )
                          }
                        >
                          {fontOptions.map((font) => (
                            <MenuItem key={font} value={font}>
                              <Typography sx={{ fontFamily: font }}>
                                {font}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <InputLabel>Secondary Font</InputLabel>
                        <Select
                          value={
                            customizedTheme.typography.fontFamily.secondary ||
                            customizedTheme.typography.fontFamily.primary
                          }
                          onChange={(e) =>
                            handleTypographyChange(
                              'fontFamily.secondary',
                              e.target.value
                            )
                          }
                        >
                          {fontOptions.map((font) => (
                            <MenuItem key={font} value={font}>
                              <Typography sx={{ fontFamily: font }}>
                                {font}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Font Weights */}
                      <Box>
                        <Typography variant='subtitle2' gutterBottom>
                          Font Weights
                        </Typography>
                        {Object.entries(
                          customizedTheme.typography.fontWeight
                        ).map(([weight, value]) => (
                          <Box key={weight} sx={{ mb: 2 }}>
                            <Typography
                              variant='body2'
                              gutterBottom
                              textTransform='capitalize'
                            >
                              {weight}: {value}
                            </Typography>
                            <Slider
                              value={value}
                              min={100}
                              max={900}
                              step={100}
                              onChange={(_, newValue) =>
                                handleTypographyChange(
                                  `fontWeight.${weight}`,
                                  newValue
                                )
                              }
                              marks={[
                                { value: 100, label: '100' },
                                { value: 400, label: '400' },
                                { value: 700, label: '700' },
                                { value: 900, label: '900' },
                              ]}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Stack>
                  </Box>
                )}
              </TabPanel>

              {/* Layout Tab */}
              <TabPanel value={currentTab} index={3}>
                {customizedTheme && (
                  <Box>
                    <Typography variant='h6' gutterBottom>
                      Layout Settings
                    </Typography>

                    <Stack spacing={3}>
                      <TextField
                        label='Max Width'
                        value={customizedTheme.layout.maxWidth}
                        onChange={(e) =>
                          handleLayoutChange('maxWidth', e.target.value)
                        }
                        helperText='e.g., 1200px, 100%, 80vw'
                      />

                      <TextField
                        label='Container Padding'
                        value={customizedTheme.layout.containerPadding}
                        onChange={(e) =>
                          handleLayoutChange('containerPadding', e.target.value)
                        }
                        helperText='e.g., 1rem, 16px, 2%'
                      />

                      <FormControl fullWidth>
                        <InputLabel>Spacing Style</InputLabel>
                        <Select
                          value={customizedTheme.spacing.md} // Using md as representative
                          onChange={(e) => {
                            // This would need to update all spacing values proportionally
                            // For now, just update the layout spacing preference
                          }}
                        >
                          {spacingOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Border Radius */}
                      <Box>
                        <Typography variant='subtitle2' gutterBottom>
                          Border Radius
                        </Typography>
                        {Object.entries(
                          customizedTheme.layout.borderRadius
                        ).map(([size, value]) => (
                          <Box key={size} sx={{ mb: 2 }}>
                            <TextField
                              label={`${size.toUpperCase()} Radius`}
                              value={value}
                              onChange={(e) =>
                                handleLayoutChange(
                                  `borderRadius.${size}`,
                                  e.target.value
                                )
                              }
                              size='small'
                              fullWidth
                            />
                          </Box>
                        ))}
                      </Box>
                    </Stack>
                  </Box>
                )}
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>

        {/* Preview Panel */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
              >
                <Preview />
                <Typography variant='h6'>Live Preview</Typography>
              </Box>
              {customizedTheme && <ThemePreview theme={customizedTheme} />}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThemeCustomizer;
