import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Search,
  Printer,
  Mail,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  Building2,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';

// Transform backend booking data to match frontend format
const transformBookingData = (backendBooking) => {
  const startDateTime = new Date(`${backendBooking.bookingDate}T${backendBooking.startTime}:00`);
  const endDateTime = new Date(`${backendBooking.bookingDate}T${backendBooking.endTime}:00`);
  
  return {
    id: backendBooking.id,
    customer: {
      name: backendBooking.customerName,
      email: backendBooking.customerEmail,
    },
    resource: backendBooking.hallName || backendBooking.selectedHall,
    start: startDateTime,
    end: endDateTime,
    balance: backendBooking.calculatedPrice || 0,
    deposit: 'Refunded', // Default for cancelled bookings
    bond: 0, // Could be enhanced later
    docs: { 
      id: true, // Default for cancelled bookings
      insurance: true 
    },
    addOns: 0, // Could be enhanced later
    guests: backendBooking.guestCount || 0,
    purpose: backendBooking.eventType || 'Event',
    status: backendBooking.status || 'cancelled',
    totalValue: backendBooking.calculatedPrice || 0,
    createdAt: backendBooking.createdAt ? new Date(backendBooking.createdAt) : new Date(),
    lastModified: backendBooking.updatedAt ? new Date(backendBooking.updatedAt) : new Date(),
    cancelledAt: backendBooking.cancelledAt ? new Date(backendBooking.cancelledAt) : new Date(),
    cancellationReason: backendBooking.cancellationReason || 'Not specified',
    // Additional backend fields
    customerPhone: backendBooking.customerPhone,
    customerAvatar: backendBooking.customerAvatar,
    bookingSource: backendBooking.bookingSource,
    priceDetails: backendBooking.priceDetails,
  };
};

// Sample data (fallback)
const sampleCancelledBookings = [
  {
    id: 'BKG-5001',
    customer: { name: 'John Smith', email: 'john.smith@email.com' },
    resource: 'Main Hall',
    start: new Date('2025-09-05T10:00:00'),
    end: new Date('2025-09-05T18:00:00'),
    balance: 0,
    deposit: 'Refunded',
    bond: 0,
    docs: { id: true, insurance: true },
    addOns: 0,
    guests: 80,
    purpose: 'Corporate Meeting',
    status: 'cancelled',
    totalValue: 1500.00,
    cancelledAt: new Date('2025-08-28T14:30:00'),
    cancellationReason: 'Client requested cancellation',
  },
  {
    id: 'BKG-5002',
    customer: { name: 'Maria Garcia', email: 'maria.garcia@gmail.com' },
    resource: 'Hall A',
    start: new Date('2025-09-12T19:00:00'),
    end: new Date('2025-09-12T23:00:00'),
    balance: 0,
    deposit: 'Refunded',
    bond: 0,
    docs: { id: true, insurance: true },
    addOns: 2,
    guests: 50,
    purpose: 'Birthday Party',
    status: 'cancelled',
    totalValue: 800.00,
    cancelledAt: new Date('2025-09-10T09:15:00'),
    cancellationReason: 'Weather concerns',
  },
];

const DocStatus = ({ docs }) => (
  <div className="flex items-center gap-2">
    <span title={docs.id ? 'ID Verified' : 'ID Missing'}>
      {docs.id ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
    </span>
    <span title={docs.insurance ? 'Insurance Verified' : 'Insurance Missing'}>
      {docs.insurance ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
    </span>
  </div>
);

export default function BookingsCancelled() {
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'cancelledAt', direction: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    recent: false,
    highValue: false,
    refunded: false,
    notRefunded: false,
  });
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewBooking, setViewBooking] = useState(null);

  // Fetch cancelled bookings from backend
  const fetchCancelledBookings = useCallback(async (isRefresh = false) => {
    if (!user?.id) {
      console.log('No user ID available:', user);
      return;
    }
    
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Determine the correct hall owner ID to fetch bookings for
      let hallOwnerId = user.id;
      if (user.role === 'sub_user' && user.parentUserId) {
        hallOwnerId = user.parentUserId;
      }

      console.log('Fetching cancelled bookings for hall owner ID:', hallOwnerId);
      
      const response = await fetch(`http://localhost:5000/api/bookings/hall-owner/${hallOwnerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Backend error response:', errorData);
        throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      const backendBookings = await response.json();
      console.log('Received bookings from backend:', backendBookings);
      
      // Filter for cancelled bookings only
      const cancelledBookings = backendBookings
        .filter(booking => booking.status === 'cancelled' || booking.status === 'CANCELLED')
        .map(transformBookingData);
      
      setBookings(cancelledBookings);
      setFilteredBookings(cancelledBookings);
      
    } catch (err) {
      console.error('Error fetching cancelled bookings:', err);
      setError(err.message);
      // Fallback to sample data on error
      setBookings(sampleCancelledBookings);
      setFilteredBookings(sampleCancelledBookings);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Fetch bookings on component mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchCancelledBookings();
    }
  }, [user?.id, fetchCancelledBookings]);

  const handleFilterToggle = (filterKey) => {
    setActiveFilters(prev => ({ ...prev, [filterKey]: !prev[filterKey] }));
  };
  
  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };
  
  useEffect(() => {
    let processedBookings = [...bookings];

    // Apply quick filters
    if (activeFilters.recent) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      processedBookings = processedBookings.filter(b => b.cancelledAt >= thirtyDaysAgo);
    }
    if (activeFilters.highValue) {
      processedBookings = processedBookings.filter(b => b.totalValue > 1000);
    }
    if (activeFilters.refunded) {
      processedBookings = processedBookings.filter(b => b.deposit === 'Refunded');
    }
    if (activeFilters.notRefunded) {
      processedBookings = processedBookings.filter(b => b.deposit !== 'Refunded');
    }

    // Apply search term
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      processedBookings = processedBookings.filter(b =>
        b.id.toLowerCase().includes(lowercasedTerm) ||
        b.customer.name.toLowerCase().includes(lowercasedTerm) ||
        b.customer.email.toLowerCase().includes(lowercasedTerm) ||
        b.purpose.toLowerCase().includes(lowercasedTerm) ||
        b.cancellationReason.toLowerCase().includes(lowercasedTerm)
      );
    }

    // Apply sorting
    processedBookings.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      let result = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        result = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        result = aValue.getTime() - bValue.getTime();
      } else {
        result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      
      return sortConfig.direction === 'desc' ? -result : result;
    });

    setFilteredBookings(processedBookings);
  }, [searchTerm, activeFilters, sortConfig, bookings]);

  const handleSelectAll = (checked) => {
    setSelectedRows(checked ? new Set(filteredBookings.map(b => b.id)) : new Set());
  };

  const handleSelectRow = (id) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };

  const handlePrintReport = useCallback(() => {
    const dataToPrint = selectedRows.size > 0 
      ? filteredBookings.filter(b => selectedRows.has(b.id))
      : filteredBookings;

    const summaryHtml = `
      <div style="margin-bottom:16px;padding:12px;border:1px solid #e5e7eb;border-radius:8px">
        <div style="font-weight:600;margin-bottom:8px">Summary</div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:#374151">
          <div>Total cancelled: <strong>${dataToPrint.length}</strong></div>
          <div>Lost value: <strong>$${dataToPrint.reduce((s,b)=>s+(b.totalValue||0),0).toLocaleString('en-AU')}</strong></div>
          <div>Refunded: <strong>${dataToPrint.filter(b=>b.deposit==='Refunded').length}</strong></div>
        </div>
      </div>`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Cancelled Bookings Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
            h1 { font-size: 20px; margin: 0 0 12px; }
            .meta { color: #6b7280; font-size: 12px; margin-bottom: 20px; }
            .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
            .row { display: flex; gap: 16px; flex-wrap: wrap; }
            .col { min-width: 180px; }
            .label { font-size: 11px; color: #6b7280; }
            .value { font-size: 14px; font-weight: 600; }
            hr { border: none; border-top: 1px solid #e5e7eb; margin: 12px 0; }
          </style>
        </head>
        <body>
          <h1>Bookings — Cancelled</h1>
          <div class="meta">Generated ${format(new Date(), 'dd MMM yyyy HH:mm')}</div>
          ${summaryHtml}
          ${dataToPrint.map(b => `
            <div class="card">
              <div class="row">
                <div class="col"><div class="label">Booking ID</div><div class="value">${b.id}</div></div>
                <div class="col"><div class="label">Customer</div><div class="value">${b.customer.name}</div></div>
                <div class="col"><div class="label">Email</div><div class="value">${b.customer.email}</div></div>
                <div class="col"><div class="label">Resource</div><div class="value">${b.resource}</div></div>
              </div>
              <div class="row">
                <div class="col"><div class="label">Event</div><div class="value">${format(b.start, 'dd MMM yyyy, HH:mm')} - ${format(b.end, 'HH:mm')}</div></div>
                <div class="col"><div class="label">Cancelled</div><div class="value">${format(b.cancelledAt, 'dd MMM yyyy, HH:mm')}</div></div>
                <div class="col"><div class="label">Reason</div><div class="value">${b.cancellationReason || ''}</div></div>
              </div>
              <hr />
              <div class="row">
                <div class="col"><div class="label">Total Value</div><div class="value">$${(b.totalValue||0).toLocaleString('en-AU')}</div></div>
                <div class="col"><div class="label">Deposit</div><div class="value">${b.deposit}</div></div>
                <div class="col"><div class="label">Guests</div><div class="value">${b.guests}</div></div>
              </div>
            </div>
          `).join('')}
          <script>window.onload = function(){ window.print(); };</script>
        </body>
      </html>`;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }, [filteredBookings, selectedRows]);

  const handleExport = useCallback(() => {
    const dataToExport = selectedRows.size > 0 
      ? filteredBookings.filter(b => selectedRows.has(b.id))
      : filteredBookings;
    
    const csv = [
      [
        'Booking ID', 'Customer', 'Email', 'Resource', 'Event Date', 'Event Time',
        'Event Type', 'Total Value', 'Deposit Status', 'Cancelled Date', 'Cancellation Reason',
        'Guests', 'Add-ons'
      ],
      ...dataToExport.map(booking => [
        booking.id,
        booking.customer.name,
        booking.customer.email,
        booking.resource,
        format(booking.start, 'dd/MM/yyyy'),
        `${format(booking.start, 'HH:mm')} - ${format(booking.end, 'HH:mm')}`,
        booking.purpose,
        `$${booking.totalValue.toLocaleString('en-AU')}`,
        booking.deposit,
        format(booking.cancelledAt, 'dd/MM/yyyy HH:mm'),
        booking.cancellationReason,
        booking.guests,
        booking.addOns,
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cancelled_bookings_export_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredBookings, selectedRows]);
  
  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings — Cancelled</h1>
          <p className="mt-1 text-gray-500">
            Review cancelled bookings, manage refunds and analyze cancellation patterns.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchCancelledBookings(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline" onClick={handlePrintReport}><Printer className="mr-2 h-4 w-4" />Print report</Button>
          {/* Send refunds button removed by request */}
          <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => {
                    const now = new Date();
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    return b.cancelledAt >= monthStart;
                  }).length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lost Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${bookings.reduce((sum, b) => sum + b.totalValue, 0).toLocaleString()}
                </p>
              </div>
              <FileText className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Refunded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.deposit === 'Refunded').length}
                </p>
              </div>
              <RotateCcw className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by ID, customer, reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeFilters.recent ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterToggle('recent')}
              >
                Recent (30 days)
              </Button>
              <Button
                variant={activeFilters.highValue ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterToggle('highValue')}
              >
                High Value
              </Button>
              <Button
                variant={activeFilters.refunded ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterToggle('refunded')}
              >
                Refunded
              </Button>
              <Button
                variant={activeFilters.notRefunded ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterToggle('notRefunded')}
              >
                Not Refunded
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-600">Loading cancelled bookings...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => fetchCancelledBookings()} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <XCircle className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">No cancelled bookings found</p>
                <p className="text-sm text-gray-500">
                  {searchTerm || Object.values(activeFilters).some(f => f === true)
                    ? 'Try adjusting your search or filters' 
                    : 'Cancelled bookings will appear here when bookings are cancelled'}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 px-4">
                      <Checkbox
                        checked={selectedRows.size > 0 && selectedRows.size === filteredBookings.length}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all bookings on this page"
                      />
                    </TableHead>
                    <TableHead>
                       <Button variant="ghost" onClick={() => handleSort('resource')}>Booking</Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('customer')}>Customer</Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('start')}>Event Date</Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('purpose')}>Event Type</Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button variant="ghost" onClick={() => handleSort('totalValue')}>Value</Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('deposit')}>Deposit</Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('cancelledAt')}>Cancelled</Button>
                    </TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id} data-state={selectedRows.has(booking.id) ? 'selected' : ''}>
                      <TableCell className="px-4">
                         <Checkbox
                          checked={selectedRows.has(booking.id)}
                          onCheckedChange={() => handleSelectRow(booking.id)}
                          aria-label={`Select booking ${booking.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{`${booking.resource} - ${booking.customer.name.split(' ')[0]} (${booking.guests})`}</TableCell>
                      <TableCell>
                        <div>{booking.customer.name}</div>
                        <div className="text-sm text-muted-foreground">{booking.customer.email}</div>
                      </TableCell>
                      <TableCell>
                        <div>{format(booking.start, 'dd MMM yyyy')}</div>
                        <div className="text-sm text-muted-foreground">{format(booking.start, 'HH:mm')} - {format(booking.end, 'HH:mm')}</div>
                      </TableCell>
                      <TableCell>{booking.purpose}</TableCell>
                      <TableCell className="text-right font-mono">${booking.totalValue.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={booking.deposit === 'Refunded' ? 'secondary' : 'destructive'}>
                          {booking.deposit}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>{format(booking.cancelledAt, 'dd MMM yyyy')}</div>
                        <div className="text-sm text-muted-foreground">{format(booking.cancelledAt, 'HH:mm')}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={booking.cancellationReason}>
                          {booking.cancellationReason}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setViewBooking(booking);
                              setViewDialogOpen(true);
                            }}
                          >
                            View
                          </Button>
                          {/* Refund action removed by request */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Booking Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cancelled Booking Details</DialogTitle>
            <DialogDescription>
              Review the details of the cancelled booking.
            </DialogDescription>
          </DialogHeader>
          {viewBooking && (
            <div className="space-y-4">
              {/* Gradient header */}
              <div className="relative overflow-hidden rounded-2xl border">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-fuchsia-600 to-indigo-600" />
                <div className="absolute inset-0 opacity-15" style={{backgroundImage:'radial-gradient(circle at 18% 18%, white 1px, transparent 1px)', backgroundSize:'16px 16px'}} />
                <div className="relative p-5 text-white flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                    {viewBooking.customer.name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold truncate">{viewBooking.customer.name}</h3>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Cancelled</Badge>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{viewBooking.deposit}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-1 rounded"><Building2 className="h-3 w-3" /> {viewBooking.resource}</span>
                      <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-1 rounded"><Calendar className="h-3 w-3" /> {format(viewBooking.start, 'dd MMM yyyy')}</span>
                      <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-1 rounded"><Clock className="h-3 w-3" /> {format(viewBooking.start, 'HH:mm')}–{format(viewBooking.end, 'HH:mm')}</span>
                    </div>
                    {viewBooking.cancellationReason && (
                      <div className="mt-3 text-[13px]leading-5 bg-white/10 rounded px-3 py-2 border border-white/20">
                        <span className="opacity-80">Reason:</span> {viewBooking.cancellationReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Key facts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border bg-gradient-to-br from-gray-50 to-white p-3">
                  <div className="text-xs text-gray-500 mb-1">Booking ID</div>
                  <div className="font-mono text-sm break-all text-gray-800">{viewBooking.id}</div>
                </div>
                <div className="rounded-lg border bg-gradient-to-br from-gray-50 to-white p-3">
                  <div className="text-xs text-gray-500 mb-1">Email</div>
                  <div className="text-sm text-gray-800 truncate">{viewBooking.customer.email}</div>
                </div>
                <div className="rounded-lg border bg-gradient-to-br from-gray-50 to-white p-3">
                  <div className="text-xs text-gray-500 mb-1">Event</div>
                  <div className="text-sm text-gray-800">{format(viewBooking.start, 'eeee, dd MMM yyyy')}</div>
                </div>
                <div className="rounded-lg border bg-gradient-to-br from-gray-50 to-white p-3">
                  <div className="text-xs text-gray-500 mb-1">Cancelled At</div>
                  <div className="text-sm text-gray-800">{format(viewBooking.cancelledAt, 'dd MMM yyyy, HH:mm')}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded border p-3 bg-gray-50">
                  <div className="text-sm text-gray-600">Guests</div>
                  <div className="font-medium">{viewBooking.guests}</div>
                </div>
                <div className="flex items-center justify-between rounded border p-3 bg-gray-50">
                  <div className="text-sm text-gray-600">Total Value</div>
                  <div className="font-medium">${viewBooking.totalValue.toLocaleString('en-AU')}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}