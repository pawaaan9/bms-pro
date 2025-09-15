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
  CheckCircle2,
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
    deposit: 'Paid', // Default for confirmed bookings
    bond: 0, // Could be enhanced later
    docs: { 
      id: true, // Default for confirmed bookings
      insurance: true 
    },
    addOns: 0, // Could be enhanced later
    guests: backendBooking.guestCount || 0,
    purpose: backendBooking.eventType || 'Event',
    status: backendBooking.status || 'confirmed',
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

// Realistic sample data (fallback)
const sampleConfirmedBookings = [
  {
    id: 'BKG-3100',
    customer: { name: 'Acme Corp', email: 'events@acme.com' },
    resource: 'Main Hall',
    start: new Date('2025-09-10T09:00:00'),
    end: new Date('2025-09-10T17:00:00'),
    balance: 1250.00,
    deposit: 'Paid',
    bond: 500.00,
    docs: { id: true, insurance: false },
    addOns: 3,
    guests: 150,
  },
  {
    id: 'BKG-3101',
    customer: { name: 'Sarah Pereira', email: 's.pereira@gmail.com' },
    resource: 'Hall A',
    start: new Date('2025-09-12T18:00:00'),
    end: new Date('2025-09-12T23:00:00'),
    balance: 0,
    deposit: 'Paid',
    bond: 250.00,
    docs: { id: true, insurance: true },
    addOns: 1,
    guests: 60,
  },
  {
    id: 'BKG-3102',
    customer: { name: 'Bright Futures NGO', email: 'contact@brightfutures.org' },
    resource: 'Hall B',
    start: new Date('2025-09-15T10:00:00'),
    end: new Date('2025-09-15T16:00:00'),
    balance: 0,
    deposit: 'Paid',
    bond: 0,
    docs: { id: true, insurance: true },
    addOns: 0,
    guests: 40,
  },
  {
    id: 'BKG-3103',
    customer: { name: 'David Chen', email: 'd.chen.weddings@email.com' },
    resource: 'Main Hall',
    start: new Date('2025-10-04T14:00:00'),
    end: new Date('2025-10-04T23:30:00'),
    balance: 2500.00,
    deposit: 'Paid',
    bond: 1000.00,
    docs: { id: false, insurance: true },
    addOns: 5,
    guests: 200,
  },
];


// --- Sub-components (would be in separate files in a real app) ---

const FilterChips = ({ activeFilters, onFilterToggle }) => {
  const chips = [
    { key: 'balanceDue', label: 'Balance due' },
    { key: 'bondRequired', label: 'Bond required' },
    { key: 'docsMissing', label: 'Docs missing' },
    { key: 'withAddOns', label: 'With add-ons' },
    { key: 'publicHoliday', label: 'Public holiday' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map(chip => (
        <Button
          key={chip.key}
          variant={activeFilters[chip.key] ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterToggle(chip.key)}
          aria-pressed={activeFilters[chip.key]}
          className="transition-all"
        >
          {chip.label}
        </Button>
      ))}
    </div>
  );
};

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


export default function BookingsConfirmed() {
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'start', direction: 'ascending' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'complete',
    title: '',
    message: '',
    confirmText: 'Complete',
    cancelText: 'Cancel',
    bookingDetails: null,
    onConfirm: null
  });
  const [toast, setToast] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [activeFilters, setActiveFilters] = useState({
    balanceDue: false,
    bondRequired: false,
    docsMissing: false,
    withAddOns: false,
    publicHoliday: false,
  });

  // Fetch confirmed bookings from backend
  const fetchConfirmedBookings = useCallback(async (isRefresh = false) => {
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

      console.log('Fetching confirmed bookings for user ID:', user.id);
      
      const response = await fetch(`http://localhost:5000/api/bookings/hall-owner/${user.id}`, {
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
      
      // Filter for confirmed bookings only
      const confirmedBookings = backendBookings
        .filter(booking => booking.status === 'confirmed' || booking.status === 'CONFIRMED')
        .map(transformBookingData);
      
      setBookings(confirmedBookings);
      setFilteredBookings(confirmedBookings);
      
    } catch (err) {
      console.error('Error fetching confirmed bookings:', err);
      setError(err.message);
      // Fallback to sample data on error
      setBookings(sampleConfirmedBookings);
      setFilteredBookings(sampleConfirmedBookings);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Fetch bookings on component mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchConfirmedBookings();
    }
  }, [user?.id, fetchConfirmedBookings]);

  const handleFilterToggle = (filterKey) => {
    setActiveFilters(prev => ({ ...prev, [filterKey]: !prev[filterKey] }));
  };
  
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  useEffect(() => {
    let processedBookings = [...bookings];

    // Apply quick filters
    if (activeFilters.balanceDue) {
      processedBookings = processedBookings.filter(b => b.balance > 0);
    }
    if (activeFilters.bondRequired) {
      processedBookings = processedBookings.filter(b => b.bond > 0);
    }
    if (activeFilters.docsMissing) {
      processedBookings = processedBookings.filter(b => !b.docs.id || !b.docs.insurance);
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
        b.customer.email.toLowerCase().includes(lowercasedTerm)
      );
    }

    // Apply sorting
    processedBookings.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
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

  // Handle complete booking action
  const handleCompleteBooking = useCallback((bookingId) => {
    // Find the booking to get customer name for confirmation
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      console.error('Booking not found:', bookingId);
      return;
    }

    // Show beautiful confirmation modal
    setConfirmationModal({
      isOpen: true,
      type: 'complete',
      title: 'Complete Booking',
      message: `Are you sure you want to mark this booking as completed for ${booking.customer.name}?`,
      confirmText: 'Mark as Completed',
      cancelText: 'Cancel',
      bookingDetails: {
        customerName: booking.customer.name,
        purpose: booking.purpose,
        start: booking.start,
        end: booking.end,
        totalValue: booking.totalValue
      },
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No authentication token found');
          }

          console.log('Completing booking:', bookingId);
          
          const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'completed' })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(`Failed to complete booking: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
          }

          const result = await response.json();
          console.log('Booking completed successfully:', result);

          // Remove the booking from confirmed bookings (since it's now completed)
          setBookings(prevBookings => 
            prevBookings.filter(booking => booking.id !== bookingId)
          );

          // Update filtered bookings as well
          setFilteredBookings(prevFilteredBookings => 
            prevFilteredBookings.filter(booking => booking.id !== bookingId)
          );

          // Close modal and show success
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
          setToast({
            isVisible: true,
            type: 'success',
            title: 'Booking Completed!',
            message: `${booking.customer.name}'s booking has been marked as completed.`
          });
          
        } catch (err) {
          console.error('Error completing booking:', err);
          setToast({
            isVisible: true,
            type: 'error',
            title: 'Error Completing Booking',
            message: err.message
          });
        }
      }
    });
  }, [bookings]);
  
  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings — Confirmed</h1>
          <p className="mt-1 text-gray-500">
            Manage confirmed events, documents, balances and run sheets.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchConfirmedBookings(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print run sheets</Button>
          <Button variant="outline"><Mail className="mr-2 h-4 w-4" />Send reminders</Button>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          <Button><Plus className="mr-2 h-4 w-4" />New Booking</Button>
        </div>
      </header>

      {/* Filters Bar */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by ID, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Date pickers would go here */}
            <FilterChips activeFilters={activeFilters} onFilterToggle={handleFilterToggle} />
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
                <p className="text-gray-600">Loading confirmed bookings...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => fetchConfirmedBookings()} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">No confirmed bookings found</p>
                <p className="text-sm text-gray-500">
                  {searchTerm || Object.values(activeFilters).some(f => f === true)
                    ? 'Try adjusting your search or filters' 
                    : 'Confirmed bookings will appear here when customers complete their reservations'}
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
                      <Button variant="ghost" onClick={() => handleSort('start')}>Start</Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('end')}>End</Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button variant="ghost" onClick={() => handleSort('balance')}>Balance</Button>
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
                      <TableCell>{format(booking.start, 'dd MMM yyyy, HH:mm')}</TableCell>
                      <TableCell>{format(booking.end, 'dd MMM yyyy, HH:mm')}</TableCell>
                      <TableCell className="text-right font-mono">${booking.balance.toFixed(2)}</TableCell>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteBooking(booking.id)}
                            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Complete
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

      {/* Confirmation Modal */}
      <Dialog open={confirmationModal.isOpen} onOpenChange={(open) => setConfirmationModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              {confirmationModal.title}
            </DialogTitle>
            <DialogDescription>
              {confirmationModal.message}
            </DialogDescription>
          </DialogHeader>
          {confirmationModal.bookingDetails && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <div><strong>Customer:</strong> {confirmationModal.bookingDetails.customerName}</div>
                <div><strong>Event:</strong> {confirmationModal.bookingDetails.purpose}</div>
                <div><strong>Date:</strong> {format(confirmationModal.bookingDetails.start, 'dd MMM yyyy, HH:mm')} - {format(confirmationModal.bookingDetails.end, 'HH:mm')}</div>
                <div><strong>Value:</strong> ${confirmationModal.bookingDetails.totalValue.toFixed(2)}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
            >
              {confirmationModal.cancelText}
            </Button>
            <Button
              onClick={confirmationModal.onConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {confirmationModal.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {toast.isVisible && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg border max-w-sm ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <div className="font-medium">{toast.title}</div>
                <div className="text-sm">{toast.message}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setToast(prev => ({ ...prev, isVisible: false }))}
                className="ml-auto h-6 w-6 p-0"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}