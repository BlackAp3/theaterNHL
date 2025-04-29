// backend/utils/defaultTabs.ts
export const defaultTabsForRole: Record<string, string[]> = {
    admin: ['dashboard', 'bookings', 'schedule', 'theaters', 'reports', 'users', 'settings','emergency'],
    manager: ['dashboard', 'bookings', 'schedule', 'theaters', 'reports', 'settings', 'emergency'],
    doctor: ['schedule', 'settings'],
    receptionist: ['dashboard', 'bookings', 'settings', 'emergency'],
    nurse: ['dashboard', 'schedule', 'settings'],
    viewer: ['settings']
  };
  