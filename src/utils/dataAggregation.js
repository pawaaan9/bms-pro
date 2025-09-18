import { format, subDays, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

// Data aggregation utilities for reports

/**
 * Calculate trend analysis for time series data
 * @param {Array} data - Array of objects with date and value properties
 * @param {string} dateField - Field name for date
 * @param {string} valueField - Field name for value
 * @returns {Object} Trend analysis with direction, percentage change, and slope
 */
export const calculateTrend = (data, dateField = 'date', valueField = 'value') => {
  if (!data || data.length < 2) {
    return { direction: 'neutral', change: 0, slope: 0 };
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a[dateField]) - new Date(b[dateField]));
  
  const firstValue = sortedData[0][valueField];
  const lastValue = sortedData[sortedData.length - 1][valueField];
  
  // Calculate percentage change
  const change = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  
  // Calculate slope using linear regression
  const n = sortedData.length;
  const sumX = sortedData.reduce((sum, item, index) => sum + index, 0);
  const sumY = sortedData.reduce((sum, item) => sum + item[valueField], 0);
  const sumXY = sortedData.reduce((sum, item, index) => sum + index * item[valueField], 0);
  const sumXX = sortedData.reduce((sum, item, index) => sum + index * index, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  return {
    direction: change > 5 ? 'up' : change < -5 ? 'down' : 'neutral',
    change: Math.round(change * 100) / 100,
    slope: Math.round(slope * 100) / 100
  };
};

/**
 * Calculate moving averages for time series data
 * @param {Array} data - Array of objects with date and value properties
 * @param {string} valueField - Field name for value
 * @param {number} window - Window size for moving average
 * @returns {Array} Data with moving averages added
 */
export const calculateMovingAverage = (data, valueField = 'value', window = 3) => {
  if (!data || data.length < window) return data;
  
  return data.map((item, index) => {
    if (index < window - 1) {
      return { ...item, movingAverage: null };
    }
    
    const windowData = data.slice(index - window + 1, index + 1);
    const average = windowData.reduce((sum, item) => sum + item[valueField], 0) / window;
    
    return { ...item, movingAverage: Math.round(average * 100) / 100 };
  });
};

/**
 * Calculate seasonality patterns
 * @param {Array} data - Array of objects with date and value properties
 * @param {string} dateField - Field name for date
 * @param {string} valueField - Field name for value
 * @returns {Object} Seasonality analysis
 */
export const calculateSeasonality = (data, dateField = 'date', valueField = 'value') => {
  if (!data || data.length < 12) {
    return { monthly: {}, quarterly: {}, yearly: {} };
  }
  
  const monthly = {};
  const quarterly = {};
  const yearly = {};
  
  data.forEach(item => {
    const date = new Date(item[dateField]);
    const month = date.getMonth();
    const quarter = Math.floor(month / 3);
    const year = date.getFullYear();
    
    // Monthly aggregation
    if (!monthly[month]) monthly[month] = { sum: 0, count: 0 };
    monthly[month].sum += item[valueField];
    monthly[month].count += 1;
    
    // Quarterly aggregation
    if (!quarterly[quarter]) quarterly[quarter] = { sum: 0, count: 0 };
    quarterly[quarter].sum += item[valueField];
    quarterly[quarter].count += 1;
    
    // Yearly aggregation
    if (!yearly[year]) yearly[year] = { sum: 0, count: 0 };
    yearly[year].sum += item[valueField];
    yearly[year].count += 1;
  });
  
  // Calculate averages
  Object.keys(monthly).forEach(month => {
    monthly[month] = monthly[month].sum / monthly[month].count;
  });
  
  Object.keys(quarterly).forEach(quarter => {
    quarterly[quarter] = quarterly[quarter].sum / quarterly[quarter].count;
  });
  
  Object.keys(yearly).forEach(year => {
    yearly[year] = yearly[year].sum / yearly[year].count;
  });
  
  return { monthly, quarterly, yearly };
};

/**
 * Calculate conversion rates for funnel data
 * @param {Array} funnelData - Array of funnel stage objects
 * @returns {Object} Conversion analysis
 */
export const calculateConversionRates = (funnelData) => {
  if (!funnelData || funnelData.length === 0) {
    return { overall: 0, stageRates: [] };
  }
  
  const firstStage = funnelData[0];
  const lastStage = funnelData[funnelData.length - 1];
  const overallRate = firstStage.count > 0 ? (lastStage.count / firstStage.count) * 100 : 0;
  
  const stageRates = funnelData.map((stage, index) => {
    if (index === 0) return { stage: stage.stage, rate: 100 };
    
    const previousStage = funnelData[index - 1];
    const rate = previousStage.count > 0 ? (stage.count / previousStage.count) * 100 : 0;
    
    return {
      stage: stage.stage,
      rate: Math.round(rate * 100) / 100,
      dropoff: previousStage.count - stage.count
    };
  });
  
  return {
    overall: Math.round(overallRate * 100) / 100,
    stageRates
  };
};

/**
 * Calculate utilization metrics
 * @param {Array} bookings - Array of booking objects
 * @param {Array} resources - Array of resource objects
 * @param {string} period - Time period for calculation
 * @returns {Object} Utilization metrics
 */
export const calculateUtilizationMetrics = (bookings, resources, period = 'monthly') => {
  if (!bookings || !resources) {
    return { overall: 0, byResource: {}, byTime: {} };
  }
  
  const utilization = {
    overall: 0,
    byResource: {},
    byTime: {}
  };
  
  // Calculate total available hours
  const totalAvailableHours = resources.reduce((sum, resource) => {
    const hoursPerDay = 12; // Assuming 12 hours per day
    const daysInPeriod = period === 'monthly' ? 30 : period === 'weekly' ? 7 : 1;
    return sum + (hoursPerDay * daysInPeriod);
  }, 0);
  
  // Calculate total booked hours
  const totalBookedHours = bookings.reduce((sum, booking) => {
    const start = new Date(`2000-01-01T${booking.startTime}:00`);
    const end = new Date(`2000-01-01T${booking.endTime}:00`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);
  
  utilization.overall = totalAvailableHours > 0 ? (totalBookedHours / totalAvailableHours) * 100 : 0;
  
  // Calculate by resource
  resources.forEach(resource => {
    const resourceBookings = bookings.filter(booking => booking.selectedHall === resource.id);
    const resourceBookedHours = resourceBookings.reduce((sum, booking) => {
      const start = new Date(`2000-01-01T${booking.startTime}:00`);
      const end = new Date(`2000-01-01T${booking.endTime}:00`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    
    const resourceAvailableHours = 12 * (period === 'monthly' ? 30 : period === 'weekly' ? 7 : 1);
    utilization.byResource[resource.name] = resourceAvailableHours > 0 ? 
      (resourceBookedHours / resourceAvailableHours) * 100 : 0;
  });
  
  return utilization;
};

/**
 * Calculate revenue metrics
 * @param {Array} bookings - Array of booking objects
 * @param {string} period - Time period for calculation
 * @returns {Object} Revenue metrics
 */
export const calculateRevenueMetrics = (bookings, period = 'monthly') => {
  if (!bookings) {
    return { total: 0, average: 0, byMonth: {}, byResource: {} };
  }
  
  const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
  const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + (booking.calculatedPrice || 0), 0);
  const averageRevenue = confirmedBookings.length > 0 ? totalRevenue / confirmedBookings.length : 0;
  
  const byMonth = {};
  const byResource = {};
  
  confirmedBookings.forEach(booking => {
    const date = new Date(booking.bookingDate);
    const month = format(date, 'yyyy-MM');
    const resource = booking.selectedHall;
    
    // By month
    if (!byMonth[month]) byMonth[month] = 0;
    byMonth[month] += booking.calculatedPrice || 0;
    
    // By resource
    if (!byResource[resource]) byResource[resource] = 0;
    byResource[resource] += booking.calculatedPrice || 0;
  });
  
  return {
    total: totalRevenue,
    average: Math.round(averageRevenue * 100) / 100,
    byMonth,
    byResource
  };
};

/**
 * Calculate customer metrics
 * @param {Array} bookings - Array of booking objects
 * @returns {Object} Customer metrics
 */
export const calculateCustomerMetrics = (bookings) => {
  if (!bookings) {
    return { totalCustomers: 0, repeatCustomers: 0, newCustomers: 0, retentionRate: 0 };
  }
  
  const customerCounts = {};
  bookings.forEach(booking => {
    const customerId = booking.customerId || booking.customerEmail;
    if (customerId) {
      customerCounts[customerId] = (customerCounts[customerId] || 0) + 1;
    }
  });
  
  const totalCustomers = Object.keys(customerCounts).length;
  const repeatCustomers = Object.values(customerCounts).filter(count => count > 1).length;
  const newCustomers = totalCustomers - repeatCustomers;
  const retentionRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;
  
  return {
    totalCustomers,
    repeatCustomers,
    newCustomers,
    retentionRate: Math.round(retentionRate * 100) / 100
  };
};

/**
 * Generate forecast data using simple linear regression
 * @param {Array} historicalData - Historical data points
 * @param {number} periods - Number of future periods to forecast
 * @param {string} dateField - Field name for date
 * @param {string} valueField - Field name for value
 * @returns {Array} Forecast data
 */
export const generateForecast = (historicalData, periods = 6, dateField = 'date', valueField = 'value') => {
  if (!historicalData || historicalData.length < 2) {
    return [];
  }
  
  // Sort data by date
  const sortedData = [...historicalData].sort((a, b) => new Date(a[dateField]) - new Date(b[dateField]));
  
  const n = sortedData.length;
  const sumX = sortedData.reduce((sum, item, index) => sum + index, 0);
  const sumY = sortedData.reduce((sum, item) => sum + item[valueField], 0);
  const sumXY = sortedData.reduce((sum, item, index) => sum + index * item[valueField], 0);
  const sumXX = sortedData.reduce((sum, item, index) => sum + index * index, 0);
  
  // Calculate linear regression coefficients
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Generate forecast
  const forecast = [];
  const lastDate = new Date(sortedData[sortedData.length - 1][dateField]);
  
  for (let i = 1; i <= periods; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setMonth(forecastDate.getMonth() + i);
    
    const forecastValue = intercept + slope * (n + i - 1);
    
    forecast.push({
      [dateField]: format(forecastDate, 'yyyy-MM-dd'),
      [valueField]: Math.max(0, Math.round(forecastValue * 100) / 100), // Ensure non-negative
      isForecast: true
    });
  }
  
  return forecast;
};

/**
 * Calculate performance benchmarks
 * @param {Object} currentMetrics - Current period metrics
 * @param {Object} previousMetrics - Previous period metrics
 * @param {Object} industryBenchmarks - Industry benchmark values
 * @returns {Object} Performance analysis
 */
export const calculatePerformanceBenchmarks = (currentMetrics, previousMetrics, industryBenchmarks = {}) => {
  const benchmarks = {
    utilization: { current: 0, previous: 0, industry: 70, status: 'below' },
    conversion: { current: 0, previous: 0, industry: 60, status: 'below' },
    revenue: { current: 0, previous: 0, industry: 0, status: 'neutral' }
  };
  
  // Update with actual values
  if (currentMetrics.utilization) {
    benchmarks.utilization.current = currentMetrics.utilization;
    benchmarks.utilization.previous = previousMetrics?.utilization || 0;
    benchmarks.utilization.status = currentMetrics.utilization >= industryBenchmarks.utilization ? 'above' : 'below';
  }
  
  if (currentMetrics.conversion) {
    benchmarks.conversion.current = currentMetrics.conversion;
    benchmarks.conversion.previous = previousMetrics?.conversion || 0;
    benchmarks.conversion.status = currentMetrics.conversion >= industryBenchmarks.conversion ? 'above' : 'below';
  }
  
  if (currentMetrics.revenue) {
    benchmarks.revenue.current = currentMetrics.revenue;
    benchmarks.revenue.previous = previousMetrics?.revenue || 0;
    benchmarks.revenue.status = currentMetrics.revenue >= industryBenchmarks.revenue ? 'above' : 'below';
  }
  
  return benchmarks;
};
