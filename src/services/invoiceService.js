// Invoice service for API calls
const API_BASE_URL = '/api';

// Transform backend invoice data to frontend format
export const transformInvoiceFromBackend = (backendInvoice) => {  
  return {
    id: backendInvoice.id,
    invoiceNumber: backendInvoice.invoiceNumber,
    type: backendInvoice.invoiceType,
    customer: backendInvoice.customer,
    booking: backendInvoice.bookingId,
    resource: backendInvoice.resource,
    issueDate: backendInvoice.issueDate ? new Date(backendInvoice.issueDate) : new Date(),
    dueDate: backendInvoice.dueDate ? new Date(backendInvoice.dueDate) : new Date(),
    subtotal: backendInvoice.subtotal,
    gst: backendInvoice.gst,
    total: backendInvoice.total,
    paidAmount: backendInvoice.paidAmount,
    status: backendInvoice.status,
    description: backendInvoice.description,
    lineItems: backendInvoice.lineItems || [],
    notes: backendInvoice.notes || '',
    sentAt: backendInvoice.sentAt ? new Date(backendInvoice.sentAt) : null,
    createdAt: backendInvoice.createdAt ? new Date(backendInvoice.createdAt) : new Date(),
    updatedAt: backendInvoice.updatedAt ? new Date(backendInvoice.updatedAt) : new Date(),
    // Booking source information
    bookingSource: backendInvoice.bookingSource,
    quotationId: backendInvoice.quotationId,
    depositPaid: backendInvoice.depositPaid,
    finalTotal: backendInvoice.finalTotal,
    depositInfo: backendInvoice.depositInfo,
    // Additional fields for compatibility
    priority: backendInvoice.status === 'OVERDUE' ? 'high' : 'normal'
  };
};

// Transform backend payment data to frontend format
export const transformPaymentFromBackend = (backendPayment) => {
  return {
    id: backendPayment.id,
    invoice: backendPayment.invoiceNumber,
    method: backendPayment.paymentMethod,
    amount: backendPayment.amount,
    status: 'Succeeded', // All recorded payments are considered succeeded
    processedAt: backendPayment.processedAt ? new Date(backendPayment.processedAt) : new Date(),
    reference: backendPayment.reference || '',
    fee: 0, // Bank transfers typically have no fee
    notes: backendPayment.notes || ''
  };
};

// Create a new invoice from a booking
export const createInvoice = async (invoiceData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to create invoice: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return transformInvoiceFromBackend(result.invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

// Fetch invoices for a hall owner
export const fetchInvoices = async (hallOwnerId, token) => {
  try {
    console.log('fetchInvoices - API call starting:', { hallOwnerId, token: token ? 'Present' : 'Missing', url: `${API_BASE_URL}/invoices/hall-owner/${hallOwnerId}` });
    
    const response = await fetch(`${API_BASE_URL}/invoices/hall-owner/${hallOwnerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('fetchInvoices - Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('fetchInvoices - Error response:', errorData);
      throw new Error(`Failed to fetch invoices: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const backendInvoices = await response.json();
    console.log('fetchInvoices - Backend response:', backendInvoices);
    
    const transformedInvoices = backendInvoices.map(transformInvoiceFromBackend);
    console.log('fetchInvoices - Transformed invoices:', transformedInvoices);
    
    return transformedInvoices;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

// Update invoice status
export const updateInvoiceStatus = async (invoiceId, status, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to update invoice status: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating invoice status:', error);
    throw error;
  }
};

// Record payment for an invoice
export const recordPayment = async (invoiceId, paymentData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/payment`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to record payment: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
};

// Get a specific invoice
export const getInvoice = async (invoiceId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to fetch invoice: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const backendInvoice = await response.json();
    return transformInvoiceFromBackend(backendInvoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
};

// Fetch payments for a hall owner
export const fetchPayments = async (hallOwnerId, token) => {
  try {
    console.log('fetchPayments - API call starting:', { hallOwnerId, token: token ? 'Present' : 'Missing', url: `${API_BASE_URL}/payments/hall-owner/${hallOwnerId}` });
    
    const response = await fetch(`${API_BASE_URL}/payments/hall-owner/${hallOwnerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('fetchPayments - Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('fetchPayments - Error response:', errorData);
      throw new Error(`Failed to fetch payments: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const backendPayments = await response.json();
    console.log('fetchPayments - Backend response:', backendPayments);
    
    const transformedPayments = backendPayments.map(transformPaymentFromBackend);
    console.log('fetchPayments - Transformed payments:', transformedPayments);
    
    return transformedPayments;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

// Fetch payments for a specific invoice
export const fetchPaymentsForInvoice = async (invoiceId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/invoice/${invoiceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to fetch payments for invoice: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const backendPayments = await response.json();
    return backendPayments.map(transformPaymentFromBackend);
  } catch (error) {
    console.error('Error fetching payments for invoice:', error);
    throw error;
  }
};

// Update payment details
export const updatePayment = async (paymentId, paymentData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to update payment: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

// Delete payment
export const deletePayment = async (paymentId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to delete payment: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
};

// Helper function to generate invoice data from booking
export const generateInvoiceFromBooking = (booking, invoiceType, amount, description) => {
  return {
    bookingId: booking.id,
    invoiceType: invoiceType,
    amount: amount,
    description: description || `${booking.eventType} - ${invoiceType} Payment`,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
  };
};

// Download invoice PDF
export const downloadInvoicePDF = async (invoiceId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to download invoice PDF: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    // Get the filename from the Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition 
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
      : `invoice-${invoiceId}.pdf`;

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, filename };
  } catch (error) {
    console.error('Error downloading invoice PDF:', error);
    throw error;
  }
};

// Send payment reminders for multiple invoices
export const sendInvoiceReminders = async (invoiceIds, hallOwnerId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/invoices/send-reminders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoiceIds: invoiceIds,
        hallOwnerId: hallOwnerId
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to send reminders: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending invoice reminders:', error);
    throw error;
  }
};

// Helper function to calculate invoice summary statistics
export const calculateInvoiceSummary = (invoices) => {
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const overdueCount = invoices.filter(inv => inv.status === 'OVERDUE').length;
  const draftCount = invoices.filter(inv => inv.status === 'DRAFT').length;
  const sentCount = invoices.filter(inv => inv.status === 'SENT').length;
  const partialCount = invoices.filter(inv => inv.status === 'PARTIAL').length;
  const paidCount = invoices.filter(inv => inv.status === 'PAID').length;
  
  return {
    totalAmount,
    paidAmount,
    outstandingAmount: totalAmount - paidAmount,
    overdueCount,
    draftCount,
    sentCount,
    partialCount,
    paidCount,
    totalCount: invoices.length
  };
};
