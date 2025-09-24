// Booking service for API calls
const API_BASE_URL = 'http://localhost:5000/api';

// Transform backend booking data to calendar event format
export const transformBookingToCalendarEvent = (backendBooking) => {
  const startDateTime = new Date(`${backendBooking.bookingDate}T${backendBooking.startTime}:00`);
  const endDateTime = new Date(`${backendBooking.bookingDate}T${backendBooking.endTime}:00`);
  
  return {
    id: backendBooking.id,
    title: `${backendBooking.customerName} — ${backendBooking.eventType}`,
    status: backendBooking.status?.toUpperCase() || 'PENDING',
    resource: backendBooking.hallName || backendBooking.selectedHall,
    start: startDateTime,
    end: endDateTime,
    customer: backendBooking.customerName,
    customerEmail: backendBooking.customerEmail,
    customerPhone: backendBooking.customerPhone,
    customerAvatar: backendBooking.customerAvatar,
    depositPaid: backendBooking.status === 'confirmed', // Simplified logic
    eventType: backendBooking.eventType,
    guestCount: backendBooking.guestCount,
    calculatedPrice: backendBooking.calculatedPrice,
    priceDetails: backendBooking.priceDetails,
    additionalDescription: backendBooking.additionalDescription,
    bookingSource: backendBooking.bookingSource,
    createdAt: backendBooking.createdAt ? new Date(backendBooking.createdAt) : new Date(),
    updatedAt: backendBooking.updatedAt ? new Date(backendBooking.updatedAt) : new Date(),
    // Calendar-specific properties
    day: startDateTime.getDay() === 0 ? 7 : startDateTime.getDay(), // Convert Sunday (0) to 7 for Monday start
    startTime: backendBooking.startTime,
    endTime: backendBooking.endTime,
    bookingDate: backendBooking.bookingDate,
    hallOwnerId: backendBooking.hallOwnerId,
  };
};

// Fetch bookings for a hall owner (or parent user for sub-users)
export const fetchBookingsForCalendar = async (hallOwnerId, token) => {
  try {
    console.log('fetchBookingsForCalendar - API call starting:', { hallOwnerId, token: token ? 'Present' : 'Missing', url: `${API_BASE_URL}/bookings/hall-owner/${hallOwnerId}` });
    
    const response = await fetch(`${API_BASE_URL}/bookings/hall-owner/${hallOwnerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('fetchBookingsForCalendar - Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('fetchBookingsForCalendar - Error response:', errorData);
      throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const backendBookings = await response.json();
    console.log('fetchBookingsForCalendar - Backend response:', backendBookings);
    
    // Transform bookings to calendar events
    const calendarEvents = backendBookings.map(transformBookingToCalendarEvent);
    console.log('fetchBookingsForCalendar - Transformed bookings:', calendarEvents);
    
    return calendarEvents;
  } catch (error) {
    console.error('Error fetching bookings for calendar:', error);
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to update booking status: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// Update booking price
export const updateBookingPrice = async (bookingId, calculatedPrice, priceDetails, notes, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/price`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        calculatedPrice, 
        priceDetails, 
        notes 
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to update booking price: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating booking price:', error);
    throw error;
  }
};

// Fetch resources for a hall owner
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

// Transform booking data to customer analytics format
export const transformBookingsToCustomers = (bookings) => {
  const customerMap = new Map();
  
  bookings.forEach(booking => {
    const customerKey = booking.customerEmail.toLowerCase();
    
    if (!customerMap.has(customerKey)) {
      customerMap.set(customerKey, {
        id: `CUST-${customerKey.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase()}`,
        name: booking.customerName,
        email: booking.customerEmail,
        phone: booking.customerPhone,
        avatar: booking.customerAvatar,
        tags: [],
        bookings: [],
        firstBookingDate: new Date(booking.bookingDate),
        lastBookingDate: new Date(booking.bookingDate),
        totalSpend: 0,
        totalBookings: 0,
        cancelledBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
      });
    }
    
    const customer = customerMap.get(customerKey);
    
    // Add booking to customer's history
    const bookingData = {
      id: booking.id,
      date: new Date(booking.bookingDate),
      spend: booking.calculatedPrice || 0,
      onTime: true, // Default assumption
      cancelled: booking.status === 'cancelled',
      status: booking.status,
      eventType: booking.eventType,
      resource: booking.hallName || booking.selectedHall,
      startTime: booking.startTime,
      endTime: booking.endTime,
      guestCount: booking.guestCount,
      createdAt: booking.createdAt,
    };
    
    customer.bookings.push(bookingData);
    
    // Update customer stats
    customer.totalBookings++;
    customer.totalSpend += bookingData.spend;
    
    if (booking.status === 'cancelled') {
      customer.cancelledBookings++;
    } else if (booking.status === 'confirmed') {
      customer.confirmedBookings++;
    } else if (booking.status === 'pending') {
      customer.pendingBookings++;
    } else if (booking.status === 'completed') {
      customer.completedBookings++;
    }
    
    // Update date ranges
    if (new Date(booking.bookingDate) < customer.firstBookingDate) {
      customer.firstBookingDate = new Date(booking.bookingDate);
    }
    if (new Date(booking.bookingDate) > customer.lastBookingDate) {
      customer.lastBookingDate = new Date(booking.bookingDate);
    }
  });
  
  return Array.from(customerMap.values());
};

// Compute customer analytics (RFM analysis)
export const computeCustomerAnalytics = (customers) => {
  const now = new Date();
  const oneYearAgo = new Date(new Date().setFullYear(now.getFullYear() - 1));

  // Find max values for normalization
  const maxRecency = Math.max(...customers.map(c => {
    const validBookings = c.bookings.filter(b => !b.cancelled);
    return validBookings.length > 0 ? now - new Date(validBookings[0].date) : now - oneYearAgo;
  }));
  
  const maxFrequency = Math.max(...customers.map(c => 
    c.bookings.filter(b => !b.cancelled && new Date(b.date) > oneYearAgo).length
  ));
  
  const maxMonetary = Math.max(...customers.map(c => 
    c.bookings.filter(b => !b.cancelled && new Date(b.date) > oneYearAgo).reduce((sum, b) => sum + b.spend, 0)
  ));

  return customers.map(c => {
    const validBookings = c.bookings.filter(b => !b.cancelled);
    const last12mBookings = validBookings.filter(b => new Date(b.date) > oneYearAgo);

    const recencyDays = validBookings.length > 0 ? (now - new Date(validBookings[0].date)) / (1000 * 3600 * 24) : 365;
    const frequency12m = last12mBookings.length;
    const monetary12m = last12mBookings.reduce((sum, b) => sum + b.spend, 0);

    // RFM Quintile calculation
    const getQuintile = (value, inverted = false) => {
      if (value <= 0.2) return inverted ? 5 : 1;
      if (value <= 0.4) return inverted ? 4 : 2;
      if (value <= 0.6) return inverted ? 3 : 3;
      if (value <= 0.8) return inverted ? 2 : 4;
      return inverted ? 1 : 5;
    };

    const R = getQuintile(recencyDays / (maxRecency || 365), true);
    const F = getQuintile(frequency12m / (maxFrequency || 1));
    const M = getQuintile(monetary12m / (maxMonetary || 1));
    
    const lifetimeSpend = validBookings.reduce((sum, b) => sum + b.spend, 0);
    const avgSpendPerBooking = validBookings.length > 0 ? lifetimeSpend / validBookings.length : 0;
    const CLV = avgSpendPerBooking * frequency12m * 2.5; // Simple heuristic: 2.5 year tenure

    // Determine customer segment
    let segment = 'At-Risk';
    if (R >= 4 && F >= 4 && M >= 4) segment = 'Champions';
    else if (R >= 3 && F >= 3 && M >= 3) segment = 'Loyal';
    else if (R >= 4 && F <= 2 && M >= 3) segment = 'New';
    else if (R <= 2 && F >= 3 && M >= 3) segment = 'At-Risk';
    else if (R <= 2 && F <= 2 && M <= 2) segment = 'Lost';

    // Add VIP tag for high-value customers
    if (lifetimeSpend > 2000 || frequency12m >= 5) {
      c.tags.push('VIP');
    }

    return {
      ...c,
      rfm: `${R}${F}${M}`,
      segment,
      clv: CLV,
      lastActiveDays: Math.round(recencyDays),
      totalBookings: validBookings.length,
      lifetimeSpend,
      avgSpendPerBooking,
      frequency12m,
      monetary12m,
    };
  });
};

// Create a new booking (admin endpoint)
export const createAdminBooking = async (bookingData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/admin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to create booking: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating admin booking:', error);
    throw error;
  }
};

// Fetch customers from bookings for a hall owner (or parent user for sub-users)
export const fetchCustomersFromBookings = async (hallOwnerId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/hall-owner/${hallOwnerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const bookings = await response.json();
    
    // Transform bookings to customers
    const customers = transformBookingsToCustomers(bookings);
    
    // Compute analytics
    const customersWithAnalytics = computeCustomerAnalytics(customers);
    
    return customersWithAnalytics;
  } catch (error) {
    console.error('Error fetching customers from bookings:', error);
    throw error;
  }
};
