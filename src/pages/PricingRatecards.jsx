import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Building2, 
  Home, 
  TreePine,
  Users,
  Hash,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Clock,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PricingRatecards() {
  const { user, isHallOwner, loading: authLoading } = useAuth();
  const [resources, setResources] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pricingToDelete, setPricingToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state for adding/editing pricing
  const [formData, setFormData] = useState({
    resourceId: '',
    resourceName: '',
    rateType: 'hourly',
    weekdayRate: '',
    weekendRate: '',
    description: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    if (isHallOwner() && user) {
      fetchResources();
      fetchPricing();
    }
  }, [isHallOwner, user]);

  // Filter pricing based on search
  useEffect(() => {
    let filteredPricing = pricing;
    
    if (search) {
      filteredPricing = filteredPricing.filter(item =>
        item.resourceName.toLowerCase().includes(search.toLowerCase()) ||
        item.rateType.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFiltered(filteredPricing);
  }, [search, pricing]);

  // API functions
  const fetchResources = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/resources', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch resources');
      }
    } catch (err) {
      setError('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const fetchPricing = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pricing', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPricing(data);
        setFiltered(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch pricing');
      }
    } catch (err) {
      setError('Failed to fetch pricing');
    }
  };

  const handleAddPricing = () => {
    setFormData({
      resourceId: '',
      resourceName: '',
      rateType: 'hourly',
      weekdayRate: '',
      weekendRate: '',
      description: ''
    });
    setShowAddModal(true);
  };

  const handleEditPricing = (pricingItem) => {
    setEditingPricing(pricingItem);
    setFormData({
      resourceId: pricingItem.resourceId,
      resourceName: pricingItem.resourceName,
      rateType: pricingItem.rateType,
      weekdayRate: pricingItem.weekdayRate.toString(),
      weekendRate: pricingItem.weekendRate.toString(),
      description: pricingItem.description || ''
    });
    setShowEditModal(true);
  };

  const handleDeletePricing = (pricingItem) => {
    setPricingToDelete(pricingItem);
    setShowDeleteModal(true);
  };

  const handleSubmitPricing = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingPricing 
        ? `http://localhost:5000/api/pricing/${editingPricing.id}`
        : 'http://localhost:5000/api/pricing';
      
      const method = editingPricing ? 'PUT' : 'POST';
      const pricingData = {
        ...formData,
        weekdayRate: parseFloat(formData.weekdayRate),
        weekendRate: parseFloat(formData.weekendRate)
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pricingData)
      });

      if (response.ok) {
        setSuccessMessage(editingPricing ? 'Pricing updated successfully!' : 'Pricing created successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Refresh pricing list
        await fetchPricing();
        
        // Close modal and reset
        setShowAddModal(false);
        setShowEditModal(false);
        setEditingPricing(null);
        setFormData({
          resourceId: '',
          resourceName: '',
          rateType: 'hourly',
          weekdayRate: '',
          weekendRate: '',
          description: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save pricing');
      }
    } catch (err) {
      setError('Failed to save pricing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeletePricing = async () => {
    if (!pricingToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pricing/${pricingToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccessMessage('Pricing deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Refresh pricing list
        await fetchPricing();
        
        // Close modal and reset
        setShowDeleteModal(false);
        setPricingToDelete(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete pricing');
      }
    } catch (err) {
      setError('Failed to delete pricing');
    }
  };


  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'hall':
        return <Building2 className="h-4 w-4" />;
      case 'room':
        return <Home className="h-4 w-4" />;
      case 'outdoor':
        return <TreePine className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (type) => {
    switch (type.toLowerCase()) {
      case 'hall':
        return 'default';
      case 'room':
        return 'secondary';
      case 'outdoor':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getTypeBadgeStyle = (type) => {
    switch (type.toLowerCase()) {
      case 'hall':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'room':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'outdoor':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRateTypeIcon = (rateType) => {
    return rateType === 'hourly' ? <Clock className="h-4 w-4" /> : <Calendar className="h-4 w-4" />;
  };

  const getRateTypeBadgeVariant = (rateType) => {
    return rateType === 'hourly' ? 'default' : 'secondary';
  };

  // Form handlers
  const handleResourceSelect = (resourceId) => {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
      setFormData(prev => ({
        ...prev,
        resourceId: resourceId,
        resourceName: resource.name
      }));
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <DollarSign className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied for non-hall owners
  if (!isHallOwner()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page.</p>
          <p className="text-sm text-gray-500 mt-2">Only Hall Owners can manage pricing.</p>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <DollarSign className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading pricing...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center text-red-600">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>{error}</p>
        <Button 
          onClick={() => {
            fetchResources();
            fetchPricing();
          }} 
          variant="outline" 
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-blue-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg w-fit">
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Resource Pricing
                </h1>
                <p className="text-gray-600 font-medium text-sm sm:text-base mt-1">
                  Set and update pricing rates for your resources
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Hourly Rates</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <span>Daily Rates</span>
              </div>
            </div>
          </div>
          {resources.length > 0 && (
            <Button 
              onClick={handleAddPricing} 
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto px-6 py-3"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm sm:text-base">Add Pricing</span>
            </Button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {successMessage}
          </div>
        </div>
      )}


      {/* Search Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <div className="relative flex-1">
              <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <Input
                placeholder="Search pricing by resource name, rate type, or description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base border border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 rounded-lg"
              />
            </div>
            {search && (
              <Button 
                variant="outline" 
                onClick={() => setSearch('')}
                className="h-10 sm:h-12 px-4 sm:px-6 border border-gray-200 hover:border-gray-300 rounded-lg text-sm sm:text-base whitespace-nowrap"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Creative Pricing Cards */}
      {filtered.length === 0 ? (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            <div className="flex flex-col items-center gap-4 sm:gap-6 text-center">
              <div className="p-4 sm:p-6 bg-gray-100 rounded-2xl">
                <DollarSign className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {search ? 'No pricing found' : 'No pricing set up yet'}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-md">
                  {search 
                    ? 'Try adjusting your search terms to find what you\'re looking for.'
                    : 'Start by adding pricing for your resources to manage rates effectively.'
                  }
                </p>
                {!search && resources.length > 0 && (
                  <Button 
                    onClick={handleAddPricing} 
                    className="gap-2 sm:gap-3 mt-4 sm:mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base lg:text-lg w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    Add Your First Pricing
                  </Button>
                )}
                {!search && resources.length === 0 && (
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-700 font-medium text-sm sm:text-base">
                      Please add resources first before setting up pricing.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map(item => {
            const resource = resources.find(r => r.id === item.resourceId);
            const isHourly = item.rateType === 'hourly';
            
            return (
              <Card key={item.id} className="group border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white h-full flex flex-col">
                <CardContent className="p-4 sm:p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl shadow-lg ${
                        isHourly 
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                          : 'bg-gradient-to-br from-green-500 to-emerald-600'
                      }`}>
                        {resource && (
                          <div className="text-white">
                            {getTypeIcon(resource.type)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                          {item.resourceName}
                        </h3>
                        {resource && (
                          <Badge 
                            variant={getTypeBadgeVariant(resource.type)} 
                            className={`mt-1 text-xs font-semibold px-2 py-1 border ${getTypeBadgeStyle(resource.type)}`}
                          >
                            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-3 text-xs font-medium bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                        onClick={() => handleEditPricing(item)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-3 text-xs font-medium bg-white/80 backdrop-blur-sm border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        onClick={() => handleDeletePricing(item)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Rate Type Badge */}
                  <div className="mb-4">
                    <Badge 
                      variant={getRateTypeBadgeVariant(item.rateType)} 
                      className={`gap-2 px-3 py-2 text-xs font-semibold ${
                        isHourly 
                          ? 'bg-blue-100 text-blue-700 border-blue-200' 
                          : 'bg-green-100 text-green-700 border-green-200'
                      }`}
                    >
                      {getRateTypeIcon(item.rateType)}
                      {item.rateType.charAt(0).toUpperCase() + item.rateType.slice(1)} Rate
                    </Badge>
                  </div>

                  {/* Pricing Display */}
                  <div className="space-y-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-100 rounded">
                            <Calendar className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="text-sm font-semibold text-green-800">Weekday Rate</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-bold text-lg text-green-700">${item.weekdayRate.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-orange-100 rounded">
                            <Calendar className="h-3 w-3 text-orange-600" />
                          </div>
                          <span className="text-sm font-semibold text-orange-800">Weekend Rate</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-orange-600" />
                          <span className="font-bold text-lg text-orange-700">${item.weekendRate.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  )}

                  {/* Resource Info */}
                  {resource && (
                    <div className="pt-3 border-t border-gray-200 mt-auto">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="p-1 bg-gray-100 rounded">
                          <Users className="h-3 w-3" />
                        </div>
                        <span className="font-medium">Capacity: {resource.capacity} people</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Pricing Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="w-[90vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Add New Pricing</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitPricing} className="space-y-4">
            <div>
              <Label htmlFor="resource">Resource *</Label>
              <Select 
                value={formData.resourceId} 
                onValueChange={handleResourceSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(resource.type)}
                        {resource.name} ({resource.type}) - {resource.capacity} capacity
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="rateType">Rate Type *</Label>
              <Select 
                value={formData.rateType} 
                onValueChange={value => setFormData(prev => ({ ...prev, rateType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Hourly Rate
                    </div>
                  </SelectItem>
                  <SelectItem value="daily">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Daily Rate
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weekdayRate">Weekday Rate ($) *</Label>
                <Input
                  id="weekdayRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weekdayRate}
                  onChange={e => setFormData(prev => ({ ...prev, weekdayRate: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="weekendRate">Weekend Rate ($) *</Label>
                <Input
                  id="weekendRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weekendRate}
                  onChange={e => setFormData(prev => ({ ...prev, weekendRate: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional notes about this pricing..."
                rows="3"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Pricing'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Pricing Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="w-[90vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Pricing</DialogTitle>
          </DialogHeader>
          {editingPricing && (
            <form onSubmit={handleSubmitPricing} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <Label className="text-sm font-medium text-gray-600">Resource</Label>
                <div className="flex items-center gap-2 mt-1">
                  {editingPricing.resourceName && (
                    <>
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{editingPricing.resourceName}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-rateType">Rate Type *</Label>
                <Select 
                  value={formData.rateType} 
                  onValueChange={value => setFormData(prev => ({ ...prev, rateType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Hourly Rate
                      </div>
                    </SelectItem>
                    <SelectItem value="daily">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Daily Rate
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-weekdayRate">Weekday Rate ($) *</Label>
                  <Input
                    id="edit-weekdayRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weekdayRate}
                    onChange={e => setFormData(prev => ({ ...prev, weekdayRate: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-weekendRate">Weekend Rate ($) *</Label>
                  <Input
                    id="edit-weekendRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weekendRate}
                    onChange={e => setFormData(prev => ({ ...prev, weekendRate: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional notes about this pricing..."
                  rows="3"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPricing(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Pricing'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="w-[90vw] max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Delete Pricing</DialogTitle>
          </DialogHeader>
          
          {pricingToDelete && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Warning</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  This action cannot be undone. The pricing for "{pricingToDelete.resourceName}" will be permanently deleted.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{pricingToDelete.resourceName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={getRateTypeBadgeVariant(pricingToDelete.rateType)} 
                        className={`text-xs font-semibold px-2 py-1 border ${
                          pricingToDelete.rateType === 'hourly' 
                            ? 'bg-blue-100 text-blue-800 border-blue-200' 
                            : 'bg-green-100 text-green-800 border-green-200'
                        }`}
                      >
                        {pricingToDelete.rateType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ${pricingToDelete.weekdayRate} / ${pricingToDelete.weekendRate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setPricingToDelete(null);
              }}
              className="flex-1 sm:flex-none sm:px-4"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeletePricing}
              className="flex-1 sm:flex-none sm:px-4"
            >
              Delete Pricing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}