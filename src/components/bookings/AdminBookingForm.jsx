import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Building2,
  DollarSign,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Calculator,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { createAdminBooking, fetchResources, fetchBookingsForCalendar } from "@/services/bookingService";
import { getDataUserId } from "@/services/userService";

export default function AdminBookingForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialData = null,
  mode = 'create' // 'create' or 'edit'
}) {
  const { user, parentUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resources, setResources] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    eventType: '',
    selectedHall: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    additionalDescription: '',
    estimatedPrice: '',
    guestCount: '',
    status: 'pending'
  });

  // Event types options
  const eventTypes = [
    'Wedding',
    'Birthday Party',
    'Corporate Event',
    'Conference',
    'Meeting',
    'Anniversary',
    'Graduation',
    'Baby Shower',
    'Bridal Shower',
    'Funeral',
    'Community Event',
    'Other'
  ];

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending Review', color: 'bg-orange-100 text-orange-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
    { value: 'tentative', label: 'Tentative', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' }
  ];

  // Fetch resources on component mount
  useEffect(() => {
    const fetchResourcesData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const resourcesData = await fetchResources(token);
          setResources(resourcesData);
        }
      } catch (err) {
        console.error('Error fetching resources:', err);
      }
    };

    if (isOpen) {
      fetchResourcesData();
    }
  }, [isOpen]);

  // Initialize form data when dialog opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          customerName: initialData.customerName || '',
          customerEmail: initialData.customerEmail || '',
          customerPhone: initialData.customerPhone || '',
          eventType: initialData.eventType || '',
          selectedHall: initialData.selectedHall || '',
          bookingDate: initialData.bookingDate || '',
          startTime: initialData.startTime || '',
          endTime: initialData.endTime || '',
          additionalDescription: initialData.additionalDescription || '',
          estimatedPrice: initialData.estimatedPrice || '',
          guestCount: initialData.guestCount || '',
          status: initialData.status || 'pending'
        });
      } else {
        // Reset form for new booking
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          eventType: '',
          selectedHall: '',
          bookingDate: '',
          startTime: '',
          endTime: '',
          additionalDescription: '',
          estimatedPrice: '',
          guestCount: '',
          status: 'pending'
        });
      }
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Check for conflicts when date, time, or hall changes
    if (['bookingDate', 'startTime', 'endTime', 'selectedHall'].includes(field)) {
      checkForConflicts();
    }
  };

  // Check for booking conflicts
  // Calculate duration in hours
  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    
    const startTimeObj = new Date(`2000-01-01T${formData.startTime}:00`);
    const endTimeObj = new Date(`2000-01-01T${formData.endTime}:00`);
    const durationMs = endTimeObj.getTime() - startTimeObj.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    return Math.max(0, durationHours);
  };

  const checkForConflicts = async () => {
    if (!formData.bookingDate || !formData.startTime || !formData.endTime || !formData.selectedHall) {
      setConflicts([]);
      return;
    }

    try {
      setCheckingConflicts(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const dataUserId = getDataUserId(user, parentUserData);
      const existingBookings = await fetchBookingsForCalendar(dataUserId, token);
      
      const startTimeObj = new Date(`2000-01-01T${formData.startTime}:00`);
      const endTimeObj = new Date(`2000-01-01T${formData.endTime}:00`);
      
      const conflictingBookings = existingBookings.filter(booking => {
        // Skip if it's the same booking (for edit mode)
        if (initialData && booking.id === initialData.id) return false;
        
        // Check if same date and hall
        if (booking.bookingDate !== formData.bookingDate || booking.selectedHall !== formData.selectedHall) {
          return false;
        }
        
        // Check if status is active (pending or confirmed)
        if (!['pending', 'confirmed', 'PENDING', 'CONFIRMED'].includes(booking.status)) {
          return false;
        }
        
        // Check for time overlap
        const existingStart = new Date(`2000-01-01T${booking.startTime}:00`);
        const existingEnd = new Date(`2000-01-01T${booking.endTime}:00`);
        
        return (startTimeObj < existingEnd && endTimeObj > existingStart);
      });
      
      setConflicts(conflictingBookings);
    } catch (err) {
      console.error('Error checking conflicts:', err);
    } finally {
      setCheckingConflicts(false);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'customerName',
      'customerEmail', 
      'customerPhone',
      'eventType',
      'selectedHall',
      'bookingDate',
      'startTime',
      'endTime'
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        setError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customerEmail)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Validate phone format (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.customerPhone.replace(/[\s\-\(\)]/g, ''))) {
      setError('Please enter a valid phone number');
      return false;
    }

    // Validate date is not in the past
    const bookingDate = new Date(formData.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      setError('Booking date cannot be in the past');
      return false;
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.startTime) || !timeRegex.test(formData.endTime)) {
      setError('Please enter valid times in HH:MM format');
      return false;
    }

    // Validate end time is after start time
    const startTimeObj = new Date(`2000-01-01T${formData.startTime}:00`);
    const endTimeObj = new Date(`2000-01-01T${formData.endTime}:00`);
    
    if (endTimeObj <= startTimeObj) {
      setError('End time must be after start time');
      return false;
    }

    // Check for conflicts
    if (conflicts.length > 0) {
      setError(`Time slot conflicts with existing booking(s). Please choose a different time.`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare booking data
      const bookingData = {
        ...formData,
        estimatedPrice: formData.estimatedPrice ? parseFloat(formData.estimatedPrice) : null,
        guestCount: formData.guestCount ? parseInt(formData.guestCount) : null
      };

      // Debug: Log the date being sent
      console.log('Admin booking form - Date being sent:', {
        originalDate: formData.bookingDate,
        dateType: typeof formData.bookingDate,
        dateValue: formData.bookingDate
      });

      const result = await createAdminBooking(bookingData, token);
      
      setSuccess(true);
      
      // Show success message with calculated price
      const successMessage = result.booking.calculatedPrice 
        ? `Booking created successfully! Total cost: $${result.booking.calculatedPrice.toFixed(2)}`
        : 'Booking created successfully!';
      
      console.log('Booking created successfully:', successMessage);
      
      // Call success callback after a short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(result.booking);
        }
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {mode === 'create' ? 'Create New Booking' : 'Edit Booking'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new booking for a customer. All fields marked with * are required.'
              : 'Edit the booking details below.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email Address *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    placeholder="customer@example.com"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestCount">Number of Guests</Label>
                  <Input
                    id="guestCount"
                    type="number"
                    min="1"
                    value={formData.guestCount}
                    onChange={(e) => handleInputChange('guestCount', e.target.value)}
                    placeholder="50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type *</Label>
                  <Select value={formData.eventType} onValueChange={(value) => handleInputChange('eventType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selectedHall">Hall/Resource *</Label>
                  <Select value={formData.selectedHall} onValueChange={(value) => handleInputChange('selectedHall', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hall" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name} ({resource.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalDescription">Additional Description</Label>
                <Textarea
                  id="additionalDescription"
                  value={formData.additionalDescription}
                  onChange={(e) => handleInputChange('additionalDescription', e.target.value)}
                  placeholder="Any special requirements, setup needs, or additional information..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bookingDate">Booking Date *</Label>
                <Input
                  id="bookingDate"
                  type="date"
                  value={formData.bookingDate}
                  onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedPrice">Estimated Price</Label>
                  <Input
                    id="estimatedPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.estimatedPrice}
                    onChange={(e) => handleInputChange('estimatedPrice', e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500">
                    Optional. Leave blank to use hall's default pricing.
                  </p>
                  
                  {/* Price Preview */}
                  {formData.selectedHall && formData.startTime && formData.endTime && formData.bookingDate && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Calculator className="h-4 w-4" />
                        <span className="text-sm font-medium">Price Preview</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Duration: {calculateDuration().toFixed(1)} hours. 
                        Price will be calculated based on hall pricing and duration.
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={option.color}>
                              {option.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conflicts Display */}
          {conflicts.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Time slot conflicts with existing bookings:</p>
                  {conflicts.map((conflict, index) => (
                    <div key={index} className="text-sm bg-red-50 p-2 rounded border border-red-200">
                      <p><strong>Customer:</strong> {conflict.customer}</p>
                      <p><strong>Time:</strong> {conflict.startTime} - {conflict.endTime}</p>
                      <p><strong>Event:</strong> {conflict.eventType}</p>
                      <p><strong>Status:</strong> 
                        <Badge className={`ml-2 ${
                          conflict.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          conflict.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {conflict.status}
                        </Badge>
                      </p>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Booking created successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  {mode === 'create' ? 'Create Booking' : 'Update Booking'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
