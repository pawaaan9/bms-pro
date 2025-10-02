
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
  Calendar,
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
            className={`flex-1 space-y-4 sm:space-y-6 transition-all duration-300 w-full max-w-full overflow-x-hidden ${activeCustomer ? 'pr-0 lg:pr-[450px]' : 'pr-0'}`}
        >
          {/* Header */}
          <header className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-blue-100">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 lg:gap-6">
              <div className="space-y-2 sm:space-y-3 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 lg:gap-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg w-fit">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Customers
                    </h1>
                    <p className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base mt-1">
                      Directory, insights and actions for every customer
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 lg:gap-4 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                    <span>Customer Analytics</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <BarChartHorizontal className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span>RFM Analysis</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fetchCustomers(true)}
                  disabled={refreshing}
                  className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </header>

          {/* Analytics Shelf */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="group border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 w-full max-w-full">
                <CardContent className="pt-4 p-3 w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-600 truncate">Total Customers</p>
                      <p className="text-lg font-bold text-blue-600 mt-1">{customers.length}</p>
                    </div>
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg flex-shrink-0 ml-2">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="group border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 w-full max-w-full">
                <CardContent className="pt-4 p-3 w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-600 truncate">VIP Customers</p>
                      <p className="text-lg font-bold text-red-600 mt-1">{customers.filter(c => c.tags.includes('VIP')).length}</p>
                    </div>
                    <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg shadow-lg flex-shrink-0 ml-2">
                      <UserCheck className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="group border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 w-full max-w-full">
                <CardContent className="pt-4 p-3 w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-600 truncate">At-Risk Customers</p>
                      <p className="text-lg font-bold text-orange-600 mt-1">{customers.filter(c => c.segment === 'At-Risk').length}</p>
                    </div>
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg shadow-lg flex-shrink-0 ml-2">
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="group border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 w-full max-w-full">
                <CardContent className="pt-4 p-3 w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-600 truncate">Top Segment</p>
                      <p className="text-base font-bold text-green-600 mt-1 truncate">
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
                    </div>
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg flex-shrink-0 ml-2">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input 
                    placeholder="Search name, email, phone..." 
                      className="pl-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                  <div className="flex gap-2 sm:gap-3">
                <Select>
                      <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px] border-gray-200 focus:border-blue-300 focus:ring-blue-200 text-sm">
                    <SelectValue placeholder="All Segments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="champions">Champions</SelectItem>
                    <SelectItem value="loyal">Loyal</SelectItem>
                    <SelectItem value="at-risk">At-Risk</SelectItem>
                  </SelectContent>
                </Select>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSearchTerm('')}
                      className="border-gray-200 hover:bg-gray-50 text-sm px-3 sm:px-4"
                    >
                      Clear
                    </Button>
                  </div>
              </div>
            </CardContent>
          </Card>
          </motion.div>
          
          {/* Main Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
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
          </motion.div>
        </motion.main>
        
        {/* Customer Profile Pane */}
        <AnimatePresence>
            {activeCustomer && (
                <motion.aside 
                    initial={{ x: '100%' }}
                    animate={{ x: '0%' }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-0 right-0 h-full w-full sm:w-[400px] lg:w-[450px] bg-gradient-to-br from-white to-gray-50 border-l border-gray-200 shadow-2xl z-20 flex flex-col overflow-hidden"
                >
                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 border-b border-gray-200">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
                        <div className="relative flex justify-between items-start">
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg flex-shrink-0">
                                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                  </div>
                                  <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">{activeCustomer.name}</h2>
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{activeCustomer.email}</div>
                                {activeCustomer.phone && <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 truncate">{activeCustomer.phone}</div>}
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                  {activeCustomer.tags.map(tag => (
                                    <Badge 
                                      key={tag} 
                                      variant={tag === 'VIP' ? 'destructive' : 'secondary'} 
                                      className={`text-xs ${
                                        tag === 'VIP' 
                                          ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white border-0' 
                                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300'
                                      }`}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setActiveCustomer(null)}
                              className="bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-gray-50 flex-shrink-0 ml-2"
                            >
                                <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                         <Card className="border border-gray-200 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                            <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                                    <BarChartHorizontal className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                                  </div>
                                  <h3 className="text-sm sm:text-lg font-semibold text-gray-800">Analytics Snapshot</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                                    <div className="p-2 sm:p-3 bg-white/60 rounded-lg border border-blue-100">
                                      <span className="font-medium text-gray-600 block mb-1 text-xs">RFM Score</span> 
                                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 text-xs">{activeCustomer.rfm}</Badge>
                                    </div>
                                    <div className="p-2 sm:p-3 bg-white/60 rounded-lg border border-green-100">
                                      <span className="font-medium text-gray-600 block mb-1 text-xs">CLV (est.)</span> 
                                      <span className="text-green-600 font-bold text-xs sm:text-sm">${activeCustomer.clv.toFixed(0)}</span>
                                    </div>
                                    <div className="p-2 sm:p-3 bg-white/60 rounded-lg border border-purple-100">
                                      <span className="font-medium text-gray-600 block mb-1 text-xs">Lifetime Spend</span> 
                                      <span className="text-purple-600 font-bold text-xs sm:text-sm">${activeCustomer.lifetimeSpend.toFixed(2)}</span>
                                    </div>
                                    <div className="p-2 sm:p-3 bg-white/60 rounded-lg border border-orange-100">
                                      <span className="font-medium text-gray-600 block mb-1 text-xs">Total Bookings</span> 
                                      <span className="text-orange-600 font-bold text-xs sm:text-sm">{activeCustomer.totalBookings}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border border-gray-200 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                             <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                                  </div>
                                  <h3 className="text-sm sm:text-lg font-semibold text-gray-800">Recent Bookings</h3>
                                </div>
                                <ul className="space-y-2 sm:space-y-3">
                                {activeCustomer.bookings.slice(0, 5).map((b, i) => (
                                    <li key={i} className="text-xs sm:text-sm p-2 sm:p-3 bg-white/60 rounded-lg border border-green-100 hover:bg-white/80 transition-colors">
                                        <div className="flex justify-between items-start gap-2">
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-800 mb-1 truncate">{b.eventType}</div>
                                            <div className="text-xs text-gray-600 mb-1">{new Date(b.date).toLocaleDateString('en-AU')} - {b.startTime} to {b.endTime}</div>
                                            <div className="text-xs text-gray-500 truncate">{b.resource}</div>
                                          </div>
                                          <div className="text-right flex-shrink-0">
                                            <div className="font-bold text-green-600 mb-1 text-xs sm:text-sm">${b.spend.toFixed(2)}</div>
                                            <Badge 
                                              variant="outline"
                                              className="text-xs text-black border-gray-300 bg-white hover:bg-gray-50"
                                            >
                                              {b.status || 'Unknown'}
                                            </Badge>
                                          </div>
                                        </div>
                                    </li>
                                ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card className="border border-gray-200 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
                           <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                                    <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                                  </div>
                                  <h3 className="text-sm sm:text-lg font-semibold text-gray-800">Privacy & Actions</h3>
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                     <Button 
                                       variant="outline" 
                                       className="w-full bg-white/60 border-purple-200 hover:bg-purple-50 hover:border-purple-300 text-gray-700 text-xs sm:text-sm"
                                     >
                                       <ShieldCheck className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                       <span className="hidden sm:inline">Access Data (Export)</span>
                                       <span className="sm:hidden">Export</span>
                                     </Button>
                                     <Button 
                                       variant="outline" 
                                       className="w-full bg-white/60 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-gray-700 text-xs sm:text-sm"
                                     >
                                       <Edit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                       <span className="hidden sm:inline">Correct Profile</span>
                                       <span className="sm:hidden">Edit</span>
                                     </Button>
                                     <Button 
                                       variant="destructive" 
                                       className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 border-0 text-xs sm:text-sm"
                                     >
                                       <UserX className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                       <span className="hidden sm:inline">Anonymise Customer</span>
                                       <span className="sm:hidden">Anonymise</span>
                                     </Button>
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
