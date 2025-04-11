import { pool } from '../config/db';

export async function logAuditAction({
  userId,
  action,
  targetTable,
  targetId,
  description
}: {
  userId: number;
  action: string;
  targetTable?: string;
  targetId?: number;
  description?: string;
}) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, target_table, target_id, description)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        action,
        targetTable || null,
        targetId || null,
        description || null
      ]
    );
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}
