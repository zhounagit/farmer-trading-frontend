// Layout Components
export { default as Container } from './Container';
export type { ContainerProps } from './Container';

export { default as Stack } from './Stack';
export type { StackProps } from './Stack';

export { default as Grid, GridContainer, GridItem } from './Grid';
export type { GridProps } from './Grid';

// Re-export useful Material-UI layout components
export {
  Grid,
  Box,
  Stack as MuiStack,
  Container as MuiContainer,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  CardActionArea,
  CardMedia,
} from '@mui/material';

// Layout utilities
export { useMediaQuery, useTheme, Breakpoint } from '@mui/material';
