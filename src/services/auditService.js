import { formatDateTime } from '../utils/dateTimeUtils';

const API_BASE_URL = '/api';

class AuditService {
  static async getAuditLogs(filters = {}, pagination = {}) {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      if (pagination.page) queryParams.append('page', pagination.page);
      if (pagination.limit) queryParams.append('limit', pagination.limit);
      if (pagination.sortBy) queryParams.append('sortBy', pagination.sortBy);
      if (pagination.sortOrder) queryParams.append('sortOrder', pagination.sortOrder);
      
      // Add filter parameters
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.userId) queryParams.append('userId', filters.userId);
      if (filters.targetType) queryParams.append('targetType', filters.targetType);
      if (filters.userRole) queryParams.append('userRole', filters.userRole);
      
      const response = await fetch(`${API_BASE_URL}/audit?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }
  
  static async getAuditStats(filters = {}) {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      const response = await fetch(`${API_BASE_URL}/audit/stats?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      throw error;
    }
  }
  
  static async getAuditActions() {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/audit/actions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.actions;
    } catch (error) {
      console.error('Error fetching audit actions:', error);
      throw error;
    }
  }
  
  static async getAuditTargetTypes() {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/audit/target-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.targetTypes;
    } catch (error) {
      console.error('Error fetching audit target types:', error);
      throw error;
    }
  }
  
  static formatTimestamp(timestamp, userSettings = null) {
    if (!timestamp) return 'N/A';
    
    // If user settings are provided, use the new formatting utilities
    if (userSettings) {
      return formatDateTime(timestamp, userSettings.dateFormat, userSettings.timeFormat, userSettings.timezone);
    }
    
    // Fallback to original formatting
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }
  
  static formatAction(action) {
    const actionMap = {
      'user_created': 'User Created',
      'user_updated': 'User Updated',
      'user_deleted': 'User Deleted',
      'user_login': 'User Login',
      'user_logout': 'User Logout',
      'booking_created': 'Booking Created',
      'booking_updated': 'Booking Updated',
      'booking_cancelled': 'Booking Cancelled',
      'booking_confirmed': 'Booking Confirmed',
      'hall_settings_updated': 'Hall Settings Updated',
      'pricing_updated': 'Pricing Updated',
      'resource_created': 'Resource Created',
      'resource_updated': 'Resource Updated',
      'resource_deleted': 'Resource Deleted',
      'customer_created': 'Customer Created',
      'customer_updated': 'Customer Updated',
      'invoice_created': 'Invoice Created',
      'invoice_paid': 'Invoice Paid',
      'report_generated': 'Report Generated',
      'settings_updated': 'Settings Updated',
      'role_assigned': 'Role Assigned',
      'permission_granted': 'Permission Granted',
      'permission_revoked': 'Permission Revoked',
      'system_config_changed': 'System Config Changed'
    };
    
    return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  static formatTargetType(targetType) {
    const typeMap = {
      'user': 'User',
      'booking': 'Booking',
      'hall': 'Hall',
      'resource': 'Resource',
      'customer': 'Customer',
      'invoice': 'Invoice',
      'report': 'Report',
      'settings': 'Settings',
      'pricing': 'Pricing',
      'system': 'System'
    };
    
    return typeMap[targetType] || targetType.charAt(0).toUpperCase() + targetType.slice(1);
  }
  
  static getActionColor(action) {
    const colorMap = {
      'user_created': 'text-green-600',
      'user_updated': 'text-blue-600',
      'user_deleted': 'text-red-600',
      'user_login': 'text-green-600',
      'user_logout': 'text-gray-600',
      'booking_created': 'text-green-600',
      'booking_updated': 'text-blue-600',
      'booking_cancelled': 'text-red-600',
      'booking_confirmed': 'text-green-600',
      'hall_settings_updated': 'text-purple-600',
      'pricing_updated': 'text-orange-600',
      'resource_created': 'text-green-600',
      'resource_updated': 'text-blue-600',
      'resource_deleted': 'text-red-600',
      'customer_created': 'text-green-600',
      'customer_updated': 'text-blue-600',
      'invoice_created': 'text-green-600',
      'invoice_paid': 'text-green-600',
      'report_generated': 'text-blue-600',
      'settings_updated': 'text-purple-600',
      'role_assigned': 'text-blue-600',
      'permission_granted': 'text-green-600',
      'permission_revoked': 'text-red-600',
      'system_config_changed': 'text-purple-600'
    };
    
    return colorMap[action] || 'text-gray-600';
  }
  
  static getActionIcon(action) {
    const iconMap = {
      'user_created': '👤',
      'user_updated': '✏️',
      'user_deleted': '🗑️',
      'user_login': '🔐',
      'user_logout': '🚪',
      'booking_created': '📅',
      'booking_updated': '✏️',
      'booking_cancelled': '❌',
      'booking_confirmed': '✅',
      'hall_settings_updated': '🏢',
      'pricing_updated': '💰',
      'resource_created': '➕',
      'resource_updated': '✏️',
      'resource_deleted': '🗑️',
      'customer_created': '👤',
      'customer_updated': '✏️',
      'invoice_created': '🧾',
      'invoice_paid': '💳',
      'report_generated': '📊',
      'settings_updated': '⚙️',
      'role_assigned': '👥',
      'permission_granted': '🔓',
      'permission_revoked': '🔒',
      'system_config_changed': '🔧'
    };
    
    return iconMap[action] || '📝';
  }
}

export default AuditService;
