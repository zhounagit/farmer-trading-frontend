import React, { useState, useRef, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Checkbox,
  Chip,
  Box,
  TextField,
  InputAdornment,
  ClickAwayListener,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemButton,
  Typography,
  Divider,
} from '@mui/material';
import { Search, KeyboardArrowDown, Clear, Check } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number | (string | number)[];
  onChange: (value: string | number | (string | number)[]) => void;
  label?: string;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';

  maxHeight?: number;
  loading?: boolean;
  renderOption?: (option: SelectOption) => React.ReactNode;
  renderValue?: (selected: SelectOption[]) => React.ReactNode;
  noOptionsText?: string;
  groupBy?: (option: SelectOption) => string;
  onSearchChange?: (searchTerm: string) => void;
}

const StyledPopper = styled(Popper)(({ theme }) => ({
  zIndex: theme.zIndex.modal,
  minWidth: '200px',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[8],
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    borderLeft: 'none',
    borderRight: 'none',
    borderTop: 'none',
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.divider,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '1px',
    },
  },
}));

const OptionsList = styled(List)<{ maxHeight?: number }>(
  ({ theme, maxHeight }) => ({
    maxHeight: maxHeight || 250,
    overflowY: 'auto',
    padding: theme.spacing(0.5, 0),
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.grey[100],
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.grey[400],
      borderRadius: '3px',
    },
  })
);

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.25),
  height: '24px',
  '& .MuiChip-deleteIcon': {
    fontSize: '16px',
  },
}));

const Select: React.FC<SelectProps> = ({
  options = [],
  value,
  onChange,
  label,
  placeholder = 'Select option...',
  multiple = false,
  searchable = false,
  clearable = false,
  disabled = false,
  error = false,
  helperText,
  required = false,
  fullWidth = true,
  size = 'medium',

  maxHeight = 250,
  loading = false,
  renderOption,
  renderValue,
  noOptionsText = 'No options available',
  groupBy,
  onSearchChange,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const anchorRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle search
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(searchTerm);
    }
  }, [searchTerm, onSearchChange]);

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Group options if groupBy is provided
  const groupedOptions = React.useMemo(() => {
    if (!groupBy) return { '': filteredOptions };

    const groups: Record<string, SelectOption[]> = {};
    filteredOptions.forEach((option) => {
      const group = groupBy(option);
      if (!groups[group]) groups[group] = [];
      groups[group].push(option);
    });
    return groups;
  }, [filteredOptions, groupBy]);

  // Get selected options
  const selectedOptions = React.useMemo(() => {
    if (!value) return [];
    const values = Array.isArray(value) ? value : [value];
    return options.filter((option) => values.includes(option.value));
  }, [value, options]);

  // Handle option click
  const handleOptionClick = (option: SelectOption) => {
    if (option.disabled) return;

    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.includes(option.value);

      if (isSelected) {
        const newValues = currentValues.filter((v) => v !== option.value);
        onChange(newValues);
      } else {
        onChange([...currentValues, option.value]);
      }
    } else {
      onChange(option.value);
      setOpen(false);
    }
  };

  // Handle clear
  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange(multiple ? [] : '');
  };

  // Handle chip delete
  const handleChipDelete = (optionValue: string | number) => {
    if (!multiple || !Array.isArray(value)) return;
    const newValues = value.filter((v) => v !== optionValue);
    onChange(newValues);
  };

  // Render selected value
  const renderSelectedValue = () => {
    if (renderValue) {
      return renderValue(selectedOptions);
    }

    if (multiple) {
      if (selectedOptions.length === 0) return placeholder;

      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selectedOptions.map((option) => (
            <StyledChip
              key={option.value}
              label={option.label}
              onDelete={() => handleChipDelete(option.value)}
              size='small'
              variant='outlined'
            />
          ))}
        </Box>
      );
    }

    return selectedOptions.length > 0 ? selectedOptions[0].label : placeholder;
  };

  // Render option
  const renderOptionItem = (option: SelectOption) => {
    if (renderOption) {
      return renderOption(option);
    }

    const isSelected = multiple
      ? Array.isArray(value) && value.includes(option.value)
      : value === option.value;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {multiple && (
          <Checkbox checked={isSelected} size='small' sx={{ mr: 1 }} />
        )}
        {option.icon && (
          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
            {option.icon}
          </Box>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant='body2'
            color={option.disabled ? 'text.disabled' : 'text.primary'}
          >
            {option.label}
          </Typography>
          {option.description && (
            <Typography variant='caption' color='text.secondary'>
              {option.description}
            </Typography>
          )}
        </Box>
        {!multiple && isSelected && <Check fontSize='small' color='primary' />}
      </Box>
    );
  };

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open, searchable]);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box>
        <FormControl
          fullWidth={fullWidth}
          error={error}
          disabled={disabled}
          required={required}
          size={size}
        >
          {label && <InputLabel>{label}</InputLabel>}

          <Box
            ref={anchorRef}
            onClick={() => !disabled && setOpen(!open)}
            sx={{
              position: 'relative',
              cursor: disabled ? 'default' : 'pointer',
              minHeight: size === 'small' ? 40 : 56,
              display: 'flex',
              alignItems: 'center',
              px: 2,
              py: 1,
              border: 1,
              borderColor: error
                ? 'error.main'
                : open
                  ? 'primary.main'
                  : 'grey.300',
              borderRadius: 1,
              backgroundColor: disabled ? 'grey.100' : 'background.paper',
              '&:hover': {
                borderColor: disabled
                  ? 'grey.300'
                  : error
                    ? 'error.main'
                    : 'grey.400',
              },
              transition: 'border-color 0.2s',
            }}
          >
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>{renderSelectedValue()}</Box>

            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              {clearable && (selectedOptions.length > 0 || value) && (
                <Clear
                  fontSize='small'
                  onClick={handleClear}
                  sx={{
                    cursor: 'pointer',
                    color: 'grey.500',
                    mr: 0.5,
                    '&:hover': { color: 'grey.700' },
                  }}
                />
              )}
              <KeyboardArrowDown
                fontSize='small'
                sx={{
                  color: 'grey.500',
                  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            </Box>
          </Box>

          {helperText && (
            <Typography
              variant='caption'
              color={error ? 'error' : 'text.secondary'}
              sx={{ mt: 0.5, mx: 2 }}
            >
              {helperText}
            </Typography>
          )}
        </FormControl>

        <StyledPopper
          open={open}
          anchorEl={anchorRef.current}
          placement='bottom-start'
          style={{ width: anchorRef.current?.offsetWidth }}
        >
          <StyledPaper>
            {searchable && (
              <>
                <SearchField
                  ref={searchInputRef}
                  fullWidth
                  placeholder='Search options...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Search fontSize='small' />
                      </InputAdornment>
                    ),
                  }}
                  size='small'
                />
                <Divider />
              </>
            )}

            <OptionsList maxHeight={maxHeight}>
              {loading ? (
                <ListItem>
                  <Typography variant='body2' color='text.secondary'>
                    Loading...
                  </Typography>
                </ListItem>
              ) : filteredOptions.length === 0 ? (
                <ListItem>
                  <Typography variant='body2' color='text.secondary'>
                    {noOptionsText}
                  </Typography>
                </ListItem>
              ) : (
                Object.entries(groupedOptions).map(
                  ([groupName, groupOptions]) => (
                    <React.Fragment key={groupName}>
                      {groupName && (
                        <>
                          <ListItem>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                              fontWeight={600}
                              textTransform='uppercase'
                            >
                              {groupName}
                            </Typography>
                          </ListItem>
                          <Divider />
                        </>
                      )}
                      {groupOptions.map((option) => (
                        <ListItemButton
                          key={option.value}
                          onClick={() => handleOptionClick(option)}
                          disabled={option.disabled}
                          sx={{
                            py: 1,
                            px: 2,
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          {renderOptionItem(option)}
                        </ListItemButton>
                      ))}
                    </React.Fragment>
                  )
                )
              )}
            </OptionsList>
          </StyledPaper>
        </StyledPopper>
      </Box>
    </ClickAwayListener>
  );
};

export default Select;
