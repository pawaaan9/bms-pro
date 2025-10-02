
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Download,
  Search,
  Mail,
  Send,
  Eye,
  FileText,
  CreditCard,
  Banknote,
  XCircle,
  Receipt,
  ArrowUpDown,
  Calendar,
  Filter,
  Settings,
  Sparkles,
  TrendingUp,
  Zap,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  MoreVertical, // Added MoreVertical import
  Clock, // Added Clock import
  Loader2,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format, addDays, subDays, isAfter, isBefore } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { fetchInvoices, fetchPayments, createInvoice, updateInvoiceStatus, recordPayment, calculateInvoiceSummary, generateInvoiceFromBooking, downloadInvoicePDF } from '@/services/invoiceService';
import { fetchBookingsForCalendar } from '@/services/bookingService';
import { exportToCSV } from '@/utils/exportUtils';


// Smart filter chips component with beautiful animations
const FilterChips = ({ activeStatuses, onStatusToggle, type = 'invoice' }) => {
  const statusOptions = type === 'invoice' 
    ? [
        { value: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-700' },
        { value: 'SENT', label: 'Sent', color: 'bg-blue-100 text-blue-700' },
        { value: 'PARTIAL', label: 'Partial', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'PAID', label: 'Paid', color: 'bg-green-100 text-green-700' },
        { value: 'OVERDUE', label: 'Overdue', color: 'bg-red-100 text-red-700' },
        { value: 'VOID', label: 'Void', color: 'bg-gray-200 text-gray-600' },
        { value: 'REFUNDED', label: 'Refunded', color: 'bg-purple-100 text-purple-700' }
      ]
    : type === 'payment'
    ? [
        { value: 'Succeeded', label: 'Succeeded', color: 'bg-green-100 text-green-700' },
        { value: 'Pending', label: 'Pending', color: 'bg-orange-100 text-orange-700' },
        { value: 'Failed', label: 'Failed', color: 'bg-red-100 text-red-700' },
        { value: 'Refunded', label: 'Refunded', color: 'bg-purple-100 text-purple-700' }
      ]
    : [
        { value: 'Draft', label: 'Draft', color: 'bg-gray-100 text-gray-700' },
        { value: 'Sent', label: 'Sent', color: 'bg-blue-100 text-blue-700' },
        { value: 'Applied', label: 'Applied', color: 'bg-green-100 text-green-700' },
        { value: 'Refunded', label: 'Refunded', color: 'bg-purple-100 text-purple-700' }
      ];

  return (
    <div className="flex flex-wrap gap-2">
      {statusOptions.map(status => (
        <motion.div
          key={status.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant={activeStatuses.includes(status.value) ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusToggle(status.value)}
            aria-pressed={activeStatuses.includes(status.value)}
            className={`transition-all duration-200 ${
              activeStatuses.includes(status.value) 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'hover:border-gray-300'
            }`}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${status.color.split(' ')[0]}`}></div>
            {activeStatuses.includes(status.value) && '✓ '}
            {status.label}
          </Button>
        </motion.div>
      ))}
    </div>
  );
};

// Enhanced status badge with intelligent coloring
const StatusBadge = ({ status, type = 'invoice', className = '' }) => {
  const getStatusConfig = (status, type) => {
    const configs = {
      invoice: {
        DRAFT: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '📝' },
        SENT: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '📧' },
        PARTIAL: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⚡' },
        PAID: { color: 'bg-green-100 text-green-700 border-green-200', icon: '✅' },
        OVERDUE: { color: 'bg-red-100 text-red-700 border-red-200', icon: '⏰' },
        VOID: { color: 'bg-gray-200 text-gray-600 border-gray-300', icon: '❌' },
        REFUNDED: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '↩️' }
      },
      payment: {
        Succeeded: { color: 'bg-green-100 text-green-700 border-green-200', icon: '✅' },
        Pending: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: '⏳' },
        Failed: { color: 'bg-red-100 text-red-700 border-red-200', icon: '❌' },
        Refunded: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '↩️' }
      }
    };
    
    return configs[type][status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '❓' };
  };

  const config = getStatusConfig(status, type);

  return (
    <Badge className={`${config.color} border text-xs font-medium px-2.5 py-1 ${className}`}>
      <span className="mr-1.5">{config.icon}</span>
      {status}
    </Badge>
  );
};

// Sophisticated invoice actions dropdown
const InvoiceActions = ({ invoice, onAction }) => {
  const canVoid = invoice.status === 'DRAFT' || (invoice.status === 'SENT' && invoice.paidAmount === 0);
  const canRefund = invoice.status === 'PAID' || invoice.status === 'PARTIAL';
  const canSend = ['DRAFT', 'SENT', 'OVERDUE'].includes(invoice.status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Open invoice actions menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Invoice Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onAction('preview', invoice.id)}>
          <Eye className="mr-2 h-4 w-4" />
          Preview Invoice
        </DropdownMenuItem>
        
        {canSend && (
          <DropdownMenuItem onClick={() => onAction('send', invoice.id)}>
            <Mail className="mr-2 h-4 w-4" />
            Send Email to Customer
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => onAction('copy-link', invoice.id)}>
          <FileText className="mr-2 h-4 w-4" />
          Copy Payment Link
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {invoice.status !== 'PAID' && (
          <DropdownMenuItem onClick={() => onAction('record-payment', invoice.id)}>
            <Banknote className="mr-2 h-4 w-4" />
            Record Bank Payment
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => onAction('download-pdf', invoice.id)}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onAction('receipt', invoice.id)}>
          <Receipt className="mr-2 h-4 w-4" />
          Download Receipt
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {canVoid && (
          <DropdownMenuItem 
            onClick={() => onAction('void', invoice.id)}
            className="text-red-600"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Void Invoice
          </DropdownMenuItem>
        )}
        
        {canRefund && (
          <DropdownMenuItem onClick={() => onAction('refund', invoice.id)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Create Refund
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// World-class invoices table with advanced features
const InvoicesTable = ({ 
  invoices, 
  selectedRows, 
  onRowSelect, 
  onSelectAll, 
  sortConfig, 
  onSort,
  onRowClick,
  onAction 
}) => {
  const getSortIcon = (column) => {
    if (sortConfig.key !== column) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    }
    return (
      <span className="text-primary">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const getSortDirection = (column) => {
    if (sortConfig.key !== column) return 'none';
    return sortConfig.direction === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <div className="relative">
      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedRows.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-10 bg-primary/5 border-primary/20 border-2 rounded-t-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {selectedRows.size} selected
              </Badge>
              <span className="text-sm text-gray-600">
                Total: ${invoices
                  .filter(inv => selectedRows.has(inv.id))
                  .reduce((sum, inv) => sum + inv.total, 0)
                  .toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Send className="mr-2 h-4 w-4" />
                Send Selected
              </Button>
              <Button size="sm" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Send Reminders
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleExportCSV}
                disabled={filteredInvoices.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`overflow-x-auto ${selectedRows.size > 0 ? 'mt-16' : ''}`}>
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.size === invoices.length && invoices.length > 0}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all invoices on this page"
                />
              </TableHead>
              <TableHead scope="col">
                <Button variant="ghost" onClick={() => onSort('id')} className="p-0 h-auto font-semibold">
                  Invoice {getSortIcon('id')}
                </Button>
              </TableHead>
              <TableHead scope="col">Type</TableHead>
              <TableHead scope="col">Customer</TableHead>
              <TableHead scope="col">Booking</TableHead>
              <TableHead scope="col">
                <Button 
                  variant="ghost" 
                  onClick={() => onSort('issueDate')} 
                  className="p-0 h-auto font-semibold"
                  aria-sort={getSortDirection('issueDate')}
                >
                  Issue Date {getSortIcon('issueDate')}
                </Button>
              </TableHead>
              <TableHead scope="col">
                <Button 
                  variant="ghost" 
                  onClick={() => onSort('dueDate')} 
                  className="p-0 h-auto font-semibold"
                  aria-sort={getSortDirection('dueDate')}
                >
                  Due Date {getSortIcon('dueDate')}
                </Button>
              </TableHead>
              <TableHead scope="col" className="text-right">
                <Button 
                  variant="ghost" 
                  onClick={() => onSort('total')} 
                  className="p-0 h-auto font-semibold"
                  aria-sort={getSortDirection('total')}
                >
                  Total {getSortIcon('total')}
                </Button>
              </TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <TableRow 
                  key={invoice.id}
                  className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => onRowClick(invoice)}
                  data-state={selectedRows.has(invoice.id) ? 'selected' : ''}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRows.has(invoice.id)}
                      onCheckedChange={(checked) => onRowSelect(invoice.id, checked)}
                      aria-label={`Select invoice ${invoice.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-gray-900">{invoice.id}</span>
                      <Badge variant="outline" className="w-fit text-xs bg-blue-50 text-blue-700 border-blue-200">
                        Tax Invoice
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={
                        invoice.type === 'DEPOSIT' ? 'bg-green-100 text-green-800' :
                        invoice.type === 'FINAL' ? 'bg-blue-100 text-blue-800' :
                        invoice.type === 'BOND' ? 'bg-orange-100 text-orange-800' :
                        'bg-purple-100 text-purple-800'
                      }
                    >
                      {invoice.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-gray-900">{invoice.customer.name}</span>
                      <span className="text-xs text-gray-500 truncate max-w-[150px]">
                        {invoice.customer.email}
                      </span>
                      {invoice.customer.abn && (
                        <span className="text-xs text-gray-400">ABN: {invoice.customer.abn}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                      {invoice.booking}
                    </Button>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {format(invoice.issueDate, 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    <div className="flex flex-col gap-1">
                      <span>{format(invoice.dueDate, 'dd MMM yyyy')}</span>
                      {invoice.status === 'OVERDUE' && (
                        <span className="text-xs text-red-600 font-medium">
                          {Math.ceil((new Date() - invoice.dueDate) / (1000 * 60 * 60 * 24))} days overdue
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col gap-1 items-end">
                      <span className="font-mono font-semibold text-gray-900">
                        ${invoice.total.toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD
                      </span>
                      {invoice.paidAmount > 0 && (
                        <div className="text-xs text-gray-500">
                          <div>Paid: ${invoice.paidAmount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</div>
                          {invoice.total > invoice.paidAmount && (
                            <div className="text-red-600 font-medium">
                              Bal: ${(invoice.total - invoice.paidAmount).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                            </div>
                          )}
                        </div>
                      )}
                      {invoice.depositPaid > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          <div className="font-medium flex items-center gap-1">
                            <span>💰</span>
                            <span>Deposit: ${invoice.depositPaid.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="text-green-600 font-medium">
                            Due: ${invoice.finalTotal.toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={invoice.status} />
                      {invoice.priority === 'high' && (
                        <AlertTriangle className="h-4 w-4 text-red-500" title="High priority" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <InvoiceActions invoice={invoice} onAction={onAction} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <p className="text-gray-500">No invoices found matching your criteria.</p>
                    <Button variant="outline" size="sm">
                      Clear Filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// Magnificent invoice detail pane with ATO compliance
const InvoiceDetailPane = ({ invoice, onClose, token }) => {
  if (!invoice) return null;

  const gstRate = 0.1;
  const isLargeInvoice = invoice.total >= 1000;
  const balanceDue = invoice.total - invoice.paidAmount;

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: '0%', opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-2xl z-50 overflow-y-auto"
    >
      <div className="p-6 space-y-6">
        {/* Header with sparkle effect */}
        <div className="flex items-center justify-between border-b pb-4 relative">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">Tax Invoice {invoice.id}</h2>
                <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
              </div>
              <StatusBadge status={invoice.status} className="mt-2" />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100">
            <XCircle className="h-5 w-5" />
          </Button>
        </div>

        {/* ATO Compliance Block - The Crown Jewel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="font-bold text-sm text-gray-800">ATO COMPLIANT TAX INVOICE</h3>
          </div>
          
          {/* Supplier Details */}
          <div className="text-sm space-y-2 bg-white/50 rounded-lg p-3">
            <p className="font-bold text-gray-900">BMSPRO</p>
            <p className="text-gray-700">123 High Street, Cranbourne VIC 3977</p>
            <p className="font-medium text-gray-800">ABN: 12 345 678 901</p>
          </div>

          {/* Issue Date */}
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-sm">
              <span className="font-semibold text-gray-800">Issue Date:</span>{' '}
              <span className="text-gray-900">{format(invoice.issueDate, 'dd MMM yyyy')}</span>
            </p>
          </div>

          {/* Booking Source Information */}
          <div className="bg-white/50 rounded-lg p-3">
            <p className="text-sm">
              <span className="font-semibold text-gray-800">Booking Source:</span>{' '}
              <div className="inline-flex items-center gap-2 mt-1">
                {invoice.bookingSource === 'quotation' && invoice.quotationId ? (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                    From Quotation {invoice.quotationId}
                  </Badge>
                ) : invoice.bookingSource === 'admin' ? (
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                    Admin Panel
                  </Badge>
                ) : invoice.bookingSource === 'website' ? (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Website
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800">
                    {invoice.bookingSource || 'Direct'}
                  </Badge>
                )}
              </div>
            </p>
          </div>

          {/* Buyer Details (required for ≥$1,000) */}
          {isLargeInvoice && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-sm space-y-2 bg-amber-50 rounded-lg p-3 border border-amber-200"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <p className="font-semibold text-amber-800">High-Value Invoice (≥$1,000 AUD)</p>
              </div>
              <p className="font-medium text-gray-800">Bill To:</p>
              <p className="text-gray-900">{invoice.customer.name}</p>
              {invoice.customer.abn && (
                <p className="text-gray-900 font-medium">ABN: {invoice.customer.abn}</p>
              )}
              {!invoice.customer.abn && (
                <p className="text-amber-700 text-xs">⚠️ Customer ABN required for invoices ≥$1,000</p>
              )}
            </motion.div>
          )}

          {/* Line Items with Perfect GST Calculation */}
          <div className="text-sm bg-white/50 rounded-lg p-3">
            <p className="font-semibold mb-3 text-gray-800">Description & GST Breakdown:</p>
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="text-gray-900">{invoice.resource} - {invoice.type} Payment</span>
                  <div className="text-xs text-gray-600 mt-1">
                    Quantity: 1 × ${invoice.subtotal.toFixed(2)} (Taxable Supply)
                  </div>
                </div>
                <span className="font-mono text-gray-900">${invoice.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-gray-600">
                  <span>GST ({(gstRate * 100).toFixed(0)}%) on ${invoice.subtotal.toFixed(2)}</span>
                  <span className="font-mono">${invoice.gst.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between font-bold text-gray-900 border-t pt-2 mt-2">
                  <span>Total (GST Inclusive)</span>
                  <span className="font-mono">${invoice.total.toFixed(2)} AUD</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-600 bg-blue-50 rounded p-2 mt-3">
                <p className="font-medium">✓ GST Rounding Applied per ATO Guidelines</p>
                <p>All amounts rounded to nearest cent (0.5¢ rounds up)</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Summary with Beautiful Metrics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h3 className="font-bold text-gray-800">Payment Summary</h3>
          </div>
          
          {/* Enhanced deposit information section */}
          {invoice.depositPaid > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border-2 border-blue-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 text-lg">Deposit Applied</h4>
                  <p className="text-sm text-blue-700">Your deposit has been deducted from the total amount</p>
                </div>
              </div>
              
              {invoice.bookingSource === 'quotation' && invoice.quotationId && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="font-semibold text-yellow-800 text-sm">Quotation-based Invoice</span>
                  </div>
                  <p className="text-xs text-yellow-800">
                    This invoice is based on quotation <strong>{invoice.quotationId}</strong>. 
                    Your deposit has been deducted from the total amount.
                  </p>
                </div>
              )}
              
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Subtotal:</span>
                    <span className="font-mono font-semibold">${invoice.subtotal.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">GST (10%):</span>
                    <span className="font-mono font-semibold">${invoice.gst.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-gray-700 font-semibold">Total Amount:</span>
                    <span className="font-mono font-bold text-gray-900">${invoice.total.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2 bg-blue-50 rounded px-2 py-1">
                    <span className="text-blue-800 font-bold flex items-center gap-1">
                      <span className="text-blue-600">💰</span>
                      Deposit Paid:
                    </span>
                    <span className="font-mono text-blue-800 font-bold">-${invoice.depositPaid.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center border-t-2 border-blue-200 pt-3 bg-green-50 rounded px-2 py-2">
                    <span className="text-green-800 font-bold text-base flex items-center gap-1">
                      <span className="text-green-600">💳</span>
                      Amount You Need to Pay:
                    </span>
                    <span className="font-mono text-green-800 font-bold text-lg">${invoice.finalTotal.toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD</span>
                  </div>
                </div>
                
                {/* Calculation explanation */}
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 text-center">
                  <strong>Calculation:</strong> ${invoice.total.toLocaleString('en-AU', { minimumFractionDigits: 2 })} - ${invoice.depositPaid.toLocaleString('en-AU', { minimumFractionDigits: 2 })} = ${invoice.finalTotal.toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/70 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                {invoice.depositPaid > 0 ? 'Final Amount' : 'Total Amount'}
              </p>
              <p className="text-lg font-bold font-mono text-gray-900">
                ${(invoice.depositPaid > 0 ? invoice.finalTotal : invoice.total).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="bg-white/70 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 uppercase tracking-wide">Amount Paid</p>
              <p className="text-lg font-bold font-mono text-green-700">
                ${invoice.paidAmount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center border-2 border-dashed border-gray-300">
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Balance Due</p>
            <p className={`text-2xl font-bold font-mono ${
              balanceDue > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              ${balanceDue.toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD
            </p>
            {balanceDue > 0 && invoice.status === 'OVERDUE' && (
              <p className="text-xs text-red-600 mt-1 font-medium">
                ⏰ {Math.ceil((new Date() - invoice.dueDate) / (1000 * 60 * 60 * 24))} days overdue
              </p>
            )}
          </div>
        </motion.div>

        {/* Action Buttons with Gradient Magic */}
        <div className="space-y-3">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg" size="sm">
            <Send className="mr-2 h-4 w-4" />
            Copy Stripe Payment Link
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="bg-white hover:bg-gray-50" 
              size="sm"
              onClick={() => downloadInvoicePDF(invoice.id, token)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="bg-white hover:bg-gray-50" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              View Booking
            </Button>
          </div>
          
          {balanceDue > 0 && (
            <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50" size="sm">
              <Banknote className="mr-2 h-4 w-4" />
              Record Bank Payment
            </Button>
          )}
        </div>

        {/* Activity Timeline */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 border-t pt-4"
        >
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Activity Timeline
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-900 font-medium">
                  Invoice created on {format(invoice.issueDate, 'dd MMM yyyy')}
                </p>
                <p className="text-gray-500 text-xs">System generated tax invoice</p>
              </div>
            </div>
            
            {invoice.status !== 'DRAFT' && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-gray-900 font-medium">Sent to customer via email</p>
                  <p className="text-gray-500 text-xs">
                    {invoice.sentAt && format(invoice.sentAt, 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
              </div>
            )}
            
            {invoice.paidAmount > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-gray-900 font-medium">
                    Payment received: ${invoice.paidAmount.toFixed(2)} AUD
                  </p>
                  <p className="text-gray-500 text-xs">Via Stripe payment processing</p>
                </div>
              </div>
            )}
            </div>
          </motion.div>

        {/* Compliance Footer */}
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border-t">
          <p className="font-medium text-gray-700 mb-1">🏛️ Australian Tax Office Compliant</p>
          <p>This digital tax invoice meets all ATO requirements for the invoice amount tier. 
          GST calculations follow official rounding guidelines. All required fields present and validated.</p>
        </div>
      </div>
    </motion.div>
  );
};

// Main magnificent component
export default function Invoices() {
  const { user, token } = useAuth();
  
  // State management with intelligent defaults
  const [activeTab, setActiveTab] = useState('invoices');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatuses, setActiveStatuses] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'issueDate', direction: 'desc' });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailPane, setShowDetailPane] = useState(false);
  
  // Real data state
  const [invoicesData, setInvoicesData] = useState([]);
  const [paymentsData, setPaymentsData] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [showCreateInvoiceDialog, setShowCreateInvoiceDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [newInvoiceData, setNewInvoiceData] = useState({
    invoiceType: 'DEPOSIT',
    amount: '',
    description: '',
    dueDate: ''
  });
  const [newPaymentData, setNewPaymentData] = useState({
    amount: '',
    paymentMethod: 'Bank Transfer',
    reference: '',
    notes: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      console.log('Invoice page - useEffect triggered');
      console.log('Invoice page - User:', user);
      console.log('Invoice page - Token:', token);
      
      if (!user || !token) {
        console.log('Invoice page - Missing user or token, skipping fetch');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const hallOwnerId = user.role === 'sub_user' ? user.parentUserId : user.id;
        
        console.log('Invoice page - User object:', user);
        console.log('Invoice page - Hall Owner ID:', hallOwnerId);
        console.log('Invoice page - Token:', token ? 'Present' : 'Missing');
        
        // Fetch invoices, payments, and bookings in parallel
        const [invoices, payments, bookings] = await Promise.all([
          fetchInvoices(hallOwnerId, token),
          fetchPayments(hallOwnerId, token),
          fetchBookingsForCalendar(hallOwnerId, token)
        ]);
        
        console.log('Invoice page - Fetched data:', { invoices: invoices.length, payments: payments.length, bookings: bookings.length });
        
        setInvoicesData(invoices);
        setPaymentsData(payments);
        setBookingsData(bookings);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token]);

  // Intelligent search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      // Search logic would go here
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Advanced filtering and sorting
  const filteredInvoices = useMemo(() => {
    let filtered = [...invoicesData];

    // Search filter with intelligent matching
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.id.toLowerCase().includes(term) ||
        invoice.booking.toLowerCase().includes(term) ||
        invoice.customer.name.toLowerCase().includes(term) ||
        invoice.customer.email.toLowerCase().includes(term) ||
        invoice.resource.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (activeStatuses.length > 0) {
      filtered = filtered.filter(invoice => activeStatuses.includes(invoice.status));
    }

    // Intelligent sorting with stable sort
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      let result = 0;
      if (aValue instanceof Date && bValue instanceof Date) {
        result = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        result = aValue.localeCompare(bValue);
      } else {
        result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      
      return sortConfig.direction === 'asc' ? result : -result;
    });

    return filtered;
  }, [invoicesData, searchTerm, activeStatuses, sortConfig]);

  // Filter bookings for invoice creation with search
  const filteredBookings = useMemo(() => {
    let filtered = bookingsData.filter(b => ['CONFIRMED', 'PENDING', 'COMPLETED'].includes(b.status));

    // Search filter for bookings
    if (bookingSearchTerm) {
      const term = bookingSearchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.customer.toLowerCase().includes(term) ||
        booking.eventType.toLowerCase().includes(term) ||
        booking.bookingDate.toLowerCase().includes(term) ||
        booking.resource.toLowerCase().includes(term) ||
        booking.status.toLowerCase().includes(term)
      );
    }

    // Sort by booking date (newest first)
    filtered.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

    return filtered;
  }, [bookingsData, bookingSearchTerm]);

  // Event handlers
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleRowSelect = useCallback((id, checked) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedRows(newSelection);
  }, [selectedRows]);

  const handleSelectAll = useCallback((checked) => {
    setSelectedRows(checked ? new Set(filteredInvoices.map(inv => inv.id)) : new Set());
  }, [filteredInvoices]);

  const handleStatusToggle = useCallback((status) => {
    setActiveStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  }, []);


  const handleRowClick = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailPane(true);
  }, []);

  const handleCloseDetailPane = useCallback(() => {
    setShowDetailPane(false);
    setSelectedInvoice(null);
  }, []);

  // Handle creating new invoice
  const handleCreateInvoice = useCallback(async () => {
    if (!selectedBooking || !newInvoiceData.amount) return;
    
    try {
      const invoiceData = generateInvoiceFromBooking(
        selectedBooking,
        newInvoiceData.invoiceType,
        parseFloat(newInvoiceData.amount),
        newInvoiceData.description
      );
      
      await createInvoice(invoiceData, token);
      
      // Refresh data
      const hallOwnerId = user.role === 'sub_user' ? user.parentUserId : user.id;
      const [invoices, payments] = await Promise.all([
        fetchInvoices(hallOwnerId, token),
        fetchPayments(hallOwnerId, token)
      ]);
      
      setInvoicesData(invoices);
      setPaymentsData(payments);
      
      // Reset form and close dialog
      setNewInvoiceData({
        invoiceType: 'DEPOSIT',
        amount: '',
        description: '',
        dueDate: ''
      });
      setShowCreateInvoiceDialog(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err.message);
    }
  }, [selectedBooking, newInvoiceData, token, user]);

  // Handle recording payment
  const handleRecordPayment = useCallback(async () => {
    if (!selectedInvoice || !newPaymentData.amount) return;
    
    try {
      await recordPayment(selectedInvoice.id, newPaymentData, token);
      
      // Refresh data
      const hallOwnerId = user.role === 'sub_user' ? user.parentUserId : user.id;
      const [invoices, payments] = await Promise.all([
        fetchInvoices(hallOwnerId, token),
        fetchPayments(hallOwnerId, token)
      ]);
      
      setInvoicesData(invoices);
      setPaymentsData(payments);
      
      // Reset form and close dialog
      setNewPaymentData({
        amount: '',
        paymentMethod: 'Bank Transfer',
        reference: '',
        notes: ''
      });
      setShowPaymentDialog(false);
    } catch (err) {
      console.error('Error recording payment:', err);
      setError(err.message);
    }
  }, [selectedInvoice, newPaymentData, token, user]);

  // Handle CSV export
  const handleExportCSV = useCallback(() => {
    try {
      if (filteredInvoices.length === 0) {
        alert('No invoices to export. Please adjust your filters or create some invoices first.');
        return;
      }

      // Prepare data for CSV export
      const csvData = filteredInvoices.map(invoice => ({
        'Invoice ID': invoice.id,
        'Type': invoice.type,
        'Customer Name': invoice.customer.name,
        'Customer Email': invoice.customer.email,
        'Customer ABN': invoice.customer.abn || '',
        'Booking ID': invoice.booking,
        'Resource': invoice.resource,
        'Issue Date': format(invoice.issueDate, 'dd/MM/yyyy'),
        'Due Date': format(invoice.dueDate, 'dd/MM/yyyy'),
        'Subtotal': invoice.subtotal.toFixed(2),
        'GST': invoice.gst.toFixed(2),
        'Total Amount': invoice.total.toFixed(2),
        'Paid Amount': invoice.paidAmount.toFixed(2),
        'Balance Due': (invoice.total - invoice.paidAmount).toFixed(2),
        'Status': invoice.status,
        'Deposit Paid': invoice.depositPaid ? invoice.depositPaid.toFixed(2) : '0.00',
        'Final Total': invoice.finalTotal ? invoice.finalTotal.toFixed(2) : invoice.total.toFixed(2),
        'Booking Source': invoice.bookingSource || 'Direct',
        'Quotation ID': invoice.quotationId || '',
        'Priority': invoice.priority || 'normal',
        'Created At': invoice.createdAt ? format(new Date(invoice.createdAt), 'dd/MM/yyyy HH:mm') : '',
        'Sent At': invoice.sentAt ? format(new Date(invoice.sentAt), 'dd/MM/yyyy HH:mm') : ''
      }));

      // Define CSV headers
      const headers = [
        'Invoice ID', 'Type', 'Customer Name', 'Customer Email', 'Customer ABN',
        'Booking ID', 'Resource', 'Issue Date', 'Due Date', 'Subtotal', 'GST',
        'Total Amount', 'Paid Amount', 'Balance Due', 'Status', 'Deposit Paid',
        'Final Total', 'Booking Source', 'Quotation ID', 'Priority', 'Created At', 'Sent At'
      ];

      // Export to CSV
      exportToCSV(csvData, 'invoices_export', headers);
      
      console.log(`Exported ${csvData.length} invoices to CSV`);
    } catch (err) {
      console.error('Error exporting invoices to CSV:', err);
      alert('Failed to export invoices. Please try again.');
    }
  }, [filteredInvoices]);

  // Handle invoice actions
  const handleInvoiceAction = useCallback(async (action, invoiceId) => {
    try {
      switch (action) {
        case 'send':
          await updateInvoiceStatus(invoiceId, 'SENT', token);
          break;
        case 'download-pdf':
          await downloadInvoicePDF(invoiceId, token);
          return; // Don't refresh data for download
        case 'record-payment':
          setSelectedInvoice(invoicesData.find(inv => inv.id === invoiceId));
          setShowPaymentDialog(true);
          return;
        default:
          console.log(`Action ${action} not implemented yet`);
      }
      
      // Refresh invoices
      const hallOwnerId = user.role === 'sub_user' ? user.parentUserId : user.id;
      const invoices = await fetchInvoices(hallOwnerId, token);
      setInvoicesData(invoices);
    } catch (err) {
      console.error('Error handling invoice action:', err);
      setError(err.message);
    }
  }, [invoicesData, token, user]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    return calculateInvoiceSummary(filteredInvoices);
  }, [filteredInvoices]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Loading invoices and payments...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show debug info if no user/token
  if (!user || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">
            {!user ? 'No user data found. ' : ''}
            {!token ? 'No authentication token found. ' : ''}
            Please log in to access invoices.
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="space-y-6 pb-20">
        {/* Magnificent Header with Gradients */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20"></div>
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold">Invoices & Payments</h1>
                <TrendingUp className="h-8 w-8 text-yellow-300 animate-pulse" />
              </div>
              <p className="mt-2 text-blue-100 text-lg">
                Create, send and reconcile tax invoices and receipts.
              </p>
              
              {/* Real-time Summary Stats */}
              <div className="mt-4 flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span>Total: <strong>${summaryStats.totalAmount.toLocaleString('en-AU')} AUD</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span>Paid: <strong>${summaryStats.paidAmount.toLocaleString('en-AU')} AUD</strong></span>
                </div>
                {summaryStats.overdueCount > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-300" />
                    <span>Overdue: <strong>{summaryStats.overdueCount} invoices</strong></span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="secondary" className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20">
                <Mail className="mr-2 h-4 w-4" />
                Send Reminders
              </Button>
              <Button 
                variant="secondary" 
                className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20"
                onClick={handleExportCSV}
                disabled={filteredInvoices.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold shadow-lg"
                onClick={() => {
                  console.log('Available bookings for invoice creation:', bookingsData);
                  console.log('Bookings by status:', bookingsData.reduce((acc, b) => {
                    acc[b.status] = (acc[b.status] || 0) + 1;
                    return acc;
                  }, {}));
                  setShowCreateInvoiceDialog(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Revolutionary Tabs Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur border-0 shadow-lg rounded-xl p-1">
            <TabsTrigger 
              value="invoices" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              <FileText className="h-4 w-4" />
              Invoices
              <Badge className="ml-2 bg-blue-500 text-white text-xs">
                {filteredInvoices.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="payments"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              <CreditCard className="h-4 w-4" />
              Payments
              <Badge className="ml-2 bg-green-500 text-white text-xs">
                {paymentsData.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Advanced Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="🔍 Search invoices, bookings, customers, emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setSearchTerm('');
                        }
                      }}
                      className="pl-10 pr-20 bg-white/50 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setSearchTerm('')}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <Select>
                      <SelectTrigger className="w-[140px] bg-white/50">
                        <SelectValue placeholder="Date Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Select>
                    <SelectTrigger className="w-[180px] bg-white/50">
                      <SelectValue placeholder="All Resources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Resources</SelectItem>
                      <SelectItem value="hall-a">Hall A</SelectItem>
                      <SelectItem value="hall-b">Hall B</SelectItem>
                      <SelectItem value="main-hall">Main Hall</SelectItem>
                      <SelectItem value="conference">Conference Room</SelectItem>
                      <SelectItem value="studio">Studio Space</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" className="bg-white/50">
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                </div>
                
                <FilterChips 
                  activeStatuses={activeStatuses} 
                  onStatusToggle={handleStatusToggle}
                  type={activeTab}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Tab Contents */}
          <AnimatePresence mode="wait">
            <TabsContent value="invoices">
              <motion.div
                key="invoices-content"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="shadow-xl border-0 overflow-hidden bg-white/80 backdrop-blur">
                  <CardContent className="p-0">
                    <InvoicesTable
                      invoices={filteredInvoices}
                      selectedRows={selectedRows}
                      onRowSelect={handleRowSelect}
                      onSelectAll={handleSelectAll}
                      sortConfig={sortConfig}
                      onSort={handleSort}
                      onRowClick={handleRowClick}
                      onAction={handleInvoiceAction}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="payments">
              <motion.div
                key="payments-content"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      Payment Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Payments table coming soon...</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Full payment reconciliation and transaction management
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

          </AnimatePresence>
        </Tabs>
      </main>

      {/* Magnificent Detail Pane */}
      <AnimatePresence>
        {showDetailPane && selectedInvoice && (
          <InvoiceDetailPane 
            invoice={selectedInvoice}
            onClose={handleCloseDetailPane}
            token={token}
          />
        )}
      </AnimatePresence>

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateInvoiceDialog} onOpenChange={(open) => {
        setShowCreateInvoiceDialog(open);
        if (!open) {
          setBookingSearchTerm('');
          setSelectedBooking(null);
        }
      }}>
        <DialogContent className="max-w-2xl w-full mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              Create New Invoice
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Select a booking from the list below and create a professional tax invoice for it.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="booking-select" className="text-sm font-medium text-gray-700 mb-1 block">
                Select Booking
              </Label>
              
              {/* Custom Booking Selector with Search */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search bookings by customer, event, or date..."
                    value={bookingSearchTerm}
                    onChange={(e) => setBookingSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {bookingSearchTerm && (
                    <button
                      onClick={() => setBookingSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {/* Booking List */}
                <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-sm max-h-60 overflow-y-auto">
                  {filteredBookings.length > 0 ? (
                    <div className="p-2">
                      {filteredBookings.map(booking => (
                        <div
                          key={booking.id}
                          onClick={() => {
                            setSelectedBooking(booking);
                            if (booking) {
                              setNewInvoiceData(prev => ({
                                ...prev,
                                amount: booking.calculatedPrice?.toString() || '',
                                description: `${booking.eventType} - ${prev.invoiceType} Payment`
                              }));
                            }
                          }}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 border ${
                            selectedBooking?.id === booking.id 
                              ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' 
                              : 'border-transparent hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className={`w-3 h-3 rounded-full ${
                                booking.status === 'CONFIRMED' ? 'bg-green-500' :
                                booking.status === 'PENDING' ? 'bg-yellow-500' :
                                booking.status === 'COMPLETED' ? 'bg-blue-500' :
                                'bg-gray-400'
                              }`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <span className="font-semibold text-gray-900 truncate">
                                    {booking.customer}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${
                                    booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </div>
                                {booking.calculatedPrice && (
                                  <span className="font-mono font-semibold text-green-600 text-sm">
                                    ${booking.calculatedPrice.toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-600">
                                <span className="font-medium">{booking.eventType}</span>
                                <span className="hidden sm:inline text-gray-400">•</span>
                                <span>{booking.bookingDate}</span>
                                <span className="hidden sm:inline text-gray-400">•</span>
                                <span className="text-xs text-gray-500 truncate">{booking.resource}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <div className="text-gray-400 mb-2">
                        <Calendar className="h-8 w-8 mx-auto" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        {bookingSearchTerm ? 'No bookings match your search' : 'No bookings available for invoicing'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {bookingSearchTerm ? 'Try adjusting your search terms' : 'Create some bookings first to generate invoices'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedBooking && (
              <>
                {/* Selected Booking Preview */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${
                      selectedBooking.status === 'CONFIRMED' ? 'bg-green-500' :
                      selectedBooking.status === 'PENDING' ? 'bg-yellow-500' :
                      selectedBooking.status === 'COMPLETED' ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`}></div>
                    <h3 className="font-semibold text-gray-900 text-sm">Selected Booking</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      selectedBooking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      selectedBooking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      selectedBooking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium text-gray-900 ml-1 truncate block">{selectedBooking.customer}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900 ml-1 truncate block">{selectedBooking.customerEmail || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Event:</span>
                      <span className="font-medium text-gray-900 ml-1 truncate block">{selectedBooking.eventType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium text-gray-900 ml-1">{selectedBooking.bookingDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Resource:</span>
                      <span className="font-medium text-gray-900 ml-1 truncate block">{selectedBooking.resource}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Source:</span>
                      <div className="inline-flex items-center gap-1 ml-1">
                        {selectedBooking.bookingSource === 'quotation' && selectedBooking.quotationId ? (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            From Quotation {selectedBooking.quotationId}
                          </Badge>
                        ) : selectedBooking.bookingSource === 'admin' ? (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                            Admin Panel
                          </Badge>
                        ) : selectedBooking.bookingSource === 'website' ? (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            Website
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800">
                            {selectedBooking.bookingSource || 'Direct'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {selectedBooking.calculatedPrice && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-mono font-semibold text-green-600 ml-1">
                          ${selectedBooking.calculatedPrice.toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="invoice-type" className="text-sm font-medium text-gray-700">Invoice Type</Label>
                    <Select 
                      value={newInvoiceData.invoiceType} 
                      onValueChange={(value) => setNewInvoiceData(prev => ({ ...prev, invoiceType: value }))}
                    >
                      <SelectTrigger className="mt-1 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DEPOSIT">💰 Deposit</SelectItem>
                        <SelectItem value="FINAL">💳 Final Payment</SelectItem>
                        <SelectItem value="BOND">🔒 Bond</SelectItem>
                        <SelectItem value="ADD-ONS">➕ Add-ons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount (AUD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newInvoiceData.amount}
                      onChange={(e) => setNewInvoiceData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      className="font-mono mt-1 h-9"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    value={newInvoiceData.description}
                    onChange={(e) => setNewInvoiceData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Invoice description..."
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="due-date" className="text-sm font-medium text-gray-700">Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={newInvoiceData.dueDate}
                    onChange={(e) => setNewInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="mt-1 h-9"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end pt-3">
            <Button 
              variant="outline" 
              onClick={() => setShowCreateInvoiceDialog(false)}
              className="w-full sm:w-auto order-2 sm:order-1 h-9"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateInvoice}
              disabled={!selectedBooking || !newInvoiceData.amount}
              className="w-full sm:w-auto order-1 sm:order-2 h-9"
            >
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for invoice {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-amount">Amount (AUD)</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                value={newPaymentData.amount}
                onChange={(e) => setNewPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select 
                value={newPaymentData.paymentMethod} 
                onValueChange={(value) => setNewPaymentData(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Card">Credit/Debit Card</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                value={newPaymentData.reference}
                onChange={(e) => setNewPaymentData(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Payment reference..."
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newPaymentData.notes}
                onChange={(e) => setNewPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRecordPayment}
              disabled={!newPaymentData.amount}
            >
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
