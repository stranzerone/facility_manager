// hooks/useConvertToSystemTime.js
import { useMemo } from 'react';

const useConvertToSystemTime = (utcDate) => {

  const convertToSystemTime = useMemo(() => {
    if (!utcDate || typeof utcDate !== 'string') return null;

    try {
      // Detect the system's time zone
      const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Safely split the UTC date string
      const parts = utcDate.split(' ');
      const datePart = parts[0] || null;
      const timePart = parts[1] || '00:00:00'; // Default to midnight if time is missing
      const period = parts[2] || null; // AM/PM if available

      // Validate date format before further processing
      if (!datePart.includes('-')) return 'Invalid Date';

      // Extract year, month, and day
      const [year, month, day] = datePart.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return 'Invalid Date';

      // Extract time components
      const timeParts = timePart.split(':').map(Number);
      const hour = timeParts[0] || 0;
      const minute = timeParts[1] || 0;
      const second = timeParts[2] || 0;

      // Convert to 24-hour format if period (AM/PM) is provided
      let hours = hour;
      if (period) {
        const lowerPeriod = period.toLowerCase();
        if (lowerPeriod === 'pm' && hours !== 12) {
          hours += 12;
        } else if (lowerPeriod === 'am' && hours === 12) {
          hours = 0;
        }
      }

      // Create a UTC Date object
      const utcDateObj = new Date(Date.UTC(year, month - 1, day, hours, minute, second));

      // Convert to the system's local time
      const systemTime = utcDateObj.toLocaleString('en-GB', {
        timeZone: systemTimeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true, // Ensure AM/PM format
      });

      return systemTime;
    } catch (error) {
      console.error('Error parsing UTC date:', error, utcDate);
      return 'Invalid Date';
    }
  }, [utcDate]);

  return convertToSystemTime;
};

export default useConvertToSystemTime;
