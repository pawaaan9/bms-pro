import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileText,
  Mail,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ArrowUpDown,
  Info,
  Filter,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, Area, AreaChart } from 'recharts';
import { format, subDays, addDays, addMonths } from 'date-fns';
import { reportsService } from '@/services/reportsService';
import { exportToPDF, exportAllReportsAsCSV } from '@/utils/exportUtils';

// --- Data State Management ---

// Forecast scenarios using seasonal naïve methodology
const generateForecastData = (scenario = 'Base') => {
  const multipliers = {
    'Base': 1.0,
    'Cautious': 0.85,
    'Optimistic': 1.15,
  };
  
  const multiplier = multipliers[scenario];
  const basePattern = [10, 14, 11, 9, 8, 12]; // Sep-Feb baseline
  
  return basePattern.map((base, index) => ({
    month: ['Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026'][index],
    forecast: Math.round(base * multiplier),
    lower: Math.round(base * multiplier * 0.9),
    upper: Math.round(base * multiplier * 1.1),
    actual: index < 1 ? [10, 14][index] : null, // Partial actuals for comparison
  }));
};

// Resource utilisation data
const generateUtilisationData = () => {
  const resources = ['Hall A', 'Hall B', 'Main Hall', 'Conference Room'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM
  
  return resources.map(resource => ({
    name: resource,
    data: days.map(day => ({
      day,
      utilisation: hours.map(hour => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        rate: Math.random() * 100,
        hasBuffers: Math.random() > 0.7,
        isSetup: Math.random() > 0.8,
        isPackdown: Math.random() > 0.85,
      })),
    })),
  }));
};

// Bookings funnel data
const funnelData = [
  { stage: 'Requests', count: 150, dropoff: 0 },
  { stage: 'Pending', count: 135, dropoff: 15, reason: 'Incomplete info' },
  { stage: 'Hold', count: 118, dropoff: 17, reason: 'Conflicts detected' },
  { stage: 'Confirmed', count: 98, dropoff: 20, reason: 'Deposit not paid' },
  { stage: 'Completed', count: 92, dropoff: 6, reason: 'Last-minute cancellations' },
];

// Cancellation reasons
const cancellationData = [
  { reason: 'Customer request', count: 12, rate: 4.2 },
  { reason: 'Weather', count: 8, rate: 2.8 },
  { reason: 'Policy violation', count: 3, rate: 1.1 },
  { reason: 'Schedule conflict', count: 2, rate: 0.7 },
];

// Payment analysis
const paymentData = {
  onTime: 78,
  overdue: 22,
  aging: [
    { bucket: '0-30 days', amount: 1200, count: 8 },
    { bucket: '31-60 days', amount: 800, count: 4 },
    { bucket: '61-90 days', amount: 450, count: 2 },
    { bucket: '90+ days', amount: 150, count: 1 },
  ],
};

// Cohort analysis data
const generateCohortData = () => {
  const cohorts = [];
  const months = ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025'];
  
  months.forEach((month, monthIndex) => {
    const cohort = { month, periods: [] };
    for (let period = 0; period < 6; period++) {
      const returnRate = period === 0 ? 100 : Math.max(0, 100 - period * 15 - Math.random() * 20);
      cohort.periods.push({
        period,
        rate: Math.round(returnRate),
        customers: Math.round((40 - monthIndex * 5) * (returnRate / 100)),
      });
    }
    cohorts.push(cohort);
  });
  
  return cohorts;
};

// Anomaly detection
const anomalies = [
  {
    date: '2025-08-15',
    metric: 'Bookings',
    value: 3,
    expected: 8,
    severity: 'high',
    reasons: ['Public holiday', 'Website downtime', 'Competitor event'],
  },
  {
    date: '2025-07-28',
    metric: 'Revenue',
    value: 6200,
    expected: 4500,
    severity: 'medium',
    reasons: ['Corporate event', 'Wedding season', 'Premium booking'],
  },
];

// --- Components ---

const KPICard = ({ title, value, prefix = '', suffix = '', change, period, trend, index = 0 }) => {
  const trendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';
  
  const getCardTheme = (index) => {
    const themes = [
      'from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100',
      'from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100',
      'from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100',
      'from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100',
      'from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100',
      'from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100'
    ];
    return themes[index % themes.length];
  };

  const getIconTheme = (index) => {
    const themes = [
      'from-blue-500 to-indigo-600',
      'from-green-500 to-emerald-600',
      'from-purple-500 to-pink-600',
      'from-orange-500 to-yellow-600',
      'from-red-500 to-pink-600',
      'from-indigo-500 to-blue-600'
    ];
    return themes[index % themes.length];
  };

  const getValueColor = (index) => {
    const colors = [
      'text-blue-600',
      'text-green-600',
      'text-purple-600',
      'text-orange-600',
      'text-red-600',
      'text-indigo-600'
    ];
    return colors[index % colors.length];
  };
  
  return (
    <Card className={`group border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${getCardTheme(index)}`}>
      <CardContent className="pt-4 p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-600 truncate">{title}</p>
            <p className={`text-lg font-bold ${getValueColor(index)} mt-1`}>
              {prefix}{value.toLocaleString('en-AU')}{suffix}
            </p>
            <div className={`flex items-center gap-1 text-xs ${trendColor} mt-1`}>
              <trendIcon className="h-3 w-3" />
              <span>{change > 0 ? '+' : ''}{change}{period === 'pp' ? ' pp' : '%'} {period}</span>
            </div>
          </div>
          <div className={`p-2 bg-gradient-to-r ${getIconTheme(index)} rounded-lg shadow-lg flex-shrink-0 ml-2`}>
            <trendIcon className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="sr-only">
          {title}: {prefix}{value.toLocaleString('en-AU')}{suffix}, 
          {change > 0 ? 'increased' : change < 0 ? 'decreased' : 'unchanged'} by {Math.abs(change)}{period === 'pp' ? ' percentage points' : ' percent'} {period}
        </div>
      </CardContent>
    </Card>
  );
};

const SortableTable = ({ data, columns, caption, sortable = true }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'none' });
  
  const handleSort = (key) => {
    if (!sortable) return;
    
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'none';
    }
    
    setSortConfig({ key, direction });
  };
  
  const sortedData = useMemo(() => {
    if (!sortConfig.key || sortConfig.direction === 'none') return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const result = aVal.localeCompare(bVal);
        return sortConfig.direction === 'ascending' ? result : -result;
      }
      
      const result = aVal - bVal;
      return sortConfig.direction === 'ascending' ? result : -result;
    });
  }, [data, sortConfig]);
  
  const getSortIcon = (key) => {
    if (!sortable) return null;
    if (sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    if (sortConfig.direction === 'ascending') return '▲';
    if (sortConfig.direction === 'descending') return '▼';
    return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
  };
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <caption className="sr-only">{caption}</caption>
        <TableHeader className="sticky top-0 bg-gray-50">
          <TableRow>
            {columns.map((col) => (
              <TableHead 
                key={col.key}
                scope="col"
                aria-sort={
                  sortConfig.key === col.key 
                    ? sortConfig.direction === 'none' ? 'none' : sortConfig.direction 
                    : 'none'
                }
                className={col.align === 'right' ? 'text-right' : ''}
              >
                {sortable ? (
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-2 font-medium hover:text-gray-900 transition-colors"
                    aria-label={`Sort by ${col.title}`}
                  >
                    <span>{col.title}</span>
                    {getSortIcon(col.key)}
                  </button>
                ) : (
                  col.title
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow key={index}>
              {columns.map((col) => (
                <TableCell 
                  key={col.key}
                  className={col.align === 'right' ? 'text-right' : ''}
                >
                  {col.format ? col.format(row[col.key]) : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const ForecastChart = ({ scenario, onScenarioChange }) => {
  const data = generateForecastData(scenario);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label>Scenario:</Label>
          <Select value={scenario} onValueChange={onScenarioChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Base">Base</SelectItem>
              <SelectItem value="Cautious">Cautious</SelectItem>
              <SelectItem value="Optimistic">Optimistic</SelectItem>
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Seasonal naïve baseline uses same period last year as benchmark.</p>
              <p>Reference: Hyndman & Athanasopoulos, Forecasting: Principles and Practice</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip />
            <Area 
              type="monotone" 
              dataKey="upper" 
              stackId="1" 
              stroke="#3b82f6" 
              fill="#dbeafe" 
            />
            <Area 
              type="monotone" 
              dataKey="lower" 
              stackId="1" 
              stroke="#3b82f6" 
              fill="transparent" 
            />
            <Line 
              type="monotone" 
              dataKey="forecast" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={{ r: 4 }} 
            />
            {data.some(d => d.actual) && (
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#10b981" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="sr-only">
        Forecast bookings per month using seasonal-naïve baseline; shows confidence bands.
        {scenario} scenario projects {data.reduce((sum, d) => sum + d.forecast, 0)} total bookings
        over the next 6 months with confidence interval bands.
      </div>
    </div>
  );
};

const UtilisationHeatmap = ({ resource = 'Hall A' }) => {
  const data = generateUtilisationData().find(r => r.name === resource);
  const [selectedResource, setSelectedResource] = useState(resource);
  
  const getUtilisationColor = (rate) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    if (rate >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={selectedResource} onValueChange={setSelectedResource}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {generateUtilisationData().map(r => (
              <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Visual heatmap */}
      <div className="overflow-x-auto" role="img" aria-labelledby="heatmap-title">
        <h3 id="heatmap-title" className="sr-only">
          Utilisation heatmap for {selectedResource} showing booking rates by hour and day of week
        </h3>
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-8 gap-1 text-xs">
            <div></div>
            {Array.from({ length: 17 }, (_, i) => (
              <div key={i} className="text-center font-medium p-1">
                {(i + 6).toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>
          {data?.data.map((dayData, dayIndex) => (
            <div key={dayData.day} className="grid grid-cols-8 gap-1 mt-1">
              <div className="text-xs font-medium p-2 flex items-center">
                {dayData.day}
              </div>
              {dayData.utilisation.map((hourData, hourIndex) => (
                <div
                  key={`${dayIndex}-${hourIndex}`}
                  className={`h-8 w-full rounded ${getUtilisationColor(hourData.rate)} relative`}
                  title={`${dayData.day} ${hourData.hour}: ${Math.round(hourData.rate)}% utilised`}
                  tabIndex={0}
                  role="gridcell"
                  aria-label={`${dayData.day} at ${hourData.hour}: ${Math.round(hourData.rate)} percent utilised`}
                >
                  {hourData.hasBuffers && (
                    <div className="absolute inset-0 border-2 border-blue-300 border-dashed rounded"></div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Accessible table fallback */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-600">
          View utilisation data table
        </summary>
        <Table className="mt-2">
          <caption>Hourly utilisation rates for {selectedResource} by day of week</caption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Day</TableHead>
              <TableHead scope="col">Peak Hour</TableHead>
              <TableHead scope="col">Peak Rate</TableHead>
              <TableHead scope="col">Average Rate</TableHead>
              <TableHead scope="col">Low Hour</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map(dayData => {
              const rates = dayData.utilisation.map(h => h.rate);
              const maxRate = Math.max(...rates);
              const minRate = Math.min(...rates);
              const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
              const peakHourIndex = rates.indexOf(maxRate);
              const lowHourIndex = rates.indexOf(minRate);
              
              return (
                <TableRow key={dayData.day}>
                  <TableCell>{dayData.day}</TableCell>
                  <TableCell>{dayData.utilisation[peakHourIndex].hour}</TableCell>
                  <TableCell>{Math.round(maxRate)}%</TableCell>
                  <TableCell>{Math.round(avgRate)}%</TableCell>
                  <TableCell>{dayData.utilisation[lowHourIndex].hour}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </details>
      
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>80%+ utilised</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>60-79%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span>40-59%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>&lt;40%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-blue-300 border-dashed rounded"></div>
          <span>Buffer time</span>
        </div>
      </div>
    </div>
  );
};

const CohortGrid = ({ cohorts }) => {
  const periods = ['Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
  
  const getCohortColor = (rate) => {
    if (rate >= 80) return 'bg-green-500 text-white';
    if (rate >= 60) return 'bg-green-400 text-white';
    if (rate >= 40) return 'bg-yellow-400 text-black';
    if (rate >= 20) return 'bg-orange-400 text-white';
    return 'bg-red-400 text-white';
  };
  
  return (
    <div className="space-y-4">
      <Tooltip>
        <TooltipTrigger>
          <Info className="h-4 w-4 text-gray-400" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Cohort analysis shows retention rates by first-booking month.</p>
          <p>Each cell shows the percentage of customers who return in that period.</p>
        </TooltipContent>
      </Tooltip>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-7 gap-1 text-xs font-medium">
            <div className="p-2">First Booking</div>
            {periods.map(period => (
              <div key={period} className="p-2 text-center">{period}</div>
            ))}
          </div>
          {cohorts.map(cohort => (
            <div key={cohort.month} className="grid grid-cols-7 gap-1 mt-1">
              <div className="p-2 text-xs font-medium bg-gray-100 rounded">
                {cohort.month}
              </div>
              {cohort.periods.map((period, index) => (
                <div
                  key={index}
                  className={`p-2 text-xs text-center rounded ${getCohortColor(period.rate)}`}
                  title={`${cohort.month}, ${periods[index]}: ${period.rate}% retention (${period.customers} customers)`}
                >
                  {period.rate}%
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="sr-only">
        Cohort retention analysis showing percentage of customers returning by time period.
        Average retention across all cohorts ranges from 100% in week 0 to approximately 
        {Math.round(cohorts.reduce((sum, c) => sum + c.periods[5].rate, 0) / cohorts.length)}% by week 5.
      </div>
    </div>
  );
};

// Main component
export default function Reports() {
  const [dateRange, setDateRange] = useState('Last 90 days');
  const [selectedResources, setSelectedResources] = useState(['All']);
  const [selectedSegments, setSelectedSegments] = useState(['All']);
  const [forecastScenario, setForecastScenario] = useState('Base');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showAnomalyDrawer, setShowAnomalyDrawer] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  
  // Data state
  const [reportsData, setReportsData] = useState({
    executiveKPIs: null,
    historicalData: null,
    pipelineData: null,
    funnelData: null,
    paymentAnalysis: null,
    resourceUtilisation: null,
    cancellationReasons: null,
    forecastData: null,
    summary: null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const cohortData = generateCohortData();
  
  // Fetch reports data
  const fetchReportsData = async () => {
    try {
      console.log('🚀 Starting to fetch reports data...');
      setLoading(true);
      setError(null);
      
      const period = dateRange === 'Last 30 days' ? '30d' : 
                    dateRange === 'Last 90 days' ? '90d' : 
                    dateRange === 'Last 180 days' ? '180d' : '1y';
      
      console.log('📊 Fetching data for period:', period);
      const data = await reportsService.getAllReportsData(period, 6);
      console.log('📈 Received reports data:', data);
      
      setReportsData(data);
      setLastUpdated(new Date());
      console.log('✅ Reports data updated successfully');
    } catch (err) {
      console.error('❌ Error fetching reports data:', err);
      setError(err.message || 'Failed to fetch reports data');
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on component mount and when date range changes
  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);
  
  // Export functions
  const exportPDF = async () => {
    try {
      if (!reportsData.executiveKPIs) {
        alert('No data available to export. Please refresh the reports first.');
        return;
      }
      
      await exportToPDF(reportsData, 'business_reports');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      // Try fallback method
      try {
        const { exportToPDFFallback } = await import('@/utils/exportUtils');
        exportToPDFFallback(reportsData, 'business_reports');
      } catch (fallbackError) {
        console.error('Fallback PDF export also failed:', fallbackError);
        alert('PDF export is not available. Please use CSV export instead or install the required dependencies.');
      }
    }
  };
  
  const exportCSVs = () => {
    try {
      if (!reportsData.executiveKPIs) {
        alert('No data available to export. Please refresh the reports first.');
        return;
      }
      
      exportAllReportsAsCSV(reportsData);
    } catch (error) {
      console.error('Error exporting CSVs:', error);
      alert('Failed to export CSV files. Please try again.');
    }
  };

  const ScheduleEmailDialog = () => {
    const [frequency, setFrequency] = useState('weekly');
    const [recipients, setRecipients] = useState('');
    const dialogRef = useRef(null);

    return (
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent 
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-title"
        >
          <DialogHeader>
            <DialogTitle id="schedule-title">Schedule Report Email</DialogTitle>
            <DialogDescription>
              Set up automatic delivery of this report
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="recipients">Recipients (comma-separated)</Label>
              <Input
                id="recipients"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="admin@cranbourne.com, manager@cranbourne.com"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              console.log('Scheduled:', { frequency, recipients });
              const nextSend = frequency === 'weekly' ? addDays(new Date(), 7) : addMonths(new Date(), 1);
              alert(`Report scheduled! Next send: ${format(nextSend, 'dd MMM yyyy')}`);
              setShowScheduleDialog(false);
            }}>
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Header */}
        <header className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-blue-100">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 lg:gap-6">
            <div className="space-y-2 sm:space-y-3 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg w-fit">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Reports
                  </h1>
                  <p className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base mt-1">
                    Performance, forecasts and insights for your business
                    {lastUpdated && (
                      <span className="ml-2 text-xs text-gray-500">
                        Last updated: {format(lastUpdated, 'dd MMM yyyy HH:mm')}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 lg:gap-4 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-1 sm:gap-2">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                  <span>Performance Analytics</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  <span>Forecasting & Insights</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchReportsData}
                disabled={loading}
                className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportPDF} 
                disabled={loading}
                className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300"
              >
                <FileText className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportCSVs} 
                disabled={loading}
                className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300"
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Download CSVs</span>
              </Button>
              <Button 
                size="sm"
                onClick={() => setShowScheduleDialog(true)} 
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Mail className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Schedule Email</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Error loading reports data</span>
              </div>
              <p className="mt-2 text-red-700">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchReportsData}
                className="mt-3"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Top Filters */}
        <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Label className="text-sm font-medium">Date Range:</Label>
                <Select value={dateRange} onValueChange={setDateRange} disabled={loading}>
                  <SelectTrigger className="w-32 sm:w-40 border-gray-200 focus:border-blue-300 focus:ring-blue-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                    <SelectItem value="Last 90 days">Last 90 days</SelectItem>
                    <SelectItem value="Last 180 days">Last 180 days</SelectItem>
                    <SelectItem value="This year">This year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Segments:</Label>
                <div className="flex gap-1">
                  <Button
                    variant={selectedSegments.includes('All') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSegments(['All'])}
                    aria-pressed={selectedSegments.includes('All')}
                    className="text-xs"
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedSegments.includes('Community/NFP') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSegments(
                      selectedSegments.includes('Community/NFP') 
                        ? selectedSegments.filter(s => s !== 'Community/NFP')
                        : [...selectedSegments.filter(s => s !== 'All'), 'Community/NFP']
                    )}
                    aria-pressed={selectedSegments.includes('Community/NFP')}
                    className="text-xs"
                  >
                    Community/NFP
                  </Button>
                  <Button
                    variant={selectedSegments.includes('VIP') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSegments(
                      selectedSegments.includes('VIP')
                        ? selectedSegments.filter(s => s !== 'VIP')
                        : [...selectedSegments.filter(s => s !== 'All'), 'VIP']
                    )}
                    aria-pressed={selectedSegments.includes('VIP')}
                    className="text-xs"
                  >
                    VIP
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Executive KPIs */}
        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">Executive KPIs</h2>
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-4 p-3">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reportsData.executiveKPIs?.kpis ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <KPICard 
                title={`Bookings (${dateRange.toLowerCase()})`}
                value={reportsData.executiveKPIs.kpis.bookings.value}
                change={reportsData.executiveKPIs.kpis.bookings.change}
                period={reportsData.executiveKPIs.kpis.bookings.period}
                trend={reportsData.executiveKPIs.kpis.bookings.trend}
                index={0}
              />
              <KPICard 
                title={`Revenue (${dateRange.toLowerCase()})`}
                value={reportsData.executiveKPIs.kpis.revenue.value}
                prefix="$"
                suffix=" AUD"
                change={reportsData.executiveKPIs.kpis.revenue.change}
                period={reportsData.executiveKPIs.kpis.revenue.period}
                trend={reportsData.executiveKPIs.kpis.revenue.trend}
                index={1}
              />
              <KPICard 
                title={`Utilisation (${dateRange.toLowerCase()})`}
                value={reportsData.executiveKPIs.kpis.utilisation.value}
                suffix="%"
                change={reportsData.executiveKPIs.kpis.utilisation.change}
                period={reportsData.executiveKPIs.kpis.utilisation.period}
                trend={reportsData.executiveKPIs.kpis.utilisation.trend}
                index={2}
              />
              <KPICard 
                title="Deposit Conversion" 
                value={reportsData.executiveKPIs.kpis.depositConversion.value}
                suffix="%"
                change={reportsData.executiveKPIs.kpis.depositConversion.change}
                period={reportsData.executiveKPIs.kpis.depositConversion.period}
                trend={reportsData.executiveKPIs.kpis.depositConversion.trend}
                index={3}
              />
              <KPICard 
                title="On-time Payments" 
                value={reportsData.executiveKPIs.kpis.onTimePayments.value}
                suffix="%"
                change={reportsData.executiveKPIs.kpis.onTimePayments.change}
                period={reportsData.executiveKPIs.kpis.onTimePayments.period}
                trend={reportsData.executiveKPIs.kpis.onTimePayments.trend}
                index={4}
              />
              <KPICard 
                title="Cancellation Rate" 
                value={reportsData.executiveKPIs.kpis.cancellationRate.value}
                suffix="%"
                change={reportsData.executiveKPIs.kpis.cancellationRate.change}
                period={reportsData.executiveKPIs.kpis.cancellationRate.period}
                trend={reportsData.executiveKPIs.kpis.cancellationRate.trend}
                index={5}
              />
            </div>
          ) : (
            <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6 p-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No KPI data available</h3>
                    <p className="text-gray-600 mb-4">Please refresh the reports to load the latest data.</p>
                    <Button 
                      onClick={fetchReportsData}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Historical & Pipeline Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                Historical Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : reportsData.historicalData?.historicalData ? (
                <SortableTable
                  data={reportsData.historicalData.historicalData}
                  columns={[
                    { key: 'month', title: 'Month' },
                    { key: 'bookings', title: 'Bookings', align: 'right' },
                    { key: 'revenue', title: 'Revenue (AUD)', align: 'right', format: (val) => `$${val.toLocaleString()}` },
                  ]}
                  caption="Historical performance data"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-center py-8">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No historical data available</h3>
                    <p className="text-gray-600">Historical performance data will appear here once available.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                Upcoming Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : reportsData.pipelineData?.pipelineData ? (
                <SortableTable
                  data={reportsData.pipelineData.pipelineData}
                  columns={[
                    { key: 'month', title: 'Month' },
                    { key: 'bookings', title: 'Bookings', align: 'right' },
                    { key: 'revenue', title: 'Revenue (AUD)', align: 'right', format: (val) => `$${val.toLocaleString()}` },
                  ]}
                  caption="Pipeline projections for upcoming months"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-center py-8">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No pipeline data available</h3>
                    <p className="text-gray-600">Pipeline projection data will appear here once available.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Forecast */}
        <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              Forecast (Linear Regression)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 sm:h-64 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : reportsData.forecastData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label>Scenario:</Label>
                  <Select value={forecastScenario} onValueChange={setForecastScenario}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Base">Base</SelectItem>
                      <SelectItem value="Optimistic">Optimistic</SelectItem>
                      <SelectItem value="Cautious">Cautious</SelectItem>
                    </SelectContent>
                  </Select>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Linear regression forecast based on historical data.</p>
                      <p>Optimistic: +15% | Cautious: -15%</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportsData.forecastData.scenarios[forecastScenario.toLowerCase()] || reportsData.forecastData.forecastData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area 
                        type="monotone" 
                        dataKey="bookings" 
                        stroke="#3b82f6" 
                        fill="#dbeafe" 
                        name="Bookings"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center py-8">
                <div className="p-4 bg-gray-100 rounded-full">
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No forecast data available</h3>
                  <p className="text-gray-600">Forecast data will appear here once historical data is available.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resource Utilisation */}
        <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              Resource Utilisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UtilisationHeatmap />
          </CardContent>
        </Card>

        {/* Bookings Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : reportsData.funnelData?.funnelData ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportsData.funnelData.funnelData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="stage" type="category" />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="sr-only">
                  Booking conversion funnel shows {reportsData.funnelData.funnelData[0]?.count || 0} initial requests
                  converting to {reportsData.funnelData.funnelData[reportsData.funnelData.funnelData.length - 1]?.count || 0} completed bookings,
                  a {reportsData.funnelData.funnelData[0]?.count ? Math.round((reportsData.funnelData.funnelData[reportsData.funnelData.funnelData.length - 1]?.count / reportsData.funnelData.funnelData[0]?.count) * 100) : 0}% conversion rate.
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">No funnel data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payments Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Timeliness</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : reportsData.paymentAnalysis?.paymentData ? (
                <>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'On-time', value: reportsData.paymentAnalysis.paymentData.onTime, fill: '#10b981' },
                            { name: 'Overdue', value: reportsData.paymentAnalysis.paymentData.overdue, fill: '#ef4444' },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        />
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="sr-only">
                    Payment timeliness: {reportsData.paymentAnalysis.paymentData.onTime}% paid on time, {reportsData.paymentAnalysis.paymentData.overdue}% overdue
                  </div>
                </>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <p className="text-gray-500">No payment data available</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Aging</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : reportsData.paymentAnalysis?.paymentData?.aging ? (
                <SortableTable
                  data={reportsData.paymentAnalysis.paymentData.aging}
                  columns={[
                    { key: 'bucket', title: 'Age' },
                    { key: 'count', title: 'Count', align: 'right' },
                    { key: 'amount', title: 'Amount (AUD)', align: 'right', format: (val) => `$${val.toLocaleString()}` },
                  ]}
                  caption="Outstanding payment amounts by age bucket"
                  sortable={false}
                />
              ) : (
                <p className="text-gray-500 text-center">No payment aging data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cohort Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Cohorts & Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <CohortGrid cohorts={cohortData} />
          </CardContent>
        </Card>

        {/* Anomaly Detection - Hidden for now */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Anomaly Watch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {anomalies.map((anomaly, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border-l-4 ${
                    anomaly.severity === 'high' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${
                          anomaly.severity === 'high' ? 'text-red-500' : 'text-yellow-500'
                        }`} />
                        <span className="font-medium">
                          {anomaly.metric} anomaly on {format(new Date(anomaly.date), 'dd MMM yyyy')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Actual: {anomaly.value} | Expected: {anomaly.expected} | 
                        Deviation: {anomaly.value > anomaly.expected ? '+' : ''}{Math.round(((anomaly.value - anomaly.expected) / anomaly.expected) * 100)}%
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedAnomaly(anomaly);
                        setShowAnomalyDrawer(true);
                      }}
                    >
                      Why?
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}

        {/* Dialogs */}
        <ScheduleEmailDialog />

        {/* Anomaly Drawer */}
        <Dialog open={showAnomalyDrawer} onOpenChange={setShowAnomalyDrawer}>
          <DialogContent role="dialog" aria-modal="true">
            <DialogHeader>
              <DialogTitle>Anomaly Analysis</DialogTitle>
              <DialogDescription>
                Possible explanations for {selectedAnomaly?.metric} deviation on {selectedAnomaly?.date}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {selectedAnomaly?.reasons.map((reason, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowAnomalyDrawer(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}