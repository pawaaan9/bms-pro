// Email service for API calls
const API_BASE_URL = '/api';

// Email Templates API
export const emailTemplatesAPI = {
  // Get all email templates
  async getTemplates(token, params = {}) {      
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/email-templates?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching email templates:', error);
      throw error;
    }
  },

  // Get a specific template
  async getTemplate(templateId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/email-templates/${templateId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to fetch template: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching email template:', error);
      throw error;
    }
  },

  // Create a new template
  async createTemplate(templateData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/email-templates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to create template: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating email template:', error);
      throw error;
    }
  },

  // Update a template
  async updateTemplate(templateId, templateData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/email-templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to update template: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating email template:', error);
      throw error;
    }
  },

  // Delete a template
  async deleteTemplate(templateId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/email-templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to delete template: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting email template:', error);
      throw error;
    }
  }
};

// Email Communications API
export const emailCommsAPI = {
  // Send a customized email
  async sendEmail(emailData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/email-comms/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to send email: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  // Get email history
  async getEmailHistory(token, params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/email-comms/history?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to fetch email history: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching email history:', error);
      throw error;
    }
  },

  // Get customers for email sending
  async getCustomers(token, params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/email-comms/customers?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to fetch customers: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get bookings for a specific customer
  async getCustomerBookings(customerEmail, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/email-comms/bookings/${encodeURIComponent(customerEmail)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to fetch customer bookings: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      throw error;
    }
  }
};

// Helper functions for email templates
export const emailTemplateHelpers = {
  // Get available variables for templates
  getAvailableVariables() {
    return [
      { key: 'customerName', label: 'Customer Name', description: 'The customer\'s full name' },
      { key: 'customerEmail', label: 'Customer Email', description: 'The customer\'s email address' },
      { key: 'bookingId', label: 'Booking ID', description: 'The unique booking identifier' },
      { key: 'eventType', label: 'Event Type', description: 'The type of event being booked' },
      { key: 'bookingDate', label: 'Booking Date', description: 'The date of the booking' },
      { key: 'startTime', label: 'Start Time', description: 'The start time of the booking' },
      { key: 'endTime', label: 'End Time', description: 'The end time of the booking' },
      { key: 'hallName', label: 'Hall Name', description: 'The name of the hall/venue' },
      { key: 'calculatedPrice', label: 'Price', description: 'The calculated price for the booking' },
      { key: 'guestCount', label: 'Guest Count', description: 'The number of guests' },
      { key: 'status', label: 'Booking Status', description: 'The current status of the booking' }
    ];
  },

  // Process template with variables
  processTemplate(template, variables) {
    if (!template) return '';
    
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  },

  // Extract variables from template
  extractVariables(template) {
    if (!template) return [];
    
    const matches = template.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    
    return [...new Set(matches.map(match => match.replace(/\{\{|\}\}/g, '')))];
  },

  // Validate template
  validateTemplate(template) {
    const errors = [];
    
    if (!template.name || template.name.trim() === '') {
      errors.push('Template name is required');
    }
    
    if (!template.subject || template.subject.trim() === '') {
      errors.push('Subject is required');
    }
    
    if (!template.body || template.body.trim() === '') {
      errors.push('Body is required');
    }
    
    return errors;
  }
};

export default {
  emailTemplatesAPI,
  emailCommsAPI,
  emailTemplateHelpers
};
