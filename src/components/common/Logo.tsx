import React from 'react';
import { Box, Typography, SvgIcon } from '@mui/material';
import { styled } from '@mui/material/styles';

// Custom tree icon for heartwood theme
const TreeIcon = () => (
  <SvgIcon viewBox='0 0 24 24' sx={{ fontSize: 'inherit' }}>
    <path d='M12 2L8 6h2v2H8l4 4 4-4h-2V6h2l-4-4z' fill='currentColor' />
    <path d='M8 10l4 4 4-4h-2v6h-4v-6H8z' fill='currentColor' />
    <rect x='11' y='18' width='2' height='4' fill='currentColor' />
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
        <TreeIcon />
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
              textTransform: 'lowercase',
            }}
          >
            heartwood
          </Typography>
          <Typography
            variant={styles.secondaryText as 'body1' | 'body2' | 'caption'}
            component='span'
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              textTransform: 'lowercase',
              letterSpacing: '0.5px',
            }}
          >
            redig
          </Typography>
        </LogoText>
      )}
    </LogoContainer>
  );
};

export default Logo;
