import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Search,
  Clock,
  AlertTriangle,
  Send,
  Plus,
  Eye,
  XCircle,
  Link2,
  CheckCircle,
  Users,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import BookingsTableAdvanced from '../components/bookings/BookingsTableAdvanced';
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
import { format, addHours, addDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

// Transform backend booking data to match frontend format
const transformBookingData = (backendBooking) => {
  const [year, month, day] = backendBooking.bookingDate.split('-').map(Number);
  const [startHour, startMin] = backendBooking.startTime.split(':').map(Number);
  const [endHour, endMin] = backendBooking.endTime.split(':').map(Number);
  
  const startDateTime = new Date(year, month - 1, day, startHour, startMin, 0);
  const endDateTime = new Date(year, month - 1, day, endHour, endMin, 0);
  
  return {
    id: backendBooking.id,
    customer: {
      name: backendBooking.customerName,
      email: backendBooking.customerEmail,
      phone: backendBooking.customerPhone,
    },
    resource: backendBooking.hallName || backendBooking.selectedHall,
    start: startDateTime,
    end: endDateTime,
    status: backendBooking.status || 'pending',
    totalValue: backendBooking.calculatedPrice || 0,
    guests: backendBooking.guestCount || 0,
    purpose: backendBooking.eventType || 'Event',
    notes: backendBooking.additionalDescription || '',
    createdAt: backendBooking.createdAt ? new Date(backendBooking.createdAt) : new Date(),
    lastModified: backendBooking.updatedAt ? new Date(backendBooking.updatedAt) : new Date(),
    customerPhone: backendBooking.customerPhone,
    customerAvatar: backendBooking.customerAvatar,
    bookingSource: backendBooking.bookingSource,
    priceDetails: backendBooking.priceDetails,
  };
};

export default function BookingsHolds() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showExpired, setShowExpired] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailPaneOpen, setIsDetailPaneOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState({ column: 'start', direction: 'desc' });
  
  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState({ open: false, booking: null });
  const [cancelDialog, setCancelDialog] = useState({ open: false, booking: null });
  const [cancelReason, setCancelReason] = useState('');
  
  // Toast notification state
  const [toast, setToast] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Fetch pending booking requests from backend
  const fetchPendingBookings = useCallback(async (isRefresh = false) => {
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

      console.log('Fetching pending bookings for hall owner ID:', hallOwnerId);
      
      // Fetch only pending bookings from backend
      const response = await fetch(`http://localhost:5000/api/bookings/hall-owner/${hallOwnerId}?status=pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Backend error response:', errorData);
        throw new Error(`Failed to fetch pending bookings: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      const backendBookings = await response.json();
      console.log('Received bookings from backend:', backendBookings);
      
      // Transform and filter for pending status only
      const transformedBookings = backendBookings
        .map(transformBookingData)
        .filter(booking => booking.status === 'pending' || booking.status === 'PENDING');
      
      console.log('Filtered pending bookings:', transformedBookings);
      
      setBookings(transformedBookings);
      setFilteredBookings(transformedBookings);
      
    } catch (err) {
      console.error('Error fetching pending bookings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Fetch bookings on component mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchPendingBookings();
    }
  }, [user?.id, fetchPendingBookings]);

  // Filter bookings
  useEffect(() => {
    let filtered = bookings;

    // Ensure we only show pending bookings
    filtered = filtered.filter(booking => 
      booking.status === 'pending' || booking.status === 'PENDING'
    );

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.id.toLowerCase().includes(term) ||
        booking.customer.name.toLowerCase().includes(term) ||
        booking.customer.email.toLowerCase().includes(term) ||
        booking.purpose.toLowerCase().includes(term) ||
        booking.resource.toLowerCase().includes(term)
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm]);

  const getTimeSinceRequest = (createdAt) => {
    const now = new Date();
    const totalMinutes = differenceInMinutes(now, createdAt);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let text = '';
    if (hours > 0) {
      text = `${hours}h ${minutes}m ago`;
    } else {
      text = `${minutes}m ago`;
    }

    const isRecent = totalMinutes <= 60; // 1 hour
    const isUrgent = totalMinutes <= 120; // 2 hours

    return {
      text,
      className: isRecent ? 'text-green-600 font-medium' : isUrgent ? 'text-orange-600 font-medium' : 'text-gray-900',
      urgent: isUrgent,
    };
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Pending Review', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { text: 'Confirmed', className: 'bg-green-100 text-green-800' },
      cancelled: { text: 'Cancelled', className: 'bg-red-100 text-red-800' },
    };
    
    const config = statusMap[status] || statusMap.pending;
    return <Badge className={config.className}>{config.text}</Badge>;
  };

  const handleConfirm = (booking) => {
    setConfirmDialog({ open: true, booking });
  };

  const handleCancel = (booking) => {
    setCancelDialog({ open: true, booking });
  };

  const confirmBooking = async () => {
    const booking = confirmDialog.booking;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Confirming booking:', booking.id);
      
      const response = await fetch(`http://localhost:5000/api/bookings/${booking.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'confirmed' })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to confirm booking: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Booking confirmed successfully:', result);

      // Update local state optimistically
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      setFilteredBookings(prev => prev.filter(b => b.id !== booking.id));

      // Close modal and show success
      setConfirmDialog({ open: false, booking: null });
      setToast({
        isVisible: true,
        type: 'success',
        title: 'Booking Confirmed!',
        message: `${booking.customer.name}'s booking request has been confirmed.`
      });
      
    } catch (err) {
      console.error('Error confirming booking:', err);
      setToast({
        isVisible: true,
        type: 'error',
        title: 'Error Confirming Booking',
        message: err.message
      });
    }
  };

  const cancelBooking = async () => {
    const booking = cancelDialog.booking;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Cancelling booking:', booking.id);
      
      const response = await fetch(`http://localhost:5000/api/bookings/${booking.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to cancel booking: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Booking cancelled successfully:', result);

      // Update local state optimistically
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      setFilteredBookings(prev => prev.filter(b => b.id !== booking.id));

      // Close modal and show success
      setCancelDialog({ open: false, booking: null });
      setToast({
        isVisible: true,
        type: 'success',
        title: 'Booking Cancelled!',
        message: `${booking.customer.name}'s booking request has been cancelled.`
      });
      
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setToast({
        isVisible: true,
        type: 'error',
        title: 'Error Cancelling Booking',
        message: err.message
      });
    }
  };

  const handleRefresh = () => {
    fetchPendingBookings(true);
  };

  // Advanced table handlers
  const handleRowClick = useCallback((booking) => {
    setSelectedBooking(booking);
    setIsDetailPaneOpen(true);
  }, []);

  const handleBulkAction = useCallback((action) => {
    console.log('Bulk action on booking requests:', action, Array.from(selectedRows));
    setSelectedRows(new Set());
  }, [selectedRows]);

  const handleConfirmOrder = useCallback((bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    setConfirmDialog({ open: true, booking });
  }, [bookings]);

  const handleCancelOrder = useCallback((bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    setCancelDialog({ open: true, booking });
  }, [bookings]);

  const handleExport = () => {
    const csv = [
      [
        'Booking ID', 'Customer', 'Email', 'Resource', 'Start Date', 'Start Time',
        'End Date', 'End Time', 'Status', 'Guests', 'Purpose', 'Total Value', 'Created Date'
      ],
      ...filteredBookings.map(booking => [
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
        format(booking.createdAt, 'dd/MM/yyyy HH:mm'),
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking_requests_export_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
          <p className="mt-1 text-gray-500">
            Pending booking requests awaiting your confirmation or cancellation. Only bookings with "pending" status are shown.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </header>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search booking requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchTerm('');
                  }
                }}
              />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Resources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="hall_a">Hall A</SelectItem>
                <SelectItem value="hall_b">Hall B</SelectItem>
                <SelectItem value="main_hall">Main Hall</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Pending Only
              </Button>
              <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700">
                Recent requests
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="flex-1 shadow-xl border-0 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Calendar className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-500" />
                <p className="text-gray-600">Loading booking requests...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">No booking requests found</p>
                <p className="text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'New pending booking requests will appear here.'}
                </p>
              </div>
            </div>
          ) : (
            <BookingsTableAdvanced
              bookings={filteredBookings.map(b => ({ ...b, balance: b.totalValue || 0 }))}
              selectedRows={selectedRows}
              onSelectedRowsChange={setSelectedRows}
              sortConfig={sortConfig}
              onSortChange={setSortConfig}
              onRowClick={handleRowClick}
              onBulkAction={handleBulkAction}
              onConfirmOrder={handleConfirmOrder}
              onCancelOrder={handleCancelOrder}
            />
          )}
        </CardContent>
      </Card>

      {/* Detail Pane */}
      {isDetailPaneOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsDetailPaneOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Booking Request Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsDetailPaneOpen(false)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg">{selectedBooking.purpose}</h3>
                <p className="text-gray-600">for {selectedBooking.customer.name}</p>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 mt-2">
                  Pending Review
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-medium">{selectedBooking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resource:</span>
                  <span>{selectedBooking.resource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests:</span>
                  <span>{selectedBooking.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="font-medium">${selectedBooking.totalValue?.toLocaleString('en-AU') || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Event Date:</span>
                  <div className="text-right">
                    <div>{format(selectedBooking.start, 'dd MMM yyyy')}</div>
                    <div className="text-sm text-gray-500">
                      {format(selectedBooking.start, 'HH:mm')} - {format(selectedBooking.end, 'HH:mm')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Status */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Request Status
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Requested:</span>
                    <div className="text-right">
                      <div className="font-medium">{getTimeSinceRequest(selectedBooking.createdAt).text}</div>
                      <div className="text-xs text-gray-600">
                        {format(selectedBooking.createdAt, 'dd MMM yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Customer Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span className="font-medium">{selectedBooking.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-blue-600">{selectedBooking.customer.email}</span>
                  </div>
                  {selectedBooking.customer.phone && (
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span>{selectedBooking.customer.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleConfirm(selectedBooking)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Booking
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => handleCancel(selectedBooking)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Booking
                </Button>
                <Button variant="secondary" className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  View Full Details
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t text-xs text-gray-500 mt-6">
              Created {format(selectedBooking.createdAt, 'dd MMM yyyy HH:mm')}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, booking: confirmDialog.booking })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to confirm the booking request for {confirmDialog.booking?.customer.name}?
            </DialogDescription>
          </DialogHeader>
          
          {confirmDialog.booking && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Booking Details:</h4>
              <div className="text-sm space-y-1">
                <div><strong>Event:</strong> {confirmDialog.booking.purpose}</div>
                <div><strong>Date:</strong> {format(confirmDialog.booking.start, 'dd MMM yyyy')}</div>
                <div><strong>Time:</strong> {format(confirmDialog.booking.start, 'HH:mm')} - {format(confirmDialog.booking.end, 'HH:mm')}</div>
                <div><strong>Resource:</strong> {confirmDialog.booking.resource}</div>
                <div><strong>Guests:</strong> {confirmDialog.booking.guests}</div>
                <div><strong>Total Value:</strong> ${confirmDialog.booking.totalValue?.toLocaleString('en-AU') || '0'}</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, booking: null })}>
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmBooking}
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ open, booking: cancelDialog.booking })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the booking request for {cancelDialog.booking?.customer.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {cancelDialog.booking && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">Booking Details:</h4>
              <div className="text-sm space-y-1">
                <div><strong>Event:</strong> {cancelDialog.booking.purpose}</div>
                <div><strong>Date:</strong> {format(cancelDialog.booking.start, 'dd MMM yyyy')}</div>
                <div><strong>Time:</strong> {format(cancelDialog.booking.start, 'HH:mm')} - {format(cancelDialog.booking.end, 'HH:mm')}</div>
                <div><strong>Resource:</strong> {cancelDialog.booking.resource}</div>
                <div><strong>Guests:</strong> {cancelDialog.booking.guests}</div>
                <div><strong>Total Value:</strong> ${cancelDialog.booking.totalValue?.toLocaleString('en-AU') || '0'}</div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for cancellation (optional)</label>
              <Select value={cancelReason} onValueChange={setCancelReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resource_unavailable">Resource unavailable</SelectItem>
                  <SelectItem value="scheduling_conflict">Scheduling conflict</SelectItem>
                  <SelectItem value="customer_request">Customer request</SelectItem>
                  <SelectItem value="admin_decision">Admin decision</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog({ open: false, booking: null })}>
              Keep Request
            </Button>
            <Button 
              onClick={cancelBooking}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Toast Notification */}
      {toast.isVisible && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg max-w-sm ${
            toast.type === 'success' ? 'bg-green-100 border border-green-200 text-green-800' :
            toast.type === 'error' ? 'bg-red-100 border border-red-200 text-red-800' :
            'bg-blue-100 border border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{toast.title}</h4>
                <p className="text-sm mt-1">{toast.message}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setToast(prev => ({ ...prev, isVisible: false }))}
                className="ml-2 h-6 w-6 p-0"
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