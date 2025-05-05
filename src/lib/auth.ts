import axios from 'axios';
import type { User, UserDetails, Permissions } from '../types/user';
import { API_URL } from '../config'; // ✅ Use env-based config

// Add axios interceptor for handling auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// -------------------------------------
// GET ALL USERS
// -------------------------------------
export async function getUsers(): Promise<User[]> {
  const token = localStorage.getItem('token');
  const response = await axios.get<User[]>(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!Array.isArray(response.data)) {
    console.error('⚠️ Invalid user list:', response.data);
    return [];
  }

  return response.data;
}

// -------------------------------------
// GET CURRENT USER'S ROLE
// -------------------------------------
export async function getUserRole(): Promise<string> {
  const token = localStorage.getItem('token');
  const response = await axios.get<{ role: string }>(`${API_URL}/auth/role`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.role;
}

// -------------------------------------
// CREATE NEW USER
// -------------------------------------
export async function createUser(
  email: string,
  password: string,
  role: string,
  firstName: string,
  lastName: string,
  details: UserDetails,
  permissions: Permissions
): Promise<User> {
  const token = localStorage.getItem('token');
  const response = await axios.post<User>(`${API_URL}/users`, {
    email,
    password,
    role,
    firstName,
    lastName,
    details,
    permissions,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

// -------------------------------------
// UPDATE USER INFO
// -------------------------------------
export async function updateUser(
  userId: number,
  updatedData: {
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    details?: UserDetails;
    permissions?: Permissions;
  }
): Promise<User> {
  const token = localStorage.getItem('token');
  const response = await axios.put<User>(`${API_URL}/users/${userId}`, updatedData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

// -------------------------------------
// DELETE USER
// -------------------------------------
export async function deleteUser(userId: number): Promise<void> {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateUserPassword(userId: number, newPassword: string): Promise<void> {
  const token = localStorage.getItem('token');
  await axios.patch(`${API_URL}/users/${userId}/password`, { newPassword }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
