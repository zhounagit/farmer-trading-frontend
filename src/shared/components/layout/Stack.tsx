import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { BoxProps } from '@mui/material';

export interface StackProps extends Omit<BoxProps, 'gap'> {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  spacing?: number | string;
  divider?: React.ReactElement;
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justifyContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  wrap?: boolean;
  children: React.ReactNode;
}

const StyledStack = styled(Box, {
  shouldForwardProp: (prop) =>
    !['direction', 'spacing', 'alignItems', 'justifyContent', 'wrap'].includes(
      prop as string
    ),
})<StackProps>(({
  theme,
  direction = 'column',
  spacing = 2,
  alignItems,
  justifyContent,
  wrap,
}) => {
  const getSpacing = () => {
    if (typeof spacing === 'number') {
      return theme.spacing(spacing);
    }
    return spacing;
  };

  const isRow = direction === 'row' || direction === 'row-reverse';

  return {
    display: 'flex',
    flexDirection: direction,
    alignItems: alignItems || (isRow ? 'center' : 'stretch'),
    justifyContent: justifyContent || 'flex-start',
    flexWrap: wrap ? 'wrap' : 'nowrap',
    gap: getSpacing(),
  };
});

const StackWithDivider: React.FC<StackProps> = ({
  children,
  divider,
  direction = 'column',
  ...props
}) => {
  const childrenArray = React.Children.toArray(children);
  const isRow = direction === 'row' || direction === 'row-reverse';

  if (!divider) {
    return (
      <StyledStack direction={direction} {...props}>
        {children}
      </StyledStack>
    );
  }

  return (
    <StyledStack direction={direction} {...props} spacing={0}>
      {childrenArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < childrenArray.length - 1 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...(isRow ? { height: '100%' } : { width: '100%' }),
              }}
            >
              {React.cloneElement(divider, {
                ...(divider.props || {}),
              })}
            </Box>
          )}
        </React.Fragment>
      ))}
    </StyledStack>
  );
};

export const Stack: React.FC<StackProps> = ({
  direction = 'column',
  spacing = 2,
  divider,
  alignItems,
  justifyContent,
  wrap = false,
  children,
  ...props
}) => {
  if (divider) {
    return (
      <StackWithDivider
        direction={direction}
        spacing={spacing}
        divider={divider}
        alignItems={alignItems}
        justifyContent={justifyContent}
        wrap={wrap}
        {...props}
      >
        {children}
      </StackWithDivider>
    );
  }

  return (
    <StyledStack
      direction={direction}
      spacing={spacing}
      alignItems={alignItems}
      justifyContent={justifyContent}
      wrap={wrap}
      {...props}
    >
      {children}
    </StyledStack>
  );
};

export default Stack;
