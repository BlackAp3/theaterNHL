// -------------------------------------
// USER INTERFACES
// -------------------------------------

export interface User {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  details: UserDetails;
  permissions: Permissions;
}

export interface UserDetails {
  address: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  specialization: string;
  department: string;
  licenseNumber: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Permissions {
  tabs: string[];
  actions: string[];
}

export interface TabPermission {
  id: string;
  name: string;
  description: string;
}

// -------------------------------------
// STATIC PERMISSIONS CONFIG
// -------------------------------------

export const AVAILABLE_TABS: TabPermission[] = [
  { id: 'bookings', name: 'Bookings', description: 'Manage patient bookings' },
  { id: 'theater', name: 'Theater', description: 'Manage theater operations' },
  { id: 'reports', name: 'Reports', description: 'View and export reports' },
  { id: 'users', name: 'Users', description: 'Manage system users' },
  { id: 'settings', name: 'Settings', description: 'System configurations' }
];

export const AVAILABLE_ACTIONS: string[] = [
  'view_bookings',
  'create_bookings',
  'edit_bookings',
  'delete_bookings',
  'manage_users',
  'view_reports'
];
