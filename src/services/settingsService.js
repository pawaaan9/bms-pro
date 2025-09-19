/**
 * Service for managing user settings
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Get user settings
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} User settings object
 */
export async function getUserSettings(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
}

/**
 * Update user settings
 * @param {string} token - Authentication token
 * @param {Object} settings - Settings to update
 * @param {string} settings.timezone - User's timezone
 * @param {string} settings.dateFormat - Date format preference
 * @param {string} settings.timeFormat - Time format preference
 * @param {string} settings.currency - Currency preference
 * @returns {Promise<Object>} Updated settings
 */
export async function updateUserSettings(token, settings) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update settings: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
}

/**
 * Get available timezones
 * @returns {Array} Array of timezone objects
 */
export function getAvailableTimezones() {
  return [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (New York)' },
    { value: 'America/Chicago', label: 'Central Time (Chicago)' },
    { value: 'America/Denver', label: 'Mountain Time (Denver)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (London)' },
    { value: 'Europe/Paris', label: 'Central European Time (Paris)' },
    { value: 'Europe/Berlin', label: 'Central European Time (Berlin)' },
    { value: 'Europe/Rome', label: 'Central European Time (Rome)' },
    { value: 'Europe/Madrid', label: 'Central European Time (Madrid)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (Tokyo)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (Shanghai)' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong Time' },
    { value: 'Asia/Singapore', label: 'Singapore Time' },
    { value: 'Asia/Kolkata', label: 'India Standard Time (Mumbai)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (Sydney)' },
    { value: 'Australia/Melbourne', label: 'Australian Eastern Time (Melbourne)' },
    { value: 'Australia/Perth', label: 'Australian Western Time (Perth)' },
    { value: 'Australia/Adelaide', label: 'Australian Central Time (Adelaide)' },
    { value: 'Pacific/Auckland', label: 'New Zealand Time (Auckland)' },
    { value: 'Pacific/Fiji', label: 'Fiji Time' }
  ];
}

/**
 * Get available date formats
 * @returns {Array} Array of date format objects
 */
export function getAvailableDateFormats() {
  return [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US Format)', example: '12/31/2024' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (International)', example: '31/12/2024' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO Format)', example: '2024-12-31' }
  ];
}

/**
 * Get available time formats
 * @returns {Array} Array of time format objects
 */
export function getAvailableTimeFormats() {
  return [
    { value: '12h', label: '12-hour (AM/PM)', example: '2:30 PM' },
    { value: '24h', label: '24-hour', example: '14:30' }
  ];
}

/**
 * Get available currencies
 * @returns {Array} Array of currency objects
 */
export function getAvailableCurrencies() {
  return [
    { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
    { value: 'AUD', label: 'Australian Dollar ($)', symbol: '$' },
    { value: 'CAD', label: 'Canadian Dollar ($)', symbol: '$' },
    { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
    { value: 'CNY', label: 'Chinese Yuan (¥)', symbol: '¥' },
    { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' }
  ];
}
