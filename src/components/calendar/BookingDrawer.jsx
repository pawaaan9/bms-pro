import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, User, Clock, DollarSign, Edit, Send, Link as LinkIcon, AlertTriangle, X } from 'lucide-react';

const BookingDrawer = ({ event, isOpen, onClose }) => {
  if (!event || !isOpen) return null;

  const statusInfo = {
    CONFIRMED: { color: 'green', text: 'Confirmed' },
    TENTATIVE: { color: 'yellow', text: 'Tentative Hold' },
    BLOCKOUT: { color: 'gray', text: 'Block-out' },
  };

  const getBadgeColor = (status) => {
    switch(status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'TENTATIVE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 max-w-full transform bg-white shadow-xl transition-transform">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <div className="mt-1">
                <Badge className={getBadgeColor(event.status)}>{statusInfo[event.status]?.text}</Badge>
                {event.status === 'TENTATIVE' && (
                  <div className="mt-2 text-yellow-600 flex items-center gap-1 text-sm">
                    <AlertTriangle className="h-4 w-4"/>
                    Hold expires in {event.holdExpiresIn}
                  </div>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span>{format(event.start, 'eeee, d MMMM yyyy')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <span>{`${format(event.start, 'h:mm a')} – ${format(event.end, 'h:mm a')}`}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <span>{event.customer}</span>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-gray-500" />
                <span>Deposit {event.depositPaid ? 'Paid' : 'Pending'}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4">
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full">
                <Send className="mr-2 h-4 w-4"/>
                Send Pay Link
              </Button>
              <Button variant="outline" className="w-full">
                <Edit className="mr-2 h-4 w-4"/>
                Edit Booking
              </Button>
              <Button className="w-full">
                <LinkIcon className="mr-2 h-4 w-4"/>
                Open Full Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDrawer;