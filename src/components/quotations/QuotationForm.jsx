import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calculator, Save, Send } from 'lucide-react';
import { fetchResources, fetchPricing, calculateResourceRate, createQuotation, updateQuotation } from '@/services/quotationService';
import { useAuth } from '@/contexts/AuthContext';

const QuotationForm = ({ 
  isOpen, 
  onClose, 
  quotation = null, 
  onSave, 
  onSend,
  isLoading = false 
}) => {
  const { user, token } = useAuth();
  const [resources, setResources] = useState([]);
  const [pricingData, setPricingData] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    eventType: '',
    resource: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    guestCount: '',
    totalAmount: 0,
    validUntil: '',
    notes: '',
    depositType: 'None',
    depositValue: 0
  });
  const [errors, setErrors] = useState({});

  // Load resources and pricing when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const [resourcesData, pricingData] = await Promise.all([
          fetchResources(token),
          fetchPricing(token)
        ]);
        setResources(resourcesData);
        setPricingData(pricingData);
        console.log('Loaded pricing data:', pricingData);
        console.log('Loaded resources data:', resourcesData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (isOpen && token) {
      loadData();
    }
  }, [isOpen, token]);

  // Auto-calculate price when pricing data is loaded and form has required fields
  useEffect(() => {
    if (pricingData && pricingData.length > 0 && 
        formData.resource && formData.eventDate && formData.startTime && formData.endTime && 
        formData.totalAmount === 0) {
      const calculatedRate = calculateResourceRate(
        pricingData,
        formData.resource,
        formData.eventDate,
        formData.startTime,
        formData.endTime
      );
      
      if (calculatedRate > 0) {
        console.log('Auto-calculating price on data load:', calculatedRate);
        setFormData(prev => ({ ...prev, totalAmount: calculatedRate }));
      }
    }
  }, [pricingData, formData.resource, formData.eventDate, formData.startTime, formData.endTime]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Disable body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Initialize form data when quotation changes
  useEffect(() => {
    if (quotation) {
      setFormData({
        customerName: quotation.customerName || '',
        customerEmail: quotation.customerEmail || '',
        customerPhone: quotation.customerPhone || '',
        eventType: quotation.eventType || '',
        resource: quotation.resource || '',
        eventDate: quotation.eventDate ? new Date(quotation.eventDate).toISOString().split('T')[0] : '',
        startTime: quotation.startTime || '',
        endTime: quotation.endTime || '',
        guestCount: quotation.guestCount || '',
        totalAmount: quotation.totalAmount || 0,
        validUntil: quotation.validUntil ? new Date(quotation.validUntil).toISOString().split('T')[0] : '',
        notes: quotation.notes || '',
        depositType: quotation.depositType || 'None',
        depositValue: quotation.depositValue || 0
      });
    } else {
      // Reset form for new quotation
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        eventType: '',
        resource: '',
        eventDate: '',
        startTime: '',
        endTime: '',
        guestCount: '',
        totalAmount: 0,
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        notes: '',
        depositType: 'None',
        depositValue: 0
      });
    }
    setErrors({});
  }, [quotation, isOpen]);


  // Calculate deposit amount based on type and value
  const calculateDepositAmount = (depositType, depositValue, totalAmount) => {
    if (depositType === 'Fixed') {
      return parseFloat(depositValue) || 0;
    } else if (depositType === 'Percentage') {
      return (totalAmount * (parseFloat(depositValue) || 0)) / 100;
    }
    return 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      
      // Auto-calculate total amount when resource, date, or time changes
      if (field === 'resource' || field === 'eventDate' || field === 'startTime' || field === 'endTime') {
        if (newFormData.resource && newFormData.eventDate && newFormData.startTime && newFormData.endTime) {
          const calculatedRate = calculateResourceRate(
            pricingData,
            newFormData.resource,
            newFormData.eventDate,
            newFormData.startTime,
            newFormData.endTime
          );
          
          console.log('Auto-calculating price:', {
            resource: newFormData.resource,
            eventDate: newFormData.eventDate,
            startTime: newFormData.startTime,
            endTime: newFormData.endTime,
            calculatedRate: calculatedRate,
            currentTotal: prev.totalAmount
          });
          
          // Always auto-set the calculated rate when all required fields are present
          newFormData.totalAmount = calculatedRate;
        }
      }
      
      return newFormData;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Customer email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Invalid email format';
    }
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Customer phone is required';
    if (!formData.eventType.trim()) newErrors.eventType = 'Event type is required';
    if (!formData.resource) newErrors.resource = 'Resource is required';
    if (!formData.eventDate) newErrors.eventDate = 'Event date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    
    if (formData.startTime && formData.endTime) {
      const startTime = new Date(`2000-01-01T${formData.startTime}:00`);
      const endTime = new Date(`2000-01-01T${formData.endTime}:00`);
      if (endTime <= startTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }


    if (formData.totalAmount <= 0) {
      newErrors.totalAmount = 'Total amount must be greater than 0';
    }

    // Validate deposit fields
    if (formData.depositType === 'Fixed' && (!formData.depositValue || formData.depositValue <= 0)) {
      newErrors.depositValue = 'Deposit value is required and must be greater than 0 for Fixed deposit type';
    }

    if (formData.depositType === 'Percentage' && (!formData.depositValue || formData.depositValue <= 0 || formData.depositValue > 100)) {
      newErrors.depositValue = 'Deposit percentage must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        if (quotation) {
          // Update existing quotation
          await updateQuotation(quotation.id, formData, token);
        } else {
          // Create new quotation
          await createQuotation(formData, token);
        }
        onSave(formData);
      } catch (error) {
        console.error('Error saving quotation:', error);
        // Handle error - could show a toast or error message
      }
    }
  };

  const handleSend = async () => {
    if (validateForm()) {
      try {
        if (quotation) {
          // Update existing quotation and send
          await updateQuotation(quotation.id, { ...formData, status: 'Sent' }, token);
        } else {
          // Create new quotation and send
          await createQuotation({ ...formData, status: 'Sent' }, token);
        }
        onSend(formData);
      } catch (error) {
        console.error('Error sending quotation:', error);
        // Handle error - could show a toast or error message
      }
    }
  };

  const handleClose = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      eventType: '',
      resource: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      guestCount: '',
      totalAmount: 0,
      validUntil: '',
      notes: '',
      depositType: 'None',
      depositValue: 0
    });
    setErrors({});
    onClose();
  };

  return (
    <>
      <style>{`
        [data-radix-dialog-overlay] {
          backdrop-filter: blur(8px) !important;
          background-color: rgba(255, 255, 255, 0.02) !important;
        }
        [data-radix-dialog-content] {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          max-height: 90vh !important;
          margin: 0 !important;
        }
        @media (max-width: 640px) {
          [data-radix-dialog-content] {
            top: 2rem !important;
            left: 1rem !important;
            right: 1rem !important;
            transform: none !important;
            width: calc(100vw - 2rem) !important;
            max-height: calc(100vh - 4rem) !important;
          }
        }
      `}</style>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border-0 shadow-2xl mx-2 sm:mx-6 md:mx-8 my-4 sm:my-8">
        <DialogHeader>
          <DialogTitle>
            {quotation ? 'Edit Quotation' : 'Create New Quotation'}
          </DialogTitle>
          <DialogDescription>
            {quotation ? 'Update the quotation details below.' : 'Fill in the details to create a new quotation for a potential booking.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className={errors.customerName ? 'border-red-500' : ''}
                  />
                  {errors.customerName && (
                    <p className="text-sm text-red-500 mt-1">{errors.customerName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="customerEmail">Customer Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    className={errors.customerEmail ? 'border-red-500' : ''}
                  />
                  {errors.customerEmail && (
                    <p className="text-sm text-red-500 mt-1">{errors.customerEmail}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="customerPhone">Customer Phone *</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    className={errors.customerPhone ? 'border-red-500' : ''}
                  />
                  {errors.customerPhone && (
                    <p className="text-sm text-red-500 mt-1">{errors.customerPhone}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="guestCount">Guest Count</Label>
                  <Input
                    id="guestCount"
                    type="number"
                    value={formData.guestCount}
                    onChange={(e) => handleInputChange('guestCount', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="eventType">Event Type *</Label>
                  <Input
                    id="eventType"
                    value={formData.eventType}
                    onChange={(e) => handleInputChange('eventType', e.target.value)}
                    className={errors.eventType ? 'border-red-500' : ''}
                  />
                  {errors.eventType && (
                    <p className="text-sm text-red-500 mt-1">{errors.eventType}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="resource">Resource *</Label>
                  <Select value={formData.resource} onValueChange={(value) => handleInputChange('resource', value)}>
                    <SelectTrigger className={errors.resource ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.resource && (
                    <p className="text-sm text-red-500 mt-1">{errors.resource}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="eventDate">Event Date *</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => handleInputChange('eventDate', e.target.value)}
                    className={errors.eventDate ? 'border-red-500' : ''}
                  />
                  {errors.eventDate && (
                    <p className="text-sm text-red-500 mt-1">{errors.eventDate}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className={errors.startTime ? 'border-red-500' : ''}
                    />
                    {errors.startTime && (
                      <p className="text-sm text-red-500 mt-1">{errors.startTime}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className={errors.endTime ? 'border-red-500' : ''}
                    />
                    {errors.endTime && (
                      <p className="text-sm text-red-500 mt-1">{errors.endTime}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="totalAmount">Total Amount (AUD) *</Label>
                  <div className="relative">
                    <Input
                      id="totalAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.totalAmount}
                      onChange={(e) => handleInputChange('totalAmount', parseFloat(e.target.value) || 0)}
                      className={errors.totalAmount ? 'border-red-500' : ''}
                      placeholder="0.00"
                    />
                    {formData.totalAmount > 0 && formData.resource && formData.eventDate && formData.startTime && formData.endTime && (
                      <div className="absolute -top-6 right-0 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        ✓ Auto-calculated
                      </div>
                    )}
                    {formData.totalAmount === 0 && formData.resource && formData.eventDate && formData.startTime && formData.endTime && pricingData && pricingData.length === 0 && (
                      <div className="absolute -top-6 right-0 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        ⚠ No pricing data
                      </div>
                    )}
                  </div>
                  {errors.totalAmount && (
                    <p className="text-sm text-red-500 mt-1">{errors.totalAmount}</p>
                  )}
                  {formData.resource && formData.eventDate && formData.startTime && formData.endTime && (
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const calculatedRate = calculateResourceRate(
                            pricingData,
                            formData.resource,
                            formData.eventDate,
                            formData.startTime,
                            formData.endTime
                          );
                          console.log('Manual price calculation:', {
                            resource: formData.resource,
                            eventDate: formData.eventDate,
                            startTime: formData.startTime,
                            endTime: formData.endTime,
                            calculatedRate: calculatedRate
                          });
                          handleInputChange('totalAmount', calculatedRate);
                        }}
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Auto Calculate Price
                      </Button>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        Calculates based on resource pricing and event duration
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => handleInputChange('validUntil', e.target.value)}
                  />
                </div>
              </div>
              
              {/* Deposit Information */}
              <div className="border-t pt-4">
                <h4 className="text-md font-semibold mb-3">Deposit Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="depositType">Deposit Type</Label>
                    <Select value={formData.depositType} onValueChange={(value) => handleInputChange('depositType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select deposit type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Fixed">Fixed Amount</SelectItem>
                        <SelectItem value="Percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="depositValue">
                      {formData.depositType === 'Fixed' ? 'Deposit Amount (AUD)' : 
                       formData.depositType === 'Percentage' ? 'Deposit Percentage (%)' : 
                       'Deposit Value'}
                    </Label>
                    <Input
                      id="depositValue"
                      type="number"
                      min="0"
                      step={formData.depositType === 'Percentage' ? '1' : '0.01'}
                      max={formData.depositType === 'Percentage' ? '100' : undefined}
                      value={formData.depositValue}
                      onChange={(e) => handleInputChange('depositValue', parseFloat(e.target.value) || 0)}
                      className={errors.depositValue ? 'border-red-500' : ''}
                      placeholder={formData.depositType === 'Percentage' ? '0' : '0.00'}
                      disabled={formData.depositType === 'None'}
                    />
                    {errors.depositValue && (
                      <p className="text-sm text-red-500 mt-1">{errors.depositValue}</p>
                    )}
                  </div>
                </div>
                
                {/* Deposit Amount Display */}
                {formData.depositType !== 'None' && formData.depositValue > 0 && formData.totalAmount > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">Calculated Deposit Amount:</span>
                      <span className="text-lg font-bold text-blue-900">
                        ${calculateDepositAmount(formData.depositType, formData.depositValue, formData.totalAmount).toFixed(2)} AUD
                      </span>
                    </div>
                    {formData.depositType === 'Percentage' && (
                      <p className="text-xs text-blue-700 mt-1">
                        {formData.depositValue}% of ${formData.totalAmount.toFixed(2)} = ${calculateDepositAmount(formData.depositType, formData.depositValue, formData.totalAmount).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes or terms..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {quotation ? 'Update' : 'Save Draft'}
          </Button>
          <Button onClick={handleSend} disabled={isLoading} className="w-full sm:w-auto">
            <Send className="h-4 w-4 mr-2" />
            {quotation ? 'Resend' : 'Send to Customer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default QuotationForm;
