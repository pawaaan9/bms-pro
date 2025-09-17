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

// Fetch bookings for a hall owner
export const fetchBookingsForCalendar = async (hallOwnerId, token) => {
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

    const backendBookings = await response.json();
    
    // Transform bookings to calendar events
    const calendarEvents = backendBookings.map(transformBookingToCalendarEvent);
    
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
