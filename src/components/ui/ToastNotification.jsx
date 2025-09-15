import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

const ToastNotification = ({ 
  isVisible, 
  onClose, 
  type = 'success', 
  title, 
  message, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { 
          icon: CheckCircle, 
          color: 'text-green-600', 
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'error':
        return { 
          icon: XCircle, 
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="fixed top-4 right-4 z-50 max-w-sm w-full"
      >
        <div className={`${bgColor} ${borderColor} border rounded-lg shadow-lg p-4`}>
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="ml-3 w-0 flex-1">
              {title && (
                <p className="text-sm font-medium text-gray-900">{title}</p>
              )}
              {message && (
                <p className={`text-sm ${title ? 'mt-1' : ''} text-gray-600`}>
                  {message}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ToastNotification;
