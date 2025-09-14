import { format, formatDistance, isToday, isYesterday, parseISO } from 'date-fns';

/**
 * Format date for display in application status and submission tracking
 */
export const formatSubmissionDate = (dateString: string): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'MMM dd, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting submission date:', error);
    return 'Invalid date';
  }
};

/**
 * Format date for short display (e.g., in lists, cards)
 */
export const formatShortDate = (dateString: string): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    console.error('Error formatting short date:', error);
    return 'Invalid date';
  }
};

/**
 * Format date relative to now (e.g., "2 hours ago", "yesterday")
 */
export const formatRelativeDate = (dateString: string): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    const now = new Date();

    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    }

    if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    }

    return formatDistance(date, now, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return 'Invalid date';
  }
};

/**
 * Format date for display in forms and inputs
 */
export const formatFormDate = (dateString: string): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting form date:', error);
    return '';
  }
};

/**
 * Format date for display in time-sensitive contexts
 */
export const formatTimelineDate = (dateString: string): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatRelativeDate(dateString);
    }

    return formatShortDate(dateString);
  } catch (error) {
    console.error('Error formatting timeline date:', error);
    return 'Invalid date';
  }
};

/**
 * Check if a date string is valid
 */
export const isValidDate = (dateString: string): boolean => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return date instanceof Date && !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Get estimated completion date based on business days
 */
export const getEstimatedCompletionDate = (
  startDate: string | Date,
  businessDays: number
): Date => {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    let currentDate = new Date(start);
    let daysAdded = 0;

    while (daysAdded < businessDays) {
      currentDate.setDate(currentDate.getDate() + 1);
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        daysAdded++;
      }
    }

    return currentDate;
  } catch (error) {
    console.error('Error calculating estimated completion date:', error);
    return new Date();
  }
};

/**
 * Format duration between two dates in human-readable format
 */
export const formatDuration = (startDate: string, endDate?: string): string => {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = endDate ? (typeof endDate === 'string' ? parseISO(endDate) : endDate) : new Date();

    return formatDistance(start, end);
  } catch (error) {
    console.error('Error formatting duration:', error);
    return 'Unknown duration';
  }
};
