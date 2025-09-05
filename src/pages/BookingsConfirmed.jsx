import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Download,
  Search,
  Printer,
  Mail,
  CheckCircle,
  XCircle,
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
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Realistic sample data
const sampleConfirmedBookings = [
  {
    id: 'BKG-3100',
    customer: { name: 'Acme Corp', email: 'events@acme.com' },
    resource: 'Main Hall',
    start: new Date('2025-09-10T09:00:00'),
    end: new Date('2025-09-10T17:00:00'),
    balance: 1250.00,
    deposit: 'Paid',
    bond: 500.00,
    docs: { id: true, insurance: false },
    addOns: 3,
    guests: 150,
  },
  {
    id: 'BKG-3101',
    customer: { name: 'Sarah Pereira', email: 's.pereira@gmail.com' },
    resource: 'Hall A',
    start: new Date('2025-09-12T18:00:00'),
    end: new Date('2025-09-12T23:00:00'),
    balance: 0,
    deposit: 'Paid',
    bond: 250.00,
    docs: { id: true, insurance: true },
    addOns: 1,
    guests: 60,
  },
  {
    id: 'BKG-3102',
    customer: { name: 'Bright Futures NGO', email: 'contact@brightfutures.org' },
    resource: 'Hall B',
    start: new Date('2025-09-15T10:00:00'),
    end: new Date('2025-09-15T16:00:00'),
    balance: 0,
    deposit: 'Paid',
    bond: 0,
    docs: { id: true, insurance: true },
    addOns: 0,
    guests: 40,
  },
  {
    id: 'BKG-3103',
    customer: { name: 'David Chen', email: 'd.chen.weddings@email.com' },
    resource: 'Main Hall',
    start: new Date('2025-10-04T14:00:00'),
    end: new Date('2025-10-04T23:30:00'),
    balance: 2500.00,
    deposit: 'Paid',
    bond: 1000.00,
    docs: { id: false, insurance: true },
    addOns: 5,
    guests: 200,
  },
];


// --- Sub-components (would be in separate files in a real app) ---

const FilterChips = ({ activeFilters, onFilterToggle }) => {
  const chips = [
    { key: 'balanceDue', label: 'Balance due' },
    { key: 'bondRequired', label: 'Bond required' },
    { key: 'docsMissing', label: 'Docs missing' },
    { key: 'withAddOns', label: 'With add-ons' },
    { key: 'publicHoliday', label: 'Public holiday' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map(chip => (
        <Button
          key={chip.key}
          variant={activeFilters[chip.key] ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterToggle(chip.key)}
          aria-pressed={activeFilters[chip.key]}
          className="transition-all"
        >
          {chip.label}
        </Button>
      ))}
    </div>
  );
};

const DocStatus = ({ docs }) => (
  <div className="flex items-center gap-2">
    <span title={docs.id ? 'ID Verified' : 'ID Missing'}>
      {docs.id ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
    </span>
    <span title={docs.insurance ? 'Insurance Verified' : 'Insurance Missing'}>
      {docs.insurance ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
    </span>
  </div>
);


export default function BookingsConfirmed() {
  const [bookings, setBookings] = useState(sampleConfirmedBookings);
  const [filteredBookings, setFilteredBookings] = useState(sampleConfirmedBookings);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'start', direction: 'ascending' });
  const [activeFilters, setActiveFilters] = useState({
    balanceDue: false,
    bondRequired: false,
    docsMissing: false,
    withAddOns: false,
    publicHoliday: false,
  });

  const handleFilterToggle = (filterKey) => {
    setActiveFilters(prev => ({ ...prev, [filterKey]: !prev[filterKey] }));
  };
  
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  useEffect(() => {
    let processedBookings = [...bookings];

    // Apply quick filters
    if (activeFilters.balanceDue) {
      processedBookings = processedBookings.filter(b => b.balance > 0);
    }
    if (activeFilters.bondRequired) {
      processedBookings = processedBookings.filter(b => b.bond > 0);
    }
    if (activeFilters.docsMissing) {
      processedBookings = processedBookings.filter(b => !b.docs.id || !b.docs.insurance);
    }
    if (activeFilters.withAddOns) {
        processedBookings = processedBookings.filter(b => b.addOns > 0);
    }

    // Apply search term
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      processedBookings = processedBookings.filter(b =>
        b.id.toLowerCase().includes(lowercasedTerm) ||
        b.customer.name.toLowerCase().includes(lowercasedTerm) ||
        b.customer.email.toLowerCase().includes(lowercasedTerm)
      );
    }

    // Apply sorting
    processedBookings.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setFilteredBookings(processedBookings);
  }, [searchTerm, activeFilters, sortConfig, bookings]);

  const handleSelectAll = (checked) => {
    setSelectedRows(checked ? new Set(filteredBookings.map(b => b.id)) : new Set());
  };

  const handleSelectRow = (id) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };
  
  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings — Confirmed</h1>
          <p className="mt-1 text-gray-500">
            Manage confirmed events, documents, balances and run sheets.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print run sheets</Button>
          <Button variant="outline"><Mail className="mr-2 h-4 w-4" />Send reminders</Button>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          <Button><Plus className="mr-2 h-4 w-4" />New Booking</Button>
        </div>
      </header>

      {/* Filters Bar */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by ID, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Date pickers would go here */}
            <FilterChips activeFilters={activeFilters} onFilterToggle={handleFilterToggle} />
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
                  <TableHead className="w-12 px-4">
                    <Checkbox
                      checked={selectedRows.size > 0 && selectedRows.size === filteredBookings.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all bookings on this page"
                    />
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => handleSort('resource')}>Booking</Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('customer')}>Customer</Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('start')}>Start</Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('end')}>End</Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => handleSort('balance')}>Balance</Button>
                  </TableHead>
                  <TableHead>Deposit</TableHead>
                  <TableHead className="text-right">Bond</TableHead>
                  <TableHead>Docs</TableHead>
                  <TableHead className="text-right">Add-ons</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id} data-state={selectedRows.has(booking.id) ? 'selected' : ''}>
                    <TableCell className="px-4">
                       <Checkbox
                        checked={selectedRows.has(booking.id)}
                        onCheckedChange={() => handleSelectRow(booking.id)}
                        aria-label={`Select booking ${booking.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{`${booking.resource} - ${booking.customer.name.split(' ')[0]} (${booking.guests})`}</TableCell>
                    <TableCell>
                      <div>{booking.customer.name}</div>
                      <div className="text-sm text-muted-foreground">{booking.customer.email}</div>
                    </TableCell>
                    <TableCell>{format(booking.start, 'dd MMM yyyy, HH:mm')}</TableCell>
                    <TableCell>{format(booking.end, 'dd MMM yyyy, HH:mm')}</TableCell>
                    <TableCell className="text-right font-mono">${booking.balance.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={booking.deposit === 'Paid' ? 'secondary' : 'destructive'}>
                        {booking.deposit}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{booking.bond > 0 ? `$${booking.bond.toFixed(2)}` : '—'}</TableCell>
                    <TableCell>
                      <DocStatus docs={booking.docs} />
                    </TableCell>
                    <TableCell className="text-right">{booking.addOns}</TableCell>
                    <TableCell>
                      {/* Row actions would go here */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}