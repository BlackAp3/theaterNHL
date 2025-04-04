import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { RowDataPacket } from 'mysql2';

// Authenticated request type
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: 'admin' | 'manager' | 'nurse' | 'viewer';
    permissions: {
      actions: string[];
      tabs: string[];
    };
  };
}

// Middleware
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token missing' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secretkey', async (err, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }

    try {
      const [rows] = await db
        .promise()
        .query<RowDataPacket[]>('SELECT id, username, role, permissions FROM users WHERE id = ?', [decoded.id]);

      const dbUser = rows[0];

      if (!dbUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      req.user = {
        id: dbUser.id,
        username: dbUser.username,
        role: dbUser.role,
        permissions: dbUser.permissions || { tabs: [], actions: [] }
      };

      next();
    } catch (dbErr) {
      console.error('❌ Database error in authenticateToken:', dbErr);
      res.status(500).json({ error: 'Server error' });
    }
  });
}
