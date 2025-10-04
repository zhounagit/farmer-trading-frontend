import React from 'react';
import { Box, Typography, SvgIcon } from '@mui/material';
import { styled } from '@mui/material/styles';

// Custom house icon for HelloNeighbors theme
const HouseIcon = () => (
  <SvgIcon viewBox='0 0 24 24' sx={{ fontSize: 'inherit' }}>
    <path d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' fill='currentColor' />
  </SvgIcon>
);

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  cursor: 'pointer',
  userSelect: 'none',
  '&:hover': {
    '& .logo-icon': {
      transform: 'scale(1.05)',
      transition: 'transform 0.2s ease-in-out',
    },
  },
}));

const LogoIcon = styled(Box)(({ theme }) => ({
  fontSize: '2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  borderRadius: '8px',
  padding: theme.spacing(0.5),
  color: 'white',
  boxShadow: theme.shadows[2],
}));

const LogoText = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  lineHeight: 1,
}));

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  showText = true,
  onClick,
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          iconSize: '1.5rem',
          primaryText: 'h6',
          secondaryText: 'caption',
          padding: 0.25,
        };
      case 'large':
        return {
          iconSize: '3rem',
          primaryText: 'h4',
          secondaryText: 'body1',
          padding: 1,
        };
      default:
        return {
          iconSize: '2rem',
          primaryText: 'h5',
          secondaryText: 'body2',
          padding: 0.5,
        };
    }
  };

  const styles = getSizeStyles();

  return (
    <LogoContainer onClick={onClick}>
      <LogoIcon
        className='logo-icon'
        sx={{
          fontSize: styles.iconSize,
          padding: styles.padding,
        }}
      >
        <HouseIcon />
      </LogoIcon>

      {showText && (
        <LogoText>
          <Typography
            variant={styles.primaryText as 'h4' | 'h5' | 'h6'}
            component='span'
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'none',
            }}
          >
            HelloNeighbors
          </Typography>
        </LogoText>
      )}
    </LogoContainer>
  );
};

export default Logo;
