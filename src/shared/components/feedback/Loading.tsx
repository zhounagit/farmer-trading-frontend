import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Typography,
  Fade,
  Backdrop,
} from '@mui/material';
import { styled } from '@mui/material/styles';

export interface LoadingProps {
  variant?: 'circular' | 'linear' | 'skeleton' | 'overlay' | 'dots';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'inherit';
  text?: string;
  fullScreen?: boolean;
  fullWidth?: boolean;
  height?: number | string;
  rows?: number;
  animation?: 'pulse' | 'wave' | false;
  backdrop?: boolean;
  children?: React.ReactNode;
}

const StyledLoadingContainer = styled(Box, {
  shouldForwardProp: (prop) => !['fullScreen', 'fullWidth', 'backdrop'].includes(prop as string),
})<{ fullScreen?: boolean; fullWidth?: boolean; backdrop?: boolean }>(
  ({ theme, fullScreen, fullWidth, backdrop }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(2),
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: theme.zIndex.modal,
      backgroundColor: backdrop ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
    }),
    ...(fullWidth && !fullScreen && {
      width: '100%',
      minHeight: '200px',
    }),
  })
);

const StyledLoadingText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  fontWeight: 500,
  textAlign: 'center',
  marginTop: theme.spacing(1),
}));

const DotsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  alignItems: 'center',
}));

const Dot = styled(Box)<{ delay: number; size: string }>(({ theme, delay, size }) => {
  const getDotSize = () => {
    switch (size) {
      case 'small':
        return '6px';
      case 'large':
        return '12px';
      default:
        return '8px';
    }
  };

  return {
    width: getDotSize(),
    height: getDotSize(),
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    animation: `dotBounce 1.4s ease-in-out ${delay}s infinite both`,
    '@keyframes dotBounce': {
      '0%, 80%, 100%': {
        transform: 'scale(0)',
      },
      '40%': {
        transform: 'scale(1)',
      },
    },
  };
});

const SkeletonContainer = styled(Box)<{ rows: number }>(({ theme, rows }) => ({
  width: '100%',
  '& > *:not(:last-child)': {
    marginBottom: theme.spacing(1),
  },
}));

const CircularLoading: React.FC<Pick<LoadingProps, 'size' | 'color' | 'text'>> = ({
  size = 'medium',
  color = 'primary',
  text,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 60;
      default:
        return 40;
    }
  };

  return (
    <>
      <CircularProgress size={getSize()} color={color} />
      {text && <StyledLoadingText>{text}</StyledLoadingText>}
    </>
  );
};

const LinearLoading: React.FC<Pick<LoadingProps, 'color' | 'text' | 'fullWidth'>> = ({
  color = 'primary',
  text,
  fullWidth = true,
}) => {
  return (
    <Box sx={{ width: fullWidth ? '100%' : '200px' }}>
      <LinearProgress color={color} />
      {text && (
        <StyledLoadingText sx={{ mt: 1, textAlign: 'center' }}>
          {text}
        </StyledLoadingText>
      )}
    </Box>
  );
};

const SkeletonLoading: React.FC<Pick<LoadingProps, 'height' | 'rows' | 'animation'>> = ({
  height = 20,
  rows = 3,
  animation = 'pulse',
}) => {
  return (
    <SkeletonContainer rows={rows}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          height={height}
          animation={animation}
          sx={{
            borderRadius: 1,
            ...(index === 0 && { width: '60%' }),
            ...(index === rows - 1 && rows > 1 && { width: '80%' }),
          }}
        />
      ))}
    </SkeletonContainer>
  );
};

const DotsLoading: React.FC<Pick<LoadingProps, 'size'>> = ({ size = 'medium' }) => {
  return (
    <DotsContainer>
      <Dot delay={0} size={size} />
      <Dot delay={0.16} size={size} />
      <Dot delay={0.32} size={size} />
    </DotsContainer>
  );
};

export const Loading: React.FC<LoadingProps> = ({
  variant = 'circular',
  size = 'medium',
  color = 'primary',
  text,
  fullScreen = false,
  fullWidth = false,
  height = 20,
  rows = 3,
  animation = 'pulse',
  backdrop = false,
  children,
}) => {
  const renderLoadingContent = () => {
    switch (variant) {
      case 'linear':
        return <LinearLoading color={color} text={text} fullWidth={fullWidth} />;
      case 'skeleton':
        return <SkeletonLoading height={height} rows={rows} animation={animation} />;
      case 'dots':
        return (
          <>
            <DotsLoading size={size} />
            {text && <StyledLoadingText>{text}</StyledLoadingText>}
          </>
        );
      case 'overlay':
        return (
          <Box
            sx={{
              position: 'relative',
              opacity: 0.6,
              pointerEvents: 'none',
            }}
          >
            {children}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
              }}
            >
              <CircularLoading size={size} color={color} text={text} />
            </Box>
          </Box>
        );
      default: // circular
        return <CircularLoading size={size} color={color} text={text} />;
    }
  };

  if (fullScreen) {
    return (
      <Backdrop open={true} sx={{ zIndex: (theme) => theme.zIndex.modal }}>
        <Fade in={true}>
          <StyledLoadingContainer
            fullScreen={fullScreen}
            fullWidth={fullWidth}
            backdrop={backdrop}
          >
            {renderLoadingContent()}
          </StyledLoadingContainer>
        </Fade>
      </Backdrop>
    );
  }

  if (variant === 'overlay') {
    return <>{renderLoadingContent()}</>;
  }

  return (
    <StyledLoadingContainer
      fullScreen={fullScreen}
      fullWidth={fullWidth}
      backdrop={backdrop}
    >
      {renderLoadingContent()}
    </StyledLoadingContainer>
  );
};

export default Loading;
