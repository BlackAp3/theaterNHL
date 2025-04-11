import { RowDataPacket } from 'mysql2';
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/db';
import { ResultSetHeader } from 'mysql2';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import { authorizeRoles } from '../middleware/authorizeRole';
import { defaultTabsForRole } from '../utils/defaultTabs'; // ✅ at the top




export const authRouter = Router();

// ✅ Register User - only for admins
// ✅ Enhanced Registration Route
authRouter.post('/register', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { email, password, role, firstName, lastName, details, permissions } = req.body;
  
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Only admins can register users' });
      return;
    }
  
    if (!email || !password || !role || !firstName || !lastName) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const query = `
        INSERT INTO users (
          username, password_hash, role, email,
          first_name, last_name, details, permissions
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
      const values = [
        email, // using email as username
        hashedPassword,
        role,
        email,
        firstName,
        lastName,
        JSON.stringify(details),
        JSON.stringify(permissions)
      ];
  
      try {
        const [result] = await pool.query<ResultSetHeader>(query, values);
      
        res.status(201).json({
          message: 'User registered successfully',
          userId: result.insertId
        });
      } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
          res.status(409).json({ error: 'Email already exists' });
          return;
        }
      
        console.error('Error inserting user:', err);
        res.status(500).json({ error: 'Server error' });
      }
      
    } catch (err) {
      console.error('Hashing error:', err);
      res.status(500).json({ error: 'Error hashing password' });
    }
  });


// ✅ Change Password - for logged-in user
authRouter.post('/change-password', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    res.status(400).json({ error: 'Old and new password are required' });
    return;
  }

  const userId = req.user!.id;

  try {
    const [results] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = (results as any[])[0];

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Old password is incorrect' });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedNewPassword, userId]);

    res.json({ message: 'Password changed successfully' });

  } catch (err) {
    console.error('❌ Error in change-password:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ✅ Login Route
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  console.log('📦 Received body:', req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const [results] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    const rows = results as RowDataPacket[];

    if (rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // ✅ Parse permissions
    let parsedPermissions = { tabs: [], actions: [] };
    try {
      parsedPermissions = typeof user.permissions === 'string'
        ? JSON.parse(user.permissions)
        : user.permissions;
    } catch (err) {
      console.warn('⚠️ Failed to parse permissions JSON. Defaulting.');
    }

    // ✅ Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: parsedPermissions
      },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    // ✅ Return token + user info
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        permissions: parsedPermissions,
        details: user.details
      }
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


authRouter.get(
  '/users',
  authenticateToken,
  authorizeRoles('admin'), // 👈 only admins can access this
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const [results] = await pool.query(
        'SELECT id, username, email, role, first_name, last_name, details, permissions FROM users'
      );

      const users = (results as RowDataPacket[]).map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        details: user.details,
        permissions: user.permissions
      }));

      res.json(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ✅ PUT /api/auth/users/:id — Admin-only
authRouter.put(
  '/users/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { email, role, firstName, lastName, details, permissions } = req.body;

    if (!email || !role || !firstName || !lastName) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const updateQuery = `
      UPDATE users SET 
        email = ?, role = ?, first_name = ?, last_name = ?, 
        details = ?, permissions = ?
      WHERE id = ?
    `;

    const values = [
      email,
      role,
      firstName,
      lastName,
      JSON.stringify(details || {}),
      JSON.stringify(permissions || {}),
      id
    ];

    try {
      await pool.query(updateQuery, values);
      res.json({ message: 'User updated successfully' });
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ error: 'Error updating user' });
    }
  }
);

 // ✅ DELETE /api/auth/users/:id - Admin-only
authRouter.delete(
  '/users/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const deleteQuery = 'DELETE FROM users WHERE id = ?';

    try {
      await pool.query(deleteQuery, [id]);
      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
);

  // ✅ PATCH /api/auth/users/:id/status — Admin-only


  // ✅ PATCH /api/auth/users/:id/status — Admin-only
  authRouter.patch(
    '/users/:id/status',
    authenticateToken,
    authorizeRoles('admin'),
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const { status } = req.body;
  
      if (!['active', 'inactive', 'suspended'].includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }
  
      const updateQuery = `
        UPDATE users
        SET details = JSON_SET(details, '$.status', ?)
        WHERE id = ?
      `;
  
      try {
        await pool.query(updateQuery, [status, id]);
        res.json({ message: 'User status updated successfully' });
      } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).json({ error: 'Error updating user status' });
      }
    }
  );
  // ✅ PATCH /api/auth/users/:id/permissions — Admin-only
  authRouter.patch(
    '/users/:id/permissions',
    authenticateToken,
    authorizeRoles('admin'),
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      console.log('🛠️ Incoming ID:', req.params.id);
  
      const id = parseInt(req.params.id);
  
      if (!id || isNaN(id)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
  
      const { permissions } = req.body;
  
      if (!permissions || typeof permissions !== 'object') {
        res.status(400).json({ error: 'Invalid permissions format' });
        return;
      }
  
      const updateQuery = `UPDATE users SET permissions = ? WHERE id = ?`;
  
      try {
        await pool.query(updateQuery, [JSON.stringify(permissions), id]);
        res.json({ message: 'User permissions updated successfully' });
      } catch (err) {
        console.error('Error updating permissions:', err);
        res.status(500).json({ error: 'Error updating permissions' });
      }
    }
  );
  
  authRouter.get('/me/role', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(400).json({ error: 'User ID missing from request' });
        return;
      }
  
      const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
  
      if ((rows as RowDataPacket[]).length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
  
      const user = (rows as RowDataPacket[])[0];
      res.json({ role: user.role });
  
    } catch (error) {
      console.error('❌ Error in /me/role route:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  authRouter.get(
    '/me/tabs',
    authenticateToken,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          res.status(400).json({ error: 'User ID is required' });
          return;
        }
  
        const [rows] = await pool.query(
          'SELECT role, permissions FROM users WHERE id = ?',
          [userId]
        );
  
        const user = (rows as any[])[0];
  
        if (!user) {
          res.status(404).json({ error: 'User not found' });
          return;
        }
  
        let parsedPermissions: any = { tabs: [] };
  
        try {
          parsedPermissions =
            typeof user.permissions === 'string'
              ? JSON.parse(user.permissions)
              : user.permissions || {};
        } catch {
          parsedPermissions = {};
        }
  
        const userTabs: string[] =
          parsedPermissions.tabs && parsedPermissions.tabs.length > 0
            ? parsedPermissions.tabs
            : defaultTabsForRole[user.role] || ['settings'];
  
        res.json({ tabs: userTabs });
      } catch (error) {
        console.error('❌ Error getting user tabs:', error);
        res.status(500).json({ error: 'Server error' });
      }
    }
  );


 
  
  