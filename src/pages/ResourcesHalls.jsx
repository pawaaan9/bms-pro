import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Download,
  Search,
  Calendar,
  Settings,
  Archive,
  RotateCcw,
  Copy,
  Edit,
  Eye,
  ArrowUpDown,
  MoreVertical,
  Clock,
  Users,
  Palette,
  CheckCircle,
  AlertCircle,
  X,
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

// Sample data representing realistic hall/room configurations
const sampleHalls = [
  {
    id: 'hall-a',
    name: 'Hall A',
    code: 'HA',
    type: 'Hall',
    capacity: 180,
    description: 'Main multi-purpose hall with stage and AV equipment',
    internalNotes: 'Check sound system before large events',
    visibility: 'Public',
    status: 'Active',
    calendarColour: '#2563EB',
    colourName: 'Blue',
    hours: {
      monday: { open: '08:00', close: '22:00', closed: false },
      tuesday: { open: '08:00', close: '22:00', closed: false },
      wednesday: { open: '08:00', close: '22:00', closed: false },
      thursday: { open: '08:00', close: '22:00', closed: false },
      friday: { open: '08:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '23:00', closed: false },
      sunday: { open: '09:00', close: '20:00', closed: false },
    },
    buffers: { setup: 30, packdown: 30 },
    applyBuffers: true,
    equipment: [
      { name: 'Chairs (plastic)', quantity: 200 },
      { name: 'Tables (round)', quantity: 20 },
      { name: 'Sound system', quantity: 1 },
      { name: 'Stage', quantity: 1 },
    ],
    icsEnabled: true,
    publicCalendar: true,
    lastUpdated: new Date('2025-08-20T14:30:00'),
  },
  {
    id: 'hall-b',
    name: 'Hall B',
    code: 'HB',
    type: 'Hall',
    capacity: 120,
    description: 'Intimate hall perfect for workshops and smaller events',
    internalNotes: 'Limited parking - inform customers',
    visibility: 'Admin-only',
    status: 'Active',
    calendarColour: '#059669',
    colourName: 'Green',
    hours: {
      monday: { open: '09:00', close: '20:00', closed: false },
      tuesday: { open: '09:00', close: '20:00', closed: true },
      wednesday: { open: '09:00', close: '20:00', closed: false },
      thursday: { open: '09:00', close: '20:00', closed: false },
      friday: { open: '09:00', close: '20:00', closed: false },
      saturday: { open: '10:00', close: '18:00', closed: false },
      sunday: { open: '10:00', close: '18:00', closed: false },
    },
    buffers: { setup: 15, packdown: 30 },
    applyBuffers: true,
    equipment: [
      { name: 'Chairs (padded)', quantity: 150 },
      { name: 'Tables (rectangle)', quantity: 15 },
      { name: 'Whiteboard', quantity: 2 },
      { name: 'Projector', quantity: 1 },
    ],
    icsEnabled: false,
    publicCalendar: false,
    lastUpdated: new Date('2025-08-18T09:15:00'),
  },
  {
    id: 'community-room',
    name: 'Community Room',
    code: 'CR',
    type: 'Room',
    capacity: 40,
    description: 'Cosy meeting room for community groups',
    internalNotes: 'Coffee machine needs daily cleaning',
    visibility: 'Public',
    status: 'Active',
    calendarColour: '#7C3AED',
    colourName: 'Purple',
    hours: {
      monday: { open: '08:00', close: '17:00', closed: false },
      tuesday: { open: '08:00', close: '17:00', closed: true },
      wednesday: { open: '08:00', close: '17:00', closed: false },
      thursday: { open: '08:00', close: '17:00', closed: false },
      friday: { open: '08:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '15:00', closed: false },
      sunday: { open: '10:00', close: '15:00', closed: true },
    },
    buffers: { setup: 10, packdown: 10 },
    applyBuffers: true,
    equipment: [
      { name: 'Chairs', quantity: 50 },
      { name: 'Tables', quantity: 8 },
      { name: 'Coffee machine', quantity: 1 },
      { name: 'TV', quantity: 1 },
    ],
    icsEnabled: true,
    publicCalendar: true,
    lastUpdated: new Date('2025-08-22T11:45:00'),
  },
  {
    id: 'outdoor-lawn',
    name: 'Outdoor Lawn',
    code: 'OL',
    type: 'Outdoor',
    capacity: 300,
    description: 'Spacious outdoor area for festivals and markets',
    internalNotes: 'Weather dependent - have backup plan',
    visibility: 'Public',
    status: 'Archived',
    calendarColour: '#6B8E23',
    colourName: 'Olive',
    hours: {
      monday: { open: '08:00', close: '20:00', closed: false },
      tuesday: { open: '08:00', close: '20:00', closed: false },
      wednesday: { open: '08:00', close: '20:00', closed: false },
      thursday: { open: '08:00', close: '20:00', closed: false },
      friday: { open: '08:00', close: '20:00', closed: false },
      saturday: { open: '08:00', close: '22:00', closed: false },
      sunday: { open: '08:00', close: '20:00', closed: false },
    },
    buffers: { setup: 60, packdown: 60 },
    applyBuffers: true,
    equipment: [
      { name: 'Gazebos', quantity: 4 },
      { name: 'Power points', quantity: 8 },
      { name: 'Water access', quantity: 2 },
    ],
    icsEnabled: false,
    publicCalendar: false,
    lastUpdated: new Date('2025-06-15T16:20:00'),
  },
];

// Advanced filter chip component
const FilterChips = ({ activeFilters, onFilterChange }) => {
  const handleChipToggle = (key, value) => {
    const currentValues = activeFilters[key] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange({ ...activeFilters, [key]: newValues });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {['Hall', 'Room', 'Outdoor'].map(type => (
        <Button
          key={type}
          variant={activeFilters.types?.includes(type) ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleChipToggle('types', type)}
          aria-pressed={activeFilters.types?.includes(type)}
        >
          {type}
        </Button>
      ))}
      
      <Separator orientation="vertical" className="h-8" />
      
      {['Active', 'Archived'].map(status => (
        <Button
          key={status}
          variant={activeFilters.statuses?.includes(status) ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleChipToggle('statuses', status)}
          aria-pressed={activeFilters.statuses?.includes(status)}
        >
          {status}
        </Button>
      ))}
    </div>
  );
};

// Status badge component with WCAG AA compliance
const StatusBadge = ({ status, type }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Active':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
      case 'Archived':
        return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Archive };
      default:
        return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: AlertCircle };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} border flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
};

// Resource detail pane component
const ResourceDetailPane = ({ resource, isOpen, onClose, onEdit, onDuplicate, onArchive, onRestore }) => {
  const paneRef = useRef(null);

  useEffect(() => {
    if (isOpen && paneRef.current) {
      const closeButton = paneRef.current.querySelector('[data-close]');
      if (closeButton) {
        closeButton.focus();
      }
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen || !resource) return null;

  const hoursText = Object.entries(resource.hours)
    .map(([day, hours]) => 
      hours.closed ? `${day}: Closed` : `${day}: ${hours.open}–${hours.close}`
    )
    .join(', ');

  return (
    <motion.div
      ref={paneRef}
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: '0%', opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-2xl z-50 overflow-y-auto"
      onKeyDown={handleKeyDown}
      role="complementary"
      aria-label={`Resource details for ${resource.name}`}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: resource.calendarColour }}
              aria-label={`Calendar colour: ${resource.colourName}`}
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{resource.name}</h2>
              <p className="text-sm text-gray-500">{resource.code} · {resource.type}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            data-close
            aria-label="Close resource details"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Key Facts */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Capacity</p>
              <p className="text-lg font-semibold">{resource.capacity} people</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <StatusBadge status={resource.status} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Operating Hours</p>
            <p className="text-sm text-gray-900 mt-1">{hoursText.substring(0, 60)}...</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Setup Buffer</p>
              <p className="text-sm text-gray-900">{resource.buffers.setup} minutes</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pack-down Buffer</p>
              <p className="text-sm text-gray-900">{resource.buffers.packdown} minutes</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Visibility</p>
            <Badge variant={resource.visibility === 'Public' ? 'default' : 'secondary'}>
              {resource.visibility}
            </Badge>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Equipment</p>
            <p className="text-sm text-gray-900">{resource.equipment.length} items configured</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Last Updated</p>
            <p className="text-sm text-gray-900">{format(resource.lastUpdated, 'dd MMM yyyy, HH:mm')}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button 
            className="w-full" 
            onClick={() => onEdit(resource)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Resource
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => onDuplicate(resource)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Block-out
            </Button>
          </div>

          {resource.status === 'Active' ? (
            <Button 
              variant="outline" 
              className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
              onClick={() => onArchive(resource)}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive Resource
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="w-full text-green-600 border-green-300 hover:bg-green-50"
              onClick={() => onRestore(resource)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore Resource
            </Button>
          )}

          {resource.icsEnabled && (
            <Button variant="outline" className="w-full">
              <Copy className="mr-2 h-4 w-4" />
              Copy ICS URL
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Create/Edit Resource Modal Component
const ResourceModal = ({ isOpen, onClose, resource, onSave }) => {
  const [formData, setFormData] = useState(resource || {
    name: '',
    code: '',
    type: 'Hall',
    capacity: 0,
    description: '',
    internalNotes: '',
    visibility: 'Public',
    calendarColour: '#2563EB',
    colourName: 'Blue',
    hours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: false },
    },
    buffers: { setup: 15, packdown: 15 },
    applyBuffers: true,
    equipment: [],
    icsEnabled: false,
    publicCalendar: false,
  });
  
  const [activeTab, setActiveTab] = useState('details');
  const [errors, setErrors] = useState({});
  const [newEquipment, setNewEquipment] = useState({ name: '', quantity: 0 });
  
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  // Focus management for modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Resource name is required';
    }

    if (!formData.code?.trim()) {
      newErrors.code = 'Resource code is required';
    }

    if (formData.capacity === undefined || formData.capacity < 0) {
      newErrors.capacity = 'Capacity must be a whole number ≥ 0';
    }

    // Validate hours
    Object.entries(formData.hours).forEach(([day, hours]) => {
      if (!hours.closed && hours.open >= hours.close) {
        newErrors[`hours_${day}`] = `${day} closing time must be after opening time`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts fixing it
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: { ...prev.hours[day], [field]: value }
      }
    }));
  };

  const handleAddEquipment = () => {
    if (newEquipment.name.trim() && newEquipment.quantity > 0) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, { ...newEquipment }]
      }));
      setNewEquipment({ name: '', quantity: 0 });
    }
  };

  const handleRemoveEquipment = (index) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        ref={modalRef}
        onKeyDown={handleKeyDown}
        aria-label={resource ? `Edit ${resource.name}` : 'Create new resource'}
      >
        <DialogHeader>
          <DialogTitle>
            {resource ? `Edit ${resource.name}` : 'Create New Resource'}
          </DialogTitle>
          <DialogDescription>
            Configure the resource details, operating hours, equipment, and publishing settings.
          </DialogDescription>
        </DialogHeader>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Please fix the following errors:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>• {message}</li>
              ))}
            </ul>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="hours">Hours</TabsTrigger>
            <TabsTrigger value="buffers">Buffers</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="publishing">Publishing</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resource-name">Resource Name *</Label>
                <Input
                  id="resource-name"
                  ref={firstInputRef}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-red-300' : ''}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="resource-code">Code *</Label>
                <Input
                  id="resource-code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  placeholder="e.g., HA, CR"
                  className={errors.code ? 'border-red-300' : ''}
                  aria-describedby={errors.code ? 'code-error' : undefined}
                />
                {errors.code && (
                  <p id="code-error" className="text-sm text-red-600 mt-1">{errors.code}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resource-type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger id="resource-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hall">Hall</SelectItem>
                    <SelectItem value="Room">Room</SelectItem>
                    <SelectItem value="Outdoor">Outdoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="resource-capacity">Capacity (people) *</Label>
                <Input
                  id="resource-capacity"
                  type="number"
                  min="0"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                  className={errors.capacity ? 'border-red-300' : ''}
                  aria-describedby={errors.capacity ? 'capacity-error' : undefined}
                />
                {errors.capacity && (
                  <p id="capacity-error" className="text-sm text-red-600 mt-1">{errors.capacity}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="resource-description">Description (public)</Label>
              <Textarea
                id="resource-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="resource-notes">Internal Notes (admin only)</Label>
              <Textarea
                id="resource-notes"
                value={formData.internalNotes}
                onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resource-visibility">Visibility</Label>
                <Select value={formData.visibility} onValueChange={(value) => handleInputChange('visibility', value)}>
                  <SelectTrigger id="resource-visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public">Public</SelectItem>
                    <SelectItem value="Admin-only">Admin-only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="resource-colour">Calendar Colour</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="resource-colour"
                    type="color"
                    value={formData.calendarColour}
                    onChange={(e) => handleInputChange('calendarColour', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <Input
                    value={formData.colourName}
                    onChange={(e) => handleInputChange('colourName', e.target.value)}
                    placeholder="Colour name"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hours" className="space-y-4">
            <div className="space-y-3">
              {Object.entries(formData.hours).map(([day, hours]) => (
                <div key={day} className="grid grid-cols-4 gap-4 items-center">
                  <Label className="capitalize font-medium">{day}</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={!hours.closed}
                      onCheckedChange={(checked) => handleHoursChange(day, 'closed', !checked)}
                    />
                    <span className="text-sm">Open</span>
                  </div>
                  {!hours.closed && (
                    <>
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                      />
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                      />
                    </>
                  )}
                  {hours.closed && (
                    <>
                      <span className="text-gray-400 col-span-2">Closed</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="buffers" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="setup-buffer">Setup Buffer (minutes)</Label>
                <Input
                  id="setup-buffer"
                  type="number"
                  min="0"
                  value={formData.buffers.setup}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    buffers: { ...prev.buffers, setup: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="packdown-buffer">Pack-down Buffer (minutes)</Label>
                <Input
                  id="packdown-buffer"
                  type="number"
                  min="0"
                  value={formData.buffers.packdown}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    buffers: { ...prev.buffers, packdown: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.applyBuffers}
                onCheckedChange={(checked) => handleInputChange('applyBuffers', checked)}
              />
              <Label>Apply buffers to bookings</Label>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>How buffers work:</strong> Setup and pack-down times block the resource before and after bookings. 
                Conflicts are automatically enforced in the calendar to prevent overlapping reservations.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Add Equipment</h3>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  placeholder="Equipment name"
                  value={newEquipment.name}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  min="1"
                  value={newEquipment.quantity || ''}
                  onChange={(e) => setNewEquipment(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                />
                <Button onClick={handleAddEquipment} disabled={!newEquipment.name.trim() || newEquipment.quantity <= 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current Equipment</Label>
              {formData.equipment.length === 0 ? (
                <p className="text-gray-500 text-sm">No equipment configured</p>
              ) : (
                <div className="space-y-2">
                  {formData.equipment.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Qty: {item.quantity}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEquipment(index)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Pricing Configuration</h3>
              <p className="text-sm text-yellow-700">
                Pricing rules are managed in the Rate Cards section. 
                <Button variant="link" className="p-0 h-auto text-yellow-700 underline ml-1">
                  Go to Pricing →
                </Button>
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Linked Rate Cards</h4>
              <p className="text-sm text-gray-500">No rate cards currently linked to this resource.</p>
            </div>
          </TabsContent>

          <TabsContent value="publishing" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Calendar</Label>
                  <p className="text-sm text-gray-500">Show this resource on the public booking calendar</p>
                </div>
                <Switch
                  checked={formData.publicCalendar}
                  onCheckedChange={(checked) => handleInputChange('publicCalendar', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>ICS Feed</Label>
                  <p className="text-sm text-gray-500">Enable calendar subscription feed for this resource</p>
                </div>
                <Switch
                  checked={formData.icsEnabled}
                  onCheckedChange={(checked) => handleInputChange('icsEnabled', checked)}
                />
              </div>

              {formData.icsEnabled && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">ICS Feed URL</h4>
                  <div className="flex items-center gap-2">
                    <Input
                      value={`https://bmspro.com.au/ics/${formData.code?.toLowerCase() || 'resource'}`}
                      readOnly
                      className="bg-white"
                    />
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    This URL allows external calendar apps to subscribe to this resource's bookings.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={Object.keys(errors).length > 0}>
            {resource ? 'Save Changes' : 'Create Resource'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Bulk block-out modal
const BulkBlockoutModal = ({ isOpen, onClose, resources, onCreateBlockouts }) => {
  const [selectedResources, setSelectedResources] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [timeFrom, setTimeFrom] = useState('09:00');
  const [timeTo, setTimeTo] = useState('17:00');
  const [reason, setReason] = useState('Maintenance');
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const newErrors = {};

    if (selectedResources.length === 0) {
      newErrors.resources = 'Please select at least one resource';
    }

    if (!dateFrom) {
      newErrors.dateFrom = 'Start date is required';
    }

    if (!dateTo) {
      newErrors.dateTo = 'End date is required';
    }

    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      newErrors.dateRange = 'End date must be after start date';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onCreateBlockouts({
        resources: selectedResources,
        dateFrom,
        dateTo,
        timeFrom,
        timeTo,
        reason,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Block-out</DialogTitle>
          <DialogDescription>
            Create block-out periods for multiple resources at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resource Selection */}
          <div>
            <Label>Resources *</Label>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-2 mt-1">
              {resources.filter(r => r.status === 'Active').map(resource => (
                <div key={resource.id} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    checked={selectedResources.includes(resource.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedResources(prev => [...prev, resource.id]);
                      } else {
                        setSelectedResources(prev => prev.filter(id => id !== resource.id));
                      }
                    }}
                  />
                  <Label className="text-sm">{resource.name}</Label>
                </div>
              ))}
            </div>
            {errors.resources && (
              <p className="text-sm text-red-600 mt-1">{errors.resources}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date-from">Start Date *</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={errors.dateFrom ? 'border-red-300' : ''}
              />
            </div>
            <div>
              <Label htmlFor="date-to">End Date *</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={errors.dateTo ? 'border-red-300' : ''}
              />
            </div>
          </div>

          {errors.dateRange && (
            <p className="text-sm text-red-600">{errors.dateRange}</p>
          )}

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="time-from">Start Time</Label>
              <Input
                id="time-from"
                type="time"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time-to">End Time</Label>
              <Input
                id="time-to"
                type="time"
                value={timeTo}
                onChange={(e) => setTimeTo(e.target.value)}
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Event">Private Event</SelectItem>
                <SelectItem value="Cleaning">Deep Cleaning</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Block-outs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main component
export default function ResourcesHalls() {
  const [halls, setHalls] = useState(sampleHalls);
  const [filteredHalls, setFilteredHalls] = useState(sampleHalls);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [sortConfig, setSortConfig] = useState({ column: null, direction: null });
  const [activeFilters, setActiveFilters] = useState({ types: [], statuses: [] });
  
  // Modal states
  const [selectedHall, setSelectedHall] = useState(null);
  const [isDetailPaneOpen, setIsDetailPaneOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [isBulkBlockoutOpen, setIsBulkBlockoutOpen] = useState(false);

  // Focus management
  const previousFocusRef = useRef(null);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...halls];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(hall =>
        hall.name.toLowerCase().includes(term) ||
        hall.code.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (activeFilters.types?.length > 0) {
      filtered = filtered.filter(hall => activeFilters.types.includes(hall.type));
    }

    // Status filter
    if (activeFilters.statuses?.length > 0) {
      filtered = filtered.filter(hall => activeFilters.statuses.includes(hall.status));
    }

    // Capacity filter
    if (minCapacity && !isNaN(parseInt(minCapacity))) {
      filtered = filtered.filter(hall => hall.capacity >= parseInt(minCapacity));
    }

    // Apply sorting
    if (sortConfig.column && sortConfig.direction) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.column];
        let bValue = b[sortConfig.column];

        if (sortConfig.column === 'name') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredHalls(filtered);
  }, [searchTerm, activeFilters, minCapacity, sortConfig, halls]);

  const handleSort = (column) => {
    let direction = 'asc';
    if (sortConfig.column === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.column === column && sortConfig.direction === 'desc') {
      direction = null;
      column = null;
    }
    setSortConfig({ column, direction });
  };

  const getSortIcon = (column) => {
    if (sortConfig.column !== column) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  const getSortAriaSort = (column) => {
    if (sortConfig.column !== column) return 'none';
    return sortConfig.direction === 'asc' ? 'ascending' : 'descending';
  };

  const handleRowClick = (hall, event) => {
    // Don't open if clicking on interactive elements
    if (event.target.closest('button, a, input, [role="button"]')) {
      return;
    }
    
    previousFocusRef.current = event.currentTarget;
    setSelectedHall(hall);
    setIsDetailPaneOpen(true);
  };

  const handleCloseDetailPane = () => {
    setIsDetailPaneOpen(false);
    setSelectedHall(null);
    
    // Restore focus
    if (previousFocusRef.current) {
      setTimeout(() => {
        previousFocusRef.current.focus();
      }, 100);
    }
  };

  const handleEdit = (hall) => {
    setEditingResource(hall);
    setIsResourceModalOpen(true);
    setIsDetailPaneOpen(false);
  };

  const handleSaveResource = (resourceData) => {
    if (editingResource) {
      // Update existing resource
      setHalls(prev => prev.map(hall => 
        hall.id === editingResource.id 
          ? { ...hall, ...resourceData, lastUpdated: new Date() }
          : hall
      ));
    } else {
      // Create new resource
      const newResource = {
        ...resourceData,
        id: `resource-${Date.now()}`,
        status: 'Active',
        lastUpdated: new Date(),
      };
      setHalls(prev => [...prev, newResource]);
    }
    
    setEditingResource(null);
    setIsResourceModalOpen(false);
  };

  const handleArchive = (hall) => {
    setHalls(prev => prev.map(h => 
      h.id === hall.id ? { ...h, status: 'Archived' } : h
    ));
    setIsDetailPaneOpen(false);
  };

  const handleRestore = (hall) => {
    setHalls(prev => prev.map(h => 
      h.id === hall.id ? { ...h, status: 'Active' } : h
    ));
    setIsDetailPaneOpen(false);
  };

  const handleBulkBlockout = (blockoutData) => {
    console.log('Creating bulk block-outs:', blockoutData);
    // In a real app, this would create block-out entries
    // For now, just log the action
    setIsBulkBlockoutOpen(false);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(filteredHalls.map(hall => hall.id)));
    } else {
      setSelectedRows(new Set());
    }
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
    <div className="relative">
      <main className="space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resources — Halls/Rooms</h1>
            <p className="mt-1 text-gray-500">
              Manage bookable spaces, hours, buffers, colours and visibility.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsBulkBlockoutOpen(true)}>
              <Calendar className="mr-2 h-4 w-4" />
              Bulk Block-out
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setIsResourceModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Hall/Room
            </Button>
          </div>
        </header>

        {/* Filter Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[250px] max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name or code..."
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

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="min-capacity" className="text-sm">Min Capacity:</Label>
                  <Input
                    id="min-capacity"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minCapacity}
                    onChange={(e) => setMinCapacity(e.target.value)}
                    className="w-24"
                  />
                </div>

                <Button variant="outline" size="sm" onClick={() => {
                  setSearchTerm('');
                  setMinCapacity('');
                  setActiveFilters({ types: [], statuses: [] });
                }}>
                  Clear filters
                </Button>
              </div>

              <FilterChips 
                activeFilters={activeFilters} 
                onFilterChange={setActiveFilters}
              />
            </div>
          </CardContent>
        </Card>

        {/* Main Table */}
        <Card>
          {/* Bulk Actions Bar */}
          <AnimatePresence>
            {selectedRows.size > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b bg-blue-50 p-3 flex items-center justify-between"
              >
                <span className="text-sm font-medium text-blue-800">
                  {selectedRows.size} resource{selectedRows.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Archive Selected
                  </Button>
                  <Button size="sm" variant="outline">
                    Export Selected
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="w-12 px-4">
                      <Checkbox
                        checked={selectedRows.size > 0 && selectedRows.size === filteredHalls.length}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all resources"
                      />
                    </TableHead>
                    <TableHead scope="col">
                      <button 
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-2 font-medium"
                        aria-sort={getSortAriaSort('name')}
                      >
                        Name
                        {getSortIcon('name')}
                      </button>
                    </TableHead>
                    <TableHead scope="col">Code</TableHead>
                    <TableHead scope="col">Type</TableHead>
                    <TableHead scope="col" className="text-right">
                      <button 
                        onClick={() => handleSort('capacity')}
                        className="flex items-center gap-2 font-medium ml-auto"
                        aria-sort={getSortAriaSort('capacity')}
                      >
                        Capacity
                        {getSortIcon('capacity')}
                      </button>
                    </TableHead>
                    <TableHead scope="col">Hours</TableHead>
                    <TableHead scope="col">Buffers</TableHead>
                    <TableHead scope="col">Colour</TableHead>
                    <TableHead scope="col">Visibility</TableHead>
                    <TableHead scope="col">
                      <button 
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-2 font-medium"
                        aria-sort={getSortAriaSort('status')}
                      >
                        Status
                        {getSortIcon('status')}
                      </button>
                    </TableHead>
                    <TableHead scope="col">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHalls.length > 0 ? (
                    filteredHalls.map((hall) => (
                      <TableRow
                        key={hall.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={(e) => handleRowClick(hall, e)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRowClick(hall, e);
                          }
                        }}
                        tabIndex={0}
                        data-state={selectedRows.has(hall.id) ? 'selected' : ''}
                        aria-label={`View details for ${hall.name}`}
                      >
                        <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedRows.has(hall.id)}
                            onCheckedChange={(checked) => handleSelectRow(hall.id, checked)}
                            aria-label={`Select ${hall.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>{hall.name}</div>
                          {hall.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">{hall.description}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{hall.code}</Badge>
                        </TableCell>
                        <TableCell>{hall.type}</TableCell>
                        <TableCell className="text-right font-mono">{hall.capacity}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {Object.values(hall.hours).some(h => h.closed) ? 'Varies' : 'Daily'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono">{hall.buffers.setup}/{hall.buffers.packdown}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: hall.calendarColour }}
                              aria-label={`Calendar colour: ${hall.colourName}`}
                            />
                            <span className="text-sm">{hall.colourName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={hall.visibility === 'Public' ? 'default' : 'secondary'}>
                            {hall.visibility}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={hall.status} />
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(hall)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedHall(hall);
                                setIsDetailPaneOpen(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              {hall.status === 'Active' ? (
                                <DropdownMenuItem onClick={() => handleArchive(hall)}>
                                  <Archive className="mr-2 h-4 w-4" />
                                  Archive
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleRestore(hall)}>
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Restore
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-gray-500">No resources found matching your criteria.</p>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSearchTerm('');
                                setMinCapacity('');
                                setActiveFilters({ types: [], statuses: [] });
                              }}
                            >
                              Clear filters
                            </Button>
                            <Button size="sm" onClick={() => setIsResourceModalOpen(true)}>
                              <Plus className="mr-2 h-4 w-4" />
                              New Hall/Room
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Detail Pane */}
      <AnimatePresence>
        {isDetailPaneOpen && selectedHall && (
          <ResourceDetailPane
            resource={selectedHall}
            isOpen={isDetailPaneOpen}
            onClose={handleCloseDetailPane}
            onEdit={handleEdit}
            onDuplicate={(resource) => {
              setEditingResource({ ...resource, id: null, name: `${resource.name} (Copy)` });
              setIsResourceModalOpen(true);
            }}
            onArchive={handleArchive}
            onRestore={handleRestore}
          />
        )}
      </AnimatePresence>

      {/* Resource Modal */}
      <ResourceModal
        isOpen={isResourceModalOpen}
        onClose={() => {
          setIsResourceModalOpen(false);
          setEditingResource(null);
        }}
        resource={editingResource}
        onSave={handleSaveResource}
      />

      {/* Bulk Block-out Modal */}
      <BulkBlockoutModal
        isOpen={isBulkBlockoutOpen}
        onClose={() => setIsBulkBlockoutOpen(false)}
        resources={halls}
        onCreateBlockouts={handleBulkBlockout}
      />
    </div>
  );
}