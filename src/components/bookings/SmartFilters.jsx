import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar, 
  X, 
  Filter,
  Zap,
  Clock,
  Star,
  AlertTriangle,
  Users,
  Building2,
} from 'lucide-react';

const QUICK_FILTERS = [
  { id: 'all', label: 'All Bookings', icon: Building2 },
  { id: 'today', label: 'Today', icon: Clock },
  { id: 'tomorrow', label: 'Tomorrow', icon: Calendar },
  { id: 'thisWeek', label: 'This Week', icon: Calendar },
  { id: 'overdue', label: 'Overdue', icon: AlertTriangle },
  { id: 'highValue', label: 'High Value', icon: Star },
];

const RESOURCES = ['Hall A', 'Hall B', 'Main Hall', 'Conference Room', 'Studio Space'];

const STATUSES = [
  { value: 'PENDING_REVIEW', label: 'Pending Review', color: 'bg-orange-500' },
  { value: 'TENTATIVE', label: 'Tentative', color: 'bg-yellow-500' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-green-500' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-blue-500' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500' },
];

const PRIORITIES = [
  { value: 'high', label: 'High Priority', color: 'bg-red-500' },
  { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-500' },
  { value: 'normal', label: 'Normal Priority', color: 'bg-gray-500' },
];

const CUSTOMER_TIERS = [
  { value: 'premium', label: 'Premium', color: 'bg-purple-500' },
  { value: 'business', label: 'Business', color: 'bg-blue-500' },
  { value: 'standard', label: 'Standard', color: 'bg-gray-500' },
  { value: 'nonprofit', label: 'Non-profit', color: 'bg-green-500' },
];

const FilterChip = ({ label, isActive, onClick, color = 'bg-blue-500', icon: Icon }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className={`relative transition-all duration-200 ${
          isActive 
            ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-md' 
            : 'hover:border-gray-300'
        }`}
      >
        {Icon && <Icon className="mr-1 h-3 w-3" />}
        <div className={`w-2 h-2 rounded-full mr-2 ${color}`}></div>
        {isActive && '✓ '}
        {label}
      </Button>
    </motion.div>
  );
};

export default function SmartFilters({ filters, onFiltersChange, onClearFilters, bookings }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key, value) => {
    const currentArray = filters[key] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const hasActiveFilters = 
    filters.resources.length > 0 ||
    filters.statuses.length > 0 ||
    filters.priority.length > 0 ||
    filters.customerTier.length > 0 ||
    filters.riskLevel.length > 0 ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.quickFilter !== 'all';

  const activeFilterCount = [
    ...(filters.resources || []),
    ...(filters.statuses || []),
    ...(filters.priority || []),
    ...(filters.customerTier || []),
    ...(filters.riskLevel || []),
    filters.dateFrom ? 1 : 0,
    filters.dateTo ? 1 : 0,
    filters.quickFilter !== 'all' ? 1 : 0,
  ].reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : curr), 0);

  return (
    <div className="space-y-6">
      {/* Quick Filters */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-blue-500" />
          <Label className="text-sm font-semibold">Quick Filters</Label>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map(filter => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              icon={filter.icon}
              isActive={filters.quickFilter === filter.id}
              onClick={() => updateFilter('quickFilter', filter.id)}
              color="bg-blue-500"
            />
          ))}
        </div>
      </div>

      {/* Status Filters */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <Label className="text-sm font-semibold">Status</Label>
          {filters.statuses.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.statuses.length} selected
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(status => (
            <FilterChip
              key={status.value}
              label={status.label}
              isActive={filters.statuses.includes(status.value)}
              onClick={() => toggleArrayFilter('statuses', status.value)}
              color={status.color}
            />
          ))}
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="border-t pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-gray-600 hover:text-gray-800"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
          <motion.div
            animate={{ rotate: showAdvanced ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </Button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date-from" className="text-sm font-medium">From Date</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="date-from"
                    type="date"
                    value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                    onChange={(e) => updateFilter('dateFrom', e.target.value ? new Date(e.target.value) : null)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="date-to" className="text-sm font-medium">To Date</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="date-to"
                    type="date"
                    value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                    onChange={(e) => updateFilter('dateTo', e.target.value ? new Date(e.target.value) : null)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Resources */}
            <div>
              <Label className="text-sm font-semibold">Resources</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {RESOURCES.map(resource => (
                  <FilterChip
                    key={resource}
                    label={resource}
                    isActive={filters.resources.includes(resource)}
                    onClick={() => toggleArrayFilter('resources', resource)}
                    color="bg-indigo-500"
                  />
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <Label className="text-sm font-semibold">Priority</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PRIORITIES.map(priority => (
                  <FilterChip
                    key={priority.value}
                    label={priority.label}
                    isActive={filters.priority.includes(priority.value)}
                    onClick={() => toggleArrayFilter('priority', priority.value)}
                    color={priority.color}
                  />
                ))}
              </div>
            </div>

            {/* Customer Tier */}
            <div>
              <Label className="text-sm font-semibold">Customer Tier</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {CUSTOMER_TIERS.map(tier => (
                  <FilterChip
                    key={tier.value}
                    label={tier.label}
                    isActive={filters.customerTier.includes(tier.value)}
                    onClick={() => toggleArrayFilter('customerTier', tier.value)}
                    color={tier.color}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <motion.div 
          className="flex justify-between items-center pt-4 border-t"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
            </Badge>
            <span className="text-sm text-gray-500">
              Showing {bookings.length} results
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="mr-1 h-3 w-3" />
            Clear all filters
          </Button>
        </motion.div>
      )}
    </div>
  );
}