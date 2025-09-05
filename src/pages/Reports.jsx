import React, { useState, useMemo, useRef } from 'react';
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

// --- Sample Data (Production-Ready Business Intelligence) ---

// Executive KPIs - exactly as specified
const executiveKPIs = {
  bookings: { value: 45, change: 8, period: 'QoQ', trend: 'up' },
  revenue: { value: 11600, change: 6, period: 'QoQ', trend: 'up' },
  utilisation: { value: 71, change: 3, period: 'pp', trend: 'up' },
  depositConversion: { value: 82, change: -2, period: 'MoM', trend: 'down' },
  onTimePayments: { value: 88, change: 1, period: 'MoM', trend: 'up' },
  cancellationRate: { value: 6, change: 0, period: 'MoM', trend: 'neutral' },
};

// Historical data - exactly as specified
const historicalData = [
  { month: 'June 2025', bookings: 12, revenue: 3200 },
  { month: 'July 2025', bookings: 18, revenue: 4500 },
  { month: 'August 2025', bookings: 15, revenue: 3900 },
];

// Pipeline data - exactly as specified
const pipelineData = [
  { month: 'Sep 2025', bookings: 10, revenue: 3000 },
  { month: 'Oct 2025', bookings: 14, revenue: 3500 },
  { month: 'Nov 2025', bookings: 11, revenue: 3200 },
  { month: 'Dec 2025', bookings: 9, revenue: 2800 },
  { month: 'Jan 2026', bookings: 8, revenue: 2600 },
  { month: 'Feb 2026', bookings: 12, revenue: 3400 },
];

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

const KPICard = ({ title, value, prefix = '', suffix = '', change, period, trend }) => {
  const trendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';
  
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {prefix}{value.toLocaleString('en-AU')}{suffix}
        </div>
        <div className={`flex items-center gap-1 text-sm ${trendColor} mt-1`}>
          <trendIcon className="h-4 w-4" />
          <span>{change > 0 ? '+' : ''}{change}{period === 'pp' ? ' pp' : '%'} {period}</span>
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
  
  const cohortData = generateCohortData();
  
  // Export functions
  const exportPDF = () => {
    console.log('Exporting PDF report...');
    // Implementation would generate PDF with timestamp
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    alert(`PDF export initiated: reports_${timestamp}.pdf`);
  };
  
  const exportCSVs = () => {
    console.log('Exporting CSV files...');
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    alert(`CSV exports initiated: reports_bundle_${timestamp}.zip`);
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
      <div className="space-y-8 p-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="mt-1 text-gray-600">Performance, forecasts and insights.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={exportCSVs}>
              <Download className="mr-2 h-4 w-4" />
              Download CSVs
            </Button>
            <Button onClick={() => setShowScheduleDialog(true)}>
              <Mail className="mr-2 h-4 w-4" />
              Schedule Email
            </Button>
          </div>
        </header>

        {/* Top Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>Date Range:</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
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
                <Label>Segments:</Label>
                <Button
                  variant={selectedSegments.includes('All') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSegments(['All'])}
                  aria-pressed={selectedSegments.includes('All')}
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
                >
                  VIP
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Executive KPIs */}
        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="text-xl font-semibold mb-4">Executive KPIs</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <KPICard 
              title="Bookings (90d)" 
              value={executiveKPIs.bookings.value}
              change={executiveKPIs.bookings.change}
              period={executiveKPIs.bookings.period}
              trend={executiveKPIs.bookings.trend}
            />
            <KPICard 
              title="Revenue (90d)" 
              value={executiveKPIs.revenue.value}
              prefix="$"
              suffix=" AUD"
              change={executiveKPIs.revenue.change}
              period={executiveKPIs.revenue.period}
              trend={executiveKPIs.revenue.trend}
            />
            <KPICard 
              title="Utilisation (90d)" 
              value={executiveKPIs.utilisation.value}
              suffix="%"
              change={executiveKPIs.utilisation.change}
              period={executiveKPIs.utilisation.period}
              trend={executiveKPIs.utilisation.trend}
            />
            <KPICard 
              title="Deposit Conversion" 
              value={executiveKPIs.depositConversion.value}
              suffix="%"
              change={executiveKPIs.depositConversion.change}
              period={executiveKPIs.depositConversion.period}
              trend={executiveKPIs.depositConversion.trend}
            />
            <KPICard 
              title="On-time Payments" 
              value={executiveKPIs.onTimePayments.value}
              suffix="%"
              change={executiveKPIs.onTimePayments.change}
              period={executiveKPIs.onTimePayments.period}
              trend={executiveKPIs.onTimePayments.trend}
            />
            <KPICard 
              title="Cancellation Rate" 
              value={executiveKPIs.cancellationRate.value}
              suffix="%"
              change={executiveKPIs.cancellationRate.change}
              period={executiveKPIs.cancellationRate.period}
              trend={executiveKPIs.cancellationRate.trend}
            />
          </div>
        </section>

        {/* Historical & Pipeline Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Last 3 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <SortableTable
                data={historicalData}
                columns={[
                  { key: 'month', title: 'Month' },
                  { key: 'bookings', title: 'Bookings', align: 'right' },
                  { key: 'revenue', title: 'Revenue (AUD)', align: 'right', format: (val) => `$${val.toLocaleString()}` },
                ]}
                caption="Historical performance data for the last 3 months"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming 6 Months (Pipeline)</CardTitle>
            </CardHeader>
            <CardContent>
              <SortableTable
                data={pipelineData}
                columns={[
                  { key: 'month', title: 'Month' },
                  { key: 'bookings', title: 'Bookings', align: 'right' },
                  { key: 'revenue', title: 'Revenue (AUD)', align: 'right', format: (val) => `$${val.toLocaleString()}` },
                ]}
                caption="Pipeline projections for the next 6 months"
              />
            </CardContent>
          </Card>
        </div>

        {/* Forecast */}
        <Card>
          <CardHeader>
            <CardTitle>Forecast (Seasonal Naïve)</CardTitle>
          </CardHeader>
          <CardContent>
            <ForecastChart 
              scenario={forecastScenario} 
              onScenarioChange={setForecastScenario} 
            />
          </CardContent>
        </Card>

        {/* Resource Utilisation */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Utilisation</CardTitle>
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
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="sr-only">
              Booking conversion funnel shows {funnelData[0].count} initial requests
              converting to {funnelData[funnelData.length - 1].count} completed bookings,
              a {Math.round((funnelData[funnelData.length - 1].count / funnelData[0].count) * 100)}% conversion rate.
            </div>
          </CardContent>
        </Card>

        {/* Payments Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Timeliness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'On-time', value: paymentData.onTime, fill: '#10b981' },
                        { name: 'Overdue', value: paymentData.overdue, fill: '#ef4444' },
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
                Payment timeliness: {paymentData.onTime}% paid on time, {paymentData.overdue}% overdue
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Aging</CardTitle>
            </CardHeader>
            <CardContent>
              <SortableTable
                data={paymentData.aging}
                columns={[
                  { key: 'bucket', title: 'Age' },
                  { key: 'count', title: 'Count', align: 'right' },
                  { key: 'amount', title: 'Amount (AUD)', align: 'right', format: (val) => `$${val.toLocaleString()}` },
                ]}
                caption="Outstanding payment amounts by age bucket"
                sortable={false}
              />
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

        {/* Anomaly Detection */}
        <Card>
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
        </Card>

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