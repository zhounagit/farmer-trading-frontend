import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface GridProps extends Omit<BoxProps, 'container' | 'item'> {
  container?: boolean;
  item?: boolean;
  spacing?: number | string;
  columns?: number;
  xs?: number | 'auto';
  sm?: number | 'auto';
  md?: number | 'auto';
  lg?: number | 'auto';
  xl?: number | 'auto';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  children: React.ReactNode;
}

const StyledGrid = styled(Box, {
  shouldForwardProp: (prop) => !['container', 'item', 'spacing', 'columns', 'xs', 'sm', 'md', 'lg', 'xl', 'wrap', 'direction'].includes(prop as string),
})<GridProps>(({
  theme,
  container,
  item,
  spacing = 0,
  columns = 12,
  xs,
  sm,
  md,
  lg,
  xl,
  wrap = 'wrap',
  direction = 'row',
  alignItems,
  justifyContent
}) => {
  const getSpacing = () => {
    if (typeof spacing === 'number') {
      return theme.spacing(spacing);
    }
    return spacing;
  };

  const getBreakpointStyles = (breakpoint: number | 'auto' | undefined, breakpointName: string) => {
    if (breakpoint === undefined) return {};

    if (breakpoint === 'auto') {
      return {
        [theme.breakpoints.up(breakpointName as any)]: {
          flexBasis: 'auto',
          flexGrow: 1,
          maxWidth: 'none',
        }
      };
    }

    const percentage = (breakpoint / columns) * 100;
    return {
      [theme.breakpoints.up(breakpointName as any)]: {
        flexBasis: `${percentage}%`,
        flexGrow: 0,
        maxWidth: `${percentage}%`,
      }
    };
  };

  if (container) {
    return {
      display: 'flex',
      flexWrap: wrap,
      flexDirection: direction,
      alignItems: alignItems || (direction.includes('column') ? 'stretch' : 'flex-start'),
      justifyContent: justifyContent || 'flex-start',
      width: '100%',
      margin: spacing ? `-${getSpacing()}` : 0,
      '& > *': {
        padding: spacing ? getSpacing() : 0,
      },
    };
  }

  if (item) {
    return {
      flexBasis: 0,
      flexGrow: 1,
      maxWidth: '100%',
      ...getBreakpointStyles(xs, 'xs'),
      ...getBreakpointStyles(sm, 'sm'),
      ...getBreakpointStyles(md, 'md'),
      ...getBreakpointStyles(lg, 'lg'),
      ...getBreakpointStyles(xl, 'xl'),
    };
  }

  return {};
});

export const Grid: React.FC<GridProps> = ({
  container = false,
  item = false,
  spacing = 0,
  columns = 12,
  xs,
  sm,
  md,
  lg,
  xl,
  wrap = 'wrap',
  direction = 'row',
  alignItems,
  justifyContent,
  children,
  ...props
}) => {
  return (
    <StyledGrid
      container={container}
      item={item}
      spacing={spacing}
      columns={columns}
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      wrap={wrap}
      direction={direction}
      alignItems={alignItems}
      justifyContent={justifyContent}
      {...props}
    >
      {children}
    </StyledGrid>
  );
};

// Convenience components for common grid patterns
export const GridContainer: React.FC<Omit<GridProps, 'container'>> = (props) => (
  <Grid container {...props} />
);

export const GridItem: React.FC<Omit<GridProps, 'item'>> = (props) => (
  <Grid item {...props} />
);

export default Grid;
