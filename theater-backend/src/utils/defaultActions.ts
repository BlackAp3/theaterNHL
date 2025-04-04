// utils/defaultActions.ts

export const defaultActionsByRole: Record<string, string[]> = {
    admin: [
      'manage_users',
      'create_user',
      'view_user',
      'edit_user',
      'delete_user',
      'reset_password',
      'update_status',
      'update_permissions',
    ],
    manager: [
      'view_user',
      'edit_user',
    ],
    doctor: [
      'view_user',
    ],
    nurse: [
      'view_user',
    ],
    receptionist: [
      'view_user',
    ],
  };
  