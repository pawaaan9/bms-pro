import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function Resources() {
  const { user, isHallOwner, loading: authLoading } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const [newResource, setNewResource] = useState({
    name: '',
    type: 'hall',
    capacity: 0
  });

  // Fetch resources on component mount
  useEffect(() => {
    if (isHallOwner() && user) {
      fetchResources();
    }
  }, [isHallOwner, user]);

  // Filter resources based on search
  useEffect(() => {
    let filteredResources = resources;
    
    if (search) {
      filteredResources = filteredResources.filter(resource =>
        resource.name.toLowerCase().includes(search.toLowerCase()) ||
        resource.code.toLowerCase().includes(search.toLowerCase()) ||
        resource.type.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFiltered(filteredResources);
  }, [search, resources]);

  const fetchResources = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
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
        setFiltered(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch resources');
      }
    } catch (err) {
      setError('Failed to fetch resources');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddResource = () => {
    setNewResource({ name: '', type: 'hall', capacity: 0 });
    setShowAddModal(true);
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setShowEditModal(true);
  };

  const handleDeleteResource = (resource) => {
    setResourceToDelete(resource);
    setShowDeleteModal(true);
  };

  const handleSubmitResource = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingResource 
        ? `http://localhost:5000/api/resources/${editingResource.id}`
        : 'http://localhost:5000/api/resources';
      
      const method = editingResource ? 'PUT' : 'POST';
      const data = editingResource ? editingResource : newResource;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setSuccessMessage(editingResource ? 'Resource updated successfully!' : 'Resource created successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Refresh resources list
        await fetchResources();
        
        // Close modal and reset
        setShowAddModal(false);
        setShowEditModal(false);
        setEditingResource(null);
        setNewResource({ name: '', type: 'hall', capacity: 0 });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save resource');
      }
    } catch (err) {
      setError('Failed to save resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteResource = async () => {
    if (!resourceToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/resources/${resourceToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccessMessage('Resource deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Refresh resources list
        await fetchResources();
        
        // Close modal and reset
        setShowDeleteModal(false);
        setResourceToDelete(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete resource');
      }
    } catch (err) {
      setError('Failed to delete resource');
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

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="h-8 w-8 animate-spin mx-auto mb-2" />
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
          <p className="text-sm text-gray-500 mt-2">Only Hall Owners can manage resources.</p>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Building2 className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading resources...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center text-red-600">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>{error}</p>
        <Button 
          onClick={fetchResources} 
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
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-blue-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 lg:gap-6">
          <div className="space-y-2 sm:space-y-3 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 lg:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg w-fit">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Resources
                </h1>
                <p className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base mt-1">
                  Manage your hall's resources including halls, rooms, and outdoor spaces
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 lg:gap-4 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-1 sm:gap-2">
                <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                <span>Hall Management</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Home className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                <span>Room & Outdoor Spaces</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchResources(true)}
              disabled={refreshing}
              className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              onClick={handleAddResource} 
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm sm:text-base">Add Resource</span>
            </Button>
          </div>
        </div>
      </header>

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
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="group border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
            <CardContent className="pt-4 p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 truncate">Total Resources</p>
                  <p className="text-lg font-bold text-blue-600 mt-1">{resources.length}</p>
                </div>
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg flex-shrink-0 ml-2">
                  <Building2 className="h-4 w-4 text-white" />
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
          <Card className="group border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100">
            <CardContent className="pt-4 p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 truncate">Halls</p>
                  <p className="text-lg font-bold text-green-600 mt-1">
                    {resources.filter(r => r.type === 'hall').length}
                  </p>
                </div>
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg flex-shrink-0 ml-2">
                  <Building2 className="h-4 w-4 text-white" />
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
          <Card className="group border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100">
            <CardContent className="pt-4 p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 truncate">Rooms</p>
                  <p className="text-lg font-bold text-purple-600 mt-1">
                    {resources.filter(r => r.type === 'room').length}
                  </p>
                </div>
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg flex-shrink-0 ml-2">
                  <Home className="h-4 w-4 text-white" />
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
          <Card className="group border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100">
            <CardContent className="pt-4 p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 truncate">Outdoor</p>
                  <p className="text-lg font-bold text-orange-600 mt-1">
                    {resources.filter(r => r.type === 'outdoor').length}
                  </p>
                </div>
                <div className="p-2 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg shadow-lg flex-shrink-0 ml-2">
                  <TreePine className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Search Section */}
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
                  placeholder="Search resources..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Resources Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {filtered.length === 0 ? (
          <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="p-4 bg-gray-100 rounded-full">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {search ? 'No resources found' : 'No resources yet'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {search ? 'Try adjusting your search terms.' : 'Get started by adding your first resource.'}
                  </p>
                  {!search && (
                    <Button 
                      onClick={handleAddResource} 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Resource
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="group border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm h-full flex flex-col">
                  <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg shadow-sm ${
                          resource.type === 'hall' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                          resource.type === 'room' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                          'bg-gradient-to-r from-orange-500 to-yellow-600'
                        }`}>
                          <div className="text-white">
                            {getTypeIcon(resource.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                            {resource.name}
                          </h3>
                          <Badge 
                            variant={getTypeBadgeVariant(resource.type)}
                            className={`text-xs font-semibold px-2 py-1 border mt-1 ${getTypeBadgeStyle(resource.type)}`}
                          >
                            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-blue-50"
                          onClick={() => handleEditResource(resource)}
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-red-50"
                          onClick={() => handleDeleteResource(resource)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>

                    {/* Resource Details */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Code</span>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                          {resource.code}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Capacity</span>
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">
                          {resource.capacity} people
                        </span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Resource ID: {resource.id}</span>
                        <span className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            resource.type === 'hall' ? 'bg-blue-500' :
                            resource.type === 'room' ? 'bg-green-500' :
                            'bg-orange-500'
                          }`}></div>
                          Active
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Resource Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="w-[90vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Add New Resource</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitResource} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newResource.name}
                onChange={e => setNewResource(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter resource name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select 
                value={newResource.type} 
                onValueChange={value => setNewResource(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hall">Hall</SelectItem>
                  <SelectItem value="room">Room</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                min="0"
                value={newResource.capacity}
                onChange={e => setNewResource(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                placeholder="Enter capacity"
                required
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
                {isSubmitting ? 'Creating...' : 'Create Resource'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Resource Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="w-[90vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
          </DialogHeader>
          {editingResource && (
            <form onSubmit={handleSubmitResource} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={editingResource.name}
                  onChange={e => setEditingResource(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter resource name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-type">Type *</Label>
                <Select 
                  value={editingResource.type} 
                  onValueChange={value => setEditingResource(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hall">Hall</SelectItem>
                    <SelectItem value="room">Room</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-capacity">Capacity *</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  min="0"
                  value={editingResource.capacity}
                  onChange={e => setEditingResource(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter capacity"
                  required
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <Label className="text-sm font-medium text-gray-600">Resource Code</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="font-mono text-sm">{editingResource.code}</span>
                  <Badge variant="secondary" className="text-xs">Auto-generated</Badge>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingResource(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Resource'}
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
            <DialogTitle>Delete Resource</DialogTitle>
          </DialogHeader>
          
          {resourceToDelete && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Warning</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  This action cannot be undone. The resource "{resourceToDelete.name}" will be permanently deleted.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-md p-3">
                <div className="flex items-center gap-2">
                  {getTypeIcon(resourceToDelete.type)}
                  <div>
                    <p className="font-medium">{resourceToDelete.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        <Hash className="h-3 w-3 mr-1" />
                        {resourceToDelete.code}
                      </Badge>
                      <Badge 
                        variant={getTypeBadgeVariant(resourceToDelete.type)} 
                        className={`text-xs font-semibold px-2 py-1 border ${getTypeBadgeStyle(resourceToDelete.type)}`}
                      >
                        {resourceToDelete.type}
                      </Badge>
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
                setResourceToDelete(null);
              }}
              className="flex-1 sm:flex-none sm:px-4"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteResource}
              className="flex-1 sm:flex-none sm:px-4"
            >
              Delete Resource
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
