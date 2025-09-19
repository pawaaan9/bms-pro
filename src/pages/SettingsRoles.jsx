
import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, Shield, Users, UserPlus, Settings, Eye, EyeOff } from 'lucide-react';

export default function SettingsRoles() {
  const { user, isHallOwner, getToken } = useAuth();
  const [subUsers, setSubUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Dialog states
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    permissions: [],
    status: 'active'
  });
  const [editingUser, setEditingUser] = useState({
    id: '',
    name: '',
    email: '',
    permissions: [],
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available permissions
  const availablePermissions = [
    { id: 'dashboard', name: 'Dashboard', description: 'Access to dashboard overview' },
    { id: 'calendar', name: 'Calendar', description: 'View and manage calendar' },
    { id: 'bookings', name: 'Bookings', description: 'Manage all bookings' },
    { id: 'invoices', name: 'Invoices & Payments', description: 'Manage invoices and payments' },
    { id: 'resources', name: 'Resources', description: 'Manage hall resources' },
    { id: 'pricing', name: 'Pricing', description: 'Manage pricing and rate cards' },
    { id: 'customers', name: 'Customers', description: 'Manage customer information' },
    { id: 'reports', name: 'Reports', description: 'View and generate reports' },
    { id: 'comms', name: 'Comms', description: 'Manage communications' },
    { id: 'settings', name: 'Settings', description: 'Access system settings' },
    { id: 'audit', name: 'Audit Log', description: 'View audit logs' },
    { id: 'help', name: 'Help', description: 'Access help documentation' }
  ];

  // Fetch sub-users on component mount
  useEffect(() => {
    if (isHallOwner() && user?.id) {
      fetchSubUsers();
    }
  }, [isHallOwner, user]);

  const fetchSubUsers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/users/sub-users/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure all sub-users have a status, default to 'active' if not set
        const usersWithStatus = data.map(user => ({
          ...user,
          status: user.status || 'active'
        }));
        setSubUsers(usersWithStatus);
      } else {
        setError('Failed to fetch sub-users');
      }
    } catch (err) {
      setError('Failed to fetch sub-users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) return;

    setIsSubmitting(true);
    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: 'sub_user',
          parentUserId: user.id,
          permissions: newUser.permissions,
          status: newUser.status
        })
      });

      if (response.ok) {
        setSuccessMessage('Sub-user created successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setNewUser({ name: '', email: '', password: '', permissions: [], status: 'active' });
        setAddUserDialogOpen(false);
        fetchSubUsers(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create sub-user');
      }
    } catch (err) {
      setError('Failed to create sub-user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/users/sub-users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editingUser.name,
          permissions: editingUser.permissions,
          status: editingUser.status
        })
      });

      if (response.ok) {
        setSuccessMessage('Sub-user updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setEditUserDialogOpen(false);
        setEditingUser({ id: '', name: '', email: '', permissions: [], status: 'active' });
        fetchSubUsers(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update sub-user');
      }
    } catch (err) {
      setError('Failed to update sub-user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccessMessage('Sub-user deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setDeleteUserDialogOpen(false);
        setSelectedUser(null);
        fetchSubUsers(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete sub-user');
      }
    } catch (err) {
      setError('Failed to delete sub-user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermissionChange = (permissionId, checked, isEditing = false) => {
    if (isEditing) {
      setEditingUser(prev => ({
        ...prev,
        permissions: checked 
          ? [...prev.permissions, permissionId]
          : prev.permissions.filter(p => p !== permissionId)
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        permissions: checked 
          ? [...prev.permissions, permissionId]
          : prev.permissions.filter(p => p !== permissionId)
      }));
    }
  };

  const openEditDialog = (user) => {
    setEditingUser({
      id: user.id,
      name: user.name || '',
      email: user.email,
      permissions: user.permissions || [],
      status: user.status || 'active'
    });
    setEditUserDialogOpen(true);
  };

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setDeleteUserDialogOpen(true);
  };

  // Show access denied for non-hall owners
  if (!isHallOwner()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page.</p>
          <p className="text-sm text-gray-500 mt-2">Only Hall Owners can manage sub-users.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading sub-users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-gray-600 mt-1">Manage sub-user accounts and their access permissions.</p>
        </div>
        <Button onClick={() => setAddUserDialogOpen(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Sub-User
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {successMessage}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            {error}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Sub-Users</p>
                <p className="text-2xl font-bold text-blue-900">{subUsers.length}</p>
              </div>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Users</p>
                <p className="text-2xl font-bold text-green-900">
                  {subUsers.filter(user => user.status === 'active').length}
                </p>
              </div>
              <div className="p-2 bg-green-500 rounded-lg">
                <Eye className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Inactive Users</p>
                <p className="text-2xl font-bold text-purple-900">
                  {subUsers.filter(user => user.status === 'inactive').length}
                </p>
              </div>
              <div className="p-2 bg-purple-500 rounded-lg">
                <EyeOff className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No sub-users found.</p>
                      <p className="text-sm text-muted-foreground">Create your first sub-user to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                subUsers.map((subUser) => (
                  <TableRow key={subUser.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {subUser.name || 'No name'}
                    </TableCell>
                    <TableCell>
                      {subUser.email}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={subUser.status === 'active' ? 'default' : 'secondary'}
                        className={subUser.status === 'active' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                        }
                      >
                        {subUser.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {subUser.permissions?.slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {availablePermissions.find(p => p.id === permission)?.name || permission}
                          </Badge>
                        ))}
                        {subUser.permissions?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{subUser.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {subUser.createdAt ? new Date(subUser.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => openEditDialog(subUser)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => openDeleteDialog(subUser)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Add Sub-User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Sub-User
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter secure password"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Permissions</h3>
              <p className="text-sm text-gray-600">Select which pages and features this sub-user can access.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.id}
                      checked={newUser.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => handlePermissionChange(permission.id, checked)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={permission.id} className="text-sm font-medium">
                        {permission.name}
                      </Label>
                      <p className="text-xs text-gray-500">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddUserDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Sub-User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Sub-User Dialog */}
      <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Sub-User
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editName">Full Name *</Label>
                  <Input
                    id="editName"
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editEmail">Email Address</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editingUser.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed after creation</p>
                </div>
                <div>
                  <Label htmlFor="editStatus">Status</Label>
                  <select
                    id="editStatus"
                    value={editingUser.status}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Permissions</h3>
              <p className="text-sm text-gray-600">Select which pages and features this sub-user can access.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${permission.id}`}
                      checked={editingUser.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => handlePermissionChange(permission.id, checked, true)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`edit-${permission.id}`} className="text-sm font-medium">
                        {permission.name}
                      </Label>
                      <p className="text-xs text-gray-500">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditUserDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Sub-User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Sub-User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this sub-user? This action cannot be undone.
            </p>
            {selectedUser && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{selectedUser.name || 'No name'}</p>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                <p className="text-sm text-gray-500">
                  {selectedUser.permissions?.length || 0} permissions assigned
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteUserDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Sub-User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}