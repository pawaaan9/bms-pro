// Dashboard service for API calls
const API_BASE_URL = '/api';

// Fetch dashboard statistics
export const fetchDashboardStats = async (token, hallOwnerId, resourceId = 'all') => {
  try {
    const url = new URL(`${API_BASE_URL}/dashboard/stats`);
    url.searchParams.append('hallOwnerId', hallOwnerId);
    if (resourceId && resourceId !== 'all') {
      url.searchParams.append('resourceId', resourceId);
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to fetch dashboard stats: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const stats = await response.json();
    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Fetch today's schedule
export const fetchTodaySchedule = async (token, hallOwnerId, resourceId = 'all') => {
  try {
    const url = new URL(`${API_BASE_URL}/dashboard/schedule`);
    url.searchParams.append('hallOwnerId', hallOwnerId);
    if (resourceId && resourceId !== 'all') {
      url.searchParams.append('resourceId', resourceId);
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to fetch schedule: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.schedule;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
};

// Fetch payments due
export const fetchPaymentsDue = async (token, hallOwnerId) => {
  try {
    const url = new URL(`${API_BASE_URL}/dashboard/payments-due`);
    url.searchParams.append('hallOwnerId', hallOwnerId);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to fetch payments due: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.payments;
  } catch (error) {
    console.error('Error fetching payments due:', error);
    throw error;
  }
};

// Fetch holds expiring
export const fetchHoldsExpiring = async (token, hallOwnerId) => {
  try {
    const url = new URL(`${API_BASE_URL}/dashboard/holds-expiring`);
    url.searchParams.append('hallOwnerId', hallOwnerId);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to fetch holds expiring: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.holds;
  } catch (error) {
    console.error('Error fetching holds expiring:', error);
    throw error;
  }
};

// Fetch recent activity
export const fetchRecentActivity = async (token, hallOwnerId) => {
  try {
    const url = new URL(`${API_BASE_URL}/dashboard/activity`);
    url.searchParams.append('hallOwnerId', hallOwnerId);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to fetch activity: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.activities;
  } catch (error) {
    console.error('Error fetching activity:', error);
    throw error;
  }
};

// Fetch resources for the hall owner
export const fetchDashboardResources = async (token, hallOwnerId) => {
  try {
    const url = new URL(`${API_BASE_URL}/dashboard/resources`);
    url.searchParams.append('hallOwnerId', hallOwnerId);
    
    const response = await fetch(url, {
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

    const data = await response.json();
    return data.resources;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
};

// Fetch all dashboard data
export const fetchDashboardData = async (token, hallOwnerId, resourceId = 'all') => {
  try {
    const [stats, schedule, payments, holds, activity, resources] = await Promise.all([
      fetchDashboardStats(token, hallOwnerId, resourceId),
      fetchTodaySchedule(token, hallOwnerId, resourceId),
      fetchPaymentsDue(token, hallOwnerId),
      fetchHoldsExpiring(token, hallOwnerId),
      fetchRecentActivity(token, hallOwnerId),
      fetchDashboardResources(token, hallOwnerId)
    ]);

    return {
      kpis: stats.kpis,
      scheduleToday: schedule,
      paymentsDue: payments,
      holds: holds,
      activity: activity,
      resources: resources
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};
