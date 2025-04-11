import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import {pool } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorizeRole';
import { logAuditAction } from '../utils/audit';
import { checkPermission } from '../middleware/checkPermissions';
import { AuthenticatedRequest } from '../middleware/auth';
import { defaultActionsByRole } from '../utils/defaultActions'; // Import default actions
import { RowDataPacket } from 'mysql2';
import { ResultSetHeader } from 'mysql2';





const router = Router();

router.get(
  '/',
  authenticateToken,
  checkPermission('manage_users'), // ✅ Only users with this action can access
  async (req: Request, res: Response): Promise<void> => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users');

      const users = rows.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        firstName: u.first_name,
        lastName: u.last_name,
        details: u.details || {},
        permissions: u.permissions || { tabs: [], actions: [] },
      }));

      res.json(users);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

router.post(
  '/',
  authenticateToken,
  checkPermission('create_user'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        email,
        password,
        role,
        firstName,
        lastName,
        details = {},
        permissions = { tabs: [], actions: [] }
      } = req.body;

      // ✅ Check if email already exists
      const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

      if ((existing as any[]).length > 0) {
        res.status(400).json({ error: 'Email already exists' });
        return;
      }

      // ✅ Hash the password
      const passwordHash = await bcrypt.hash(password, 10);

      // ✅ Determine final permissions (fallback to defaults by role)
      const defaultActions = permissions.actions?.length
        ? permissions.actions
        : defaultActionsByRole[role] || [];

      // ✅ Insert new user
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO users (username, email, password_hash, role, first_name, last_name, details, permissions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          email, // use email as username
          email,
          passwordHash,
          role,
          firstName,
          lastName,
          JSON.stringify(details),
          JSON.stringify({
            tabs: permissions.tabs || [],
            actions: defaultActions
          })
        ]
      );

      const newUserId = result.insertId;

      // ✅ Log audit trail
      await logAuditAction({
        userId: req.user!.id,
        action: 'create_user',
        targetTable: 'users',
        targetId: newUserId,
        description: `Created user ${email}`
      });

      // ✅ Respond
      res.status(201).json({
        id: newUserId,
        email,
        username: email,
        role,
        firstName,
        lastName,
        details,
        permissions: {
          tabs: permissions.tabs || [],
          actions: defaultActions
        }
      });
    } catch (err) {
      console.error('❌ Error creating user:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);



router.get(
  '/:id',
  authenticateToken,
  checkPermission('view_user'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT id, email, role,
                first_name AS firstName,
                last_name AS lastName,
                details, permissions
         FROM users
         WHERE id = ?`,
        [id]
      );

      const user = rows[0];

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);

      // ✅ Log audit action
      await logAuditAction({
        userId: req.user!.id,
        action: 'view_user',
        targetTable: 'users',
        targetId: parseInt(id),
        description: `Viewed user ${id}`
      });
    } catch (err) {
      console.error('Error fetching user:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);
router.get(
  '/:id',
  authenticateToken,
  checkPermission('view_user'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT id, email, role,
                first_name AS firstName,
                last_name AS lastName,
                details, permissions
         FROM users
         WHERE id = ?`,
        [id]
      );

      const user = rows[0];

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);

      await logAuditAction({
        userId: req.user!.id,
        action: 'view_user',
        targetTable: 'users',
        targetId: parseInt(id),
        description: `Viewed user ${id}`
      });
    } catch (err) {
      console.error('Error fetching user:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);
  

router.delete(
  '/:id',
  authenticateToken,
  checkPermission('delete_user'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const [existingRows] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM users WHERE id = ?',
        [id]
      );

      if (existingRows.length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      await pool.query('DELETE FROM users WHERE id = ?', [id]);

      await logAuditAction({
        userId: req.user!.id,
        action: 'delete_user',
        targetTable: 'users',
        targetId: parseInt(id),
        description: `Deleted user ${id}`
      });

      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

  // PATCH /api/users/:id/password - admin-only password reset
  router.patch(
    '/:id/password',
    authenticateToken,
    checkPermission('reset_password'),
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const { id } = req.params;
        const { newPassword } = req.body;
  
        if (!newPassword || newPassword.length < 6) {
          res.status(400).json({ error: 'Password must be at least 6 characters' });
          return;
        }
  
        const [rows] = await pool.query<RowDataPacket[]>(
          'SELECT id FROM users WHERE id = ?',
          [id]
        );
  
        if (rows.length === 0) {
          res.status(404).json({ error: 'User not found' });
          return;
        }
  
        const hashedPassword = await bcrypt.hash(newPassword, 10);
  
        await pool.query(
          'UPDATE users SET password_hash = ? WHERE id = ?',
          [hashedPassword, id]
        );
  
        await logAuditAction({
          userId: req.user!.id,
          action: 'reset_password',
          targetTable: 'users',
          targetId: parseInt(id),
          description: `Reset password for user ${id}`
        });
  
        res.json({ message: 'Password updated successfully' });
      } catch (err) {
        console.error('Error updating password:', err);
        res.status(500).json({ error: 'Server error' });
      }
    }
  );

  router.patch(
    '/:id/status',
    authenticateToken,
    checkPermission('update_status'),
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const { id } = req.params;
        const { status } = req.body;
  
        const allowedStatuses = ['active', 'inactive', 'suspended'];
        if (!allowedStatuses.includes(status)) {
          res.status(400).json({ error: 'Invalid status' });
          return;
        }
  
        await pool.query(
          `UPDATE users SET details = JSON_SET(details, '$.status', ?) WHERE id = ?`,
          [status, id]
        );
  
        await logAuditAction({
          userId: req.user!.id,
          action: 'update_status',
          targetTable: 'users',
          targetId: parseInt(id),
          description: `Updated user ${id} status to ${status}`
        });
  
        res.json({ message: 'Status updated successfully' });
      } catch (err) {
        console.error('Error updating user status:', err);
        res.status(500).json({ error: 'Server error' });
      }
    }
  );
  

  // PATCH /api/users/:id/permissions - Update permissions
  router.patch(
    '/:id/permissions',
    authenticateToken,
    checkPermission('update_permissions'),
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const id = parseInt(req.params.id);
  
        if (!id || isNaN(id)) {
          res.status(400).json({ error: 'Invalid user ID' });
          return;
        }
  
        const { permissions } = req.body;
  
        if (
          !permissions ||
          !Array.isArray(permissions.tabs) ||
          !Array.isArray(permissions.actions)
        ) {
          res.status(400).json({ error: 'Invalid permissions format' });
          return;
        }
  
        await pool.query(
          `UPDATE users SET permissions = ? WHERE id = ?`,
          [JSON.stringify(permissions), id]
        );
  
        await logAuditAction({
          userId: req.user!.id,
          action: 'update_permissions',
          targetTable: 'users',
          targetId: id,
          description: `Updated permissions for user ${id}`
        });
  
        res.json({ message: 'User permissions updated successfully' });
      } catch (err) {
        console.error('Error updating permissions:', err);
        res.status(500).json({ error: 'Server error' });
      }
    }
  );
  
  router.put(
    '/:id',
    authenticateToken,
    checkPermission('edit_user'),
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const { id } = req.params;
        const {
          firstName,
          lastName,
          role,
          details = {},
          permissions = { tabs: [], actions: [] }
        } = req.body;
  
        // Use the default actions for the role
        const actions = defaultActionsByRole[role] || [];
  
        // Update user using pooled connection
        await pool.query(
          `UPDATE users
           SET first_name = ?, last_name = ?, role = ?, details = ?, permissions = ?
           WHERE id = ?`,
          [
            firstName,
            lastName,
            role,
            JSON.stringify(details),
            JSON.stringify({ tabs: permissions.tabs, actions }),
            id
          ]
        );
  
        res.json({ message: 'User updated successfully' });
  
      } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Server error' });
      }
    }
  );
  
  

export default router;
