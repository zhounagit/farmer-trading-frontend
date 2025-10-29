/**
 * Business Hours Utility - Helper functions for business hours formatting and consolidation
 */

import type { StoreOpenHours } from './open-shop.types';

export interface BusinessHours {
  [day: number]: {
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
    isAllDay?: boolean;
  };
}

export interface ConsolidatedHours {
  [day: number]: {
    isClosed: boolean;
    openTime?: string;
    closeTime?: string;
    isAllDay?: boolean;
  };
}

/**
 * Consolidate business hours from form state to API format
 */
export function consolidateBusinessHours(formHours: BusinessHours): ConsolidatedHours {
  const consolidated: ConsolidatedHours = {};

  // Days of week: 0 = Sunday, 6 = Saturday
  for (let day = 0; day < 7; day++) {
    const dayHours = formHours[day];

    if (dayHours) {
      consolidated[day] = {
        isClosed: !dayHours.isOpen,
        openTime: dayHours.isOpen ? dayHours.openTime : undefined,
        closeTime: dayHours.isOpen ? dayHours.closeTime : undefined,
        isAllDay: dayHours.isOpen ? dayHours.isAllDay : false,
      };
    } else {
      // Default to closed if no hours specified
      consolidated[day] = {
        isClosed: true,
      };
    }
  }

  return consolidated;
}

/**
 * Convert consolidated hours to StoreOpenHours array for API submission
 */
export function convertToStoreOpenHours(
  storeId: number,
  consolidatedHours: ConsolidatedHours
): StoreOpenHours[] {
  const openHours: StoreOpenHours[] = [];

  for (const [day, hours] of Object.entries(consolidatedHours)) {
    const dayOfWeek = parseInt(day, 10);

    openHours.push({
      storeId,
      dayOfWeek,
      openTime: hours.openTime,
      closeTime: hours.closeTime,
      isClosed: hours.isClosed,
      isAllDay: hours.isAllDay || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return openHours;
}

/**
 * Format time for display (e.g., "09:00" -> "9:00 AM")
 */
export function formatTime(time?: string): string {
  if (!time) return 'Not set';

  try {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch {
    return 'Invalid time';
  }
}

/**
 * Parse time from display format to 24-hour format
 */
export function parseTime(displayTime: string): string {
  try {
    const [timePart, period] = displayTime.split(' ');
    const [hours, minutes] = timePart.split(':').map(Number);

    let parsedHours = hours;
    if (period === 'PM' && hours !== 12) {
      parsedHours += 12;
    } else if (period === 'AM' && hours === 12) {
      parsedHours = 0;
    }

    return `${parsedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch {
    return '09:00'; // Default fallback
  }
}

/**
 * Validate business hours for consistency
 */
export function validateBusinessHours(hours: BusinessHours): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [day, dayHours] of Object.entries(hours)) {
    const dayName = getDayName(parseInt(day, 10));

    if (dayHours.isOpen) {
      if (!dayHours.openTime || !dayHours.closeTime) {
        errors.push(`${dayName}: Both open and close times are required when store is open`);
      } else {
        const openTime = parseTimeToMinutes(dayHours.openTime);
        const closeTime = parseTimeToMinutes(dayHours.closeTime);

        if (openTime >= closeTime) {
          errors.push(`${dayName}: Close time must be after open time`);
        }

        if (closeTime - openTime < 60) {
          errors.push(`${dayName}: Store must be open for at least 1 hour`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get day name from day number
 */
export function getDayName(dayOfWeek: number): string {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[dayOfWeek] || 'Unknown';
}

/**
 * Get short day name from day number
 */
export function getShortDayName(dayOfWeek: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayOfWeek] || 'Unknown';
}

/**
 * Parse time string to minutes since midnight
 */
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if store is currently open based on business hours
 */
export function isStoreOpenNow(openHours: StoreOpenHours[]): boolean {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const todayHours = openHours.find(hours => hours.dayOfWeek === currentDay);

  if (!todayHours || todayHours.isClosed) {
    return false;
  }

  if (todayHours.isAllDay) {
    return true;
  }

  if (!todayHours.openTime || !todayHours.closeTime) {
    return false;
  }

  const openTime = parseTimeToMinutes(todayHours.openTime);
  const closeTime = parseTimeToMinutes(todayHours.closeTime);

  return currentTime >= openTime && currentTime <= closeTime;
}

/**
 * Get next opening time for store
 */
export function getNextOpeningTime(openHours: StoreOpenHours[]): { day: string; time: string } | null {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Check next 7 days
  for (let i = 0; i < 7; i++) {
    const checkDay = (currentDay + i) % 7;
    const dayHours = openHours.find(hours => hours.dayOfWeek === checkDay);

    if (dayHours && !dayHours.isClosed && dayHours.openTime) {
      const openTime = parseTimeToMinutes(dayHours.openTime);

      // If it's today and store opens later today
      if (i === 0 && currentTime < openTime) {
        return {
          day: 'Today',
          time: formatTime(dayHours.openTime),
        };
      }

      // If it's a future day
      if (i > 0) {
        const dayName = i === 1 ? 'Tomorrow' : getDayName(checkDay);
        return {
          day: dayName,
          time: formatTime(dayHours.openTime),
        };
      }
    }
  }

  return null;
}

/**
 * Generate human-readable hours summary
 */
export function generateHoursSummary(openHours: StoreOpenHours[]): string {
  const summaries: string[] = [];

  for (let day = 0; day < 7; day++) {
    const dayHours = openHours.find(hours => hours.dayOfWeek === day);
    const dayName = getShortDayName(day);

    if (!dayHours || dayHours.isClosed) {
      summaries.push(`${dayName}: Closed`);
    } else if (dayHours.isAllDay) {
      summaries.push(`${dayName}: 24 Hours`);
    } else if (dayHours.openTime && dayHours.closeTime) {
      summaries.push(`${dayName}: ${formatTime(dayHours.openTime)} - ${formatTime(dayHours.closeTime)}`);
    } else {
      summaries.push(`${dayName}: Hours not set`);
    }
  }

  return summaries.join(' | ');
}

export default {
  consolidateBusinessHours,
  convertToStoreOpenHours,
  formatTime,
  parseTime,
  validateBusinessHours,
  getDayName,
  getShortDayName,
  isStoreOpenNow,
  getNextOpeningTime,
  generateHoursSummary,
};
