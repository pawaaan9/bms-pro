/**
 * Date and time utility functions for handling user preferences
 */

/**
 * Format a date according to user preferences
 * @param {Date|string} date - Date to format
 * @param {string} dateFormat - Format preference (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
 * @param {string} timezone - User's timezone
 * @returns {string} Formatted date string
 */
export function formatDate(date, dateFormat = 'DD/MM/YYYY', timezone = 'Australia/Sydney') {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Convert to user's timezone
  const localDate = new Date(dateObj.toLocaleString('en-US', { timeZone: timezone }));
  
  const day = String(localDate.getDate()).padStart(2, '0');
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const year = localDate.getFullYear();
  
  switch (dateFormat) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

/**
 * Format a time according to user preferences
 * @param {Date|string} date - Date/time to format
 * @param {string} timeFormat - Format preference (12h, 24h)
 * @param {string} timezone - User's timezone
 * @returns {string} Formatted time string
 */
export function formatTime(date, timeFormat = '12h', timezone = 'Australia/Sydney') {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Convert to user's timezone
  const localDate = new Date(dateObj.toLocaleString('en-US', { timeZone: timezone }));
  
  if (timeFormat === '24h') {
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } else {
    // 12-hour format
    let hours = localDate.getHours();
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${hours}:${minutes} ${ampm}`;
  }
}

/**
 * Format a date and time together
 * @param {Date|string} date - Date/time to format
 * @param {string} dateFormat - Date format preference
 * @param {string} timeFormat - Time format preference
 * @param {string} timezone - User's timezone
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date, dateFormat = 'DD/MM/YYYY', timeFormat = '12h', timezone = 'Australia/Sydney') {
  if (!date) return '';
  
  const formattedDate = formatDate(date, dateFormat, timezone);
  const formattedTime = formatTime(date, timeFormat, timezone);
  
  return `${formattedDate} ${formattedTime}`;
}

/**
 * Convert UTC timestamp to user's timezone
 * @param {Date|string} utcDate - UTC date/time
 * @param {string} timezone - User's timezone
 * @returns {Date} Date in user's timezone
 */
export function convertToUserTimezone(utcDate, timezone = 'Australia/Sydney') {
  if (!utcDate) return null;
  
  const dateObj = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  return new Date(dateObj.toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * Get timezone display name
 * @param {string} timezone - Timezone identifier
 * @returns {string} Display name for timezone
 */
export function getTimezoneDisplayName(timezone) {
  const timezoneNames = {
    'UTC': 'UTC (Coordinated Universal Time)',
    'America/New_York': 'Eastern Time (New York)',
    'America/Chicago': 'Central Time (Chicago)',
    'America/Denver': 'Mountain Time (Denver)',
    'America/Los_Angeles': 'Pacific Time (Los Angeles)',
    'Europe/London': 'Greenwich Mean Time (London)',
    'Europe/Paris': 'Central European Time (Paris)',
    'Europe/Berlin': 'Central European Time (Berlin)',
    'Europe/Rome': 'Central European Time (Rome)',
    'Europe/Madrid': 'Central European Time (Madrid)',
    'Asia/Tokyo': 'Japan Standard Time (Tokyo)',
    'Asia/Shanghai': 'China Standard Time (Shanghai)',
    'Asia/Hong_Kong': 'Hong Kong Time',
    'Asia/Singapore': 'Singapore Time',
    'Asia/Kolkata': 'India Standard Time (Mumbai)',
    'Australia/Sydney': 'Australian Eastern Time (Sydney)',
    'Australia/Melbourne': 'Australian Eastern Time (Melbourne)',
    'Australia/Perth': 'Australian Western Time (Perth)',
    'Australia/Adelaide': 'Australian Central Time (Adelaide)',
    'Pacific/Auckland': 'New Zealand Time (Auckland)',
    'Pacific/Fiji': 'Fiji Time'
  };
  
  return timezoneNames[timezone] || timezone;
}

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export function getCurrencySymbol(currency = 'AUD') {
  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AUD': '$',
    'CAD': '$',
    'JPY': '¥',
    'CNY': '¥',
    'INR': '₹'
  };
  
  return currencySymbols[currency] || '$';
}

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @param {string} locale - Locale for formatting (defaults based on currency)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'AUD', locale = null) {
  if (amount === null || amount === undefined) return '';
  
  // Default locales for currencies
  const currencyLocales = {
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
    'AUD': 'en-AU',
    'CAD': 'en-CA',
    'JPY': 'ja-JP',
    'CNY': 'zh-CN',
    'INR': 'en-IN'
  };
  
  const targetLocale = locale || currencyLocales[currency] || 'en-AU';
  
  try {
    return new Intl.NumberFormat(targetLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback to simple formatting
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toFixed(2)}`;
  }
}
