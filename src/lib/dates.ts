import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Formats a date string to a locale-specific string
 * @param dateString - The date string to format (e.g., from API)
 * @param timeZone - Optional timezone (defaults to browser's timezone)
 * @returns Formatted date string (e.g., "12/31/2023, 11:59:59 PM")
 */
export function formatDateString(
    dateString: string | Date,
    timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
): string {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
        timeZone,
    });
}

/**
 * Converts a date to a user-friendly relative time string
 * @param dateString - The date string to format
 * @returns Relative time string (e.g., "2 hours ago", "in 1 minute")
 */
export function toRelativeTime(dateString: string | Date): string {
    return dayjs(dateString).fromNow();
}

/**
 * Formats date with more options using Day.js
 * @param dateString - The date string to format
 * @param format - Day.js format string (default: 'MMM D, YYYY h:mm A')
 * @returns Formatted date string
 */
export function formatDate(
    dateString: string | Date,
    format: string = 'MMM D, YYYY h:mm A'
): string {
    return dayjs(dateString).format(format);
}

/**
 * Gets the timezone-adjusted date
 * @param dateString - The date string to adjust
 * @param timeZone - Target timezone (defaults to browser's timezone)
 * @returns Day.js object in the specified timezone
 */
export function getLocalizedDate(
    dateString: string | Date,
    timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
) {
    return dayjs(dateString).tz(timeZone);
}