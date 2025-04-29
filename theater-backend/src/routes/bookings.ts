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
router.get('/', async (req: Request, res: Response) => {
  const { isEmergency } = req.query;

  let query = 'SELECT * FROM bookings';
  const values: any[] = [];

  if (isEmergency === 'true') {
    query += ' WHERE is_emergency = 1';
  } else if (isEmergency === 'false') {
    query += ' WHERE (is_emergency = 0 OR is_emergency IS NULL)';
  }

  query += ' ORDER BY start_time DESC';

  try {
    const [results] = await pool.query<RowDataPacket[]>(query, values);

// Sanitize null fields before sending to frontend
const cleaned = results.map(b => ({
  ...b,
  mode_of_payment: b.mode_of_payment ?? 'N/A',
  anesthesia_review: b.anesthesia_review ?? 'No',
  gender: b.gender ?? 'Unspecified',
  special_requirements: b.special_requirements ?? 'None'
}));
console.log('Sanitized bookings:', cleaned);

res.json(cleaned);

  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post('/', async (req: Request, res: Response): Promise<void> => {
  const {
    patient_id,
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

  // First check for conflicts
  const conflictQuery = `
    SELECT * FROM bookings
    WHERE theater = ?
      AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?) OR
        (start_time >= ? AND end_time <= ?)
      )
  `;

  try {
    const [conflicts] = await pool.query<RowDataPacket[]>(conflictQuery, [
      theater,
      end_time,
      start_time,
      end_time,
      start_time,
      start_time,
      end_time
    ]);

    if (conflicts.length > 0) {
      const conflictDetails = conflicts.map(c => ({
        id: c.id,
        start_time: new Date(c.start_time).toLocaleString(),
        end_time: new Date(c.end_time).toLocaleString(),
        operation_type: c.operation_type,
        doctor: c.doctor,
        patient: `${c.patient_first_name} ${c.patient_last_name}`
      }));

      res.status(409).json({ 
        error: 'Scheduling Conflict Detected',
        message: 'The selected time slot overlaps with existing bookings.',
        details: {
          theater: theater,
          requested_time: {
            start: new Date(start_time).toLocaleString(),
            end: new Date(end_time).toLocaleString()
          },
          conflicting_bookings: conflictDetails
        },
        suggestion: 'Please choose a different time slot or theater.'
      });
      return;
    }

    // If no conflicts, proceed with booking creation
    const query = `
      INSERT INTO bookings (
        patient_id,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      patient_id,
      patient_first_name,
      patient_last_name,
      operation_type,
      doctor,
      theater,
      start_time,
      end_time,
      status || 'scheduled',
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

    // Check for existing patient_id
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM bookings WHERE patient_id = ?',
      [patient_id]
    );

    if (existing.length > 0) {
      res.status(409).json({ error: 'A booking with this patient_id already exists' });
      return;
    }

    // Insert booking
    const [result] = await pool.query<ResultSetHeader>(query, values);

    res.status(201).json({
      message: 'Booking created successfully',
      id: result.insertId
    });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Duplicate patient_id not allowed' });
      return;
    }

    console.error('Error inserting booking:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    patient_id,
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

  // First check for conflicts
  const conflictQuery = `
    SELECT * FROM bookings
    WHERE theater = ?
      AND id != ?
      AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?) OR
        (start_time >= ? AND end_time <= ?)
      )
  `;

  try {
    const [conflicts] = await pool.query<RowDataPacket[]>(conflictQuery, [
      theater,
      id,
      end_time,
      start_time,
      end_time,
      start_time,
      start_time,
      end_time
    ]);

    if (conflicts.length > 0) {
      // Get all theaters
      const [theaters] = await pool.query<RowDataPacket[]>(
        'SELECT DISTINCT theater FROM bookings WHERE theater IS NOT NULL'
      );
      
      // Get available theaters for the requested time slot
      const [availableTheaters] = await pool.query<RowDataPacket[]>(
        `SELECT DISTINCT theater 
         FROM bookings 
         WHERE theater NOT IN (
           SELECT theater 
           FROM bookings 
           WHERE (
             (start_time <= ? AND end_time > ?) OR
             (start_time < ? AND end_time >= ?) OR
             (start_time >= ? AND end_time <= ?)
           )
         )`,
        [end_time, start_time, end_time, start_time, start_time, end_time]
      );

      const conflictDetails = conflicts.map(c => ({
        id: c.id,
        start_time: new Date(c.start_time).toLocaleString(),
        end_time: new Date(c.end_time).toLocaleString(),
        operation_type: c.operation_type,
        doctor: c.doctor,
        patient: `${c.patient_first_name} ${c.patient_last_name}`
      }));

      res.status(409).json({ 
        error: 'Scheduling Conflict Detected',
        message: 'The selected time slot overlaps with existing bookings.',
        details: {
          theater: theater,
          requested_time: {
            start: new Date(start_time).toLocaleString(),
            end: new Date(end_time).toLocaleString()
          },
          conflicting_bookings: conflictDetails,
          available_theaters: availableTheaters.map(t => t.theater),
          all_theaters: theaters.map(t => t.theater)
        },
        suggestion: 'Please choose a different time slot or select one of the available theaters.'
      });
      return;
    }

    // If no conflicts, proceed with update
    const query = `
      UPDATE bookings SET
        patient_id = ?,
        patient_first_name = ?,
        patient_last_name = ?,
        operation_type = ?,
        doctor = ?,
        theater = ?,
        start_time = ?,
        end_time = ?,
        status = ?,
        date_of_birth = ?,
        gender = ?,
        phone_contact = ?,
        anesthesia_review = ?,
        classification = ?,
        urgency_level = ?,
        diagnosis = ?,
        special_requirements = ?,
        mode_of_payment = ?,
        patient_location = ?
      WHERE id = ?
    `;

    const values = [
      patient_id,
      patient_first_name,
      patient_last_name,
      operation_type,
      doctor,
      theater,
      start_time,
      end_time,
      status || 'scheduled',
      date_of_birth,
      gender,
      phone_contact,
      anesthesia_review,
      classification,
      urgency_level,
      diagnosis,
      special_requirements,
      mode_of_payment,
      patient_location,
      id
    ];

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
      const { theater, start_time, end_time, booking_id } = req.body;
  
      // Validate input
      if (!theater || !start_time || !end_time) {
        res.status(400).json({ error: 'Missing required fields: theater, start_time, or end_time' });
        return;
      }

      // Ensure start_time is before end_time
      if (new Date(start_time) >= new Date(end_time)) {
        res.status(400).json({ error: 'start_time must be before end_time' });
        return;
      }
  
      const query = `
        SELECT * FROM bookings
        WHERE theater = ?
          AND id != ?  -- Exclude current booking when checking for conflicts
          AND (
            (start_time <= ? AND end_time > ?) OR  -- New booking starts during existing booking
            (start_time < ? AND end_time >= ?) OR  -- New booking ends during existing booking
            (start_time >= ? AND end_time <= ?)    -- New booking is completely within existing booking
          )
      `;
  
      try {
        const [rows] = await pool.query(query, [
          theater,
          booking_id || 0, // If no booking_id provided, use 0 to not exclude any bookings
          end_time,
          start_time,
          end_time,
          start_time,
          start_time,
          end_time
        ]);
        
        const conflicts = rows as RowDataPacket[];
  
        if (conflicts.length > 0) {
          res.status(409).json({ 
            message: 'Theater is already booked during this time',
            conflicts: conflicts.map(c => ({
              id: c.id,
              start_time: c.start_time,
              end_time: c.end_time,
              operation_type: c.operation_type,
              doctor: c.doctor
            }))
          });
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
