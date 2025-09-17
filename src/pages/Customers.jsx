
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
  RefreshCw,
  AlertTriangle,
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
import { useAuth } from '../contexts/AuthContext';
import { fetchCustomersFromBookings } from '../services/bookingService';



export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ column: 'clv', direction: 'desc' });
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch customers from bookings
  const fetchCustomers = useCallback(async (isRefresh = false) => {
    if (!user?.id) {
      console.log('No user ID available for customers:', user);
      return;
    }
    
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const customersData = await fetchCustomersFromBookings(user.id, token);
      setCustomers(customersData);
      setFilteredCustomers(customersData);
      
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Fetch customers on component mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchCustomers();
    }
  }, [user?.id, fetchCustomers]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if(searchTerm) console.log(`Searching for: ${searchTerm}`);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Filtering and Sorting Logic
  useEffect(() => {
    let processed = [...customers];
    
    // Search filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      processed = processed.filter(customer => 
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        (customer.phone && customer.phone.includes(term))
      );
    }
    
    // Sorting
    if (sortConfig.column) {
      processed.sort((a, b) => {
        const aValue = a[sortConfig.column];
        const bValue = b[sortConfig.column];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
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
              <Button 
                variant="outline" 
                onClick={() => fetchCustomers(true)}
                disabled={refreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button variant="outline"><Users className="mr-2 h-4 w-4" />Merge Duplicates</Button>
              <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export CSV</Button>
              <Button><Plus className="mr-2 h-4 w-4" />New Customer</Button>
            </div>
          </header>

          {/* Analytics Shelf */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </CardContent>
            </Card>
             <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-gray-500">VIP Customers</p>
                <p className="text-2xl font-bold">{customers.filter(c => c.tags.includes('VIP')).length}</p>
              </CardContent>
            </Card>
             <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-gray-500">At-Risk Customers</p>
                <p className="text-2xl font-bold">{customers.filter(c => c.segment === 'At-Risk').length}</p>
              </CardContent>
            </Card>
             <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-gray-500">Top Segment</p>
                <p className="text-2xl font-bold">
                  {customers.length > 0 ? 
                    customers.reduce((acc, curr) => {
                      acc[curr.segment] = (acc[curr.segment] || 0) + 1;
                      return acc;
                    }, {}) && Object.entries(customers.reduce((acc, curr) => {
                      acc[curr.segment] = (acc[curr.segment] || 0) + 1;
                      return acc;
                    }, {})).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
                    : 'N/A'
                  }
                </p>
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
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-gray-600">Loading customers...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={() => fetchCustomers()} variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">No customers found</p>
                    <p className="text-sm text-gray-500">
                      {searchTerm 
                        ? 'Try adjusting your search terms' 
                        : 'Customers will appear here when they make bookings'
                      }
                    </p>
                  </div>
                </div>
              ) : (
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
                          {customer.phone && <div className="text-xs text-gray-400">{customer.phone}</div>}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline">{customer.rfm}</Badge>
                            <span className="text-xs text-gray-500">{customer.segment}</span>
                          </div>
                        </TableCell>
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
              )}
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
                                <div className="text-sm text-gray-500 mt-1">{activeCustomer.email}</div>
                                {activeCustomer.phone && <div className="text-sm text-gray-500">{activeCustomer.phone}</div>}
                                <div className="mt-2">
                                  {activeCustomer.tags.map(tag => <Badge key={tag} variant={tag === 'VIP' ? 'destructive' : 'secondary'} className="mr-1">{tag}</Badge>)}
                                </div>
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
                                {activeCustomer.bookings.slice(0, 5).map((b, i) => (
                                    <li key={i} className="text-sm p-2 bg-gray-50 rounded-md">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <div className="font-medium">{b.eventType}</div>
                                            <div className="text-xs text-gray-500">{new Date(b.date).toLocaleDateString('en-AU')} - {b.startTime} to {b.endTime}</div>
                                            <div className="text-xs text-gray-500">{b.resource}</div>
                                          </div>
                                          <div className="text-right">
                                            <div className="font-medium">${b.spend.toFixed(2)}</div>
                                            <Badge 
                                              variant={b.status === 'confirmed' ? 'default' : b.status === 'cancelled' ? 'destructive' : 'secondary'}
                                              className="text-xs"
                                            >
                                              {b.status}
                                            </Badge>
                                          </div>
                                        </div>
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
