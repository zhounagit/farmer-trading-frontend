import React from 'react';
import { Avatar } from '@mui/material';
import type { User } from '../../types/auth';

interface UserProfilePictureAvatarProps {
  user: User;
  size?: 'small' | 'medium' | 'large' | number;
  sx?: Record<string, unknown>;
  onClick?: () => void;
}

const UserProfilePictureAvatar: React.FC<UserProfilePictureAvatarProps> = ({
  user,
  size = 'medium',
  sx,
  onClick,
}) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarSize = () => {
    if (typeof size === 'number') {
      return { width: size, height: size, fontSize: `${size * 0.4}px` };
    }

    switch (size) {
      case 'small':
        return { width: 32, height: 32, fontSize: '0.875rem' };
      case 'large':
        return { width: 80, height: 80, fontSize: '1.5rem' };
      default: // medium
        return { width: 48, height: 48, fontSize: '1rem' };
    }
  };

  const avatarSize = getAvatarSize();

  // Convert relative URL to absolute URL using backend server
  const getFullImageUrl = (
    url: string | null | undefined
  ): string | undefined => {
    if (!url) return undefined;

    // If it's already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative URL, make it absolute using backend server URL
    if (url.startsWith('/')) {
      // Get the backend URL from API configuration or use default
      const backendUrl = 'https://localhost:7008'; // Same as API_BASE_URL in api.ts
      const fullUrl = `${backendUrl}${url}`;

      return fullUrl;
    }

    return url;
  };

  const imageUrl = getFullImageUrl(user.profilePictureUrl);

  return (
    <Avatar
      src={imageUrl}
      onClick={onClick}
      sx={{
        ...avatarSize,
        bgcolor: user.profilePictureUrl ? 'transparent' : 'primary.main',
        fontWeight: 600,
        cursor: onClick ? 'pointer' : 'default',
        ...sx,
      }}
    >
      {!user.profilePictureUrl && getInitials(user.firstName, user.lastName)}
    </Avatar>
  );
};

export default UserProfilePictureAvatar;
