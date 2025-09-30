import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ArrowUpDown,
  MoreVertical,
  CheckCircle,
  XCircle,
  Link,
  Eye,
  Edit,
  Send,
  AlertTriangle,
  Clock,
  Star,
  Users,
  Check,
  X,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const StatusBadge = ({ status }) => {
  const statusMap = {
    // Backend statuses (lowercase)
    pending: { color: 'orange', icon: <Clock className="h-3 w-3" />, text: 'Pending' },
    confirmed: { color: 'green', icon: <CheckCircle className="h-3 w-3" />, text: 'Confirmed' },
    completed: { color: 'blue', icon: <Star className="h-3 w-3" />, text: 'Completed' },
    cancelled: { color: 'red', icon: <XCircle className="h-3 w-3" />, text: 'Cancelled' },
    // Legacy uppercase versions (for backward compatibility)
    PENDING_REVIEW: { color: 'orange', icon: <Clock className="h-3 w-3" />, text: 'Pending Review' },
    TENTATIVE: { color: 'yellow', icon: <AlertTriangle className="h-3 w-3" />, text: 'Tentative' },
    CONFIRMED: { color: 'green', icon: <CheckCircle className="h-3 w-3" />, text: 'Confirmed' },
    COMPLETED: { color: 'blue', icon: <Star className="h-3 w-3" />, text: 'Completed' },
    CANCELLED: { color: 'red', icon: <XCircle className="h-3 w-3" />, text: 'Cancelled' },
  };

  const { color, icon, text } = statusMap[status] || { color: 'gray', icon: <Users className="h-3 w-3" />, text: 'Unknown' };

  const baseClasses = "flex items-center gap-1.5 capitalize text-xs font-medium px-2.5 py-1 rounded-full border";
  const colorClasses = {
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    yellow: "bg-yellow-50 text-yellow-800 border-yellow-200",
    green: "bg-green-50 text-green-700 border-green-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <Badge variant="outline" className={`${baseClasses} ${colorClasses[color]}`}>
      {icon}
      <span>{text}</span>
    </Badge>
  );
};

const BookingsTableAdvanced = React.forwardRef(({
  bookings,
  selectedRows,
  onSelectedRowsChange,
  sortConfig,
  onSortChange,
  onRowClick,
  onBulkAction,
  onConfirmOrder,
  onCancelOrder
}, ref) => {

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectedRowsChange(new Set(bookings.map(b => b.id)));
    } else {
      onSelectedRowsChange(new Set());
    }
  };

  const handleSelectRow = (id, checked) => {
    const newSelectedRows = new Set(selectedRows);
    if (checked) {
      newSelectedRows.add(id);
    } else {
      newSelectedRows.delete(id);
    }
    onSelectedRowsChange(newSelectedRows);
  };
  
  const requestSort = (column) => {
    let direction = 'asc';
    if (sortConfig.column === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    onSortChange({ column, direction });
  };

  const getSortIcon = (column) => {
    if (sortConfig.column !== column) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };
  
  const headers = [
    { key: 'customer', label: 'Customer' },
    { key: 'resource', label: 'Resource' },
    { key: 'source', label: 'Source' },
    { key: 'start', label: 'Event Start' },
    { key: 'status', label: 'Status' },
    { key: 'value', label: 'Value' },
    { key: 'balance', label: 'Balance' },
    { key: 'actions', label: 'Actions' },
  ];

  return (
    <div className="relative overflow-auto" ref={ref}>
       {/* Bulk Actions Header */}
        <AnimatePresence>
            {selectedRows.size > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-0 left-0 right-0 z-10 bg-blue-50 p-3 flex items-center justify-between shadow-md"
                >
                    <span className="text-sm font-medium text-blue-800">{selectedRows.size} selected</span>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onBulkAction('accept')}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => onBulkAction('decline')}>Decline</Button>
                        <Button size="sm" variant="outline" onClick={() => onBulkAction('send-link')}>Send Pay Link</Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        
      <Table className="min-w-full">
        <TableHeader className="sticky top-0 bg-gray-50 z-10">
          <TableRow>
            <TableHead className="w-12 px-4">
              <Checkbox
                checked={selectedRows.size > 0 && selectedRows.size === bookings.length}
                onCheckedChange={handleSelectAll}
                aria-label="Select all rows"
              />
            </TableHead>
            {headers.map(header => (
                <TableHead key={header.key}>
                    <Button variant="ghost" onClick={() => requestSort(header.key)} className="px-2 py-1 h-auto">
                        {header.label}
                        <span className="ml-2">{getSortIcon(header.key)}</span>
                    </Button>
                </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <TableRow
                key={booking.id}
                data-state={selectedRows.has(booking.id) ? 'selected' : ''}
                className="cursor-pointer"
                onClick={() => onRowClick(booking)}
              >
                <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedRows.has(booking.id)}
                    onCheckedChange={(checked) => handleSelectRow(booking.id, checked)}
                    aria-label={`Select row ${booking.id}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900">{booking.customer.name}</div>
                  <div className="text-sm text-gray-500">{booking.purpose}</div>
                </TableCell>
                <TableCell>{booking.resource}</TableCell>
                <TableCell>
                  {booking.bookingSource === 'quotation' && booking.quotationId ? (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      Quotation
                    </Badge>
                  ) : booking.bookingSource === 'admin' ? (
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                      Admin
                    </Badge>
                  ) : booking.bookingSource === 'website' ? (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      Website
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800">
                      {booking.bookingSource || 'Direct'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                    <div>{format(booking.start, 'dd MMM yyyy')}</div>
                    <div className="text-xs text-gray-500">{format(booking.start, 'HH:mm')} - {format(booking.end, 'HH:mm')}</div>
                </TableCell>
                <TableCell>
                    <StatusBadge status={booking.status} />
                </TableCell>
                <TableCell className="text-right">
                    ${booking.totalValue.toLocaleString('en-AU')}
                </TableCell>
                 <TableCell className="text-right">
                    <span className={booking.balance > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        ${booking.balance.toLocaleString('en-AU')}
                    </span>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onRowClick(booking)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            {booking.status === 'pending' && (
                                <>
                                    <DropdownMenuItem 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onConfirmOrder(booking.id);
                                        }}
                                        className="text-green-600 focus:text-green-600"
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Confirm Order
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCancelOrder(booking.id);
                                        }}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel Order
                                    </DropdownMenuItem>
                                </>
                            )}
                            <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                             <DropdownMenuItem>
                                <Send className="mr-2 h-4 w-4" />
                                Send Pay Link
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={headers.length + 1} className="h-24 text-center">
                No bookings found. Try adjusting your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
});

export default BookingsTableAdvanced;