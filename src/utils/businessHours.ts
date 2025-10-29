import type { StoreOpenHours } from '../features/stores/services/open-shop.types';

export interface ConsolidatedHours {
  day: string;
  hours: string;
}

/**
 * Consolidates consecutive days with the same business hours into readable ranges
 * @param openHours Array of store open hours from the API
 * @returns Array of consolidated day ranges with their hours
 */
export const consolidateBusinessHours = (
  openHours: StoreOpenHours[]
): ConsolidatedHours[] => {
  if (!openHours || openHours.length === 0) return [];

  const daysMap = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // Create a map of day index to hours
  const dayHours: { [key: number]: string } = {};

  openHours.forEach((hour) => {
    if (hour.isClosed) {
      dayHours[hour.dayOfWeek] = 'Closed';
    } else if (hour.openTime && hour.closeTime) {
      dayHours[hour.dayOfWeek] = `${hour.openTime} - ${hour.closeTime}`;
    } else {
      dayHours[hour.dayOfWeek] = 'Hours not set';
    }
  });

  // Group consecutive days with same hours
  const consolidated: ConsolidatedHours[] = [];
  let i = 0;

  while (i < 7) {
    if (dayHours[i] === undefined) {
      i++;
      continue;
    }

    const currentHours = dayHours[i];
    let endDay = i;

    // Find consecutive days with same hours
    while (endDay + 1 < 7 && dayHours[endDay + 1] === currentHours) {
      endDay++;
    }

    // Format the day range
    let dayRange: string;
    if (i === endDay) {
      // Single day
      dayRange = daysMap[i];
    } else {
      // Multiple consecutive days (even just 2)
      dayRange = `${daysMap[i]} - ${daysMap[endDay]}`;
    }

    consolidated.push({ day: dayRange, hours: currentHours });
    i = endDay + 1;
  }

  return consolidated;
};

/**
 * Formats business hours from different data structures into a consistent format
 * @param hours Hours data in various formats (API response, form data, etc.)
 * @returns Standardized StoreOpenHours array
 */
export const normalizeBusinessHours = (
  hours: Record<string, unknown>[]
): StoreOpenHours[] => {
  if (!hours || !Array.isArray(hours)) return [];

  return hours.map((hour) => ({
    storeId: (hour.storeId as number) || 0,
    dayOfWeek: (hour.dayOfWeek as number) || (hour.dayIndex as number) || 0,
    openTime: (hour.openTime as string) || (hour.open_time as string) || '',
    closeTime: (hour.closeTime as string) || (hour.close_time as string) || '',
    isClosed:
      (hour.isClosed as boolean) || (hour.is_closed as boolean) || false,
    isAllDay:
      (hour.isAllDay as boolean) || (hour.is_all_day as boolean) || false,
    createdAt: (hour.createdAt as string) || new Date().toISOString(),
    updatedAt: (hour.updatedAt as string) || new Date().toISOString(),
  }));
};

/**
 * Checks if a store is currently open based on business hours
 * @param openHours Array of store open hours
 * @returns Object with open status and next open time
 */
export const getStoreOpenStatus = (
  openHours: StoreOpenHours[]
): { isOpen: boolean; nextOpenTime?: string } => {
  if (!openHours || openHours.length === 0) {
    return { isOpen: false };
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  // Find today's hours
  const todayHours = openHours.find((hour) => hour.dayOfWeek === currentDay);

  if (!todayHours || todayHours.isClosed) {
    // Find next open day
    for (let i = 1; i <= 7; i++) {
      const nextDay = (currentDay + i) % 7;
      const nextDayHours = openHours.find((hour) => hour.dayOfWeek === nextDay);

      if (nextDayHours && !nextDayHours.isClosed) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return {
          isOpen: false,
          nextOpenTime: `${dayNames[nextDay]} ${nextDayHours.openTime}`,
        };
      }
    }

    return { isOpen: false };
  }

  // Check if currently within open hours
  const isOpen =
    currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;

  return { isOpen };
};

/**
 * Formats time from 24-hour to 12-hour format
 * @param time Time string in HH:MM format
 * @returns Formatted time string
 */
export const formatTime = (time: string): string => {
  if (!time) return '';

  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Formats consolidated business hours with time formatting
 * @param openHours Array of store open hours
 * @param use12Hour Whether to use 12-hour format (default: true)
 * @returns Array of consolidated day ranges with formatted hours
 */
export const formatConsolidatedBusinessHours = (
  openHours: StoreOpenHours[],
  use12Hour: boolean = true
): ConsolidatedHours[] => {
  const consolidated = consolidateBusinessHours(openHours);

  if (!use12Hour) {
    return consolidated;
  }

  return consolidated.map((item) => ({
    day: item.day,
    hours:
      item.hours === 'Closed'
        ? 'Closed'
        : item.hours.split(' - ').map(formatTime).join(' - '),
  }));
};
