import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Send,
  FileText,
  Calendar,
  DollarSign,
  User,
  Building2,
  Receipt,
  ArrowUpDown,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2
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
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import QuotationForm from '@/components/quotations/QuotationForm';
import { 
  fetchQuotationsForCurrentUser, 
  updateQuotationStatus, 
  deleteQuotation, 
  downloadQuotationPDF, 
  exportQuotationsToCSV,
  formatQuotationForDisplay 
} from '@/services/quotationService';

// Mock data for quotations
const sampleQuotations = [
  {
    id: 'QUO-001',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    resource: 'Main Hall',
    eventType: 'Corporate Event',
    eventDate: new Date('2025-10-15'),
    totalAmount: 2500.00,
    status: 'Draft',
    createdDate: new Date('2025-01-15'),
    validUntil: new Date('2025-01-30'),
    items: [
      { name: 'Main Hall Rental', quantity: 1, rate: 2000.00, amount: 2000.00 },
      { name: 'AV Equipment', quantity: 1, rate: 300.00, amount: 300.00 },
      { name: 'Cleaning Fee', quantity: 1, rate: 200.00, amount: 200.00 }
    ]
  },
  {
    id: 'QUO-002',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@events.com',
    resource: 'Hall A',
    eventType: 'Wedding Reception',
    eventDate: new Date('2025-11-20'),
    totalAmount: 3500.00,
    status: 'Sent',
    createdDate: new Date('2025-01-14'),
    validUntil: new Date('2025-01-29'),
    items: [
      { name: 'Hall A Rental', quantity: 1, rate: 2500.00, amount: 2500.00 },
      { name: 'Catering Setup', quantity: 1, rate: 500.00, amount: 500.00 },
      { name: 'Decoration Package', quantity: 1, rate: 500.00, amount: 500.00 }
    ]
  },
  {
    id: 'QUO-003',
    customerName: 'Mike Chen',
    customerEmail: 'mike.chen@company.com',
    resource: 'Hall B',
    eventType: 'Conference',
    eventDate: new Date('2025-12-05'),
    totalAmount: 1800.00,
    status: 'Accepted',
    createdDate: new Date('2025-01-13'),
    validUntil: new Date('2025-01-28'),
    items: [
      { name: 'Hall B Rental', quantity: 1, rate: 1200.00, amount: 1200.00 },
      { name: 'Projector & Screen', quantity: 1, rate: 300.00, amount: 300.00 },
      { name: 'WiFi Access', quantity: 1, rate: 100.00, amount: 100.00 },
      { name: 'Coffee Break Setup', quantity: 1, rate: 200.00, amount: 200.00 }
    ]
  }
];

// Status badge component
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      Draft: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '📝' },
      Sent: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '📧' },
      Accepted: { color: 'bg-green-100 text-green-700 border-green-200', icon: '✅' },
      Declined: { color: 'bg-red-100 text-red-700 border-red-200', icon: '❌' },
      Expired: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏰' }
    };
    return configs[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '❓' };
  };

  const config = getStatusConfig(status);
  return (
    <Badge className={`${config.color} border text-xs font-medium px-2.5 py-1`}>
      <span className="mr-1.5">{config.icon}</span>
      {status}
    </Badge>
  );
};

// Quotation actions dropdown
const QuotationActions = ({ quotation, onAction }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Open quotation actions menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quotation Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onAction('preview', quotation.id)}>
          <Eye className="mr-2 h-4 w-4" />
          Preview Quotation
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onAction('download', quotation.id)}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </DropdownMenuItem>
        
        {quotation.status === 'Draft' && (
          <DropdownMenuItem onClick={() => onAction('send', quotation.id)}>
            <Send className="mr-2 h-4 w-4" />
            Send to Customer
          </DropdownMenuItem>
        )}
        
        {quotation.status === 'Sent' && (
          <>
            <DropdownMenuItem onClick={() => onAction('accept', quotation.id)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept & Create Booking
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('decline', quotation.id)}>
              <XCircle className="mr-2 h-4 w-4" />
              Decline Quotation
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuItem onClick={() => onAction('edit', quotation.id)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Quotation
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onAction('duplicate', quotation.id)}>
          <FileText className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onAction('delete', quotation.id)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function Quotations() {
  const { user, token } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState('All Resources');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showDetailPane, setShowDetailPane] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState(null);
  const [editingQuotation, setEditingQuotation] = useState(null);

  // Load quotations on component mount
  useEffect(() => {
    if (user && token) {
      loadQuotations();
    }
  }, [user, token]);

  const loadQuotations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const quotationsData = await fetchQuotationsForCurrentUser(token);
      const formattedQuotations = quotationsData.map(formatQuotationForDisplay);
      setQuotations(formattedQuotations);
    } catch (error) {
      console.error('Error loading quotations:', error);
      setError('Failed to load quotations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(quotations.map(q => q.id)));
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

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRowClick = (quotation) => {
    setSelectedQuotation(quotation);
    setShowDetailPane(true);
  };

  const handleAction = async (action, quotationId) => {
    const quotation = quotations.find(q => q.id === quotationId);
    
    switch (action) {
      case 'preview':
        setSelectedQuotation(quotation);
        setShowDetailPane(true);
        break;
      case 'send':
        try {
          await updateQuotationStatus(quotationId, 'Sent', token);
          setQuotations(prev => prev.map(q => 
            q.id === quotationId ? { ...q, status: 'Sent' } : q
          ));
        } catch (error) {
          console.error('Error sending quotation:', error);
          setError('Failed to send quotation. Please try again.');
        }
        break;
      case 'accept':
        try {
          await updateQuotationStatus(quotationId, 'Accepted', token);
          setQuotations(prev => prev.map(q => 
            q.id === quotationId ? { ...q, status: 'Accepted' } : q
          ));
          // Show success message about booking creation
          setError(null);
          setSuccessMessage('Quotation accepted successfully! A new confirmed booking has been created and added to your booking list. You can view it in the Bookings section.');
          // Clear success message after 5 seconds
          setTimeout(() => setSuccessMessage(null), 5000);
          console.log('Quotation accepted and converted to booking successfully!');
        } catch (error) {
          console.error('Error accepting quotation:', error);
          setError('Failed to accept quotation. Please try again.');
        }
        break;
      case 'decline':
        try {
          await updateQuotationStatus(quotationId, 'Declined', token);
          setQuotations(prev => prev.map(q => 
            q.id === quotationId ? { ...q, status: 'Declined' } : q
          ));
          // Show success message about decline
          setError(null);
          setSuccessMessage('Quotation declined successfully! The customer has been notified via email.');
          // Clear success message after 5 seconds
          setTimeout(() => setSuccessMessage(null), 5000);
          console.log('Quotation declined successfully!');
        } catch (error) {
          console.error('Error declining quotation:', error);
          setError('Failed to decline quotation. Please try again.');
        }
        break;
      case 'edit':
        setEditingQuotation(quotation);
        setShowCreateDialog(true);
        break;
      case 'duplicate':
        // Create a copy of the quotation for editing
        const duplicatedQuotation = {
          ...quotation,
          id: null,
          customerName: quotation.customerName,
          customerEmail: quotation.customerEmail,
          customerPhone: quotation.customerPhone,
          eventType: quotation.eventType,
          resource: quotation.resource,
          eventDate: quotation.eventDate,
          startTime: quotation.startTime,
          endTime: quotation.endTime,
          guestCount: quotation.guestCount,
          items: quotation.items,
          totalAmount: quotation.totalAmount,
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: quotation.notes
        };
        setEditingQuotation(duplicatedQuotation);
        setShowCreateDialog(true);
        break;
      case 'delete':
        setQuotationToDelete(quotation);
        setShowDeleteDialog(true);
        break;
      case 'download':
        try {
          await downloadQuotationPDF(quotationId, token);
        } catch (error) {
          console.error('Error downloading quotation PDF:', error);
          setError('Failed to download quotation PDF. Please try again.');
        }
        break;
    }
  };

  const confirmDelete = async () => {
    if (quotationToDelete) {
      try {
        await deleteQuotation(quotationToDelete.id, token);
        setQuotations(prev => prev.filter(q => q.id !== quotationToDelete.id));
        setQuotationToDelete(null);
        setShowDeleteDialog(false);
      } catch (error) {
        console.error('Error deleting quotation:', error);
        setError('Failed to delete quotation. Please try again.');
      }
    }
  };

  const handleSaveQuotation = async (quotationData) => {
    try {
      // This would call the create or update API
      // For now, we'll just close the dialog and reload
      setShowCreateDialog(false);
      setEditingQuotation(null);
      await loadQuotations();
    } catch (error) {
      console.error('Error saving quotation:', error);
      setError('Failed to save quotation. Please try again.');
    }
  };

  const handleSendQuotation = async (quotationData) => {
    try {
      // This would call the create and send API
      // For now, we'll just close the dialog and reload
      setShowCreateDialog(false);
      setEditingQuotation(null);
      await loadQuotations();
    } catch (error) {
      console.error('Error sending quotation:', error);
      setError('Failed to send quotation. Please try again.');
    }
  };

  const handleExportCSV = () => {
    try {
      exportQuotationsToCSV(filteredQuotations);
    } catch (error) {
      console.error('Error exporting quotations:', error);
      setError('Failed to export quotations. Please try again.');
    }
  };

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

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.eventType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesResource = selectedResource === 'All Resources' || quotation.resource === selectedResource;
    const matchesStatus = selectedStatus === 'All Statuses' || quotation.status === selectedStatus;
    return matchesSearch && matchesResource && matchesStatus;
  });

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
          <p className="mt-1 text-gray-500">
            Create, manage, and track quotation requests for potential bookings.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={selectedRows.size === 0}>
            <Send className="mr-2 h-4 w-4" />
            Bulk Send
          </Button>
          <Button variant="outline" onClick={handleExportCSV} disabled={filteredQuotations.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => {
            setEditingQuotation(null);
            setShowCreateDialog(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            New Quotation
          </Button>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-400 hover:text-green-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search quotations..."
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
            <Select value={selectedResource} onValueChange={setSelectedResource}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Resources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Resources">All Resources</SelectItem>
                <SelectItem value="Main Hall">Main Hall</SelectItem>
                <SelectItem value="Hall A">Hall A</SelectItem>
                <SelectItem value="Hall B">Hall B</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Statuses">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Declined">Declined</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
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
                      checked={selectedRows.size > 0 && selectedRows.size === quotations.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all quotations"
                    />
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('id')} className="p-0 h-auto font-semibold">
                      Quotation {getSortIcon('id')}
                    </Button>
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('eventDate')} className="p-0 h-auto font-semibold">
                      Event Date {getSortIcon('eventDate')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('totalAmount')} className="p-0 h-auto font-semibold">
                      Amount {getSortIcon('totalAmount')}
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('validUntil')} className="p-0 h-auto font-semibold">
                      Valid Until {getSortIcon('validUntil')}
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        <p className="text-gray-500">Loading quotations...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredQuotations.length > 0 ? (
                  filteredQuotations.map((quotation) => (
                    <TableRow
                      key={quotation.id}
                      data-state={selectedRows.has(quotation.id) ? 'selected' : ''}
                      className="cursor-pointer"
                      onClick={() => handleRowClick(quotation)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.has(quotation.id)}
                          onCheckedChange={(checked) => handleSelectRow(quotation.id, checked)}
                          aria-label={`Select quotation ${quotation.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{quotation.id}</div>
                        <div className="text-sm text-gray-500">{quotation.eventType}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{quotation.customerName}</div>
                        <div className="text-sm text-gray-500">{quotation.customerEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{quotation.resource}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{format(quotation.eventDate, 'dd MMM yyyy')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="font-mono font-semibold">
                            ${quotation.totalAmount.toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={quotation.status} />
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(quotation.validUntil, 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <QuotationActions quotation={quotation} onAction={handleAction} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No quotations found.</p>
                        <Button variant="outline" size="sm" onClick={() => setShowCreateDialog(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Quotation
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
      {showDetailPane && selectedQuotation && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDetailPane(false)} />
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Quotation Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDetailPane(false)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg">{selectedQuotation.eventType}</h3>
                <p className="text-gray-600">for {selectedQuotation.customerName}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quotation ID:</span>
                  <span className="font-medium">{selectedQuotation.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resource:</span>
                  <span>{selectedQuotation.resource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Event Date:</span>
                  <span>{format(selectedQuotation.eventDate, 'dd MMM yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-mono font-semibold">
                    ${selectedQuotation.totalAmount.toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valid Until:</span>
                  <span>{format(selectedQuotation.validUntil, 'dd MMM yyyy')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Line Items:</h4>
                <div className="space-y-2">
                  {selectedQuotation.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="font-mono">${item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {selectedQuotation.status === 'Sent' && (
                  <>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleAction('accept', selectedQuotation.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept & Create Booking
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handleAction('decline', selectedQuotation.id)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Decline Quotation
                    </Button>
                  </>
                )}
                {selectedQuotation.status === 'Draft' && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleAction('send', selectedQuotation.id)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send to Customer
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleAction('edit', selectedQuotation.id)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Quotation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Quotation Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Quotation</DialogTitle>
            <DialogDescription>
              Create a new quotation for a potential booking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input id="customer-name" placeholder="Enter customer name" />
            </div>
            <div>
              <Label htmlFor="customer-email">Customer Email</Label>
              <Input id="customer-email" type="email" placeholder="Enter customer email" />
            </div>
            <div>
              <Label htmlFor="event-type">Event Type</Label>
              <Input id="event-type" placeholder="Enter event type" />
            </div>
            <div>
              <Label htmlFor="resource">Resource</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main-hall">Main Hall</SelectItem>
                  <SelectItem value="hall-a">Hall A</SelectItem>
                  <SelectItem value="hall-b">Hall B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="event-date">Event Date</Label>
              <Input id="event-date" type="date" />
            </div>
            <div>
              <Label htmlFor="amount">Total Amount (AUD)</Label>
              <Input id="amount" type="number" step="0.01" placeholder="0.00" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateDialog(false)}>
              Create Quotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quotation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete quotation {quotationToDelete?.id}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quotation Form Dialog */}
      <QuotationForm
        isOpen={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setEditingQuotation(null);
        }}
        quotation={editingQuotation}
        onSave={handleSaveQuotation}
        onSend={handleSendQuotation}
        isLoading={isLoading}
      />
    </main>
  );
}
