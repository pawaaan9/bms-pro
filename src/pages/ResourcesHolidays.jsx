import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Download,
  Upload,
  Search,
  RefreshCw,
  Calendar,
  Settings,
  Archive,
  Copy,
  Edit,
  Eye,
  ArrowUpDown,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
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
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sample Data (Seed based on Victoria 2025) ---
const sampleHolidays = [
  {
    id: 'vic-2025-01-27',
    name: 'Australia Day (Observed)',
    date: new Date('2025-01-27'),
    scope: 'Statewide',
    pricingRule: 'PH-Std',
    blockOut: true,
    notes: 'Date observed on Monday.',
    provenance: 'Official',
    sourceUrl: 'https://business.vic.gov.au/business-information/public-holidays/victorian-public-holidays-2025',
    restrictedTrading: false,
  },
  {
    id: 'vic-2025-03-10',
    name: 'Labour Day',
    date: new Date('2025-03-10'),
    scope: 'Statewide',
    pricingRule: 'PH-Std',
    blockOut: false,
    notes: '',
    provenance: 'Official',
    restrictedTrading: false,
  },
  {
    id: 'vic-2025-04-18',
    name: 'Good Friday',
    date: new Date('2025-04-18'),
    scope: 'Statewide',
    pricingRule: 'PH-Religious',
    blockOut: true,
    notes: 'Restricted trading day. Only exempt businesses may open.',
    provenance: 'Official',
    restrictedTrading: true,
  },
  {
    id: 'vic-2025-04-25',
    name: 'ANZAC Day',
    date: new Date('2025-04-25'),
    scope: 'Statewide',
    pricingRule: 'PH-Std',
    blockOut: true,
    notes: 'Restricted trading day until 1pm.',
    provenance: 'Official',
    restrictedTrading: true,
  },
  {
    id: 'vic-2025-09-26',
    name: 'Friday before the AFL Grand Final',
    date: new Date('2025-09-26'),
    scope: 'Statewide',
    pricingRule: 'PH-AFL',
    blockOut: false,
    notes: 'Date is subject to change based on AFL schedule.',
    provenance: 'Official',
    restrictedTrading: false,
  },
  {
    id: 'vic-2025-11-04',
    name: 'Melbourne Cup Day',
    date: new Date('2025-11-04'),
    scope: 'Statewide',
    pricingRule: 'PH-Std',
    blockOut: false,
    notes: 'Councils may substitute a local holiday.',
    provenance: 'Official',
    restrictedTrading: false,
  },
  {
    id: 'local-2025-11-04',
    name: 'Cranbourne Community Show Day',
    date: new Date('2025-11-04'),
    scope: 'Local',
    pricingRule: 'PH-Local',
    blockOut: true,
    notes: 'Local council holiday for Cranbourne area.',
    provenance: 'Manual',
    substitutes: 'vic-2025-11-04',
  },
];

// --- Subcomponents ---

// Filter Chips
const FilterChips = ({ filters, onFilterChange }) => {
  const toggleFilter = (key, value) => {
    const currentValues = filters[key] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange({ ...filters, [key]: newValues });
  };

  const scopeChips = ['Statewide', 'Local', 'Custom'];
  const impactChips = ['Surcharge', 'Block-out', 'Restricted'];

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Scope:</Label>
        {scopeChips.map(scope => (
          <Button
            key={scope}
            variant={filters.scopes?.includes(scope) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleFilter('scopes', scope)}
            aria-pressed={filters.scopes?.includes(scope)}
          >
            {scope}
          </Button>
        ))}
      </div>
      <Separator orientation="vertical" className="h-8" />
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Impact:</Label>
        {impactChips.map(impact => (
          <Button
            key={impact}
            variant={filters.impacts?.includes(impact) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleFilter('impacts', impact)}
            aria-pressed={filters.impacts?.includes(impact)}
          >
            {impact}
          </Button>
        ))}
      </div>
    </div>
  );
};


// Main Component
export default function ResourcesHolidays() {
  const [holidays, setHolidays] = useState(sampleHolidays);
  const [filteredHolidays, setFilteredHolidays] = useState(holidays);
  const [year, setYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ scopes: [], impacts: [] });
  const [sortConfig, setSortConfig] = useState({ column: 'date', direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);

  // Memoized filtering and sorting logic
  useEffect(() => {
    let processed = [...holidays];

    // Year filter
    processed = processed.filter(h => new Date(h.date).getFullYear() === year);

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      processed = processed.filter(h => h.name.toLowerCase().includes(term));
    }
    
    // Chip filters
    if (filters.scopes.length > 0) {
      processed = processed.filter(h => filters.scopes.includes(h.scope));
    }
    if (filters.impacts.length > 0) {
      processed = processed.filter(h => 
        (filters.impacts.includes('Surcharge') && h.pricingRule) ||
        (filters.impacts.includes('Block-out') && h.blockOut) ||
        (filters.impacts.includes('Restricted') && h.restrictedTrading)
      );
    }
    
    // Sorting
    if (sortConfig.column) {
      processed.sort((a, b) => {
        let aVal = a[sortConfig.column];
        let bVal = b[sortConfig.column];

        if (sortConfig.column === 'date') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredHolidays(processed);
  }, [holidays, year, searchTerm, filters, sortConfig]);

  const handleSort = (column) => {
    let direction = 'asc';
    if (sortConfig.column === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ column, direction });
  };
  
  const getSortIcon = (column) => {
    if (sortConfig.column !== column) return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };
  
  const getAriaSort = (column) => {
    if (sortConfig.column !== column) return 'none';
    return sortConfig.direction === 'asc' ? 'ascending' : 'descending';
  };
  
  const handleOpenModal = (holiday = null) => {
    setEditingHoliday(holiday);
    setIsModalOpen(true);
  };
  
  const handleSaveHoliday = (holidayData) => {
    if (editingHoliday) {
      setHolidays(holidays.map(h => h.id === editingHoliday.id ? { ...h, ...holidayData } : h));
    } else {
      setHolidays([...holidays, { ...holidayData, id: `custom-${Date.now()}` }]);
    }
    setIsModalOpen(false);
    setEditingHoliday(null);
  };

  const handleSelectAll = (checked) => {
    setSelectedRows(checked ? new Set(filteredHolidays.map(h => h.id)) : new Set());
  };

  const handleSelectRow = (id, checked) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedRows(newSelection);
  };

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resources — Public Holidays</h1>
          <p className="mt-1 text-gray-500">
            Manage Victoria and local holiday dates, surcharges and block-outs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" />Sync with Victoria</Button>
          <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Import ICS</Button>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export ICS</Button>
          <Button onClick={() => handleOpenModal()}><Plus className="mr-2 h-4 w-4" />New Holiday</Button>
        </div>
      </header>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="year-select">Year:</Label>
              <Select value={year.toString()} onValueChange={(val) => setYear(parseInt(val))}>
                <SelectTrigger id="year-select" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026, 2027].map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              setSearchTerm('');
              setFilters({ scopes: [], impacts: [] });
            }}>
              Clear filters
            </Button>
          </div>
          <FilterChips filters={filters} onFilterChange={setFilters} />
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
                      checked={selectedRows.size > 0 && selectedRows.size === filteredHolidays.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead scope="col">
                    <Button variant="ghost" onClick={() => handleSort('date')} aria-sort={getAriaSort('date')}>
                      Date {getSortIcon('date')}
                    </Button>
                  </TableHead>
                  <TableHead scope="col">
                    <Button variant="ghost" onClick={() => handleSort('name')} aria-sort={getAriaSort('name')}>
                      Name {getSortIcon('name')}
                    </Button>
                  </TableHead>
                  <TableHead scope="col">
                    <Button variant="ghost" onClick={() => handleSort('scope')} aria-sort={getAriaSort('scope')}>
                      Scope {getSortIcon('scope')}
                    </Button>
                  </TableHead>
                  <TableHead>Pricing Rule</TableHead>
                  <TableHead>Block-out</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHolidays.map(holiday => (
                  <TableRow key={holiday.id}>
                    <TableCell className="px-4">
                      <Checkbox
                        checked={selectedRows.has(holiday.id)}
                        onCheckedChange={(checked) => handleSelectRow(holiday.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{format(holiday.date, 'E, dd MMM yyyy')}</TableCell>
                    <TableCell>{holiday.name} {holiday.restrictedTrading && <Lock className="h-3 w-3 inline-block ml-1 text-gray-500" />}</TableCell>
                    <TableCell><Badge variant="secondary">{holiday.scope}</Badge></TableCell>
                    <TableCell>{holiday.pricingRule || '—'}</TableCell>
                    <TableCell>
                      {holiday.blockOut ? 
                        <Badge className="bg-blue-100 text-blue-800">Yes</Badge> : 
                        <Badge variant="outline">No</Badge>
                      }
                    </TableCell>
                    <TableCell><div className="max-w-xs truncate">{holiday.notes}</div></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(holiday)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Add/Edit Modal (A simplified version for brevity) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}</DialogTitle>
          </DialogHeader>
          {/* Form content would go here */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => handleSaveHoliday({})}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}