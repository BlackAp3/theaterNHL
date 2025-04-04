import { Router, Request, Response } from 'express';
import { db } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorizeRole';

const router = Router();

// GET /api/audit-logs - Admin only
router.get('/', authenticateToken, authorizeRoles('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const [logs] = await db.promise().query(
      `SELECT 
         a.id,
         a.user_id,
         u.email AS performed_by,
         a.action,
         a.target_table,
         a.target_id,
         a.description,
         a.timestamp
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.timestamp DESC
       LIMIT 100`
    );

    res.json(logs);
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
