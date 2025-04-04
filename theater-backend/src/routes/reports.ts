import { Router } from 'express';
import { db } from '../config/db';
import { RowDataPacket } from 'mysql2';

const router = Router();

router.get('/stats', async (req, res) => {
  try {
    const monthlyQuery = `
      SELECT MONTHNAME(start_time) AS month, COUNT(*) AS operations
      FROM bookings
      GROUP BY MONTH(start_time), MONTHNAME(start_time)
      ORDER BY MONTH(start_time)
    `;

    const typesQuery = `
      SELECT operation_type AS name, COUNT(*) AS value
      FROM bookings
      GROUP BY operation_type
    `;

    const [monthlyData] = await db.promise().query<RowDataPacket[]>(monthlyQuery);
    const [operationTypes] = await db.promise().query<RowDataPacket[]>(typesQuery);

    // Fake metrics for now (you can calculate real ones later)
    const metrics = {
      averageOperationTime: '1h 45m',
      theaterUtilization: '82%',
      patientSatisfaction: '4.5/5',
    };

    res.json({
      monthlyData,
      operationTypes,
      metrics,
    });
  } catch (err) {
    console.error('❌ Error in /api/reports/stats:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

export default router;
