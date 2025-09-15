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

  return (
    <Avatar
      src={user.profilePictureUrl || undefined}
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
