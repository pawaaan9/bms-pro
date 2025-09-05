
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Download,
  Users,
  Search,
  UserCheck,
  UserX,
  TrendingUp,
  BarChartHorizontal,
  Mail,
  MoreVertical,
  ArrowUpDown,
  ShieldCheck,
  EyeOff,
  XCircle,
  Edit,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// --- Analytics Engine & Data Simulation ---
// This would typically be a separate module, included here for demonstration.

// 1. Raw Sample Data
const rawCustomers = [
  // S. Perera - High-value, recent
  { id: 'CUST-001', name: 'S. Perera', email: 's.perera@example.com', tags: ['VIP'], bookings: [
    { date: new Date('2025-08-18'), spend: 800, onTime: true, cancelled: false },
    { date: new Date('2025-06-10'), spend: 650, onTime: true, cancelled: false },
    { date: new Date('2025-03-01'), spend: 720, onTime: true, cancelled: false },
    { date: new Date('2024-12-15'), spend: 950, onTime: true, cancelled: false },
    { date: new Date('2024-10-20'), spend: 400, onTime: false, cancelled: false },
    { date: new Date('2024-08-05'), spend: 540, onTime: true, cancelled: false },
    { date: new Date('2024-05-11'), spend: 500, onTime: true, cancelled: false },
  ]},
  // L. Nguyen - At-risk, infrequent
  { id: 'CUST-002', name: 'L. Nguyen', email: 'l.nguyen@example.com', tags: [], bookings: [
    { date: new Date('2025-05-12'), spend: 220, onTime: true, cancelled: false },
    { date: new Date('2024-09-01'), spend: 300, onTime: true, cancelled: true },
  ]},
  // J. Kaur - Loyal, NFP
  { id: 'CUST-003', name: 'J. Kaur', email: 'j.kaur@community.org', tags: ['NFP', 'VIP'], bookings: [
    { date: new Date('2025-07-25'), spend: 450, onTime: true, cancelled: false },
    { date: new Date('2025-04-15'), spend: 400, onTime: true, cancelled: false },
    { date: new Date('2025-01-10'), spend: 550, onTime: true, cancelled: false },
    { date: new Date('2024-11-05'), spend: 380, onTime: true, cancelled: false },
    { date: new Date('2024-07-30'), spend: 320, onTime: true, cancelled: false },
  ]},
  // Acme Corp - High monetary, but not frequent
   { id: 'CUST-004', name: 'Acme Corp', email: 'accounts@acme.com', tags: ['Business'], bookings: [
    { date: new Date('2025-04-02'), spend: 4500, onTime: true, cancelled: false },
    { date: new Date('2024-04-01'), spend: 4200, onTime: true, cancelled: false },
  ]},
];

// 2. Quintile Calculation Helper
const getQuintile = (value, inverted = false) => {
  if (value <= 0.2) return inverted ? 5 : 1;
  if (value <= 0.4) return inverted ? 4 : 2;
  if (value <= 0.6) return inverted ? 3 : 3;
  if (value <= 0.8) return inverted ? 2 : 4;
  return inverted ? 1 : 5;
};

// 3. Analytics Computation Function
const computeCustomerAnalytics = (customers) => {
  const now = new Date();
  const oneYearAgo = new Date(new Date().setFullYear(now.getFullYear() - 1));

  // Find max values for normalization
  const maxRecency = Math.max(...customers.map(c => c.bookings.length > 0 ? now - new Date(c.bookings[0].date) : now - oneYearAgo));
  const maxFrequency = Math.max(...customers.map(c => c.bookings.filter(b => !b.cancelled && new Date(b.date) > oneYearAgo).length));
  const maxMonetary = Math.max(...customers.map(c => c.bookings.filter(b => !b.cancelled && new Date(b.date) > oneYearAgo).reduce((sum, b) => sum + b.spend, 0)));

  return customers.map(c => {
    const validBookings = c.bookings.filter(b => !b.cancelled);
    const last12mBookings = validBookings.filter(b => new Date(b.date) > oneYearAgo);

    const recencyDays = validBookings.length > 0 ? (now - new Date(validBookings[0].date)) / (1000 * 3600 * 24) : 365;
    const frequency12m = last12mBookings.length;
    const monetary12m = last12mBookings.reduce((sum, b) => sum + b.spend, 0);

    const R = getQuintile(recencyDays / (maxRecency || 365), true);
    const F = getQuintile(frequency12m / (maxFrequency || 1));
    const M = getQuintile(monetary12m / (maxMonetary || 1));
    
    const lifetimeSpend = validBookings.reduce((sum, b) => sum + b.spend, 0);
    const avgSpendPerBooking = validBookings.length > 0 ? lifetimeSpend / validBookings.length : 0;
    const CLV = avgSpendPerBooking * frequency12m * 2.5; // Simple heuristic: 2.5 year tenure

    return {
      ...c,
      rfm: `${R}${F}${M}`,
      clv: CLV,
      lastActiveDays: Math.round(recencyDays),
      totalBookings: validBookings.length,
      lifetimeSpend,
    };
  });
};

const customerData = computeCustomerAnalytics(rawCustomers);


export default function CustomersPage() {
  const [customers, setCustomers] = useState(customerData);
  const [filteredCustomers, setFilteredCustomers] = useState(customerData);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ column: 'clv', direction: 'desc' });
  const [activeCustomer, setActiveCustomer] = useState(null);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      // In a real app, you'd apply the filter here.
      // For now, we'll just log it.
      if(searchTerm) console.log(`Searching for: ${searchTerm}`);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Filtering and Sorting Logic
  useEffect(() => {
    let processed = [...customers];
    // Add filtering logic here based on searchTerm and other filters
    
    if (sortConfig.column) {
      processed.sort((a, b) => {
        if (a[sortConfig.column] < b[sortConfig.column]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.column] > b[sortConfig.column]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    setFilteredCustomers(processed);
  }, [customers, searchTerm, sortConfig]);

  const handleSort = useCallback((column) => {
    let direction = 'asc';
    if (sortConfig.column === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.column === column && sortConfig.direction === 'desc') {
        column = null;
        direction = null;
    }
    setSortConfig({ column, direction });
  }, [sortConfig]);
  
  const getSortIcon = (column) => {
    if(sortConfig.column !== column) return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };
  
  const getAriaSort = (column) => {
      if(sortConfig.column !== column) return 'none';
      return sortConfig.direction === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <TooltipProvider>
      <div className="flex h-full">
        <motion.main 
            layout 
            className={`flex-1 space-y-6 transition-all duration-300 ${activeCustomer ? 'pr-[450px]' : 'pr-0'}`}
        >
          {/* Header */}
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
              <p className="mt-1 text-gray-500">Directory, insights and actions for every customer.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline"><Users className="mr-2 h-4 w-4" />Merge Duplicates</Button>
              <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export CSV</Button>
              <Button><Plus className="mr-2 h-4 w-4" />New Customer</Button>
            </div>
          </header>

          {/* Analytics Shelf */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-gray-500">Active Customers (30d)</p>
                <p className="text-2xl font-bold">12</p>
              </CardContent>
            </Card>
             <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-gray-500">New Customers (90d)</p>
                <p className="text-2xl font-bold">5</p>
              </CardContent>
            </Card>
             <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-gray-500">At-Risk Customers</p>
                <p className="text-2xl font-bold">1</p>
              </CardContent>
            </Card>
             <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-gray-500">Top Segment</p>
                <p className="text-2xl font-bold">Champions</p>
              </CardContent>
            </Card>
          </section>

          {/* Filter Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input 
                    placeholder="Search name, email, phone..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Segments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="champions">Champions</SelectItem>
                    <SelectItem value="loyal">Loyal</SelectItem>
                    <SelectItem value="at-risk">At-Risk</SelectItem>
                  </SelectContent>
                </Select>
                 <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>Clear</Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Main Table */}
          <Card>
            <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"><Checkbox /></TableHead>
                      <TableHead><button className="flex items-center gap-1" onClick={() => handleSort('name')} aria-sort={getAriaSort('name')}>Customer {getSortIcon('name')}</button></TableHead>
                      <TableHead><button className="flex items-center gap-1" onClick={() => handleSort('rfm')} aria-sort={getAriaSort('rfm')}>RFM {getSortIcon('rfm')}</button></TableHead>
                      <TableHead><button className="flex items-center gap-1" onClick={() => handleSort('clv')} aria-sort={getAriaSort('clv')}>CLV (AUD) {getSortIcon('clv')}</button></TableHead>
                      <TableHead><button className="flex items-center gap-1" onClick={() => handleSort('lastActiveDays')} aria-sort={getAriaSort('lastActiveDays')}>Last Active {getSortIcon('lastActiveDays')}</button></TableHead>
                      <TableHead><button className="flex items-center gap-1" onClick={() => handleSort('totalBookings')} aria-sort={getAriaSort('totalBookings')}>Bookings {getSortIcon('totalBookings')}</button></TableHead>
                      <TableHead><button className="flex items-center gap-1" onClick={() => handleSort('lifetimeSpend')} aria-sort={getAriaSort('lifetimeSpend')}>Spend (AUD) {getSortIcon('lifetimeSpend')}</button></TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map(customer => (
                      <TableRow key={customer.id} className="cursor-pointer" onClick={() => setActiveCustomer(customer)}>
                        <TableCell><Checkbox /></TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {customer.name}
                            {customer.tags.includes('VIP') && <Badge variant="destructive">VIP</Badge>}
                            {customer.tags.includes('NFP') && <Badge variant="secondary">NFP</Badge>}
                          </div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{customer.rfm}</Badge></TableCell>
                        <TableCell className="text-right">${customer.clv.toFixed(0)}</TableCell>
                        <TableCell>{formatDistanceToNow(new Date().setDate(new Date().getDate() - customer.lastActiveDays))} ago</TableCell>
                        <TableCell className="text-center">{customer.totalBookings}</TableCell>
                        <TableCell className="text-right">${customer.lifetimeSpend.toFixed(2)}</TableCell>
                        <TableCell>
                           <Button variant="ghost" size="icon"><Mail className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </CardContent>
          </Card>
        </motion.main>
        
        {/* Customer Profile Pane */}
        <AnimatePresence>
            {activeCustomer && (
                <motion.aside 
                    initial={{ x: '100%' }}
                    animate={{ x: '0%' }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-0 right-0 h-full w-[450px] bg-white border-l shadow-2xl z-20 flex flex-col"
                >
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-start">
                             <div>
                                <h2 className="text-xl font-bold">{activeCustomer.name}</h2>
                                {activeCustomer.tags.map(tag => <Badge key={tag} variant={tag === 'VIP' ? 'destructive' : 'secondary'} className="mr-1">{tag}</Badge>)}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setActiveCustomer(null)}>
                                <XCircle className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                         <Card>
                            <CardContent className="pt-6">
                                <h3 className="text-lg font-semibold mb-2">Analytics Snapshot</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="font-medium text-gray-600">RFM Score:</span> <Badge variant="outline">{activeCustomer.rfm}</Badge></div>
                                    <div><span className="font-medium text-gray-600">CLV (est.):</span> ${activeCustomer.clv.toFixed(0)}</div>
                                    <div><span className="font-medium text-gray-600">Lifetime Spend:</span> ${activeCustomer.lifetimeSpend.toFixed(2)}</div>
                                    <div><span className="font-medium text-gray-600">Total Bookings:</span> {activeCustomer.totalBookings}</div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardContent className="pt-6">
                                <h3 className="text-lg font-semibold mb-2">Recent Bookings</h3>
                                <ul className="space-y-2">
                                {activeCustomer.bookings.slice(0, 3).map((b, i) => (
                                    <li key={i} className="text-sm p-2 bg-gray-50 rounded-md">
                                        {new Date(b.date).toLocaleDateString('en-AU')} - ${b.spend} {b.cancelled && <Badge variant="destructive" className="ml-2">Cancelled</Badge>}
                                    </li>
                                ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                           <CardContent className="pt-6">
                                <h3 className="text-lg font-semibold mb-2">Privacy & Actions</h3>
                                <div className="space-y-2">
                                     <Button variant="outline" className="w-full"><ShieldCheck className="mr-2 h-4 w-4" />Access Data (Export)</Button>
                                     <Button variant="outline" className="w-full"><Edit className="mr-2 h-4 w-4" />Correct Profile</Button>
                                     <Button variant="destructive" className="w-full"><UserX className="mr-2 h-4 w-4" />Anonymise Customer</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>

      </div>
    </TooltipProvider>
  );
}
