// src/types.ts

export type Role = 'admin' | 'manager' | 'nurse' | 'viewer' | 'doctor' | 'receptionist';

export type Tab = 
  | 'dashboard'
  | 'bookings'
  | 'schedule'
  | 'theaters'
  | 'reports'
  | 'users'
  | 'settings'
  | 'emergency'; // ✅ Add this line
