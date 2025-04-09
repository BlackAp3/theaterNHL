import { addDays, format, setHours, setMinutes } from 'date-fns';
import { API_URL } from '../config'; // Adjust path based on folder structure


// Types
export interface UserDetails {
  address: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  specialization?: string;
  department?: string;
  licenseNumber?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  schedule?: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
    sunday: string[];
  };
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  notes?: string;
}

export interface TabPermission {
  id: string;
  name: string;
  description: string;
  key: 'dashboard' | 'bookings' | 'schedule' | 'theaters' | 'reports' | 'settings';
}

export interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  details: UserDetails;
  permissions: {
    tabs: string[];
    actions: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  patient_first_name: string;
  patient_last_name: string;
  operation_type: string;
  doctor: string;
  theater: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  date_of_birth?: string;
  gender?: string;
  phone_contact?: string;
  anesthesia_review?: string;
  classification?: string;
  urgency_level?: string;
  diagnosis?: string;
  special_requirements?: string;
  mode_of_payment?: string;
  patient_location?: string;
  created_at: string;
}

export const AVAILABLE_TABS: TabPermission[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'View system dashboard and statistics',
    key: 'dashboard'
  },
  {
    id: 'bookings',
    name: 'Bookings',
    description: 'Manage operation bookings',
    key: 'bookings'
  },
  {
    id: 'schedule',
    name: 'Schedule',
    description: 'View and manage operation schedules',
    key: 'schedule'
  },
  {
    id: 'theaters',
    name: 'Theaters',
    description: 'Manage operation theaters',
    key: 'theaters'
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Access system reports and analytics',
    key: 'reports'
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Configure system settings',
    key: 'settings'
  }
];

// Default permissions for each role
const DEFAULT_PERMISSIONS = {
  admin: {
    tabs: AVAILABLE_TABS.map(tab => tab.id),
    actions: ['all']
  },
  doctor: {
    tabs: ['dashboard', 'bookings', 'schedule'],
    actions: ['view_bookings', 'create_bookings', 'edit_bookings']
  },
  nurse: {
    tabs: ['dashboard', 'schedule', 'theaters'],
    actions: ['view_bookings', 'view_schedule']
  },
  receptionist: {
    tabs: ['bookings', 'schedule'],
    actions: ['view_bookings', 'create_bookings']
  }
};

// Mock data store


const today = new Date();
const mockBookings: Booking[] = [
  {
    id: '1',
    patient_first_name: 'John',
    patient_last_name: 'Doe',
    operation_type: 'Appendectomy',
    doctor: 'Dr. Smith - Surgeon',
    theater: 'Theater 1',
    start_time: setMinutes(setHours(today, 9), 0).toISOString(),
    end_time: setMinutes(setHours(today, 11), 0).toISOString(),
    status: 'scheduled',
    date_of_birth: '1980-01-01',
    gender: 'Male',
    phone_contact: '123-456-7890',
    anesthesia_review: 'Yes',
    classification: 'Major',
    urgency_level: 'urgent',
    diagnosis: 'Acute appendicitis',
    special_requirements: 'None',
    mode_of_payment: 'insurance',
    patient_location: 'Ward 3A',
    created_at: new Date().toISOString()
  }
];

// User management functions
export const getUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem('token');

  const res = await 
fetch(`${API_URL}/users`,  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch users');
  }

  return await res.json();
};


export const getUserById = async (id: string): Promise<User | null> => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/auth/users/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || 'Failed to fetch user');
  }

  return await res.json();
};


export const createUser = async (
  email: string,
  password: string,
  role: string,
  firstName: string,
  lastName: string,
  details: Partial<UserDetails> = {},
  permissions: { tabs: string[]; actions: string[] }
): Promise<User> => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/auth/register`, {

    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      role,
      firstName,
      lastName,
      details,
      permissions
    })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || 'Failed to create user');
  }

  const result = await res.json();

  return {
    id: result.userId,
    email,
    role,
    firstName,
    lastName,
    details: details as UserDetails,
    permissions,
    createdAt: new Date().toISOString(), // temp until backend returns full user
    updatedAt: new Date().toISOString()
  };
};

export const updateUser = async (
  id: string,
  updates: Partial<User>
): Promise<User> => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/auth/users/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || 'Failed to update user');
  }

  return await res.json();
};

export const deleteUser = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/auth/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || 'Failed to delete user');
  }
};

export const updateUserStatus = async (id: string, status: 'active' | 'inactive' | 'suspended'): Promise<User> => {
  const user = await getUserById(id);
  if (!user) throw new Error('User not found');
  
  return updateUser(id, {
    details: {
      ...user.details,
      status
    }
  });
};

export const updateUserPermissions = async (
  id: string,
  permissions: { tabs: string[]; actions: string[] }
): Promise<User> => {
  const user = await getUserById(id);
  if (!user) throw new Error('User not found');

  return updateUser(id, { permissions });
};

export const signIn = async (email: string, password: string): Promise<User> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || 'Login failed');
  }

  const data = await res.json();

  // Save token to localStorage for future requests
  localStorage.setItem('token', data.token);

  // Return user object from backend response
  return {
    id: data.user.id,
    email: data.user.email,
    role: data.user.role,
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    details: data.user.details,
    permissions: data.user.permissions,
    createdAt: new Date().toISOString(), // optional placeholder
    updatedAt: new Date().toISOString()  // optional placeholder
  };
};

export const getCurrentUser = async (): Promise<User | null> => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  if (res.status === 401 || res.status === 403) {
    return null;
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || 'Failed to fetch current user');
  }

  const data = await res.json();

  return {
    id: data.id,
    email: data.email,
    role: data.role,
    firstName: data.firstName,
    lastName: data.lastName,
    details: data.details,
    permissions: data.permissions,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
};


export const signOut = async () => {
  // No-op in mock version
};

export const getUserRole = async (): Promise<string | null> => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/auth/me/role`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user role');
  }

  const data = await res.json();
  return data.role;
};

export const isAdmin = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    return user?.role === 'admin';
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
};


// Permission check functions
export const hasTabAccess = (user: User, tabId: string): boolean => {
  if (user.role === 'admin') return true;
  return user.permissions.tabs.includes(tabId);
};

export const hasActionPermission = (user: User, action: string): boolean => {
  if (user.role === 'admin' || user.permissions.actions.includes('all')) return true;
  return user.permissions.actions.includes(action);
};

// Booking functions
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'created_at' | 'status'>): Promise<Booking> => {
  return {
    ...bookingData,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
    status: 'scheduled'
  };
};

export const updateBooking = async (id: string, bookingData: Partial<Booking>): Promise<Booking> => {
  const booking = mockBookings.find(b => b.id === id);
  if (!booking) throw new Error('Booking not found');
  return { ...booking, ...bookingData };
};

export const getBookings = async (): Promise<Booking[]> => {
  return mockBookings;
};

export const getBookingById = async (id: string): Promise<Booking> => {
  const booking = mockBookings.find(b => b.id === id);
  if (!booking) throw new Error('Booking not found');
  return booking;
};

export const getScheduleBookings = async (startDate: Date, endDate: Date): Promise<Booking[]> => {
  return mockBookings;
};

export const getDashboardStats = async () => {
  const now = new Date();

  return {
    totalPatients: 150,
    averageWaitTime: 45,
    pendingReviews: 8,
    completedOperations: 142,
    weeklyData: Array.from({ length: 7 }, (_, i) => ({
      name: format(addDays(now, -6 + i), 'EEE'),
      operations: Math.floor(Math.random() * 10) + 5
    })),
    todayOperations: mockBookings.map(op => ({
      id: op.id,
      patient: `${op.patient_first_name} ${op.patient_last_name}`,
      operation: op.operation_type,
      doctor: op.doctor,
      time: format(new Date(op.start_time), 'h:mm a'),
      status: op.status === 'scheduled' ? 'Confirmed' : 'Pending'
    })),
    operationTypes: [
      { name: 'General Surgery', value: 35 },
      { name: 'Orthopedics', value: 25 },
      { name: 'Cardiac', value: 20 },
      { name: 'Neurosurgery', value: 15 },
      { name: 'Other', value: 5 }
    ]
  };
};

export const getTheaterStatus = async () => {
  const theaters = [
    { id: 1, name: 'Theater 1', type: 'General Surgery' },
    { id: 2, name: 'Theater 2', type: 'Orthopedics' },
    { id: 3, name: 'Theater 3', type: 'Cardiac' },
    { id: 4, name: 'Theater 4', type: 'Neurosurgery' },
  ];

  return theaters.map(theater => {
    const theaterBookings = mockBookings.filter(b => b.theater === theater.name);
    
    const currentOperation = theaterBookings[0];
    const nextOperation = theaterBookings[1];

    return {
      ...theater,
      status: currentOperation ? 'In Use' : 'Available',
      currentOperation: currentOperation ? {
        patient: `${currentOperation.patient_first_name} ${currentOperation.patient_last_name}`,
        type: currentOperation.operation_type,
        timeRemaining: '1h 30m',
      } : null,
      nextOperation: nextOperation ? {
        patient: `${nextOperation.patient_first_name} ${nextOperation.patient_last_name}`,
        type: nextOperation.operation_type,
        time: format(new Date(nextOperation.start_time), 'h:mm a'),
      } : null,
    };
  });
};