
import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { GreenCheckbox } from '@/components/ui/green-checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, Shield, Users, UserPlus, Settings, Eye, EyeOff, Key, Search, RefreshCw } from 'lucide-react';

export default function SettingsRoles() {
  const { user, isHallOwner, getToken } = useAuth();
  const [subUsers, setSubUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
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
  
  // Password change states
  const [passwordChangeDialogOpen, setPasswordChangeDialogOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
      const response = await fetch(`/api/users/sub-users/${user.id}`, {
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

  const filteredSubUsers = subUsers.filter((u) => {
    const matchesSearch = searchTerm
      ? (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesStatus = statusFilter === 'all' ? true : (u.status || 'active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) return;

    setIsSubmitting(true);
    try {
      const token = getToken();
      const response = await fetch('/api/users', {
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
      const response = await fetch(`/api/users/sub-users/${editingUser.id}`, {
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
      const response = await fetch(`/api/users/${selectedUser.id}`, {          
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

  const openPasswordChangeDialog = (user) => {
    setSelectedUserForPassword(user);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMessage({ type: '', text: '' });
    setPasswordChangeDialogOpen(true);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!selectedUserForPassword) return;

    setIsChangingPassword(true);
    setPasswordMessage({ type: '', text: '' });

    try {
      // Validate form
      if (!newPassword || !confirmPassword) {
        setPasswordMessage({ type: 'error', text: '🔍 Please fill in both password fields.' });
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordMessage({ type: 'error', text: '🔄 Oops! Your passwords don\'t match. Try typing them again.' });
        return;
      }

      if (newPassword.length < 6) {
        setPasswordMessage({ type: 'error', text: '💪 The new password needs to be at least 6 characters long for security.' });
        return;
      }

      // Call backend API to change sub-user password
      const token = getToken();
      const response = await fetch(`/api/users/change-sub-user-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subUserId: selectedUserForPassword.id,
          newPassword: newPassword
        })
      });

      if (response.ok) {
        setPasswordMessage({ type: 'success', text: '🎉 Password changed successfully for ' + selectedUserForPassword.name + '!' });
        
        // Clear form and close dialog after success
        setTimeout(() => {
          setPasswordChangeDialogOpen(false);
          setSelectedUserForPassword(null);
          setNewPassword('');
          setConfirmPassword('');
          setPasswordMessage({ type: '', text: '' });
        }, 2000);
      } else {
        const errorData = await response.json();
        setPasswordMessage({ type: 'error', text: '😅 ' + (errorData.message || 'Failed to change password. Please try again.') });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordMessage({ type: 'error', text: '😅 Something went wrong while changing the password. Please try again.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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
      {/* Header - creative card style */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-blue-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative flex items-center justify-between gap-3 sm:gap-4 lg:gap-6">
          <div className="space-y-2 sm:space-y-3 flex-1">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg w-fit">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Roles & Permissions
                </h1>
                <p className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base mt-1">
                  Manage sub-user accounts and their access permissions
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setAddUserDialogOpen(true)}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-gray-800"
              variant="outline"
            >
              <UserPlus className="h-4 w-4" />
              Add Sub-User
            </Button>
          </div>
        </div>
      </section>

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

      {/* Filter Bar */}
      <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search name or email..."
                className="pl-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px] border-gray-200 focus:border-blue-300 focus:ring-blue-200 text-sm">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                className="border-gray-200 hover:bg-gray-50 text-sm px-3 sm:px-4"
              >
                Clear
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchSubUsers}
                className="relative overflow-hidden group"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-Users Cards */}
      {filteredSubUsers.length === 0 ? (
        <Card className="border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 bg-gray-100 rounded-full">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No sub-users found</h3>
                <p className="text-gray-600">Try adjusting your search or filters.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredSubUsers.map((subUser, index) => (
            <div key={subUser.id} className="group border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm rounded-lg">
              <div className="p-4 sm:p-6">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm text-white">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                        {subUser.name || 'No name'}
                      </h3>
                      <div className="text-xs text-gray-500 truncate">{subUser.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-blue-50"
                      onClick={() => openEditDialog(subUser)}
                      title="Edit user"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-indigo-50"
                      onClick={() => openPasswordChangeDialog(subUser)}
                      title="Change password"
                    >
                      <Key className="h-4 w-4 text-indigo-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-red-50"
                      onClick={() => openDeleteDialog(subUser)}
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge 
                      variant={subUser.status === 'active' ? 'default' : 'secondary'}
                      className={subUser.status === 'active' 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-gray-100 text-gray-800 border-gray-200'}
                    >
                      {subUser.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div>
                    <span className="block text-sm text-gray-600 mb-1">Permissions</span>
                    {subUser.permissions && subUser.permissions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {subUser.permissions.slice(0, 4).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {availablePermissions.find(p => p.id === permission)?.name || permission}
                          </Badge>
                        ))}
                        {subUser.permissions.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{subUser.permissions.length - 4} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No permissions assigned</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span>Created</span>
                    <span>{subUser.createdAt ? new Date(subUser.createdAt.seconds * 1000).toLocaleDateString() : '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                    <GreenCheckbox
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
                    <GreenCheckbox
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

      {/* Change Password Dialog */}
      <Dialog open={passwordChangeDialogOpen} onOpenChange={setPasswordChangeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {selectedUserForPassword && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{selectedUserForPassword.name || 'No name'}</p>
                <p className="text-sm text-gray-500">{selectedUserForPassword.email}</p>
              </div>
            )}

            {passwordMessage.text && (
              <div className={`p-3 rounded-md ${
                passwordMessage.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {passwordMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password *</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordChangeDialogOpen(false)}
                disabled={isChangingPassword}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isChangingPassword}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}