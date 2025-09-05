import React, { useState, useEffect } from 'react';
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
import { format, addHours, addDays, differenceInHours, differenceInMinutes } from 'date-fns';

// Sample holds data
const generateSampleHolds = () => {
  const now = new Date();
  return [
    {
      id: 'BKG-2201',
      customer: { name: 'Emma Thompson', email: 'emma.t@events.com' },
      resource: 'Hall A',
      start: addDays(now, 2),
      end: addHours(addDays(now, 2), 4),
      purpose: 'Art Exhibition Opening',
      guests: 75,
      holdExpiresAt: addHours(now, 5),
      depositStatus: 'link_sent',
      createdAt: addHours(now, -18),
      paymentLink: 'https://checkout.stripe.com/...',
    },
    {
      id: 'BKG-2202',
      customer: { name: 'David Kim', email: 'david.kim@startup.io' },
      resource: 'Main Hall',
      start: addDays(now, 5),
      end: addHours(addDays(now, 5), 6),
      purpose: 'Product Launch Event',
      guests: 200,
      holdExpiresAt: addHours(now, 1),
      depositStatus: 'not_sent',
      createdAt: addHours(now, -30),
      paymentLink: null,
    },
    {
      id: 'BKG-2203',
      customer: { name: 'Lisa Johnson', email: 'lisa.j@community.org' },
      resource: 'Hall B',
      start: addDays(now, 3),
      end: addHours(addDays(now, 3), 3),
      purpose: 'Community Workshop',
      guests: 40,
      holdExpiresAt: addHours(now, 20),
      depositStatus: 'paid',
      createdAt: addHours(now, -12),
      paymentLink: 'https://checkout.stripe.com/...',
    },
    {
      id: 'BKG-2204',
      customer: { name: 'Michael Rodriguez', email: 'm.rodriguez@corp.com' },
      resource: 'Conference Room',
      start: addDays(now, 1),
      end: addHours(addDays(now, 1), 2),
      purpose: 'Board Meeting',
      guests: 15,
      holdExpiresAt: addHours(now, -2), // Expired
      depositStatus: 'not_sent',
      createdAt: addHours(now, -50),
      paymentLink: null,
    },
  ];
};

export default function BookingsHolds() {
  const [bookings, setBookings] = useState(generateSampleHolds());
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showExpired, setShowExpired] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailPaneOpen, setIsDetailPaneOpen] = useState(false);
  
  // Dialog states
  const [extendDialog, setExtendDialog] = useState({ open: false, booking: null });
  const [releaseDialog, setReleaseDialog] = useState({ open: false, booking: null });
  const [customExtension, setCustomExtension] = useState('');
  const [releaseReason, setReleaseReason] = useState('');

  // Timer state for live updates
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Filter bookings
  useEffect(() => {
    let filtered = bookings;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.id.toLowerCase().includes(term) ||
        booking.customer.name.toLowerCase().includes(term) ||
        booking.customer.email.toLowerCase().includes(term)
      );
    }

    // Show expired filter
    if (!showExpired) {
      filtered = filtered.filter(booking => booking.holdExpiresAt > currentTime);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, showExpired, currentTime]);

  const getTimeRemaining = (expiresAt) => {
    const now = currentTime;
    if (expiresAt <= now) return { text: 'Expired', className: 'text-red-600', urgent: false };

    const totalMinutes = differenceInMinutes(expiresAt, now);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let text = '';
    if (hours > 0) {
      text = `${hours}h ${minutes}m`;
    } else {
      text = `${minutes}m`;
    }

    const isUrgent = totalMinutes <= 120; // 2 hours
    const isWarning = totalMinutes <= 720; // 12 hours

    return {
      text,
      className: isUrgent ? 'text-red-600 font-bold' : isWarning ? 'text-orange-600 font-medium' : 'text-gray-900',
      urgent: isUrgent,
    };
  };

  const getDepositStatusBadge = (status) => {
    const statusMap = {
      not_sent: { text: 'Not sent', className: 'bg-gray-100 text-gray-800' },
      link_sent: { text: 'Link sent', className: 'bg-blue-100 text-blue-800' },
      paid: { text: 'Paid', className: 'bg-green-100 text-green-800' },
    };
    
    const config = statusMap[status] || statusMap.not_sent;
    return <Badge className={config.className}>{config.text}</Badge>;
  };

  const handleExtend = (booking) => {
    setExtendDialog({ open: true, booking });
  };

  const handleRelease = (booking) => {
    setReleaseDialog({ open: true, booking });
  };

  const confirmExtend = (extension) => {
    const booking = extendDialog.booking;
    let newExpiryTime;
    
    if (extension === 'custom' && customExtension) {
      const hours = parseInt(customExtension);
      newExpiryTime = addHours(booking.holdExpiresAt, hours);
    } else {
      const extensionMap = {
        '2h': 2,
        '6h': 6,
        '24h': 24,
      };
      newExpiryTime = addHours(booking.holdExpiresAt, extensionMap[extension] || 2);
    }

    // Update booking
    setBookings(prev => prev.map(b => 
      b.id === booking.id 
        ? { ...b, holdExpiresAt: newExpiryTime }
        : b
    ));

    console.log(`Extended ${booking.id} until ${format(newExpiryTime, 'dd MMM yyyy HH:mm OOOO')}`);
    setExtendDialog({ open: false, booking: null });
    setCustomExtension('');
  };

  const confirmRelease = () => {
    const booking = releaseDialog.booking;
    console.log(`Released ${booking.id}: ${releaseReason}`);
    
    // Remove from holds list
    setBookings(prev => prev.filter(b => b.id !== booking.id));
    setReleaseDialog({ open: false, booking: null });
    setReleaseReason('');
  };

  const handleSendPaymentLink = (booking) => {
    if (booking.paymentLink) {
      navigator.clipboard.writeText(booking.paymentLink);
      console.log(`Copied payment link for ${booking.id}`);
    } else {
      // Create new payment link
      const newLink = `https://checkout.stripe.com/pay/cs_${booking.id}`;
      setBookings(prev => prev.map(b => 
        b.id === booking.id 
          ? { ...b, paymentLink: newLink, depositStatus: 'link_sent' }
          : b
      ));
      console.log(`Created payment link for ${booking.id}`);
    }
  };

  const isExpired = (expiresAt) => expiresAt <= currentTime;

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings — Holds (Tentative)</h1>
          <p className="mt-1 text-gray-500">
            Provisional bookings with a hold expiry. Extend, release or convert to confirmed.
          </p>
        </div>
        <div className="flex gap-2">
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
                placeholder="Search holds..."
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
              <Button variant="outline" size="sm" className="bg-orange-50 border-orange-200 text-orange-700">
                Expiring soon
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowExpired(!showExpired)}
                className={showExpired ? 'bg-gray-50 border-gray-300' : ''}
              >
                {showExpired ? '✓ ' : ''}Show expired
              </Button>
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
                      checked={selectedRows.size > 0 && selectedRows.size === filteredBookings.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRows(new Set(filteredBookings.map(b => b.id)));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                      aria-label="Select all holds"
                    />
                  </TableHead>
                  <TableHead>
                    <button className="flex items-center gap-2 font-medium">
                      Booking
                    </button>
                  </TableHead>
                  <TableHead>
                    <button className="flex items-center gap-2 font-medium">
                      Start
                    </button>
                  </TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>
                    <button className="flex items-center gap-2 font-medium">
                      Expires In
                      <Clock className="h-4 w-4" />
                    </button>
                  </TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Deposit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => {
                    const timeRemaining = getTimeRemaining(booking.holdExpiresAt);
                    const expired = isExpired(booking.holdExpiresAt);
                    
                    return (
                      <TableRow
                        key={booking.id}
                        data-state={selectedRows.has(booking.id) ? 'selected' : ''}
                        className={`cursor-pointer ${expired ? 'opacity-60' : ''}`}
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsDetailPaneOpen(true);
                        }}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedRows.has(booking.id)}
                            onCheckedChange={(checked) => {
                              const newSelectedRows = new Set(selectedRows);
                              if (checked) {
                                newSelectedRows.add(booking.id);
                              } else {
                                newSelectedRows.delete(booking.id);
                              }
                              setSelectedRows(newSelectedRows);
                            }}
                            aria-label={`Select booking ${booking.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>{booking.id}</div>
                          <div className="text-sm text-gray-500">{booking.purpose}</div>
                        </TableCell>
                        <TableCell>
                          <div>{format(booking.start, 'dd MMM yyyy')}</div>
                          <div className="text-sm text-gray-500">{format(booking.start, 'HH:mm')}</div>
                        </TableCell>
                        <TableCell>
                          <div>{format(booking.end, 'dd MMM yyyy')}</div>
                          <div className="text-sm text-gray-500">{format(booking.end, 'HH:mm')}</div>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-2 ${timeRemaining.className}`} role="timer">
                            {timeRemaining.urgent && <AlertTriangle className="h-4 w-4" />}
                            <span>{timeRemaining.text}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Expires {format(booking.holdExpiresAt, 'dd MMM HH:mm OOOO')}
                          </div>
                        </TableCell>
                        <TableCell>{booking.resource}</TableCell>
                        <TableCell>
                          {getDepositStatusBadge(booking.depositStatus)}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1">
                            {!expired && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExtend(booking)}
                                  title="Extend hold"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendPaymentLink(booking)}
                                  title="Send payment link"
                                  className="text-blue-700 border-blue-200 hover:bg-blue-50"
                                >
                                  {booking.paymentLink ? <Link2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRelease(booking)}
                              title="Release hold"
                              className="text-red-700 border-red-200 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsDetailPaneOpen(true);
                              }}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <p>No holds found.</p>
                        {searchTerm && (
                          <Button variant="link" onClick={() => setSearchTerm('')}>
                            Clear filters
                          </Button>
                        )}
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
              <h2 className="text-xl font-semibold">Hold Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsDetailPaneOpen(false)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg">{selectedBooking.purpose}</h3>
                <p className="text-gray-600">for {selectedBooking.customer.name}</p>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 mt-2">
                  Tentative Hold
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
                  <span className="text-gray-600">Event Date:</span>
                  <div className="text-right">
                    <div>{format(selectedBooking.start, 'dd MMM yyyy')}</div>
                    <div className="text-sm text-gray-500">
                      {format(selectedBooking.start, 'HH:mm')} - {format(selectedBooking.end, 'HH:mm')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hold Status */}
              <div className="border rounded-lg p-4 bg-yellow-50">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Hold Status
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Expires:</span>
                    <div className="text-right">
                      <div className="font-medium">{getTimeRemaining(selectedBooking.holdExpiresAt).text}</div>
                      <div className="text-xs text-gray-600">
                        {format(selectedBooking.holdExpiresAt, 'dd MMM yyyy HH:mm OOOO')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deposit Status */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Deposit
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    {getDepositStatusBadge(selectedBooking.depositStatus)}
                  </div>
                  {selectedBooking.paymentLink && (
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      Copy payment link
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {!isExpired(selectedBooking.holdExpiresAt) && (
                  <>
                    <Button 
                      className="w-full"
                      onClick={() => handleExtend(selectedBooking)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Extend Hold
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
                      onClick={() => handleSendPaymentLink(selectedBooking)}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {selectedBooking.paymentLink ? 'Copy Payment Link' : 'Send Payment Link'}
                    </Button>
                  </>
                )}
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => handleRelease(selectedBooking)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Release Hold
                </Button>
                <Button variant="secondary" className="w-full">
                  Open Full Booking
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t text-xs text-gray-500 mt-6">
              Created {format(selectedBooking.createdAt, 'dd MMM yyyy HH:mm')}
            </div>
          </div>
        </div>
      )}

      {/* Extend Dialog */}
      <Dialog open={extendDialog.open} onOpenChange={(open) => setExtendDialog({ open, booking: extendDialog.booking })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Hold</DialogTitle>
            <DialogDescription>
              Extend the hold for {extendDialog.booking?.customer.name}'s booking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => confirmExtend('2h')}>+2 hours</Button>
            <Button variant="outline" onClick={() => confirmExtend('6h')}>+6 hours</Button>
            <Button variant="outline" onClick={() => confirmExtend('24h')}>+24 hours</Button>
            <div className="col-span-2">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Custom hours"
                  value={customExtension}
                  onChange={(e) => setCustomExtension(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  onClick={() => confirmExtend('custom')}
                  disabled={!customExtension}
                >
                  Extend
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendDialog({ open: false, booking: null })}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Dialog */}
      <Dialog open={releaseDialog.open} onOpenChange={(open) => setReleaseDialog({ open, booking: releaseDialog.booking })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Hold</DialogTitle>
            <DialogDescription>
              This will release the hold and free up the slot. The customer will be notified.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason (optional)</label>
              <Select value={releaseReason} onValueChange={setReleaseReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expired">Hold expired</SelectItem>
                  <SelectItem value="customer_request">Customer request</SelectItem>
                  <SelectItem value="admin_decision">Admin decision</SelectItem>
                  <SelectItem value="booking_conflict">Booking conflict</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReleaseDialog({ open: false, booking: null })}>
              Cancel
            </Button>
            <Button 
              onClick={confirmRelease}
              className="bg-red-600 hover:bg-red-700"
            >
              Release Hold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}