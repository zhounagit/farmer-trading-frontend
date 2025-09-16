// Profile picture storage utility for handling local storage fallback
// when backend API is not available

interface StoredProfilePicture {
  userId: string;
  imageData: string; // base64 encoded image
  fileName: string;
  mimeType: string;
  timestamp: number;
  expiresAt: number;
}

const STORAGE_KEY = 'farmer_trading_profile_pictures';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Convert File to base64 string for localStorage
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Get all stored profile pictures from localStorage
 */
const getStoredPictures = (): Record<string, StoredProfilePicture> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const pictures = JSON.parse(stored);
    const now = Date.now();

    // Filter out expired pictures
    const validPictures: Record<string, StoredProfilePicture> = {};
    Object.entries(pictures).forEach(([userId, picture]) => {
      const pic = picture as StoredProfilePicture;
      if (pic.expiresAt > now) {
        validPictures[userId] = pic;
      }
    });

    // Update localStorage with only valid pictures
    if (Object.keys(validPictures).length !== Object.keys(pictures).length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validPictures));
    }

    return validPictures;
  } catch (error) {
    console.error('Error reading profile pictures from localStorage:', error);
    return {};
  }
};

/**
 * Store profile picture in localStorage
 */
export const storeProfilePicture = async (
  userId: string,
  file: File
): Promise<string> => {
  try {
    const base64Data = await fileToBase64(file);
    const now = Date.now();

    const pictureData: StoredProfilePicture = {
      userId,
      imageData: base64Data,
      fileName: file.name,
      mimeType: file.type,
      timestamp: now,
      expiresAt: now + CACHE_DURATION,
    };

    const storedPictures = getStoredPictures();
    storedPictures[userId] = pictureData;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedPictures));

    return base64Data;
  } catch (error) {
    console.error('❌ Failed to store profile picture locally:', error);
    throw new Error('Failed to save profile picture locally');
  }
};

/**
 * Get profile picture from localStorage
 */
export const getStoredProfilePicture = (userId: string): string | null => {
  try {
    const storedPictures = getStoredPictures();
    const picture = storedPictures[userId];

    if (picture) {
      return picture.imageData;
    }

    return null;
  } catch (error) {
    console.error('Error retrieving profile picture from localStorage:', error);
    return null;
  }
};

/**
 * Alias for getStoredProfilePicture - used by API service
 */
export const getProfilePictureFromStorage = getStoredProfilePicture;

/**
 * Remove profile picture from localStorage
 */
export const removeStoredProfilePicture = (userId: string): void => {
  try {
    const storedPictures = getStoredPictures();
    delete storedPictures[userId];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedPictures));
  } catch (error) {
    console.error('Error removing profile picture from localStorage:', error);
  }
};

/**
 * Clear all stored profile pictures (for cleanup)
 */
export const clearAllStoredProfilePictures = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing stored profile pictures:', error);
  }
};

/**
 * Get storage usage information
 */
export const getStorageInfo = (): {
  totalPictures: number;
  storageSize: number;
  oldestTimestamp: number | null;
  newestTimestamp: number | null;
} => {
  try {
    const storedPictures = getStoredPictures();
    const pictures = Object.values(storedPictures);

    const storageSize = JSON.stringify(storedPictures).length;
    let oldestTimestamp: number | null = null;
    let newestTimestamp: number | null = null;

    if (pictures.length > 0) {
      oldestTimestamp = Math.min(...pictures.map((p) => p.timestamp));
      newestTimestamp = Math.max(...pictures.map((p) => p.timestamp));
    }

    return {
      totalPictures: pictures.length,
      storageSize,
      oldestTimestamp,
      newestTimestamp,
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      totalPictures: 0,
      storageSize: 0,
      oldestTimestamp: null,
      newestTimestamp: null,
    };
  }
};

/**
 * Check if localStorage has enough space (rough estimate)
 */
export const checkStorageSpace = (fileSize: number): boolean => {
  try {
    // localStorage typically has 5-10MB limit
    // Base64 encoding increases size by ~33%
    const estimatedSize = fileSize * 1.33;
    const currentInfo = getStorageInfo();

    // Conservative estimate: assume 3MB available for profile pictures
    const maxStorageSize = 3 * 1024 * 1024; // 3MB

    return currentInfo.storageSize + estimatedSize < maxStorageSize;
  } catch (error) {
    console.error('Error checking storage space:', error);
    return false;
  }
};

/**
 * Initialize profile picture from stored data when app starts
 */
export const initializeProfilePicture = (userId: string): string | null => {
  const storedPicture = getStoredProfilePicture(userId);

  if (storedPicture) {
    return storedPicture;
  }

  return null;
};
