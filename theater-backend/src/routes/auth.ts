import { RowDataPacket } from 'mysql2';
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../config/db';
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
  
      db.query(query, values, async (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: 'Email already exists' });
            return;
          }
          console.error('Error inserting user:', err);
          res.status(500).json({ error: 'Server error' });
          return;
        }
  
        const insertResult = result as ResultSetHeader;
       
  
        res.status(201).json({
          message: 'User registered successfully',
          userId: insertResult.insertId
        });
      });
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

  const getUserQuery = 'SELECT * FROM users WHERE id = ?';
  db.query(getUserQuery, [userId], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

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
    const updateQuery = 'UPDATE users SET password_hash = ? WHERE id = ?';

    db.query(updateQuery, [hashedNewPassword, userId], async (err2) => {
      if (err2) {
        console.error('Error updating password:', err2);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

     

      res.json({ message: 'Password changed successfully' });
    });
  });
});

// ✅ Login Route
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  console.log('📦 Received body:', req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

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

    // ✅ Safely parse permissions from JSON string
    let parsedPermissions = { tabs: [], actions: [] };
    try {
      parsedPermissions = typeof user.permissions === 'string'
        ? JSON.parse(user.permissions)
        : user.permissions;
    } catch (err) {
      console.warn('⚠️ Failed to parse permissions JSON. Defaulting.');
    }

    // ✅ Create JWT with permissions
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

    // ✅ Send full user info and token
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
  });
});



  // ✅ GET /api/auth/users - Admin-only
  authRouter.get(
    '/users',
    authenticateToken,
    authorizeRoles('admin'), // 👈 only admins can access this
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const query = 'SELECT id, username, email, role, first_name, last_name, details, permissions FROM users';
  
      db.query(query, async (err, results) => {
        if (err) {
          console.error('Error fetching users:', err);
          res.status(500).json({ error: 'Server error' });
          return;
        }
  
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
      });
    }
  );
  
// PUT /api/auth/users/:id — Admin-only
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
  
      db.query(updateQuery, values, async (err, result) => {
        if (err) {
          console.error('Error updating user:', err);
          res.status(500).json({ error: 'Error updating user' });
          return;
        }
  
      
        res.json({ message: 'User updated successfully' });
      });
    }
  );

  // DELETE /api/auth/users/:id - Admin-only
authRouter.delete(
    '/users/:id',
    authenticateToken,
    authorizeRoles('admin'),
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;
  
      const deleteQuery = 'DELETE FROM users WHERE id = ?';
  
      db.query(deleteQuery, [id], async (err, result) => {
        if (err) {
          console.error('Error deleting user:', err);
          res.status(500).json({ error: 'Failed to delete user' });
          return;
        }
  
  
        res.json({ message: 'User deleted successfully' });
      });
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
  
      db.query(updateQuery, [status, id], async (err, result) => {
        if (err) {
          console.error('Error updating status:', err);
          res.status(500).json({ error: 'Error updating user status' });
          return;
        }
  
      
  
        res.json({ message: 'User status updated successfully' });
      });
    }
  );

  // ✅ PATCH /api/auth/users/:id/permissions — Admin-only
  authRouter.patch(
    '/users/:id/permissions',
    authenticateToken,
    authorizeRoles('admin'),
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      console.log('🛠️ Incoming ID:', req.params.id); // 🪵 Debug log
  
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
  
      db.query(updateQuery, [JSON.stringify(permissions), id], async (err) => {
        if (err) {
          console.error('Error updating permissions:', err);
          res.status(500).json({ error: 'Error updating permissions' });
          return;
        }
  
     
        res.json({ message: 'User permissions updated successfully' });
      });
    }
  );
  
  // ✅ GET /api/auth/me/role — return current user's role
authRouter.get('/me/role', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const query = 'SELECT role FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching role:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      if (!results || (results as RowDataPacket[]).length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const user = (results as RowDataPacket[])[0];
      res.json({ role: user.role });
    });
  } catch (error) {
    console.error('Error in /me/role route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.get(
  '/me/tabs',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      const [rows] = await db.promise().query(
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
      console.error('Error getting user tabs:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);



 
  
  