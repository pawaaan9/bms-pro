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
  CheckCircle
} from 'lucide-react';
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
        setFiltered(data);
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground mt-1">
            Manage your hall's resources including halls, rooms, and outdoor spaces.
          </p>
        </div>
        <Button onClick={handleAddResource} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Resource
        </Button>
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
                <p className="text-sm font-medium text-blue-600">Total Resources</p>
                <p className="text-2xl font-bold text-blue-900">{resources.length}</p>
              </div>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Halls</p>
                <p className="text-2xl font-bold text-green-900">
                  {resources.filter(r => r.type === 'hall').length}
                </p>
              </div>
              <div className="p-2 bg-green-500 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Rooms</p>
                <p className="text-2xl font-bold text-purple-900">
                  {resources.filter(r => r.type === 'room').length}
                </p>
              </div>
              <div className="p-2 bg-purple-500 rounded-lg">
                <Home className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Outdoor</p>
                <p className="text-2xl font-bold text-orange-900">
                  {resources.filter(r => r.type === 'outdoor').length}
                </p>
              </div>
              <div className="p-2 bg-orange-500 rounded-lg">
                <TreePine className="h-5 w-5 text-white" />
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
                placeholder="Search resources..."
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
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Capacity</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {search ? 'No resources found matching your search.' : 'No resources found.'}
                      </p>
                      {!search && (
                        <Button onClick={handleAddResource} className="mt-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Resource
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(resource => (
                  <TableRow key={resource.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(resource.type)}
                        {resource.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        <Hash className="h-3 w-3 mr-1" />
                        {resource.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(resource.type)}>
                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">{resource.capacity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditResource(resource)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteResource(resource)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                      <Badge variant={getTypeBadgeVariant(resourceToDelete.type)} className="text-xs">
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
