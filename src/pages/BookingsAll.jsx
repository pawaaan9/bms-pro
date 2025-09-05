import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Plus,
  Download,
  Search,
  Filter,
  Calendar,
  Settings2,
  MoreVertical,
  Eye,
  Edit,
  Send,
  XCircle,
  Zap,
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Keyboard,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BookingsTableAdvanced from '../components/bookings/BookingsTableAdvanced';
import SmartFilters from '../components/bookings/SmartFilters';
import BookingDetailPaneAdvanced from '../components/bookings/BookingDetailPaneAdvanced';
import QuickStats from '../components/bookings/QuickStats';
import CommandPalette from '../components/bookings/CommandPalette';
import { format, subDays, addDays, isToday, isTomorrow, isYesterday } from 'date-fns';

// Enhanced sample data with realistic business scenarios
const generateRealisticBookings = () => {
  const statuses = ['PENDING_REVIEW', 'TENTATIVE', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  const resources = ['Hall A', 'Hall B', 'Main Hall', 'Conference Room', 'Studio Space'];
  const purposes = [
    'Wedding Reception', 'Corporate Training', 'Birthday Party', 'Art Exhibition',
    'Dance Recital', 'Community Meeting', 'Graduation Ceremony', 'Product Launch',
    'Fitness Class', 'Music Concert', 'Theatre Performance', 'Workshop',
  ];
  
  const customers = [
    { name: 'Sarah Chen', email: 'sarah.chen@email.com', tier: 'premium' },
    { name: 'Michael Rodriguez', email: 'm.rodriguez@corp.com', tier: 'business' },
    { name: 'Emma Thompson', email: 'emma.t@events.com', tier: 'premium' },
    { name: 'David Kim', email: 'david.kim@startup.io', tier: 'standard' },
    { name: 'Lisa Johnson', email: 'lisa.j@community.org', tier: 'nonprofit' },
    { name: 'James Wilson', email: 'james.wilson@gmail.com', tier: 'standard' },
    { name: 'Maria Garcia', email: 'maria.garcia@dance.com', tier: 'business' },
    { name: 'Robert Lee', email: 'robert.lee@tech.com', tier: 'premium' },
  ];

  return Array.from({ length: 47 }, (_, i) => {
    const customer = customers[i % customers.length];
    const baseDate = subDays(new Date(), Math.random() * 60 - 30); // ±30 days
    const startHour = Math.floor(Math.random() * 16) + 8; // 8 AM to 11 PM
    const duration = [2, 3, 4, 5, 6][Math.floor(Math.random() * 5)]; // 2-6 hours
    
    const start = new Date(baseDate);
    start.setHours(startHour, 0, 0, 0);
    
    const end = new Date(start);
    end.setHours(startHour + duration);
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const guests = Math.floor(Math.random() * 200) + 20;
    const basePrice = guests * (Math.random() * 15 + 10); // $10-25 per guest
    const balance = status === 'COMPLETED' ? 0 : Math.floor(basePrice * Math.random());
    
    return {
      id: `BKG-${2000 + i}`,
      customer: {
        ...customer,
        bookingHistory: Math.floor(Math.random() * 10) + 1,
        totalSpent: Math.floor(Math.random() * 50000) + 5000,
      },
      resource: resources[Math.floor(Math.random() * resources.length)],
      start,
      end,
      status,
      balance,
      totalValue: Math.floor(basePrice),
      guests,
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      priority: Math.random() > 0.8 ? 'high' : Math.random() > 0.6 ? 'medium' : 'normal',
      tags: Math.random() > 0.7 ? ['VIP'] : Math.random() > 0.8 ? ['Recurring'] : [],
      notes: Math.random() > 0.6 ? 'Special requirements discussed' : '',
      createdAt: new Date(baseDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      lastModified: new Date(),
      assignedTo: ['Sarah Admin', 'Mike Manager', 'Lisa Coordinator'][Math.floor(Math.random() * 3)],
      riskLevel: Math.random() > 0.9 ? 'high' : Math.random() > 0.7 ? 'medium' : 'low',
    };
  }).sort((a, b) => b.start - a.start);
};

export default function BookingsAll() {
  // State management with performance optimization
  const [bookings] = useState(() => generateRealisticBookings());
  const [filteredBookings, setFilteredBookings] = useState(bookings);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ column: 'start', direction: 'desc' });
  const [isDetailPaneOpen, setIsDetailPaneOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // table, cards, timeline
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  
  // Advanced filter states
  const [filters, setFilters] = useState({
    resources: [],
    statuses: [],
    dateFrom: null,
    dateTo: null,
    priority: [],
    customerTier: [],
    riskLevel: [],
    tags: [],
    quickFilter: 'all', // today, tomorrow, thisWeek, etc.
  });

  // Performance refs
  const searchTimeoutRef = useRef(null);
  const tableRef = useRef(null);

  // Memoized computations for performance
  const quickStats = useMemo(() => {
    const today = new Date();
    const todayBookings = bookings.filter(b => isToday(b.start));
    const tomorrowBookings = bookings.filter(b => isTomorrow(b.start));
    const pendingReview = bookings.filter(b => b.status === 'PENDING_REVIEW');
    const totalRevenue = bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.totalValue, 0);
    
    const avgBookingValue = bookings.length > 0 
      ? bookings.reduce((sum, b) => sum + b.totalValue, 0) / bookings.length 
      : 0;
    
    const occupancyRate = todayBookings.length / 10; // Assuming 10 max bookings per day
    
    return {
      todayCount: todayBookings.length,
      tomorrowCount: tomorrowBookings.length,
      pendingCount: pendingReview.length,
      totalRevenue,
      avgBookingValue,
      occupancyRate: Math.min(occupancyRate, 1),
      highRiskCount: bookings.filter(b => b.riskLevel === 'high').length,
    };
  }, [bookings]);

  // Smart filtering with debounce
  const applyFilters = useCallback(() => {
    let filtered = [...bookings];

    // Quick filters
    const now = new Date();
    switch (filters.quickFilter) {
      case 'today':
        filtered = filtered.filter(b => isToday(b.start));
        break;
      case 'tomorrow':
        filtered = filtered.filter(b => isTomorrow(b.start));
        break;
      case 'thisWeek':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        filtered = filtered.filter(b => b.start >= weekStart && b.start <= weekEnd);
        break;
      case 'overdue':
        filtered = filtered.filter(b => 
          b.status === 'TENTATIVE' && b.start < now
        );
        break;
      case 'highValue':
        filtered = filtered.filter(b => b.totalValue > 2000);
        break;
    }

    // Search with intelligent matching
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => {
        const searchableText = [
          booking.id,
          booking.customer.name,
          booking.customer.email,
          booking.resource,
          booking.purpose,
          booking.assignedTo,
          ...(booking.tags || [])
        ].join(' ').toLowerCase();
        
        return searchableText.includes(term) ||
          // Fuzzy matching for common misspellings
          booking.customer.name.toLowerCase().replace(/[aeiou]/g, '').includes(term.replace(/[aeiou]/g, ''));
      });
    }

    // Advanced filters
    if (filters.resources.length > 0) {
      filtered = filtered.filter(b => filters.resources.includes(b.resource));
    }
    
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(b => filters.statuses.includes(b.status));
    }
    
    if (filters.priority.length > 0) {
      filtered = filtered.filter(b => filters.priority.includes(b.priority));
    }
    
    if (filters.customerTier.length > 0) {
      filtered = filtered.filter(b => filters.customerTier.includes(b.customer.tier));
    }
    
    if (filters.riskLevel.length > 0) {
      filtered = filtered.filter(b => filters.riskLevel.includes(b.riskLevel));
    }

    // Date range with intelligent defaults
    if (filters.dateFrom) {
      filtered = filtered.filter(b => b.start >= filters.dateFrom);
    }
    if (filters.dateTo) {
      const endOfDay = new Date(filters.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(b => b.end <= endOfDay);
    }

    // Apply sorting with stable sort
    if (sortConfig.column && sortConfig.direction) {
      filtered.sort((a, b) => {
        const aValue = getColumnValue(a, sortConfig.column);
        const bValue = getColumnValue(b, sortConfig.column);
        
        let result = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          result = aValue.localeCompare(bValue);
        } else if (aValue instanceof Date && bValue instanceof Date) {
          result = aValue.getTime() - bValue.getTime();
        } else {
          result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
        
        // Secondary sort by ID for stability
        if (result === 0) {
          result = a.id.localeCompare(b.id);
        }
        
        return sortConfig.direction === 'asc' ? result : -result;
      });
    }

    setFilteredBookings(filtered);
  }, [searchTerm, filters, sortConfig, bookings]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, filters, sortConfig, applyFilters]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      
      // Quick filters
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        switch (e.key) {
          case 'T':
            e.preventDefault();
            setFilters(prev => ({ ...prev, quickFilter: 'today' }));
            break;
          case 'N':
            e.preventDefault();
            setFilters(prev => ({ ...prev, quickFilter: 'tomorrow' }));
            break;
          case 'W':
            e.preventDefault();
            setFilters(prev => ({ ...prev, quickFilter: 'thisWeek' }));
            break;
          case 'P':
            e.preventDefault();
            setFilters(prev => ({ ...prev, statuses: ['PENDING_REVIEW'] }));
            break;
        }
      }
      
      // Escape key handlers
      if (e.key === 'Escape') {
        if (isDetailPaneOpen) {
          setIsDetailPaneOpen(false);
          setSelectedBooking(null);
        } else if (showCommandPalette) {
          setShowCommandPalette(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDetailPaneOpen, showCommandPalette]);

  const getColumnValue = (booking, column) => {
    switch (column) {
      case 'booking': return booking.id;
      case 'customer': return booking.customer.name;
      case 'resource': return booking.resource;
      case 'start': return booking.start;
      case 'end': return booking.end;
      case 'status': return booking.status;
      case 'balance': return booking.balance;
      case 'priority': return booking.priority;
      case 'value': return booking.totalValue;
      default: return '';
    }
  };

  const handleRowClick = useCallback((booking) => {
    setSelectedBooking(booking);
    setIsDetailPaneOpen(true);
  }, []);

  const handleBulkAction = useCallback((action) => {
    const selectedBookingIds = Array.from(selectedRows);
    console.log(`Bulk action ${action} on bookings:`, selectedBookingIds);
    
    // Optimistic UI updates
    switch (action) {
      case 'accept':
        // Update local state optimistically
        break;
      case 'decline':
        // Update local state optimistically  
        break;
      case 'send-link':
        // Show success toast immediately
        break;
    }
    
    setSelectedRows(new Set());
  }, [selectedRows]);

  const handleExport = useCallback(() => {
    const dataToExport = selectedRows.size > 0 
      ? filteredBookings.filter(b => selectedRows.has(b.id))
      : filteredBookings;
    
    // Enhanced CSV with more fields
    const csv = [
      [
        'Booking ID', 'Customer', 'Email', 'Resource', 'Start Date', 'Start Time',
        'End Date', 'End Time', 'Status', 'Guests', 'Purpose', 'Total Value',
        'Balance', 'Priority', 'Risk Level', 'Assigned To', 'Created Date'
      ],
      ...dataToExport.map(booking => [
        booking.id,
        booking.customer.name,
        booking.customer.email,
        booking.resource,
        format(booking.start, 'dd/MM/yyyy'),
        format(booking.start, 'HH:mm'),
        format(booking.end, 'dd/MM/yyyy'),
        format(booking.end, 'HH:mm'),
        booking.status,
        booking.guests,
        booking.purpose,
        `$${booking.totalValue.toLocaleString('en-AU')}`,
        `$${booking.balance.toLocaleString('en-AU')}`,
        booking.priority,
        booking.riskLevel,
        booking.assignedTo,
        format(booking.createdAt, 'dd/MM/yyyy HH:mm'),
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_export_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredBookings, selectedRows]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({
      resources: [],
      statuses: [],
      dateFrom: null,
      dateTo: null,
      priority: [],
      customerTier: [],
      riskLevel: [],
      tags: [],
      quickFilter: 'all',
    });
  }, []);

  return (
    <TooltipProvider>
      <div className="flex h-full relative">
        <motion.div 
          className={`flex-1 space-y-6 transition-all duration-300 ${isDetailPaneOpen ? 'pr-96' : ''}`}
          layout
        >
          {/* Enhanced Header with Sparkles Effect */}
          <motion.div 
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-indigo-100/20 to-purple-100/20"></div>
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">Bookings — All</h1>
                  <Sparkles className="h-6 w-6 text-purple-500 animate-pulse" />
                </div>
                <p className="mt-2 text-gray-600 flex items-center gap-2">
                  Search, filter and action bookings across all statuses
                  <Tooltip>
                    <TooltipTrigger>
                      <Keyboard className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs space-y-1">
                        <div>⌘+K: Command palette</div>
                        <div>⌘+Shift+T: Today's bookings</div>
                        <div>⌘+Shift+P: Pending review</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </p>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleExport} className="relative overflow-hidden group">
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/10 to-green-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export current view or selected bookings</TooltipContent>
                </Tooltip>
                
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  New Booking
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Dashboard */}
          <QuickStats stats={quickStats} />

          {/* Enhanced Search & Filters */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Intelligent Search */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search everything... (⌘+K for advanced)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        applyFilters();
                      } else if (e.key === 'Escape') {
                        setSearchTerm('');
                      }
                    }}
                    className="pl-10 pr-20 bg-white shadow-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded border">⌘K</kbd>
                  </div>
                </div>

                {/* Smart Filters */}
                <SmartFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClearFilters={clearFilters}
                  bookings={bookings}
                />
              </div>
            </CardContent>
          </Card>

          {/* Revolutionary Table */}
          <Card className="flex-1 shadow-xl border-0 overflow-hidden">
            <BookingsTableAdvanced
              bookings={filteredBookings}
              selectedRows={selectedRows}
              onSelectedRowsChange={setSelectedRows}
              sortConfig={sortConfig}
              onSortChange={setSortConfig}
              onRowClick={handleRowClick}
              onBulkAction={handleBulkAction}
              ref={tableRef}
            />
          </Card>
        </motion.div>

        {/* Revolutionary Detail Pane */}
        <AnimatePresence>
          {isDetailPaneOpen && selectedBooking && (
            <BookingDetailPaneAdvanced
              booking={selectedBooking}
              onClose={() => {
                setIsDetailPaneOpen(false);
                setSelectedBooking(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Command Palette */}
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          bookings={filteredBookings}
          onSelectBooking={handleRowClick}
          onApplyFilter={setFilters}
        />
      </div>
    </TooltipProvider>
  );
}