import React from 'react';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import {
  X,
  Calendar,
  Clock,
  Users,
  DollarSign,
  User,
  Hash,
  Info,
  CheckCircle,
  Edit,
  Send,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const DetailRow = ({ icon: Icon, label, value, children }) => (
  <div className="flex items-start gap-4 py-3">
    <Icon className="h-5 w-5 mt-1 text-gray-500 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      {value && <p className="text-base text-gray-900">{value}</p>}
      {children}
    </div>
  </div>
);

const PaymentStatus = ({ label, amount, status }) => {
  const statusMap = {
    paid: { text: 'Paid', color: 'bg-green-100 text-green-800' },
    pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    overdue: { text: 'Overdue', color: 'bg-red-100 text-red-800' },
  };
  const currentStatus = statusMap[status] || { text: 'N/A', color: 'bg-gray-100 text-gray-800' };

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium">${amount.toLocaleString('en-AU')}</span>
        <Badge variant="outline" className={currentStatus.color}>{currentStatus.text}</Badge>
      </div>
    </div>
  );
};

const BookingDetailPaneAdvanced = ({ booking, onClose }) => {
  const paneVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: '0%', opacity: 1 },
  };

  return (
    <motion.div
      variants={paneVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-96 bg-white border-l shadow-2xl z-20 flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Booking Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close detail pane">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header Info */}
        <div>
          <h3 className="text-xl font-bold">{booking.purpose}</h3>
          <p className="text-sm text-gray-500">for {booking.customer.name}</p>
        </div>

        {/* Key Details */}
        <div className="divide-y border rounded-lg">
          <DetailRow icon={Hash} label="Booking ID" value={booking.id} />
          <DetailRow icon={Calendar} label="Date & Time">
            <p>{format(booking.start, 'eeee, dd MMMM yyyy')}</p>
            <p className="text-sm text-gray-600">{format(booking.start, 'HH:mm')} - {format(booking.end, 'HH:mm')}</p>
          </DetailRow>
          <DetailRow icon={Users} label="Guests" value={booking.guests} />
          <DetailRow icon={User} label="Assigned To" value={booking.assignedTo} />
        </div>

        {/* Customer Intelligence */}
        <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold mb-3 text-gray-800">Customer Snapshot</h4>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Tier:</span>
                    <Badge variant="secondary" className="capitalize">{booking.customer.tier}</Badge>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Total Bookings:</span>
                    <span>{booking.customer.bookingHistory}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Lifetime Value:</span>
                    <span className="font-medium">${booking.customer.totalSpent.toLocaleString('en-AU')}</span>
                </div>
            </div>
        </div>

        {/* Financials */}
        <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2"><DollarSign className="h-4 w-4" />Financials</h4>
            <div className="space-y-2">
                {/* Show deposit information if available */}
                {booking.depositType && booking.depositType !== 'None' && booking.depositAmount > 0 ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Deposit ({booking.depositType}):</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${booking.depositAmount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
                        <Badge variant="outline" className="bg-green-100 text-green-800">Paid</Badge>
                      </div>
                    </div>
                    {booking.depositType === 'Percentage' && (
                      <div className="text-xs text-gray-500 ml-4">
                        {booking.depositValue}% of ${booking.totalValue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                      </div>
                    )}
                    <PaymentStatus label="Balance" amount={booking.totalValue - booking.depositAmount} status={booking.balance > booking.depositAmount ? "pending" : "paid"} />
                  </>
                ) : (
                  <>
                    <PaymentStatus label="Deposit" amount={booking.totalValue * 0.5} status="paid" />
                    <PaymentStatus label="Balance" amount={booking.balance} status={booking.balance > 0 ? "pending" : "paid"} />
                  </>
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-base">
                    <span>Total Value:</span>
                    <span>${booking.totalValue.toLocaleString('en-AU')}</span>
                </div>
                
                {/* Show source information if from quotation */}
                {booking.quotationId && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Source:</span>
                      <span>From Quotation {booking.quotationId}</span>
                    </div>
                  </div>
                )}
            </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {booking.status === 'PENDING_REVIEW' && (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700">Decline</Button>
              <Button className="bg-green-600 hover:bg-green-700">Accept Booking</Button>
            </div>
          )}
          <Button className="w-full">
            <Send className="mr-2 h-4 w-4" /> Send Payment Link
          </Button>
           <Button variant="outline" className="w-full">
            <FileText className="mr-2 h-4 w-4" /> View Invoice
          </Button>
          <Button variant="secondary" className="w-full">
            <Edit className="mr-2 h-4 w-4" /> Edit Booking
          </Button>
        </div>
      </div>

      <div className="p-4 border-t text-xs text-gray-500">
        Created {formatDistanceToNow(booking.createdAt, { addSuffix: true })}
      </div>
    </motion.div>
  );
};

export default BookingDetailPaneAdvanced;