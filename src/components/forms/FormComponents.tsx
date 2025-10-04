import React from 'react';
import {
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  FormHelperText,
  Box,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export interface FormFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'textarea' | 'url';
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export interface SelectFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string) => void;
  options: Array<{ value: string | number; label: string }>;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export interface CheckboxFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  label: string;
  name: string;
  options: Array<{ value: string; label: string; description?: string }>;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface RadioGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; description?: string }>;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  row?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  helperText,
  required = false,
  placeholder,
  type = 'text',
  disabled = false,
  multiline = false,
  rows = 1,
  maxLength,
  startIcon,
  endIcon,
  fullWidth = true,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  const InputProps: any = {};

  if (startIcon) {
    InputProps.startAdornment = (
      <InputAdornment position="start">
        {startIcon}
      </InputAdornment>
    );
  }

  if (type === 'password') {
    InputProps.endAdornment = (
      <InputAdornment position="end">
        <IconButton
          onClick={handleTogglePassword}
          edge="end"
          size="small"
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    );
  } else if (endIcon) {
    InputProps.endAdornment = (
      <InputAdornment position="end">
        {endIcon}
      </InputAdornment>
    );
  }

  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={!!error}
      helperText={error || helperText || (maxLength ? `${String(value).length}/${maxLength}` : undefined)}
      required={required}
      placeholder={placeholder}
      type={inputType}
      disabled={disabled}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      fullWidth={fullWidth}
      InputProps={InputProps}
      inputProps={{
        maxLength,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 1.5,
        },
      }}
    />
  );
};

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
}) => {
  return (
    <FormControl fullWidth={fullWidth} error={!!error} disabled={disabled}>
      <InputLabel required={required}>{label}</InputLabel>
      <Select
        label={label}
        name={name}
        value={value}
        onChange={(e) => onChange(String(e.target.value))}
        sx={{
          borderRadius: 1.5,
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  name,
  checked,
  onChange,
  error,
  disabled = false,
}) => {
  return (
    <Box>
      <FormControlLabel
        control={
          <Checkbox
            name={name}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            color="primary"
          />
        }
        label={label}
      />
      {error && (
        <FormHelperText error sx={{ ml: 0, mt: 0.5 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
};

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  name,
  options,
  selectedValues,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
}) => {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, optionValue]);
    } else {
      onChange(selectedValues.filter(value => value !== optionValue));
    }
  };

  return (
    <FormControl component="fieldset" error={!!error} disabled={disabled}>
      <FormLabel component="legend" required={required}>
        {label}
      </FormLabel>
      <FormGroup sx={{ mt: 1 }}>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            control={
              <Checkbox
                checked={selectedValues.includes(option.value)}
                onChange={(e) => handleChange(option.value, e.target.checked)}
                name={`${name}-${option.value}`}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {option.label}
                </Typography>
                {option.description && (
                  <Typography variant="caption" color="text.secondary">
                    {option.description}
                  </Typography>
                )}
              </Box>
            }
            sx={{
              alignItems: 'flex-start',
              mb: option.description ? 1 : 0.5,
              '& .MuiCheckbox-root': {
                pt: option.description ? 0 : 1
              }
            }}
          />
        ))}
      </FormGroup>
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export const RadioGroupField: React.FC<RadioGroupProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  helperText,
  required = false,
  disabled = false,
  row = false,
}) => {
  return (
    <FormControl component="fieldset" error={!!error} disabled={disabled}>
      <FormLabel component="legend" required={required}>
        {label}
      </FormLabel>
      <RadioGroup
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        row={row}
        sx={{ mt: 1 }}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio color="primary" />}
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {option.label}
                </Typography>
                {option.description && (
                  <Typography variant="caption" color="text.secondary">
                    {option.description}
                  </Typography>
                )}
              </Box>
            }
            sx={{
              alignItems: 'flex-start',
              mb: option.description ? 1 : 0.5,
              '& .MuiRadio-root': {
                pt: option.description ? 0 : 1
              }
            }}
          />
        ))}
      </RadioGroup>
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

// Form Section wrapper component
export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  elevation?: number;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  icon,
  elevation = 1,
}) => {
  return (
    <Box
      sx={{
        p: 3,
        mb: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'background.paper',
        boxShadow: elevation > 0 ? 1 : 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: description ? 2 : 3 }}>
        {icon && (
          <Box sx={{ mr: 2, color: 'primary.main' }}>
            {icon}
          </Box>
        )}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>

      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
      )}

      {children}
    </Box>
  );
};

// Address form component
interface AddressFormProps {
  addressData: {
    locationName: string;
    contactPhone: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  disabled?: boolean;
  showLocationName?: boolean;
  showContactPhone?: boolean;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  addressData,
  onChange,
  errors,
  disabled = false,
  showLocationName = true,
  showContactPhone = true,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {showLocationName && (
        <FormField
          label="Location Name"
          name="locationName"
          value={addressData.locationName}
          onChange={(value) => onChange('locationName', value)}
          error={errors.locationName}
          required
          disabled={disabled}
          placeholder="e.g., Main Farm Office"
        />
      )}

      {showContactPhone && (
        <FormField
          label="Contact Phone"
          name="contactPhone"
          type="tel"
          value={addressData.contactPhone}
          onChange={(value) => onChange('contactPhone', value)}
          error={errors.contactPhone}
          required
          disabled={disabled}
          placeholder="(555) 123-4567"
        />
      )}

      <FormField
        label="Street Address"
        name="streetAddress"
        value={addressData.streetAddress}
        onChange={(value) => onChange('streetAddress', value)}
        error={errors.streetAddress}
        required
        disabled={disabled}
        placeholder="123 Farm Road"
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormField
          label="City"
          name="city"
          value={addressData.city}
          onChange={(value) => onChange('city', value)}
          error={errors.city}
          required
          disabled={disabled}
          placeholder="City"
        />

        <FormField
          label="State"
          name="state"
          value={addressData.state}
          onChange={(value) => onChange('state', value)}
          error={errors.state}
          required
          disabled={disabled}
          placeholder="CA"
        />

        <FormField
          label="ZIP Code"
          name="zipCode"
          value={addressData.zipCode}
          onChange={(value) => onChange('zipCode', value)}
          error={errors.zipCode}
          required
          disabled={disabled}
          placeholder="12345"
        />
      </Box>
    </Box>
  );
};
