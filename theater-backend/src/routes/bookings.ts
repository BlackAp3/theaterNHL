import { format } from 'date-fns'; // 🧠 add this at the very top of the file if not already
import { RowDataPacket } from 'mysql2';
import { Router } from 'express';
import { pool } from '../config/db'; // ✅ use pool, not db
import { ResultSetHeader } from 'mysql2';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { Request, Response } from 'express';



const router = Router();


router.get('/secure-data', authenticateToken, (req: AuthenticatedRequest, res) => {
    res.json({ message: 'Access granted', user: req.user });
  });


  router.get('/schedule', async (req, res) => {
    const { start, end } = req.query;
  
    try {
      const [rows] = await pool.query(
        `SELECT * FROM bookings
         WHERE start_time BETWEEN ? AND ?
         ORDER BY start_time ASC`,
        [start, end]
      );
  
      res.json(rows);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// GET /api/bookings - fetch all bookings
router.get('/', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM bookings ORDER BY start_time DESC');
    res.json(results);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
  const {
    patient_first_name,
    patient_last_name,
    operation_type,
    doctor,
    theater,
    start_time,
    end_time,
    status,
    date_of_birth,
    gender,
    phone_contact,
    anesthesia_review,
    classification,
    urgency_level,
    diagnosis,
    special_requirements,
    mode_of_payment,
    patient_location
  } = req.body;

  const query = `
    INSERT INTO bookings (
      patient_first_name,
      patient_last_name,
      operation_type,
      doctor,
      theater,
      start_time,
      end_time,
      status,
      date_of_birth,
      gender,
      phone_contact,
      anesthesia_review,
      classification,
      urgency_level,
      diagnosis,
      special_requirements,
      mode_of_payment,
      patient_location
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    patient_first_name,
    patient_last_name,
    operation_type,
    doctor,
    theater,
    start_time,
    end_time,
    status,
    date_of_birth,
    gender,
    phone_contact,
    anesthesia_review,
    classification,
    urgency_level,
    diagnosis,
    special_requirements,
    mode_of_payment,
    patient_location
  ];

  try {
    const [result] = await pool.query<ResultSetHeader>(query, values);

    res.status(201).json({
      message: 'Booking created successfully',
      id: result.insertId
    });
  } catch (err) {
    console.error('Error inserting booking:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    patient_first_name,
    patient_last_name,
    operation_type,
    doctor,
    theater,
    start_time,
    end_time,
    status,
    date_of_birth,
    gender,
    phone_contact,
    anesthesia_review,
    classification,
    urgency_level,
    diagnosis,
    special_requirements,
    mode_of_payment,
    patient_location
  } = req.body;

  const query = `
    UPDATE bookings SET
      patient_first_name = ?, patient_last_name = ?, operation_type = ?, doctor = ?, theater = ?,
      start_time = ?, end_time = ?, status = ?, date_of_birth = ?, gender = ?, phone_contact = ?,
      anesthesia_review = ?, classification = ?, urgency_level = ?, diagnosis = ?, special_requirements = ?,
      mode_of_payment = ?, patient_location = ?
    WHERE id = ?
  `;

  const values = [
    patient_first_name, patient_last_name, operation_type, doctor, theater,
    start_time, end_time, status, date_of_birth, gender, phone_contact,
    anesthesia_review, classification, urgency_level, diagnosis, special_requirements,
    mode_of_payment, patient_location, id
  ];

  try {
    const [result] = await pool.query<ResultSetHeader>(query, values);

    res.json({ message: 'Booking updated successfully' });
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  // GET /api/bookings/:id - fetch one booking by ID


  router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    const query = `UPDATE bookings SET status = ? WHERE id = ?`;
  
    try {
      await pool.query(query, [status, id]);
      res.json({ message: 'Status updated successfully' });
    } catch (err) {
      console.error('Error updating status:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  router.post(
    '/conflicts',
    authenticateToken,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { theater, start_time, end_time } = req.body;
  
      const query = `
        SELECT * FROM bookings
        WHERE theater = ?
          AND (? < end_time AND ? > start_time)
      `;
  
      try {
        const [rows] = await pool.query(query, [theater, start_time, end_time]);
        const conflicts = rows as RowDataPacket[];
  
        if (conflicts.length > 0) {
          res.status(409).json({ message: 'Theater is already booked during this time' });
          return;
        }
  
        res.status(200).json({ message: 'No conflict' });
      } catch (err) {
        console.error('Error checking conflicts:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );
  

  router.get('/dashboard/stats', async (req, res) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
  
    const summaryQuery = `
      SELECT
        (SELECT COUNT(*) FROM bookings) AS totalPatients,
        (SELECT AVG(TIMESTAMPDIFF(MINUTE, start_time, end_time)) FROM bookings) AS averageWaitTime,
        (SELECT COUNT(*) FROM bookings WHERE status = 'pending') AS pendingReviews,
        (SELECT COUNT(*) FROM bookings WHERE status = 'completed') AS completedOperations
    `;
  
    const weeklyQuery = `
      SELECT DATE(start_time) as name, COUNT(*) as operations
      FROM bookings
      WHERE start_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(start_time)
      ORDER BY DATE(start_time)
    `;
  
    const todayOpsQuery = `
      SELECT id, CONCAT(patient_first_name, ' ', patient_last_name) AS patient,
             operation_type AS operation, doctor, TIME(start_time) AS time, status
      FROM bookings
      WHERE DATE(start_time) = ?
      ORDER BY start_time ASC
    `;
  
    const typesQuery = `
      SELECT operation_type AS name, COUNT(*) AS value
      FROM bookings
      GROUP BY operation_type
    `;
  
    try {
      const [summary] = await pool.query(summaryQuery);
      const stats = (summary as RowDataPacket[])[0];
  
      const [weeklyData] = await pool.query(weeklyQuery);
      const [todayOperations] = await pool.query(todayOpsQuery, [todayStr]);
      const [operationTypes] = await pool.query(typesQuery);
  
      res.json({
        ...stats,
        weeklyData,
        todayOperations,
        operationTypes
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

  router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
  
    try {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM bookings WHERE id = ?', [id]);
  
      if (rows.length === 0) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }
  
      res.json(rows[0]);
    } catch (err) {
      console.error('Error fetching booking by ID:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  
  

export default router;
