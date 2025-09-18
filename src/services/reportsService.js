const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make authenticated API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  console.log(`🔍 API Call: ${endpoint}`, {
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
    apiBaseUrl: API_BASE_URL
  });
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    console.log(`📡 Response for ${endpoint}:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ API Error for ${endpoint}:`, errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Success for ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`💥 API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Reports API service
export const reportsService = {
  // Get executive KPIs
  getExecutiveKPIs: async (period = '90d') => {
    return apiCall(`/reports/executive-kpis?period=${period}`);
  },

  // Get historical performance data
  getHistoricalData: async (months = 6) => {
    return apiCall(`/reports/historical-data?months=${months}`);
  },

  // Get pipeline data (upcoming bookings)
  getPipelineData: async (months = 6) => {
    return apiCall(`/reports/pipeline-data?months=${months}`);
  },

  // Get booking funnel data
  getFunnelData: async (period = '90d') => {
    return apiCall(`/reports/funnel-data?period=${period}`);
  },

  // Get payment analysis data
  getPaymentAnalysis: async () => {
    return apiCall('/reports/payment-analysis');
  },

  // Get resource utilisation data
  getResourceUtilisation: async () => {
    return apiCall('/reports/resource-utilisation');
  },

  // Get cancellation reasons analysis
  getCancellationReasons: async (period = '90d') => {
    return apiCall(`/reports/cancellation-reasons?period=${period}`);
  },

  // Get forecast data
  getForecastData: async (periods = 6) => {
    return apiCall(`/reports/forecast?periods=${periods}`);
  },

  // Get comprehensive summary
  getSummary: async (period = '90d') => {
    return apiCall(`/reports/summary?period=${period}`);
  },

  // Get all reports data at once
  getAllReportsData: async (period = '90d', months = 6) => {
    try {
      const [
        executiveKPIs,
        historicalData,
        pipelineData,
        funnelData,
        paymentAnalysis,
        resourceUtilisation,
        cancellationReasons,
        forecastData,
        summary
      ] = await Promise.all([
        reportsService.getExecutiveKPIs(period),
        reportsService.getHistoricalData(months),
        reportsService.getPipelineData(months),
        reportsService.getFunnelData(period),
        reportsService.getPaymentAnalysis(),
        reportsService.getResourceUtilisation(),
        reportsService.getCancellationReasons(period),
        reportsService.getForecastData(6),
        reportsService.getSummary(period)
      ]);

      return {
        executiveKPIs,
        historicalData,
        pipelineData,
        funnelData,
        paymentAnalysis,
        resourceUtilisation,
        cancellationReasons,
        forecastData,
        summary
      };
    } catch (error) {
      console.error('Error fetching all reports data:', error);
      throw error;
    }
  }
};

export default reportsService;
