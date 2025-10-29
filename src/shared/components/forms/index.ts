// Form Components
export { default as FormField } from './FormField';
export type { FormFieldProps } from './FormField';

// Re-export useful Material-UI form components
export {
  FormControl,
  FormLabel,
  FormHelperText,
  FormGroup,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  Rating,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

// Date picker components
export {
  DatePicker,
  TimePicker,
  DateTimePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';

// Form validation utilities
export {
  useForm,
  Controller,
  useController,
  useFormContext,
  FormProvider,
  useWatch,
  useFieldArray,
} from 'react-hook-form';

export type {
  Control,
  FieldValues,
  FieldPath,
  UseFormReturn,
  SubmitHandler,
  FieldError,
  ValidationRule,
} from 'react-hook-form';
