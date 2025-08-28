import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
// import { useAuth } from '../contexts/auth-hooks';
import { UserRole, UserRoleEnum } from '../contexts/auth-types';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Mock users data
  const mockUsers: User[] = useMemo(() => [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: UserRoleEnum.ADMIN,
      isActive: true,
      lastLoginAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: UserRoleEnum.MANAGER,
      isActive: true,
      lastLoginAt: new Date('2024-01-14'),
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: UserRoleEnum.TECHNICIAN,
      isActive: false,
      lastLoginAt: new Date('2024-01-10'),
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@example.com',
      role: UserRoleEnum.CASHIER,
      isActive: true,
      lastLoginAt: new Date('2024-01-13'),
    },
  ], []);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, [mockUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    if (!selectedUser) return;

    setUsers(prev => prev.map(user =>
      user.id === selectedUser.id ? { ...user, ...updates } : user
    ));
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleConfirmDelete = () => {
    if (!selectedUser) return;

    setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button>Add New User</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.map(user => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Last login: {user.lastLoginAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user)}>
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Edit User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    defaultValue={selectedUser.name}
                    onChange={(e) => handleUpdateUser({ name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    defaultValue={selectedUser.email}
                    onChange={(e) => handleUpdateUser({ email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value: UserRole) => handleUpdateUser({ role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                                              <SelectItem value={UserRoleEnum.ADMIN}>Admin</SelectItem>
                        <SelectItem value={UserRoleEnum.MANAGER}>Manager</SelectItem>
                        <SelectItem value={UserRoleEnum.TECHNICIAN}>Technician</SelectItem>
                        <SelectItem value={UserRoleEnum.CASHIER}>Cashier</SelectItem>
                        <SelectItem value={UserRoleEnum.VIEWER}>Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
                  <Button onClick={() => setShowEditModal(false)}>Save</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Confirm Delete</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Are you sure you want to delete <strong>{selectedUser.name}</strong>?
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleConfirmDelete}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 