import { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../lib/auth';
import { Users, UserPlus, Pencil, Trash2, Eye, EyeOff, Check, X, ArrowLeft } from 'lucide-react';
import type { User } from '../types/user';

interface UserManagementProps {
  currentUser: {
    id: number;
    username: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    permissions?: Record<string, any>;
    details?: Record<string, any>;
  } | null;
}


// Available tabs in the system
const AVAILABLE_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'theaters', label: 'Theaters' },
  { id: 'reports', label: 'Reports' },
  { id: 'users', label: 'User Management' },
  { id: 'settings', label: 'Settings' },
  { id: 'emergency', label: 'Emergency' } // ✅ Added Emergency tab
] as const;


const ROLE_TAB_DEFAULTS: Record<string, TabId[]> = {
  admin: ['dashboard', 'bookings', 'schedule', 'theaters', 'reports', 'users', 'settings', 'emergency'],
  manager: ['dashboard', 'bookings', 'schedule', 'theaters', 'reports', 'settings', 'emergency'],
  doctor: ['schedule', 'settings', 'emergency'],
  receptionist: ['dashboard', 'bookings', 'settings'],
  nurse: ['dashboard', 'schedule', 'settings', 'emergency'],
  viewer: ['settings']
};




type TabId = typeof AVAILABLE_TABS[number]['id'];


function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    password: string;
    status: 'active' | 'inactive' | 'suspended';
    permissions: {
      tabs: TabId[];
    };
  }>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'nurse',
    password: '',
    status: 'active',
    permissions: {
      tabs: []
    }
  });

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('❌ Failed to delete user:', err);
      alert('Failed to delete user.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newUser = await createUser(
        formData.email,
        formData.password || 'defaultPassword123',
        formData.role,
        formData.firstName,
        formData.lastName,
        {
          address: '',
          phoneNumber: '',
          dateOfBirth: '',
          gender: 'Other',
          specialization: '',
          department: '',
          licenseNumber: '',
          status: formData.status
        },
        {
          tabs: formData.permissions.tabs,
          actions: []
        }
      );

      setUsers((prev) => [...prev, newUser]);
      setShowCreateForm(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'nurse',
        password: '',
        status: 'active',
        permissions: { tabs: [] }
      });
      setIsEditing(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('❌ Failed to create user:', err);
      alert('Error creating user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, {
        email: formData.email,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        details: {
          address: '',
          phoneNumber: '',
          dateOfBirth: '',
          gender: 'Other',
          specialization: '',
          department: '',
          licenseNumber: '',
          status: formData.status
        },
        permissions: {
          tabs: formData.permissions.tabs,
          actions: []
        }
      });

      const updatedUsers = await getUsers();
      setUsers(updatedUsers);

      setShowCreateForm(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'nurse',
        password: '',
        status: 'active',
        permissions: { tabs: [] }
      });
      setSelectedUser(null);
      setIsEditing(false);
    } catch (err) {
      console.error('❌ Failed to update user:', err);
      alert('Error updating user');
    }
  };

  const toggleTabPermission = (tabId: TabId) => {
    setFormData(prev => {
      const currentTabs = prev.permissions.tabs;
      const newTabs = currentTabs.includes(tabId)
        ? currentTabs.filter(t => t !== tabId)
        : [...currentTabs, tabId];

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          tabs: newTabs
        }
      };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userList: User[] = await getUsers();
        if (!Array.isArray(userList)) throw new Error('Invalid user list');
        setUsers(userList);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{error}</h3>
        </div>
      </div>
    </div>
  );

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => {
                setShowCreateForm(false);
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  role: 'nurse',
                  password: '',
                  status: 'active',
                  permissions: { tabs: [] }
                });
                setSelectedUser(null);
                setIsEditing(false);
              }}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Users
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {isEditing ? 'Edit User' : 'Create New User'}
            </h2>

            <form onSubmit={isEditing ? handleUpdateUser : handleCreateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {isEditing ? 'Reset Password' : 'Password'}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={isEditing ? "Leave blank to keep current password" : "Enter password"}
                      className="block w-full rounded-md border-gray-300 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
  value={formData.role}
  onChange={(e) => {
    const newRole = e.target.value;
    const defaultTabs = ROLE_TAB_DEFAULTS[newRole] || [];

    setFormData((prev) => ({
      ...prev,
      role: newRole,
      permissions: {
        ...prev.permissions,
        tabs: defaultTabs
      }
    }));
  }}
  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
>

                    <option value="nurse">Nurse</option>
                    <option value="doctor">Doctor</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({
                      ...formData,
                      status: e.target.value as 'active' | 'inactive' | 'suspended'
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {currentUser?.role === 'admin' && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Tab Permissions</label>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {AVAILABLE_TABS.map((tab) => (
        <div
          key={tab.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium text-gray-900">{tab.label}</span>
          <button
            type="button"
            onClick={() => toggleTabPermission(tab.id)}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
              formData.permissions.tabs.includes(tab.id)
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
            }`}
          >
            {formData.permissions.tabs.includes(tab.id) ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>
        </div>
      ))}
    </div>
  </div>
)}


              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      role: 'nurse',
                      password: '',
                      status: 'active',
                      permissions: { tabs: [] }
                    });
                    setSelectedUser(null);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isEditing ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-gray-400" />
            <h2 className="ml-2 text-xl font-semibold text-gray-900">User Management</h2>
          </div>
          <button
            onClick={() => {
              setShowCreateForm(true);
              setIsEditing(false);
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                role: 'nurse',
                password: '',
                status: 'active',
                permissions: { tabs: [] }
              });
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Create User
          </button>
        </div>

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Access</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{u.email}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                            {u.role}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.details?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {u.details?.status ?? 'unknown'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className="text-xs text-gray-500">
                            {u.permissions?.tabs?.length || 0} tabs
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setFormData({
                                firstName: u.firstName,
                                lastName: u.lastName,
                                email: u.email,
                                role: u.role,
                                password: '',
                                status: u.details?.status || 'active',
                                permissions: {
                                  tabs: (u.permissions?.tabs as TabId[]) || []
                                }
                              });
                              
                              setShowCreateForm(true);
                              setIsEditing(true);
                            }}
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="inline-flex items-center text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;