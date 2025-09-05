import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Download,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

// Sample pending bookings
const samplePendingBookings = [
  {
    id: 'BKG-2101',
    customer: { name: 'Rachel Green', email: 'rachel.green@email.com' },
    resource: 'Main Hall',
    start: new Date('2025-09-15T14:00:00'),
    end: new Date('2025-09-15T18:00:00'),
    guests: 120,
    purpose: 'Corporate Annual Meeting',
    notes: 'Requires AV setup and catering space',
    conflicts: [],
    submittedAt: new Date('2025-08-20T09:30:00'),
  },
  {
    id: 'BKG-2102',
    customer: { name: 'Michael Chen', email: 'michael.chen@events.com' },
    resource: 'Hall A',
    start: new Date('2025-09-18T19:00:00'),
    end: new Date('2025-09-18T23:00:00'),
    guests: 80,
    purpose: 'Wedding Reception',
    notes: 'Late finish requested, DJ equipment',
    conflicts: ['Buffer overlap with existing booking'],
    submittedAt: new Date('2025-08-21T14:15:00'),
  },
  {
    id: 'BKG-2103',
    customer: { name: 'Sarah Wilson', email: 'sarah.w@community.org' },
    resource: 'Hall B',
    start: new Date('2025-09-12T10:00:00'),
    end: new Date('2025-09-12T16:00:00'),
    guests: 45,
    purpose: 'Community Workshop',
    notes: 'Non-profit discount applies',
    conflicts: [],
    submittedAt: new Date('2025-08-19T16:45:00'),
  },
];

export default function BookingsPending() {
  const [bookings, setBookings] = useState(samplePendingBookings);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailPaneOpen, setIsDetailPaneOpen] = useState(false);
  
  // Dialog states
  const [acceptDialog, setAcceptDialog] = useState({ open: false, booking: null });
  const [declineDialog, setDeclineDialog] = useState({ open: false, booking: null });
  const [requestChangesDialog, setRequestChangesDialog] = useState({ open: false, booking: null });
  
  const [declineReason, setDeclineReason] = useState('');
  const [changeMessage, setChangeMessage] = useState('');
  const [holdExpiry, setHoldExpiry] = useState('24h');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        const filtered = samplePendingBookings.filter(booking =>
          booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setBookings(filtered);
      } else {
        setBookings(samplePendingBookings);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(bookings.map(b => b.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id, checked) => {
    const newSelectedRows = new Set(selectedRows);
    if (checked) {
      newSelectedRows.add(id);
    } else {
      newSelectedRows.delete(id);
    }
    setSelectedRows(newSelectedRows);
  };

  const handleAccept = (booking) => {
    setAcceptDialog({ open: true, booking });
  };

  const handleDecline = (booking) => {
    setDeclineDialog({ open: true, booking });
  };

  const handleRequestChanges = (booking) => {
    setRequestChangesDialog({ open: true, booking });
  };

  const confirmAccept = () => {
    const booking = acceptDialog.booking;
    // Create tentative hold
    console.log(`Accepting ${booking.id} with ${holdExpiry} hold expiry`);
    setAcceptDialog({ open: false, booking: null });
    setHoldExpiry('24h');
  };

  const confirmDecline = () => {
    const booking = declineDialog.booking;
    console.log(`Declining ${booking.id}: ${declineReason}`);
    setDeclineDialog({ open: false, booking: null });
    setDeclineReason('');
  };

  const confirmRequestChanges = () => {
    const booking = requestChangesDialog.booking;
    console.log(`Requesting changes for ${booking.id}: ${changeMessage}`);
    setRequestChangesDialog({ open: false, booking: null });
    setChangeMessage('');
  };

  const getConflictBadge = (conflicts) => {
    if (conflicts.length === 0) return null;
    return (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}
      </Badge>
    );
  };

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings — Pending Review</h1>
          <p className="mt-1 text-gray-500">
            Assess new requests, apply holds, and send deposit links.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={selectedRows.size === 0}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Bulk Accept
          </Button>
          <Button variant="outline" disabled={selectedRows.size === 0}>
            <XCircle className="mr-2 h-4 w-4" />
            Bulk Decline
          </Button>
          <Button variant="outline">
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
                placeholder="Search bookings..."
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
              <Button variant="outline" size="sm">Large events</Button>
              <Button variant="outline" size="sm">With add-ons</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRows.size > 0 && selectedRows.size === bookings.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all bookings"
                    />
                  </TableHead>
                  <TableHead>
                    <button className="flex items-center gap-2 font-medium">
                      Booking
                    </button>
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>
                    <button className="flex items-center gap-2 font-medium">
                      Start
                    </button>
                  </TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Conflicts</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <TableRow
                      key={booking.id}
                      data-state={selectedRows.has(booking.id) ? 'selected' : ''}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsDetailPaneOpen(true);
                      }}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.has(booking.id)}
                          onCheckedChange={(checked) => handleSelectRow(booking.id, checked)}
                          aria-label={`Select booking ${booking.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{booking.id}</div>
                        <div className="text-sm text-gray-500">{booking.purpose}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{booking.customer.name}</div>
                        <div className="text-sm text-gray-500">{booking.customer.email}</div>
                      </TableCell>
                      <TableCell>{booking.resource}</TableCell>
                      <TableCell>
                        <div>{format(booking.start, 'dd MMM yyyy')}</div>
                        <div className="text-sm text-gray-500">{format(booking.start, 'HH:mm')}</div>
                      </TableCell>
                      <TableCell>
                        <div>{format(booking.end, 'dd MMM yyyy')}</div>
                        <div className="text-sm text-gray-500">{format(booking.end, 'HH:mm')}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-40 truncate text-sm">
                          {booking.notes}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getConflictBadge(booking.conflicts)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAccept(booking)}
                            className="text-green-700 border-green-200 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDecline(booking)}
                            className="text-red-700 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequestChanges(booking)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsDetailPaneOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <p>No pending bookings found.</p>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          New Booking
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Pane */}
      {isDetailPaneOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsDetailPaneOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Booking Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsDetailPaneOpen(false)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg">{selectedBooking.purpose}</h3>
                <p className="text-gray-600">for {selectedBooking.customer.name}</p>
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
                  <span className="text-gray-600">Date & Time:</span>
                  <div className="text-right">
                    <div>{format(selectedBooking.start, 'dd MMM yyyy')}</div>
                    <div className="text-sm text-gray-500">
                      {format(selectedBooking.start, 'HH:mm')} - {format(selectedBooking.end, 'HH:mm')}
                    </div>
                  </div>
                </div>
              </div>

              {selectedBooking.conflicts.length > 0 && (
                <div className="border rounded-lg p-4 bg-red-50">
                  <h4 className="font-semibold text-red-800 mb-2">Conflicts Detected</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {selectedBooking.conflicts.map((conflict, index) => (
                      <li key={index}>• {conflict}</li>
                    ))}
                  </ul>
                  <Button variant="link" size="sm" className="text-red-700 p-0 h-auto">
                    View in Calendar
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleAccept(selectedBooking)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept Booking
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => handleDecline(selectedBooking)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Decline
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleRequestChanges(selectedBooking)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Request Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept Dialog */}
      <Dialog open={acceptDialog.open} onOpenChange={(open) => setAcceptDialog({ open, booking: acceptDialog.booking })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Booking</DialogTitle>
            <DialogDescription>
              This will create a tentative hold for {acceptDialog.booking?.customer.name}'s booking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Hold Expiry</label>
              <Select value={holdExpiry} onValueChange={setHoldExpiry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="48h">48 hours</SelectItem>
                  <SelectItem value="72h">72 hours</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptDialog({ open: false, booking: null })}>
              Cancel
            </Button>
            <Button onClick={confirmAccept} className="bg-green-600 hover:bg-green-700">
              Accept & Create Hold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={declineDialog.open} onOpenChange={(open) => setDeclineDialog({ open, booking: declineDialog.booking })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Booking</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining {declineDialog.booking?.customer.name}'s booking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Select value={declineReason} onValueChange={setDeclineReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unavailable">Resource unavailable</SelectItem>
                  <SelectItem value="conflict">Scheduling conflict</SelectItem>
                  <SelectItem value="policy">Policy violation</SelectItem>
                  <SelectItem value="capacity">Over capacity</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineDialog({ open: false, booking: null })}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDecline} 
              disabled={!declineReason}
              className="bg-red-600 hover:bg-red-700"
            >
              Decline Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Changes Dialog */}
      <Dialog open={requestChangesDialog.open} onOpenChange={(open) => setRequestChangesDialog({ open, booking: requestChangesDialog.booking })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Send a message to {requestChangesDialog.booking?.customer.name} requesting changes to their booking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Please describe the changes needed..."
                value={changeMessage}
                onChange={(e) => setChangeMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestChangesDialog({ open: false, booking: null })}>
              Cancel
            </Button>
            <Button 
              onClick={confirmRequestChanges} 
              disabled={!changeMessage.trim()}
            >
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}