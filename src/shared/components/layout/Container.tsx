import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface ContainerProps extends Omit<BoxProps, 'maxWidth'> {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fluid' | false;
  padding?: 'none' | 'small' | 'medium' | 'large';
  centered?: boolean;
  children: React.ReactNode;
}

const StyledContainer = styled(Box, {
  shouldForwardProp: (prop) => !['padding', 'centered'].includes(prop as string),
})<ContainerProps>(({ theme, maxWidth, padding, centered }) => {
  const getMaxWidth = () => {
    if (maxWidth === false) return 'none';
    if (maxWidth === 'fluid') return '100%';

    const breakpoints = {
      xs: theme.breakpoints.values.xs,
      sm: theme.breakpoints.values.sm,
      md: theme.breakpoints.values.md,
      lg: theme.breakpoints.values.lg,
      xl: theme.breakpoints.values.xl,
    };

    return breakpoints[maxWidth as keyof typeof breakpoints] || breakpoints.lg;
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'small':
        return {
          padding: theme.spacing(1),
          [theme.breakpoints.up('sm')]: {
            padding: theme.spacing(2),
          },
        };
      case 'large':
        return {
          padding: theme.spacing(3),
          [theme.breakpoints.up('sm')]: {
            padding: theme.spacing(4),
          },
          [theme.breakpoints.up('md')]: {
            padding: theme.spacing(6),
          },
        };
      default: // medium
        return {
          padding: theme.spacing(2),
          [theme.breakpoints.up('sm')]: {
            padding: theme.spacing(3),
          },
          [theme.breakpoints.up('md')]: {
            padding: theme.spacing(4),
          },
        };
    }
  };

  return {
    width: '100%',
    maxWidth: getMaxWidth(),
    ...(centered && {
      marginLeft: 'auto',
      marginRight: 'auto',
    }),
    ...getPaddingStyles(),
  };
});

export const Container: React.FC<ContainerProps> = ({
  maxWidth = 'lg',
  padding = 'medium',
  centered = true,
  children,
  ...props
}) => {
  return (
    <StyledContainer
      maxWidth={maxWidth}
      padding={padding}
      centered={centered}
      {...props}
    >
      {children}
    </StyledContainer>
  );
};

export default Container;
