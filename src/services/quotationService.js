// Quotation service for API calls
const API_BASE_URL = '/api';

// Create a new quotation
export const createQuotation = async (quotationData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quotations`, {  
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quotationData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to create quotation: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating quotation:', error);
    throw error;
  }
};

// Fetch quotations for the current user (hall owner or sub-user)
export const fetchQuotationsForCurrentUser = async (token) => {
  try {
    console.log('fetchQuotationsForCurrentUser - API call starting:', { token: token ? 'Present' : 'Missing', url: `${API_BASE_URL}/quotations/my-quotations` });
    
    const response = await fetch(`${API_BASE_URL}/quotations/my-quotations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('fetchQuotationsForCurrentUser - Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('fetchQuotationsForCurrentUser - Error response:', errorData);
      throw new Error(`Failed to fetch quotations: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const quotations = await response.json();
    console.log('fetchQuotationsForCurrentUser - Backend response:', quotations);
    
    return quotations;
  } catch (error) {
    console.error('Error fetching quotations for current user:', error);
    throw error;
  }
};

// Update quotation status
export const updateQuotationStatus = async (quotationId, status, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quotations/${quotationId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to update quotation status: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating quotation status:', error);
    throw error;
  }
};

// Get a specific quotation
export const fetchQuotation = async (quotationId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quotations/${quotationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to fetch quotation: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching quotation:', error);
    throw error;
  }
};

// Update a quotation
export const updateQuotation = async (quotationId, updateData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quotations/${quotationId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to update quotation: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating quotation:', error);
    throw error;
  }
};

// Delete a quotation
export const deleteQuotation = async (quotationId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quotations/${quotationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to delete quotation: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting quotation:', error);
    throw error;
  }
};

// Download quotation PDF
export const downloadQuotationPDF = async (quotationId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quotations/${quotationId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to download quotation PDF: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    // Get the PDF blob
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quotation-${quotationId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Error downloading quotation PDF:', error);
    throw error;
  }
};

// Fetch resources for quotation form
export const fetchResources = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to fetch resources: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const resources = await response.json();
    return resources;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
};

export const fetchPricing = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pricing`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to fetch pricing: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const pricing = await response.json();
    return pricing;
  } catch (error) {
    console.error('Error fetching pricing:', error);
    throw error;
  }
};

// Calculate rate for a resource based on date and time
export const calculateResourceRate = (pricingData, resourceId, eventDate, startTime, endTime) => {
  try {
    // Find pricing for the specific resource
    const resourcePricing = pricingData.find(p => p.resourceId === resourceId);
    
    if (!resourcePricing) {
      console.log('No pricing found for resource:', resourceId);
      return 0;
    }

    // Determine if it's a weekend (Saturday = 6, Sunday = 0)
    const date = new Date(eventDate);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    
    // Get the appropriate rate
    const baseRate = isWeekend ? resourcePricing.weekendRate : resourcePricing.weekdayRate;
    
    // Calculate duration if rate type is hourly
    if (resourcePricing.rateType === 'hourly') {
      const start = new Date(`2000-01-01T${startTime}:00`);
      const end = new Date(`2000-01-01T${endTime}:00`);
      const durationHours = (end - start) / (1000 * 60 * 60); // Convert to hours
      
      return baseRate * durationHours;
    } else {
      // For daily rates, return the base rate
      return baseRate;
    }
  } catch (error) {
    console.error('Error calculating resource rate:', error);
    return 0;
  }
};

// Export quotations to CSV
export const exportQuotationsToCSV = (quotations) => {
  try {
    // Define CSV headers
    const headers = [
      'Quotation ID',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Event Type',
      'Resource',
      'Event Date',
      'Start Time',
      'End Time',
      'Guest Count',
      'Total Amount',
      'Deposit Type',
      'Deposit Amount',
      'Status',
      'Valid Until',
      'Created Date',
      'Notes'
    ];

    // Convert quotations to CSV rows
    const csvRows = quotations.map(quotation => [
      quotation.id || '',
      quotation.customerName || '',
      quotation.customerEmail || '',
      quotation.customerPhone || '',
      quotation.eventType || '',
      quotation.resource || '',
      quotation.eventDate ? new Date(quotation.eventDate).toLocaleDateString() : '',
      quotation.startTime || '',
      quotation.endTime || '',
      quotation.guestCount || '',
      quotation.totalAmount || '',
      quotation.depositType || 'None',
      quotation.depositAmount || '0.00',
      quotation.status || '',
      quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : '',
      quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : '',
      quotation.notes || ''
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `quotations-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true };
  } catch (error) {
    console.error('Error exporting quotations to CSV:', error);
    throw error;
  }
};

// Helper function to validate quotation data
export const validateQuotationData = (quotationData) => {
  const errors = [];

  if (!quotationData.customerName || quotationData.customerName.trim() === '') {
    errors.push('Customer name is required');
  }

  if (!quotationData.customerEmail || quotationData.customerEmail.trim() === '') {
    errors.push('Customer email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(quotationData.customerEmail)) {
      errors.push('Invalid email format');
    }
  }

  if (!quotationData.customerPhone || quotationData.customerPhone.trim() === '') {
    errors.push('Customer phone is required');
  }

  if (!quotationData.eventType || quotationData.eventType.trim() === '') {
    errors.push('Event type is required');
  }

  if (!quotationData.resource || quotationData.resource.trim() === '') {
    errors.push('Resource is required');
  }

  if (!quotationData.eventDate) {
    errors.push('Event date is required');
  }

  if (!quotationData.startTime) {
    errors.push('Start time is required');
  }

  if (!quotationData.endTime) {
    errors.push('End time is required');
  }

  if (quotationData.startTime && quotationData.endTime) {
    const startTime = new Date(`2000-01-01T${quotationData.startTime}:00`);
    const endTime = new Date(`2000-01-01T${quotationData.endTime}:00`);
    if (endTime <= startTime) {
      errors.push('End time must be after start time');
    }
  }


  if (!quotationData.totalAmount || quotationData.totalAmount <= 0) {
    errors.push('Total amount must be greater than 0');
  }

  return errors;
};


// Helper function to format quotation for display
export const formatQuotationForDisplay = (quotation) => {
  return {
    ...quotation,
    eventDate: quotation.eventDate ? new Date(quotation.eventDate) : null,
    validUntil: quotation.validUntil ? new Date(quotation.validUntil) : null,
    createdAt: quotation.createdAt ? new Date(quotation.createdAt) : null,
    updatedAt: quotation.updatedAt ? new Date(quotation.updatedAt) : null,
    formattedTotalAmount: quotation.totalAmount ? `$${quotation.totalAmount.toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD` : '$0.00 AUD'
  };
};
