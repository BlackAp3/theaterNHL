// backend/utils/defaultTabs.ts
export const defaultTabsForRole: Record<string, string[]> = {
    admin: ['dashboard', 'bookings', 'schedule', 'theaters', 'reports', 'users', 'settings'],
    manager: ['dashboard', 'bookings', 'schedule', 'theaters', 'reports', 'settings'],
    doctor: ['schedule', 'settings'],
    receptionist: ['dashboard', 'bookings', 'settings'],
    nurse: ['dashboard', 'schedule', 'settings'],
    viewer: ['settings']
  };
  