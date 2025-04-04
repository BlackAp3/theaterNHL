import { format } from 'date-fns'; // 🧠 add this at the very top of the file if not already
import { RowDataPacket } from 'mysql2';
import { Router } from 'express';
import { db } from '../config/db';
import { ResultSetHeader } from 'mysql2';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';


const router = Router();


router.get('/secure-data', authenticateToken, (req: AuthenticatedRequest, res) => {
    res.json({ message: 'Access granted', user: req.user });
  });

 // GET /api/bookings/schedule?start=YYYY-MM-DD&end=YYYY-MM-DD
 router.get('/schedule', (req, res) => {
    const { start, end } = req.query;
  
    const query = `
      SELECT * FROM bookings
      WHERE start_time BETWEEN ? AND ?
      ORDER BY start_time ASC
    `;
  
    db.query(query, [start, end], (err, results) => {
      if (err) {
        console.error('Error fetching schedule:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.json(results);
    });
  });
  

  router.get('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM bookings WHERE id = ?';
  
    db.query(query, [id], (err, results) => {
        if (err) {
          console.error('Error fetching booking by ID:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      
        const rows = results as RowDataPacket[];
      
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Booking not found' });
        }
      
        res.json(rows[0]); // ✅ this is now typed correctly
      });
      
  });

// GET /api/bookings - fetch all bookings
router.get('/', (req, res) => {
  const query = 'SELECT * FROM bookings ORDER BY start_time DESC';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching bookings:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.json(results);
  });
});

// POST /api/bookings - add a new booking
router.post('/', (req, res) => {
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

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting booking:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const insertResult = result as ResultSetHeader;

    res.status(201).json({
      message: 'Booking created successfully',
      id: insertResult.insertId
    });
  });
});

// PUT /api/bookings/:id - update booking
router.put('/:id', (req, res) => {
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
  
    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error updating booking:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.json({ message: 'Booking updated successfully' });
    });
  });

  // GET /api/bookings/:id - fetch one booking by ID


  // PATCH /api/bookings/:id/status - update booking status only
router.patch('/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    const query = `UPDATE bookings SET status = ? WHERE id = ?`;
    db.query(query, [status, id], (err) => {
      if (err) {
        console.error('Error updating status:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.json({ message: 'Status updated successfully' });
    });
  });
  

  router.post('/conflicts', (req, res) => {
    const { theater, start_time, end_time } = req.body;
  
    const query = `
      SELECT * FROM bookings
      WHERE theater = ?
        AND (? < end_time AND ? > start_time)
    `;
  
    db.query(query, [theater, start_time, end_time], (err, results) => {
      if (err) {
        console.error('Error checking conflicts:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      const rows = results as RowDataPacket[];
  
      if (rows.length > 0) {
        return res.status(409).json({ message: 'Theater is already booked during this time' });
      }
  
      res.status(200).json({ message: 'No conflict' });
    });
  });

  router.get('/dashboard/stats', (req, res) => {
    const today = new Date();
    const todayStr = format(new Date(), 'yyyy-MM-dd'); // ✅ this gives correct local date

  
    const query = `
    SELECT
      (SELECT COUNT(*) FROM bookings) AS totalPatients,
      (SELECT AVG(TIMESTAMPDIFF(MINUTE, start_time, end_time)) FROM bookings) AS averageWaitTime,
      (SELECT COUNT(*) FROM bookings WHERE status = 'pending') AS pendingReviews,
      (SELECT COUNT(*) FROM bookings WHERE status = 'completed') AS completedOperations
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching dashboard stats:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  
    const rows = results as RowDataPacket[];
    const stats = rows[0];
  
      // Fetch extra data
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
  
      db.query(weeklyQuery, (err2, weeklyData) => {
        if (err2) return res.status(500).json({ error: 'Failed to fetch weekly data' });
        console.log('📅 Today is:', todayStr);

  
        db.query(todayOpsQuery, [todayStr], (err3, todayOperations) => {
          if (err3) return res.status(500).json({ error: 'Failed to fetch today\'s operations' });
  
          db.query(typesQuery, (err4, operationTypes) => {
            if (err4) return res.status(500).json({ error: 'Failed to fetch operation types' });
  
            res.json({
              ...stats,
              weeklyData,
              todayOperations,
              operationTypes
            });
          });
        });
      });
    });
  });
  


  
  
  

export default router;
