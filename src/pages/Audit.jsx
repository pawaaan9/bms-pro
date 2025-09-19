import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import AuditService from "../services/auditService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Calendar, Filter, Download, RefreshCw, Search, Eye, ChevronLeft, ChevronRight, Users } from "lucide-react";

export default function Audit() {
  const { user, isSuperAdmin, isHallOwner, userSettings } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  
  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    action: '',
    targetType: '',
    userRole: '',
    search: ''
  });
  
  const [availableActions, setAvailableActions] = useState([]);
  const [availableTargetTypes, setAvailableTargetTypes] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
    fetchFilterOptions();
    fetchStats();
  }, [pagination.page, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      // Convert "all" values to empty strings for API
      const apiFilters = {
        ...filters,
        action: filters.action === 'all' ? '' : filters.action,
        targetType: filters.targetType === 'all' ? '' : filters.targetType,
        userRole: filters.userRole === 'all' ? '' : filters.userRole
      };
      
      const data = await AuditService.getAuditLogs(apiFilters, {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'timestamp',
        sortOrder: 'desc'
      });
      
      setAuditLogs(data.auditLogs || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0
      }));
      setError(null);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [actions, targetTypes] = await Promise.all([
        AuditService.getAuditActions(),
        AuditService.getAuditTargetTypes()
      ]);
      
      setAvailableActions(actions);
      setAvailableTargetTypes(targetTypes);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const fetchStats = async () => {
    try {
      // Convert "all" values to empty strings for API
      const apiFilters = {
        ...filters,
        action: filters.action === 'all' ? '' : filters.action,
        targetType: filters.targetType === 'all' ? '' : filters.targetType,
        userRole: filters.userRole === 'all' ? '' : filters.userRole
      };
      
      const data = await AuditService.getAuditStats(apiFilters);
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      action: '',
      targetType: '',
      userRole: '',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const exportAuditLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Target', 'IP Address', 'Details'],
      ...auditLogs.map(log => [
        AuditService.formatTimestamp(log.timestamp, userSettings),
        log.userEmail,
        AuditService.formatAction(log.action),
        log.target,
        log.ipAddress || 'N/A',
        log.additionalInfo || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const checkSubUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in first');
        return;
      }

      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const subUsers = data.filter(u => u.role === 'sub_user' && u.parentUserId === user.id);
        
        if (subUsers.length === 0) {
          alert('No sub-users found under your hall. You need sub-users to see their audit activities.');
        } else {
          const subUserEmails = subUsers.map(u => u.email).join(', ');
          alert(`Found ${subUsers.length} sub-user(s) under your hall:\n${subUserEmails}\n\nHave them perform actions to generate audit logs.`);
        }
      } else {
        alert('Failed to fetch sub-users');
      }
    } catch (error) {
      console.error('Error checking sub-users:', error);
      alert('Error checking sub-users');
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    return (
      log.userEmail?.toLowerCase().includes(searchTerm) ||
      log.action?.toLowerCase().includes(searchTerm) ||
      log.target?.toLowerCase().includes(searchTerm) ||
      log.additionalInfo?.toLowerCase().includes(searchTerm)
    );
  });

  const renderChanges = (changes) => {
    if (!changes || typeof changes !== 'object') return null;
    
    return (
      <div className="space-y-2">
        {Object.entries(changes).map(([field, change]) => (
          <div key={field} className="text-sm">
            <span className="font-medium">{field}:</span>
            {change.old !== undefined && change.new !== undefined ? (
              <span className="ml-2">
                <span className="text-red-600 line-through">{JSON.stringify(change.old)}</span>
                <span className="mx-2">→</span>
                <span className="text-green-600">{JSON.stringify(change.new)}</span>
              </span>
            ) : change.new !== undefined ? (
              <span className="ml-2 text-green-600">{JSON.stringify(change.new)}</span>
            ) : (
              <span className="ml-2 text-red-600">{JSON.stringify(change.old)}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading && auditLogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading audit logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground">
            Complete record of system changes and actions for compliance
          </p>
          {isSuperAdmin() && (
            <p className="text-sm text-blue-600 font-medium mt-1">
              🔍 Super Admin View: Hall owner activities and system-wide actions
            </p>
          )}
          {isHallOwner() && (
            <p className="text-sm text-green-600 font-medium mt-1">
              🏢 Hall Owner View: Sub-user activities only (your own actions are not shown)
            </p>
          )}
          {user?.role === 'sub_user' && (
            <p className="text-sm text-orange-600 font-medium mt-1">
              👤 Sub-User View: Your own activities only
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchAuditLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportAuditLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {isHallOwner() && (
            <Button 
              onClick={checkSubUsers} 
              variant="outline" 
              size="sm"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Users className="h-4 w-4 mr-2" />
              Check Sub-Users
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.totalLogs}</div>
              <p className="text-sm text-muted-foreground">Total Logs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{Object.keys(stats.usersCount).length}</div>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{Object.keys(stats.actionsCount).length}</div>
              <p className="text-sm text-muted-foreground">Action Types</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{Object.keys(stats.targetTypesCount).length}</div>
              <p className="text-sm text-muted-foreground">Target Types</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Action</label>
              <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {availableActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {AuditService.formatAction(action)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Target Type</label>
              <Select value={filters.targetType} onValueChange={(value) => handleFilterChange('targetType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {availableTargetTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {AuditService.formatTargetType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">User Role</label>
              <Select value={filters.userRole} onValueChange={(value) => handleFilterChange('userRole', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="hall_owner">Hall Owner</SelectItem>
                  <SelectItem value="sub_user">Sub User</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={clearFilters} variant="outline" className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {pagination.total} logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
              <div className="mt-2 text-sm text-red-700">
                <p><strong>Troubleshooting steps:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Ensure the backend server is running on port 5000</li>
                  <li>Check if you're logged in with a valid token</li>
                  <li>Try performing some actions (create booking, update settings) to generate audit logs</li>
                  <li>For hall owners: Use the "Check Sub-Users" button to verify you have sub-users</li>
                </ul>
              </div>
            </div>
          )}
          
          {!error && auditLogs.length === 0 && (
            <div className="mb-4 p-6 bg-blue-50 border border-blue-200 rounded-md text-center">
              <div className="text-blue-600 text-4xl mb-2">📋</div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">No Audit Logs Found</h3>
              <p className="text-blue-700 mb-4">
                {isSuperAdmin() && "No hall owner activities found yet."}
                {isHallOwner() && "No sub-user activities found yet. This could mean your sub-users haven't performed any actions yet, or you may not have any sub-users assigned to your hall."}
                {user?.role === 'sub_user' && "No activities found for your account yet."}
              </p>
              <div className="text-sm text-blue-600 space-y-1">
                <p><strong>To generate audit logs:</strong></p>
                {isSuperAdmin() && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Hall owners need to perform actions in the system</li>
                    <li>System administrators performing actions</li>
                  </ul>
                )}
                {isHallOwner() && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Have your sub-users perform actions in the system</li>
                    <li>Sub-users creating/updating bookings, managing customers, etc.</li>
                  </ul>
                )}
                {user?.role === 'sub_user' && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Perform actions like creating bookings, updating customer info</li>
                    <li>Manage resources, update pricing, generate reports</li>
                  </ul>
                )}
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      {AuditService.formatTimestamp(log.timestamp, userSettings)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.userEmail}</div>
                        <div className="text-sm text-muted-foreground">
                          <Badge variant="outline">{log.userRole}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{AuditService.getActionIcon(log.action)}</span>
                        <span className={`font-medium ${AuditService.getActionColor(log.action)}`}>
                          {AuditService.formatAction(log.action)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.target}</div>
                        <div className="text-sm text-muted-foreground">
                          <Badge variant="secondary">{AuditService.formatTargetType(log.targetType)}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.ipAddress || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLog(log);
                            setShowDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Audit Log Details</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(false)}
                className="absolute right-4 top-4"
              >
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                  <p className="font-mono">{AuditService.formatTimestamp(selectedLog.timestamp, userSettings)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                  <p className="font-mono">{selectedLog.ipAddress || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User</label>
                  <p>{selectedLog.userEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <Badge variant="outline">{selectedLog.userRole}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Action</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{AuditService.getActionIcon(selectedLog.action)}</span>
                    <span className={`font-medium ${AuditService.getActionColor(selectedLog.action)}`}>
                      {AuditService.formatAction(selectedLog.action)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Target Type</label>
                  <Badge variant="secondary">{AuditService.formatTargetType(selectedLog.targetType)}</Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Target</label>
                <p className="font-medium">{selectedLog.target}</p>
              </div>
              
              {selectedLog.additionalInfo && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Additional Info</label>
                  <p>{selectedLog.additionalInfo}</p>
                </div>
              )}
              
              {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Changes</label>
                  <div className="mt-2 p-4 bg-muted rounded-md">
                    {renderChanges(selectedLog.changes)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}