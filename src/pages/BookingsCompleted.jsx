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
import { createInvoice, updateInvoiceStatus, generateInvoiceFromBooking, fetchInvoices } from '@/services/invoiceService';

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
  const [isSendingInvoices, setIsSendingInvoices] = useState(false);
  const [showSendInvoicesDialog, setShowSendInvoicesDialog] = useState(false);
  const [invoiceTargets, setInvoiceTargets] = useState([]);
  const [sendingInvoiceId, setSendingInvoiceId] = useState(null);
  const [sentInvoiceIds, setSentInvoiceIds] = useState(new Set());
  const [invoiceSearch, setInvoiceSearch] = useState('');

  const visibleInvoiceTargets = useMemo(() => {
    if (!invoiceSearch) return invoiceTargets;
    const q = invoiceSearch.toLowerCase();
    return invoiceTargets.filter(b =>
      (b.customer?.name || '').toLowerCase().includes(q) ||
      (b.customer?.email || '').toLowerCase().includes(q) ||
      (b.id || '').toLowerCase().includes(q) ||
      (b.resource || '').toLowerCase().includes(q) ||
      (b.purpose || '').toLowerCase().includes(q)
    );
  }, [invoiceTargets, invoiceSearch]);

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

  const openSendInvoicesDialog = useCallback(() => {
    const targets = selectedRows.size > 0 
      ? filteredBookings.filter(b => selectedRows.has(b.id))
      : filteredBookings;
    if (!targets || targets.length === 0) {
      alert('No bookings available to invoice.');
      return;
    }
    setInvoiceTargets(targets);
    setShowSendInvoicesDialog(true);
  }, [filteredBookings, selectedRows]);

  const sendInvoiceForBooking = useCallback(async (booking) => {
    try {
      setIsSendingInvoices(true);
      setSendingInvoiceId(booking.id);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const description = `Final invoice for ${booking.purpose} on ${format(booking.start, 'dd MMM yyyy')}`;
      const invoicePayload = generateInvoiceFromBooking(
        { id: booking.id },
        'FINAL',
        Number(booking.totalValue || 0),
        description
      );
      const created = await createInvoice(invoicePayload, token);
      await updateInvoiceStatus(created.id, 'SENT', token);

      alert(`Invoice sent to ${booking.customer.name} (${booking.customer.email}).`);

      // Optionally remove from dialog list after sending
      setInvoiceTargets(prev => prev.filter(b => b.id !== booking.id));
      setSentInvoiceIds(prev => { const next = new Set(prev); next.add(booking.id); return next; });
    } catch (err) {
      console.error('Error sending invoice:', err);
      const message = err?.message || '';
      const isConflict = message.includes('409') || message.toLowerCase().includes('already exists');
      if (isConflict) {
        try {
          const token = localStorage.getItem('token');
          const hallOwnerId = (user?.role === 'sub_user' && user?.parentUserId) ? user.parentUserId : user?.id;
          const invoices = await fetchInvoices(hallOwnerId, token);
          const existing = invoices.find(inv => inv.booking === booking.id && inv.type === 'FINAL');
          if (existing) {
            if (existing.status !== 'SENT') {
              await updateInvoiceStatus(existing.id, 'SENT', token);
              alert(`Invoice sent to ${booking.customer.name} (${booking.customer.email}).`);
            } else {
              alert('Invoice already sent for this booking.');
            }
            setInvoiceTargets(prev => prev.filter(b => b.id !== booking.id));
            setSentInvoiceIds(prev => { const next = new Set(prev); next.add(booking.id); return next; });
          } else {
            alert('An invoice already exists and could not be located for sending.');
          }
        } catch (fallbackErr) {
          console.error('Fallback send existing invoice failed:', fallbackErr);
          alert(`Failed to send existing invoice: ${fallbackErr.message}`);
        }
      } else {
        alert(`Failed to send invoice: ${message}`);
      }
    } finally {
      setSendingInvoiceId(null);
      setIsSendingInvoices(false);
    }
  }, []);

  const handlePrintReports = useCallback(() => {
    const dataToPrint = selectedRows.size > 0 
      ? filteredBookings.filter(b => selectedRows.has(b.id))
      : filteredBookings;

    const summaryHtml = `
      <div style="margin-bottom:16px;padding:12px;border:1px solid #e5e7eb;border-radius:8px">
        <div style="font-weight:600;margin-bottom:8px">Summary</div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:#374151">
          <div>Total completed: <strong>${dataToPrint.length}</strong></div>
          <div>Total revenue: <strong>$${dataToPrint.reduce((s,b)=>s+b.totalValue,0).toLocaleString('en-AU')}</strong></div>
          <div>Avg value: <strong>$${(dataToPrint.length>0?Math.round(dataToPrint.reduce((s,b)=>s+b.totalValue,0)/dataToPrint.length):0).toLocaleString('en-AU')}</strong></div>
        </div>
      </div>`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Completed Bookings Report</title>
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
            @media print { .page-break { page-break-after: always; } }
          </style>
        </head>
        <body>
          <h1>Bookings — Completed</h1>
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
                <div class="col"><div class="label">Start</div><div class="value">${format(b.start, 'dd MMM yyyy, HH:mm')}</div></div>
                <div class="col"><div class="label">End</div><div class="value">${format(b.end, 'dd MMM yyyy, HH:mm')}</div></div>
                <div class="col"><div class="label">Guests</div><div class="value">${b.guests}</div></div>
                <div class="col"><div class="label">Add-ons</div><div class="value">${b.addOns}</div></div>
              </div>
              <hr />
              <div class="row">
                <div class="col"><div class="label">Purpose</div><div class="value">${b.purpose || ''}</div></div>
                <div class="col"><div class="label">Deposit</div><div class="value">${b.deposit}</div></div>
                <div class="col"><div class="label">Bond</div><div class="value">$${b.bond.toLocaleString('en-AU')}</div></div>
                <div class="col"><div class="label">Total Value</div><div class="value">$${b.totalValue.toLocaleString('en-AU')}</div></div>
              </div>
            </div>
          `).join('')}
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

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
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings — Completed</h1>
          <p className="mt-1 text-gray-500">
            Review completed events, finalise invoices and manage post-event tasks.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchCompletedBookings(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrintReports}><Printer className="mr-2 h-4 w-4" />Print reports</Button>
          <Button variant="outline" size="sm" onClick={openSendInvoicesDialog} disabled={isSendingInvoices}>
            <Mail className="mr-2 h-4 w-4" />{isSendingInvoices ? 'Sending…' : 'Send invoices'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
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
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="relative flex-1 min-w-[180px] sm:min-w-[250px]">
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
                          <Button variant="outline" size="sm" onClick={() => sendInvoiceForBooking(booking)} disabled={sendingInvoiceId === booking.id}>
                            <FileText className="mr-1 h-3 w-3" />
                            {sendingInvoiceId === booking.id ? 'Sending…' : 'Invoice'}
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


      {/* Send Invoices Dialog */}
      <Dialog open={showSendInvoicesDialog} onOpenChange={setShowSendInvoicesDialog}>
        <DialogContent className="w-[92vw] sm:max-w-md max-h-[70vh] sm:max-h-[60vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Send Invoices
            </DialogTitle>
            <DialogDescription>
              Send invoices one-by-one to the selected customers.
            </DialogDescription>
          </DialogHeader>

          {/* Fancy summary */}
          <div className="mb-2 rounded-md border bg-gradient-to-r from-indigo-50 to-purple-50 p-2.5 text-[11px] sm:text-sm">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="px-2 py-0.5 rounded-full bg-white/70 border text-indigo-700">
                {visibleInvoiceTargets.length}/{invoiceTargets.length} customer{visibleInvoiceTargets.length !== 1 ? 's' : ''}
              </div>
              <div className="px-2 py-0.5 rounded-full bg-white/70 border text-purple-700">
                Total ${visibleInvoiceTargets.reduce((s,b)=>s+(b.totalValue||0),0).toLocaleString('en-AU')}
              </div>
              <div className="px-2 py-0.5 rounded-full bg-white/70 border text-emerald-700">
                Sent {Array.from(sentInvoiceIds).length}
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search name, email, booking ID, event, resource..."
              value={invoiceSearch}
              onChange={(e) => setInvoiceSearch(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>

          <div className="flex-1 overflow-auto border rounded-md">
            {visibleInvoiceTargets.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No bookings to invoice.</div>
            ) : (
              visibleInvoiceTargets.map(b => (
                <div key={b.id} className="group flex flex-col sm:flex-row sm:items-start justify-between gap-2 p-2.5 border-b last:border-b-0 hover:bg-gray-50">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-semibold flex-shrink-0 text-[11px]">
                      {b.customer.name?.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}
                    </div>
                    <div className="text-[11px] sm:text-sm min-w-0">
                      <div className="font-medium flex items-center gap-2 min-w-0">
                        <span className="truncate max-w-[52vw] sm:max-w-[24rem]">{b.customer.name}</span> <span className="text-gray-400 hidden sm:inline">•</span>
                        <span className="text-gray-500 truncate max-w-[52vw] sm:max-w-[18rem]">{b.customer.email}</span>
                        <span className="ml-0 sm:ml-2 rounded-full border px-1 py-0.5 text-[9px] sm:text-[10px] uppercase tracking-wide text-purple-700 bg-purple-50 whitespace-nowrap">Final</span>
                      </div>
                      <div className="text-gray-600 truncate max-w-[72vw] sm:max-w-[36rem]">
                        Invoice for {b.purpose} — {format(b.start, 'dd MMM yyyy')} ({b.resource}) • ${b.totalValue.toLocaleString('en-AU')}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-400 truncate max-w-[72vw] sm:max-w-[36rem]">{b.id} · {format(b.start, 'HH:mm')} - {format(b.end, 'HH:mm')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:self-auto self-end">
                    {sentInvoiceIds.has(b.id) && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-sm">
                        <CheckCircle className="h-4 w-4" /> Sent
                      </span>
                    )}
                    <Button size="sm" onClick={() => sendInvoiceForBooking(b)} disabled={sendingInvoiceId === b.id || sentInvoiceIds.has(b.id)}>
                      {sendingInvoiceId === b.id ? 'Sending…' : (sentInvoiceIds.has(b.id) ? 'Sent' : 'Send')}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendInvoicesDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}