import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Download,
  Search,
  Printer,
  Mail,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  FileText,
  Eye,
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
    deposit: 'Paid', // Default for completed bookings
    bond: 0, // Could be enhanced later
    docs: { 
      id: true, // Default for completed bookings
      insurance: true 
    },
    addOns: 0, // Could be enhanced later
    guests: backendBooking.guestCount || 0,
    purpose: backendBooking.eventType || 'Event',
    status: backendBooking.status || 'completed',
    totalValue: backendBooking.calculatedPrice || 0,
    createdAt: backendBooking.createdAt ? new Date(backendBooking.createdAt) : new Date(),
    lastModified: backendBooking.updatedAt ? new Date(backendBooking.updatedAt) : new Date(),
    // Additional backend fields
    customerPhone: backendBooking.customerPhone,
    customerAvatar: backendBooking.customerAvatar,
    bookingSource: backendBooking.bookingSource,
    priceDetails: backendBooking.priceDetails,
  };
};

// Sample data (fallback)
const sampleCompletedBookings = [
  {
    id: 'BKG-4001',
    customer: { name: 'Acme Corp', email: 'events@acme.com' },
    resource: 'Main Hall',
    start: new Date('2025-08-15T09:00:00'),
    end: new Date('2025-08-15T17:00:00'),
    balance: 0,
    deposit: 'Paid',
    bond: 500.00,
    docs: { id: true, insurance: true },
    addOns: 3,
    guests: 150,
    purpose: 'Corporate Event',
    status: 'completed',
    totalValue: 2500.00,
  },
  {
    id: 'BKG-4002',
    customer: { name: 'Sarah Pereira', email: 's.pereira@gmail.com' },
    resource: 'Hall A',
    start: new Date('2025-08-20T18:00:00'),
    end: new Date('2025-08-20T23:00:00'),
    balance: 0,
    deposit: 'Paid',
    bond: 250.00,
    docs: { id: true, insurance: true },
    addOns: 1,
    guests: 60,
    purpose: 'Birthday Party',
    status: 'completed',
    totalValue: 1200.00,
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

export default function BookingsCompleted() {
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'start', direction: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    recent: false,
    highValue: false,
    withAddOns: false,
    publicHoliday: false,
  });

  // Fetch completed bookings from backend
  const fetchCompletedBookings = useCallback(async (isRefresh = false) => {
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

      console.log('Fetching completed bookings for hall owner ID:', hallOwnerId);
      
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
      
      // Filter for completed bookings only
      const completedBookings = backendBookings
        .filter(booking => booking.status === 'completed' || booking.status === 'COMPLETED')
        .map(transformBookingData);
      
      setBookings(completedBookings);
      setFilteredBookings(completedBookings);
      
    } catch (err) {
      console.error('Error fetching completed bookings:', err);
      setError(err.message);
      // Fallback to sample data on error
      setBookings(sampleCompletedBookings);
      setFilteredBookings(sampleCompletedBookings);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Fetch bookings on component mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchCompletedBookings();
    }
  }, [user?.id, fetchCompletedBookings]);

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
      processedBookings = processedBookings.filter(b => b.start >= thirtyDaysAgo);
    }
    if (activeFilters.highValue) {
      processedBookings = processedBookings.filter(b => b.totalValue > 2000);
    }
    if (activeFilters.withAddOns) {
      processedBookings = processedBookings.filter(b => b.addOns > 0);
    }

    // Apply search term
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      processedBookings = processedBookings.filter(b =>
        b.id.toLowerCase().includes(lowercasedTerm) ||
        b.customer.name.toLowerCase().includes(lowercasedTerm) ||
        b.customer.email.toLowerCase().includes(lowercasedTerm) ||
        b.purpose.toLowerCase().includes(lowercasedTerm)
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

  const handleExport = useCallback(() => {
    const dataToExport = selectedRows.size > 0 
      ? filteredBookings.filter(b => selectedRows.has(b.id))
      : filteredBookings;
    
    const csv = [
      [
        'Booking ID', 'Customer', 'Email', 'Resource', 'Start Date', 'Start Time',
        'End Date', 'End Time', 'Status', 'Guests', 'Purpose', 'Total Value',
        'Balance', 'Deposit', 'Bond', 'Add-ons', 'Completed Date'
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
        booking.deposit,
        `$${booking.bond.toLocaleString('en-AU')}`,
        booking.addOns,
        format(booking.lastModified, 'dd/MM/yyyy HH:mm'),
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `completed_bookings_export_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredBookings, selectedRows]);
  
  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings — Completed</h1>
          <p className="mt-1 text-gray-500">
            Review completed events, finalise invoices and manage post-event tasks.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchCompletedBookings(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print reports</Button>
          <Button variant="outline"><Mail className="mr-2 h-4 w-4" />Send invoices</Button>
          <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          <Button><Plus className="mr-2 h-4 w-4" />New Booking</Button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Completed</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
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
                    return b.start >= monthStart;
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
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${bookings.reduce((sum, b) => sum + b.totalValue, 0).toLocaleString()}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${bookings.length > 0 ? Math.round(bookings.reduce((sum, b) => sum + b.totalValue, 0) / bookings.length) : 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
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
                placeholder="Search by ID, customer, event..."
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
                variant={activeFilters.withAddOns ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterToggle('withAddOns')}
              >
                With Add-ons
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
                <p className="text-gray-600">Loading completed bookings...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => fetchCompletedBookings()} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">No completed bookings found</p>
                <p className="text-sm text-gray-500">
                  {searchTerm || Object.values(activeFilters).some(f => f === true)
                    ? 'Try adjusting your search or filters' 
                    : 'Completed bookings will appear here after events have taken place'}
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
                      <Button variant="ghost" onClick={() => handleSort('totalValue')}>Total Value</Button>
                    </TableHead>
                    <TableHead>Deposit</TableHead>
                    <TableHead className="text-right">Bond</TableHead>
                    <TableHead>Docs</TableHead>
                    <TableHead className="text-right">Add-ons</TableHead>
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
                        <Badge variant={booking.deposit === 'Paid' ? 'secondary' : 'destructive'}>
                          {booking.deposit}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{booking.bond > 0 ? `$${booking.bond.toFixed(2)}` : '—'}</TableCell>
                      <TableCell>
                        <DocStatus docs={booking.docs} />
                      </TableCell>
                      <TableCell className="text-right">{booking.addOns}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="mr-1 h-3 w-3" />
                            Invoice
                          </Button>
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
    </main>
  );
}