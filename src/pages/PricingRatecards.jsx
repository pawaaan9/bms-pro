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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Pricing</h1>
          <p className="text-muted-foreground mt-1">
            Set and update pricing rates for your resources. Choose between hourly or daily rates.
          </p>
        </div>
        {resources.length > 0 && (
          <Button onClick={handleAddPricing} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Pricing
          </Button>
        )}
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

      {/* Statistics Box */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Pricing</p>
                <p className="text-2xl font-bold text-blue-900">{pricing.length}</p>
              </div>
              <div className="p-2 bg-blue-500 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Hourly Rates</p>
                <p className="text-2xl font-bold text-green-900">
                  {pricing.filter(p => p.rateType === 'hourly').length}
                </p>
              </div>
              <div className="p-2 bg-green-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Daily Rates</p>
                <p className="text-2xl font-bold text-purple-900">
                  {pricing.filter(p => p.rateType === 'daily').length}
                </p>
              </div>
              <div className="p-2 bg-purple-500 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Resources</p>
                <p className="text-2xl font-bold text-orange-900">{resources.length}</p>
              </div>
              <div className="p-2 bg-orange-500 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pricing..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rate Type</TableHead>
                <TableHead className="text-right">Weekday Rate</TableHead>
                <TableHead className="text-right">Weekend Rate</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <DollarSign className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {search ? 'No pricing found matching your search.' : 'No pricing found.'}
                      </p>
                      {!search && resources.length > 0 && (
                        <Button onClick={handleAddPricing} className="mt-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Pricing
                        </Button>
                      )}
                      {!search && resources.length === 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Please add resources first before setting up pricing.
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(item => {
                  const resource = resources.find(r => r.id === item.resourceId);
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {resource && getTypeIcon(resource.type)}
                          {item.resourceName}
                        </div>
                      </TableCell>
                      <TableCell>
                        {resource ? (
                          <Badge variant={getTypeBadgeVariant(resource.type)}>
                            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRateTypeBadgeVariant(item.rateType)}>
                          <div className="flex items-center gap-1">
                            {getRateTypeIcon(item.rateType)}
                            {item.rateType}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono">{item.weekdayRate.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono">{item.weekendRate.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        <span className="text-sm text-muted-foreground">
                          {item.description || 'No description'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditPricing(item)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDeletePricing(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                      <Badge variant={getRateTypeBadgeVariant(pricingToDelete.rateType)} className="text-xs">
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