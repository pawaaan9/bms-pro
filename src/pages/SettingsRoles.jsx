
import React, { useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const initialUsers = [
  { id: 1, name: 'Priya Sharma', email: 'priya@bms.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'John Lee', email: 'john@bms.com', role: 'Manager', status: 'Active' },
  { id: 3, name: 'Sara Kim', email: 'sara@bms.com', role: 'Staff', status: 'Inactive' },
];

export default function SettingsRoles() {
  const [users, setUsers] = useState(initialUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'Staff', status: 'Active' });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setUsers((prev) => [
      ...prev,
      { ...form, id: Date.now() },
    ]);
    setForm({ name: '', email: '', role: 'Staff', status: 'Active' });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Roles & Permissions</h1>
        <p className="text-gray-600 mt-1">Manage user roles, access levels, and staff permissions.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Users</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setDialogOpen(true)}>
                  + Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={form.name} onChange={handleInput} required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={form.email} onChange={handleInput} required />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <select id="role" name="role" value={form.role} onChange={handleInput} className="w-full border rounded-md px-3 py-2">
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select id="status" name="status" value={form.status} onChange={handleInput} className="w-full border rounded-md px-3 py-2">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">+ Add User</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                {/* <TableHead>Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Manager' ? 'secondary' : 'outline'}>{user.role}</Badge></TableCell>
                  <TableCell>
                    {user.status === 'Active' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-green-600 border border-green-600 font-semibold cursor-default hover:bg-transparent focus-visible:ring-0 focus:outline-none"
                        tabIndex={-1}
                        style={{ pointerEvents: 'none' }}
                      >
                        Active
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 border border-red-600 font-semibold cursor-default hover:bg-transparent focus-visible:ring-0 focus:outline-none"
                        tabIndex={-1}
                        style={{ pointerEvents: 'none' }}
                      >
                        Inactive
                      </Button>
                    )}
                  </TableCell>
                  {/* <TableCell>
                    <Button variant="ghost" size="icon" title="Edit" disabled>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13z"></path></svg>
                    </Button>
                  </TableCell> */}
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">No users found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}