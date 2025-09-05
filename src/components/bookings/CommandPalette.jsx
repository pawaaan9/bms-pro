import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Calendar,
  Users,
  Building2,
  Filter,
  Zap,
  Command,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';

const CommandItem = ({ item, isSelected, onClick }) => {
  return (
    <motion.div
      className={`flex items-center gap-3 p-3 cursor-pointer rounded-lg transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className={`p-2 rounded-md ${item.color || 'bg-gray-100'}`}>
        <item.icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{item.title}</div>
        <div className="text-sm text-gray-500">{item.subtitle}</div>
      </div>
      {item.badge && (
        <Badge variant="secondary" className="text-xs">
          {item.badge}
        </Badge>
      )}
      <ArrowRight className="h-4 w-4 text-gray-400" />
    </motion.div>
  );
};

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  bookings, 
  onSelectBooking, 
  onApplyFilter 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Generate command items based on search
  const getCommandItems = () => {
    const items = [];
    
    // Quick actions
    if (!searchTerm || 'new booking'.includes(searchTerm.toLowerCase())) {
      items.push({
        id: 'new-booking',
        title: 'New Booking',
        subtitle: 'Create a new booking',
        icon: Calendar,
        color: 'bg-blue-500',
        action: () => console.log('New booking'),
      });
    }

    // Quick filters
    const quickFilters = [
      { id: 'today', label: "Today's Bookings", filter: { quickFilter: 'today' } },
      { id: 'pending', label: 'Pending Review', filter: { statuses: ['PENDING_REVIEW'] } },
      { id: 'confirmed', label: 'Confirmed Bookings', filter: { statuses: ['CONFIRMED'] } },
      { id: 'high-value', label: 'High Value Bookings', filter: { quickFilter: 'highValue' } },
    ];

    quickFilters.forEach(qf => {
      if (!searchTerm || qf.label.toLowerCase().includes(searchTerm.toLowerCase())) {
        items.push({
          id: qf.id,
          title: qf.label,
          subtitle: 'Apply quick filter',
          icon: Filter,
          color: 'bg-purple-500',
          action: () => onApplyFilter(qf.filter),
        });
      }
    });

    // Search bookings
    if (searchTerm.length >= 2) {
      const matchingBookings = bookings
        .filter(booking => 
          booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.purpose.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 8); // Limit results

      matchingBookings.forEach(booking => {
        items.push({
          id: booking.id,
          title: `${booking.id} - ${booking.customer.name}`,
          subtitle: `${booking.resource} • ${format(booking.start, 'dd MMM yyyy')}`,
          icon: Users,
          color: 'bg-green-500',
          badge: booking.status,
          action: () => onSelectBooking(booking),
        });
      });
    }

    return items;
  };

  const commandItems = getCommandItems();

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, commandItems.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (commandItems[selectedIndex]) {
            commandItems[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, commandItems, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          ref={containerRef}
          className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl border overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", duration: 0.3 }}
        >
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                ref={inputRef}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search bookings, customers, or type a command..."
                className="pl-10 pr-4 text-lg border-0 focus:ring-0 bg-transparent"
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto p-2">
            {commandItems.length > 0 ? (
              <div className="space-y-1">
                {commandItems.map((item, index) => (
                  <CommandItem
                    key={item.id}
                    item={item}
                    isSelected={index === selectedIndex}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                  />
                ))}
              </div>
            ) : searchTerm.length >= 2 ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No results found for "{searchTerm}"</p>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Command className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium mb-2">Quick Commands</p>
                <div className="text-sm space-y-1">
                  <div>Type to search bookings and customers</div>
                  <div>Use ↑↓ to navigate, ⏎ to select</div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>⏎ Select</span>
              <span>Esc Close</span>
            </div>
            <div className="flex items-center gap-1">
              <Command className="h-3 w-3" />
              <span>Command Palette</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}