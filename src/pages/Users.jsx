import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Filter, Users as UsersIcon, Plus, Mail, Lock, Building2, MapPin, User, Shield, Home } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'hall_owner',
    hallName: '',
    address: {
      line1: '',
      line2: '',
      postcode: '',
      state: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('super_admin'); // This should come from auth context

  useEffect(() => {
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch users');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filteredUsers = users;
    
    // Apply search filter
    if (search) {
      filteredUsers = filteredUsers.filter(u =>
        (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.role || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.hallName || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.address?.line1 || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.address?.line2 || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.address?.postcode || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.address?.state || '').toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply role filter
    if (selectedRole !== 'All Roles') {
      filteredUsers = filteredUsers.filter(u => u.role === selectedRole);
    }
    
    // Apply active filter (assuming users with email are active)
    if (showActiveOnly) {
      filteredUsers = filteredUsers.filter(u => u.email);
    }
    
    setFiltered(filteredUsers);
  }, [search, users, selectedRole, showActiveOnly]);

  const getRoleBadgeVariant = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'staff': return 'secondary';
      default: return 'outline';
    }
  };

  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccessMessage('User deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Refresh users list
        const updatedUsers = await fetch('http://localhost:5000/api/users').then(res => res.json());
        setUsers(updatedUsers);
        setFiltered(updatedUsers);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userData = {
        email: editingUser.email,
        role: editingUser.role
      };

      // Add hall-specific data for hall owners
      if (editingUser.role === 'hall_owner') {
        userData.hallName = editingUser.hallName;
        userData.address = editingUser.address;
      }

      const response = await fetch(`http://localhost:5000/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setSuccessMessage('User updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Refresh users list
        const updatedUsers = await fetch('http://localhost:5000/api/users').then(res => res.json());
        setUsers(updatedUsers);
        setFiltered(updatedUsers);
        
        // Close modal and reset
        setShowEditModal(false);
        setEditingUser(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update user');
      }
    } catch (err) {
      setError('Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setNewUser(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userData = {
        email: newUser.email,
        password: newUser.password,
        role: newUser.role
      };

      // Add hall-specific data for hall owners
      if (newUser.role === 'hall_owner') {
        userData.hallName = newUser.hallName;
        userData.address = newUser.address;
      }

      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        // Show success message
        setSuccessMessage(`${newUser.role === 'hall_owner' ? 'Hall Owner' : 'Super Admin'} account created successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Refresh users list
        const updatedUsers = await fetch('http://localhost:5000/api/users').then(res => res.json());
        setUsers(updatedUsers);
        setFiltered(updatedUsers);
        
        // Reset form and close modal
        setNewUser({
          email: '',
          password: '',
          role: 'hall_owner',
          hallName: '',
          address: {
            line1: '',
            line2: '',
            postcode: '',
            state: ''
          }
        });
        setShowAddUserModal(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create user');
      }
    } catch (err) {
      setError('Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueRoles = [...new Set(users.map(u => u.role).filter(Boolean))];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <UsersIcon className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center text-red-600">
        <UsersIcon className="h-8 w-8 mx-auto mb-2" />
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, roles, and hall assignments.
          </p>
        </div>
        <Button onClick={handleAddUser} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add User
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

      {/* Statistics Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{users.length}</p>
              </div>
              <div className="p-2 bg-blue-500 rounded-lg">
                <UsersIcon className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Hall Owners</p>
                <p className="text-2xl font-bold text-green-900">
                  {users.filter(user => user.role === 'hall_owner').length}
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
                <p className="text-sm font-medium text-purple-600">Super Admins</p>
                <p className="text-2xl font-bold text-purple-900">
                  {users.filter(user => user.role === 'super_admin').length}
                </p>
              </div>
              <div className="p-2 bg-purple-500 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="All Roles">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              
              <Button
                variant={showActiveOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowActiveOnly(!showActiveOnly)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Active only
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input type="checkbox" className="rounded" />
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Hall Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <UsersIcon className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No users found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(user => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <input type="checkbox" className="rounded" />
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.email || '-'}
                    </TableCell>
                    <TableCell>
                      {user.role ? (
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {user.hallName ? (
                        <span className="font-medium">{user.hallName}</span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {user.address ? (
                        <div className="text-sm space-y-1">
                          {user.address.line1 && (
                            <div className="font-medium">{user.address.line1}</div>
                          )}
                          {user.address.line2 && (
                            <div className="text-muted-foreground">{user.address.line2}</div>
                          )}
                          <div className="text-muted-foreground">
                            {user.address.postcode && `${user.address.postcode}`}
                            {user.address.state && `, ${user.address.state}`}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {currentUserRole === 'super_admin' ? (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditUser(user)}
                            >
                              <span className="sr-only">Edit</span>
                              ✏️
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <span className="sr-only">Delete</span>
                              🗑️
                            </Button>
                          </>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">View</span>
                            👁️
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
        <DialogContent className="w-[90vw] max-w-md mx-auto max-h-[90vh] overflow-hidden p-0">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-md">
                <User className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Add New User</DialogTitle>
                <p className="text-blue-100 text-xs">Create a new user account</p>
              </div>
            </div>
          </div>

          {/* Scrollable form content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-4">
            <form id="user-form" onSubmit={handleSubmitUser} className="space-y-4">
              {/* Role Selection with Cards */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  User Role
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  <label className={`relative cursor-pointer rounded-md border-2 p-3 transition-all ${
                    newUser.role === 'hall_owner' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="hall_owner"
                      checked={newUser.role === 'hall_owner'}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${
                        newUser.role === 'hall_owner' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Building2 className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Hall Owner</div>
                        <div className="text-xs text-gray-500">Manage hall bookings</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className={`relative cursor-pointer rounded-md border-2 p-3 transition-all ${
                    newUser.role === 'super_admin' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="super_admin"
                      checked={newUser.role === 'super_admin'}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${
                        newUser.role === 'super_admin' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Shield className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Super Admin</div>
                        <div className="text-xs text-gray-500">Full system access</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                  <User className="h-3 w-3" />
                  Basic Information
                </div>
                
                <div className="space-y-3">
                  <div className="relative">
                    <Label htmlFor="email" className="text-xs font-medium text-gray-700 mb-1 block">
                      Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-9 h-9 text-sm"
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Label htmlFor="password" className="text-xs font-medium text-gray-700 mb-1 block">
                      Password *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="pl-9 h-9 text-sm"
                        placeholder="Enter secure password"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hall Owner specific fields */}
              {newUser.role === 'hall_owner' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                    <Building2 className="h-3 w-3" />
                    Hall Information
                  </div>
                  
                  <div className="relative">
                    <Label htmlFor="hallName" className="text-xs font-medium text-gray-700 mb-1 block">
                      Hall Name *
                    </Label>
                    <div className="relative">
                      <Home className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <Input
                        id="hallName"
                        value={newUser.hallName}
                        onChange={(e) => handleInputChange('hallName', e.target.value)}
                        className="pl-9 h-9 text-sm"
                        placeholder="Enter hall name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                      <MapPin className="h-3 w-3" />
                      Address Information
                    </div>
                    
                    <div className="space-y-3">
                      <div className="relative">
                        <Label htmlFor="line1" className="text-xs font-medium text-gray-700 mb-1 block">
                          Address Line 1 *
                        </Label>
                        <Input
                          id="line1"
                          value={newUser.address.line1}
                          onChange={(e) => handleInputChange('address.line1', e.target.value)}
                          className="h-9 text-sm"
                          placeholder="Street address"
                          required
                        />
                      </div>

                      <div className="relative">
                        <Label htmlFor="line2" className="text-xs font-medium text-gray-700 mb-1 block">
                          Address Line 2
                        </Label>
                        <Input
                          id="line2"
                          value={newUser.address.line2}
                          onChange={(e) => handleInputChange('address.line2', e.target.value)}
                          className="h-9 text-sm"
                          placeholder="Apartment, suite, etc. (optional)"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <Label htmlFor="postcode" className="text-xs font-medium text-gray-700 mb-1 block">
                            Postcode *
                          </Label>
                          <Input
                            id="postcode"
                            value={newUser.address.postcode}
                            onChange={(e) => handleInputChange('address.postcode', e.target.value)}
                            className="h-9 text-sm"
                            placeholder="12345"
                            required
                          />
                        </div>
                        
                        <div className="relative">
                          <Label htmlFor="state" className="text-xs font-medium text-gray-700 mb-1 block">
                            State *
                          </Label>
                          <Input
                            id="state"
                            value={newUser.address.state}
                            onChange={(e) => handleInputChange('address.state', e.target.value)}
                            className="h-9 text-sm"
                            placeholder="State"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit button inside form */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full h-9 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Plus className="h-3 w-3" />
                      Create User
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Fixed footer with actions */}
          <div className="bg-gray-50 p-3">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddUserModal(false)}
                disabled={isSubmitting}
                className="px-6 h-9 text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="w-[90vw] max-w-md mx-auto max-h-[90vh] overflow-hidden p-0">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-md">
                <User className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Edit User</DialogTitle>
                <p className="text-green-100 text-xs">Update user information</p>
              </div>
            </div>
          </div>

          {/* Scrollable form content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-4">
            {editingUser && (
              <form id="edit-user-form" onSubmit={handleUpdateUser} className="space-y-4">
                {/* Role Selection with Cards */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    User Role
                  </Label>
                  <div className="grid grid-cols-1 gap-2">
                    <label className={`relative cursor-pointer rounded-md border-2 p-3 transition-all ${
                      editingUser.role === 'hall_owner' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="editRole"
                        value="hall_owner"
                        checked={editingUser.role === 'hall_owner'}
                        onChange={(e) => setEditingUser(prev => ({ ...prev, role: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${
                          editingUser.role === 'hall_owner' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Building2 className="h-3 w-3" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Hall Owner</div>
                          <div className="text-xs text-gray-500">Manage hall bookings</div>
                        </div>
                      </div>
                    </label>
                    
                    <label className={`relative cursor-pointer rounded-md border-2 p-3 transition-all ${
                      editingUser.role === 'super_admin' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="editRole"
                        value="super_admin"
                        checked={editingUser.role === 'super_admin'}
                        onChange={(e) => setEditingUser(prev => ({ ...prev, role: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${
                          editingUser.role === 'super_admin' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Shield className="h-3 w-3" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Super Admin</div>
                          <div className="text-xs text-gray-500">Full system access</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                    <User className="h-3 w-3" />
                    Basic Information
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <Label htmlFor="editEmail" className="text-xs font-medium text-gray-700 mb-1 block">
                        Email Address *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <Input
                          id="editEmail"
                          type="email"
                          value={editingUser.email}
                          onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-9 h-9 text-sm"
                          placeholder="user@example.com"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hall Owner specific fields */}
                {editingUser.role === 'hall_owner' && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                      <Building2 className="h-3 w-3" />
                      Hall Information
                    </div>
                    
                    <div className="relative">
                      <Label htmlFor="editHallName" className="text-xs font-medium text-gray-700 mb-1 block">
                        Hall Name *
                      </Label>
                      <div className="relative">
                        <Home className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <Input
                          id="editHallName"
                          value={editingUser.hallName || ''}
                          onChange={(e) => setEditingUser(prev => ({ ...prev, hallName: e.target.value }))}
                          className="pl-9 h-9 text-sm"
                          placeholder="Enter hall name"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                        <MapPin className="h-3 w-3" />
                        Address Information
                      </div>
                      
                      <div className="space-y-3">
                        <div className="relative">
                          <Label htmlFor="editLine1" className="text-xs font-medium text-gray-700 mb-1 block">
                            Address Line 1 *
                          </Label>
                          <Input
                            id="editLine1"
                            value={editingUser.address?.line1 || ''}
                            onChange={(e) => setEditingUser(prev => ({ 
                              ...prev, 
                              address: { ...prev.address, line1: e.target.value }
                            }))}
                            className="h-9 text-sm"
                            placeholder="Street address"
                            required
                          />
                        </div>

                        <div className="relative">
                          <Label htmlFor="editLine2" className="text-xs font-medium text-gray-700 mb-1 block">
                            Address Line 2
                          </Label>
                          <Input
                            id="editLine2"
                            value={editingUser.address?.line2 || ''}
                            onChange={(e) => setEditingUser(prev => ({ 
                              ...prev, 
                              address: { ...prev.address, line2: e.target.value }
                            }))}
                            className="h-9 text-sm"
                            placeholder="Apartment, suite, etc. (optional)"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <Label htmlFor="editPostcode" className="text-xs font-medium text-gray-700 mb-1 block">
                              Postcode *
                            </Label>
                            <Input
                              id="editPostcode"
                              value={editingUser.address?.postcode || ''}
                              onChange={(e) => setEditingUser(prev => ({ 
                                ...prev, 
                                address: { ...prev.address, postcode: e.target.value }
                              }))}
                              className="h-9 text-sm"
                              placeholder="12345"
                              required
                            />
                          </div>
                          
                          <div className="relative">
                            <Label htmlFor="editState" className="text-xs font-medium text-gray-700 mb-1 block">
                              State *
                            </Label>
                            <Input
                              id="editState"
                              value={editingUser.address?.state || ''}
                              onChange={(e) => setEditingUser(prev => ({ 
                                ...prev, 
                                address: { ...prev.address, state: e.target.value }
                              }))}
                              className="h-9 text-sm"
                              placeholder="State"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button inside form */}
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full h-9 text-sm bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3" />
                        Update User
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Fixed footer with actions */}
          <div className="bg-gray-50 p-3">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                disabled={isSubmitting}
                className="px-6 h-9 text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
