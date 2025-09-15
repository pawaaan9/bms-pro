import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Calendar, Clock, User, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "confirm", // 'confirm', 'cancel', 'warning'
  bookingDetails = null 
}) => {
  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'confirm':
        return { 
          icon: CheckCircle, 
          color: 'text-green-600', 
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'cancel':
        return { 
          icon: X, 
          color: 'text-red-600', 
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'warning':
        return { 
          icon: AlertTriangle, 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      default:
        return { 
          icon: CheckCircle, 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
    }
  };

  const { icon: Icon, color, bgColor, borderColor } = getIconAndColor();

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-0">
              {/* Compact Header */}
              <div className={`${bgColor} ${borderColor} border-b px-4 py-3 rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-full ${bgColor} ${borderColor} border`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-7 w-7 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Compact Content */}
              <div className="px-4 py-4">
                <p className="text-gray-700 mb-4 text-sm">{message}</p>
                
                {/* Compact Booking Details - Grid Layout */}
                {bookingDetails && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Customer & Event */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{bookingDetails.customerName}</p>
                            <p className="text-xs text-gray-600">{bookingDetails.purpose}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <p className="text-sm text-gray-700">
                            {formatDate(bookingDetails.start)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Time & Value */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <p className="text-sm text-gray-700">
                            {formatTime(bookingDetails.start)} - {formatTime(bookingDetails.end)}
                          </p>
                        </div>
                        
                        {bookingDetails.totalValue && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <p className="text-sm font-medium text-gray-900">
                              ${bookingDetails.totalValue.toLocaleString('en-AU')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="px-4 py-2 text-sm"
                  >
                    {cancelText}
                  </Button>
                  <Button
                    onClick={onConfirm}
                    className={`px-4 py-2 text-sm ${
                      type === 'confirm' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : type === 'cancel'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    {confirmText}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
