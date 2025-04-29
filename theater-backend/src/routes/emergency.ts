import express, { Request, Response } from 'express';
import { pool } from '../config/db';

const router = express.Router();

// Available theater options
const theaterOptions = [
  'Theater 1',
  'Theater 2',
  'Theater 3',
  'Theater 4',
];

// Available doctors list
const doctorOptions = [
  { value: "Dr. Fualal Jane Odubu - General Surgeon", label: "Dr. Fualal Jane Odubu - General Surgeon" },
  { value: "Dr. Noah Masiira Mukasa - General Surgeon", label: "Dr. Noah Masiira Mukasa - General Surgeon" },
  { value: "Dr. Nelson Onira Alema - General Surgeon", label: "Dr. Nelson Onira Alema - General Surgeon" },
  { value: "Dr. Johashaphat Jombwe - General Surgeon", label: "Dr. Johashaphat Jombwe - General Surgeon" },
  { value: "Dr. Ronald Mbiine - General Surgeon", label: "Dr. Ronald Mbiine - General Surgeon" },
  { value: "Dr. Makobore Patson - General Surgeon", label: "Dr. Makobore Patson - General Surgeon" },
  { value: "Dr. Vianney Kweyamba - General,HPB,GIT&Laparascopic Surgeon", label: "Dr. Vianney Kweyamba - General,HPB,GIT&Laparascopic Surgeon" },
  { value: "Dr.Gabriel Okumu - Inhouse-General Surgeon", label: "Dr.Gabriel Okumu - Inhouse-General Surgeon" },
  { value: "Dr. Francis Lakor - Maxillofacial & Oral Surgeon", label: "Dr. Francis Lakor - Maxillofacial & Oral Surgeon" },
  { value: "Dr. Michael Bironse - Maxillofacial & Oral Surgeon", label: "Dr. Michael Bironse - Maxillofacial & Oral Surgeon" },
  { value: "Dr. Juliet Nalwanga - Neurosurgeon", label: "Dr. Juliet Nalwanga - Neurosurgeon" },
  { value: "Dr. Justin Onen - Neurosurgeon", label: "Dr. Justin Onen - Neurosurgeon" },
  { value: "Dr. Peter Ssenyonga - Neurosurgeon", label: "Dr. Peter Ssenyonga - Neurosurgeon" },
  { value: "Dr. Hussein Ssenyonjo - Neurosurgeon", label: "Dr. Hussein Ssenyonjo - Neurosurgeon" },
  { value: "Dr. Michael Edgar Muhumuza - Neurosurgeon", label: "Dr. Michael Edgar Muhumuza - Neurosurgeon" },
  { value: "Dr.Rodney Mugarura - Orthopaedic Spine Surgeon", label: "Dr.Rodney Mugarura - Orthopaedic Spine Surgeon" },
  { value: "Dr.Malagala Joseph - Orthopaedic Surgeon", label: "Dr.Malagala Joseph - Orthopaedic Surgeon" },
  { value: "Dr. Edward Kironde - Orthopaedic Surgeon", label: "Dr. Edward Kironde - Orthopaedic Surgeon" },
  { value: "Dr. Ben Mbonye - Orthopaedic Surgeon", label: "Dr. Ben Mbonye - Orthopaedic Surgeon" },
  { value: "Dr. Edward Naddumba - Orthopaedic Surgeon", label: "Dr. Edward Naddumba - Orthopaedic Surgeon" },
  { value: "Dr. Isaac Kyamanywa - Orthopaedic Surgeon", label: "Dr. Isaac Kyamanywa - Orthopaedic Surgeon" },
  { value: "Dr. Isaac Ojangor - Orthopaedic Surgeon", label: "Dr. Isaac Ojangor - Orthopaedic Surgeon" },
  { value: "Dr. Fred Mutyaba - Orthopaedic Surgeon", label: "Dr. Fred Mutyaba - Orthopaedic Surgeon" },
  { value: "Dr. Arlene Muzira Nakanwangi - Paediatric Surgeon", label: "Dr. Arlene Muzira Nakanwangi - Paediatric Surgeon" },
  { value: "Dr. Nasser Kakembo - Paediatric Surgeon", label: "Dr. Nasser Kakembo - Paediatric Surgeon" },
  { value: "Dr. John Sekabira - Paediatric Surgeon", label: "Dr. John Sekabira - Paediatric Surgeon" },
  { value: "Dr. Phyllis Kisa - Paediatric Urology Surgeon", label: "Dr. Phyllis Kisa - Paediatric Urology Surgeon" },
  { value: "Dr. George Galiwango - Plastic & Reconstructive Surgeon", label: "Dr. George Galiwango - Plastic & Reconstructive Surgeon" },
  { value: "Dr. Martin Tungotyo - Plastic & Reconstructive Surgeon", label: "Dr. Martin Tungotyo - Plastic & Reconstructive Surgeon" },
  { value: "Dr. Robert Ssentongo - Plastic & Reconstructive Surgeon", label: "Dr. Robert Ssentongo - Plastic & Reconstructive Surgeon" },
  { value: "Dr. Leonard Odoi - Urologist/General Surgeon", label: "Dr. Leonard Odoi - Urologist/General Surgeon" },
  { value: "Dr. Badru Ssekitoleko - Urologist/General Surgeon", label: "Dr. Badru Ssekitoleko - Urologist/General Surgeon" },
  { value: "Dr. Frank Asiimwe Rubabinda - Urologist/General Surgeon", label: "Dr. Frank Asiimwe Rubabinda - Urologist/General Surgeon" },
  { value: "Dr. Godfrey Nabunwa - Urology Surgeon", label: "Dr. Godfrey Nabunwa - Urology Surgeon" },
  { value: "DR. NAOMI LEAH KEKISA - Plastic & Reconstructive Surgeon", label: "DR. NAOMI LEAH KEKISA - Plastic & Reconstructive Surgeon" },
  { value: "DR. FLAVIA WERE - General Surgeon", label: "DR. FLAVIA WERE - General Surgeon" },
  { value: "DR. CORNELIUS MASAMBA - Plastic & Reconstructive Surgeon", label: "DR. CORNELIUS MASAMBA - Plastic & Reconstructive Surgeon" },
  { value: "DR. IRENE ASABA ASABA - Plastic & Reconstructive Surgeon", label: "DR. IRENE ASABA ASABA - Plastic & Reconstructive Surgeon" }
];

// Classification options
const classificationOptions = [
  { value: "Minor", label: "Minor" },
  { value: "Major", label: "Major" },
  { value: "Critical", label: "Critical" }
];

// Urgency level options
const urgencyLevelOptions = [
  { value: "elective", label: "Elective" },
  { value: "urgent", label: "Urgent" },
  { value: "emergency", label: "Emergency" }
];

// Get available options for emergency booking
router.get('/options', async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      theaters: theaterOptions,
      doctors: doctorOptions,
      classifications: classificationOptions,
      urgencyLevels: urgencyLevelOptions
    });
  } catch (error) {
    console.error('Error fetching emergency options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/escalate/:id', async (req: Request, res: Response): Promise<void> => {
  const bookingId = parseInt(req.params.id);
  const { reason } = req.body;

  if (!reason) {
    res.status(400).json({ error: 'Emergency reason is required' });
    return;
  }

  try {
    const connection = await pool.getConnection();

    // Step 1: Validate original booking is eligible
    const [existingRows] = await connection.query(
      'SELECT * FROM bookings WHERE id = ? AND status IN (?, ?)',
      [bookingId, 'scheduled', 'pending']
    );

    if ((existingRows as any[]).length === 0) {
      connection.release();
      res.status(404).json({ error: 'Booking not found or not eligible for escalation' });
      return;
    }

    // Step 2: Check for duplicate escalation
    const [duplicateRows] = await connection.query(
      'SELECT id FROM bookings WHERE overridden_booking_id = ? AND is_emergency = 1',
      [bookingId]
    );

    if ((duplicateRows as any[]).length > 0) {
      connection.release();
      res.status(409).json({ error: 'This booking has already been escalated' });
      return;
    }

    const existing = (existingRows as any[])[0];

    // Step 3: Mark original as rescheduled
    await connection.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['preempted', bookingId]
    );
    

    // Step 4: Insert new emergency booking
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        // Step 3.5: Find overlapping future bookings in the same theater
        const emergencyStart = now;
        const emergencyEnd = oneHourLater;
    
        const [conflictingBookings] = await connection.query(
          `SELECT * FROM bookings
           WHERE theater = ? AND is_emergency = 0 AND status = 'scheduled'
           AND start_time < ? AND end_time > ?
           ORDER BY start_time ASC`,
          [existing.theater, emergencyEnd, emergencyStart]
        );
    
        console.log('Conflicting bookings:', conflictingBookings);
    
        // Step 3.6: Shift conflicting bookings forward
let shiftStart = oneHourLater; // After emergency ends
const shiftedBookingIds: number[] = [];

for (const booking of conflictingBookings as any[]) {
  const originalStart = new Date(booking.start_time);
  const originalEnd = new Date(booking.end_time);
  const durationMs = originalEnd.getTime() - originalStart.getTime(); // how long the surgery is

  let proposedStart = new Date(oneHourLater); // start checking after emergency ends
  let proposedEnd = new Date(proposedStart.getTime() + durationMs);

  let conflictFound = true;

  while (conflictFound) {
    const [futureConflicts] = await connection.query(
      `SELECT id FROM bookings
       WHERE theater = ?
         AND is_emergency = 0
         AND status = 'scheduled'
         AND (start_time < ? AND end_time > ?)
         LIMIT 1`,
      [existing.theater, proposedEnd, proposedStart]
    );

    if ((futureConflicts as any[]).length === 0) {
      // No conflict — safe to move
      conflictFound = false;
    } else {
      // Conflict found — shift by 30 minutes and retry
      proposedStart = new Date(proposedStart.getTime() + 30 * 60 * 1000); // +30 min
      proposedEnd = new Date(proposedStart.getTime() + durationMs);
    }
  }

  // Update booking with safe new time
  await connection.query(
    'UPDATE bookings SET start_time = ?, end_time = ? WHERE id = ?',
    [proposedStart, proposedEnd, booking.id]
  );

  shiftedBookingIds.push(booking.id);

  console.log(`Smart Shifted Booking #${booking.id}: ${originalStart.toISOString()} → ${proposedStart.toISOString()}`);
}


    const [result] = await connection.query(
      `INSERT INTO bookings (
        patient_id, patient_first_name, patient_last_name, operation_type, doctor, theater,
        start_time, end_time, status, date_of_birth, gender, phone_contact, anesthesia_review,
        classification, urgency_level, diagnosis, special_requirements, mode_of_payment,
        patient_location, is_emergency, emergency_reason, overridden_booking_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        existing.patient_id,
        existing.patient_first_name,
        existing.patient_last_name,
        existing.operation_type,
        existing.doctor,
        existing.theater,
        now,
        oneHourLater,
        'scheduled',
        existing.date_of_birth,
        existing.gender,
        existing.phone_contact,
        existing.anesthesia_review,
        existing.classification,
        existing.urgency_level,
        existing.diagnosis,
        existing.special_requirements,
        existing.mode_of_payment,
        existing.patient_location,
        true,
        reason,
        bookingId
      ]
    );

    connection.release();

    res.status(201).json({
      message: 'Emergency operation created',
      emergencyBookingId: (result as any).insertId,
      overriddenBookingId: bookingId,
      shiftedBookingIds: shiftedBookingIds,
    });

  } catch (error) {
    console.error('Emergency escalation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel an emergency and restore the original booking
router.delete('/cancel/:id', async (req: Request, res: Response): Promise<void> => {
  const emergencyId = parseInt(req.params.id);

  try {
    const connection = await pool.getConnection();

    // 1. Fetch the emergency booking
    const [rows] = await connection.query(
      'SELECT * FROM bookings WHERE id = ? AND is_emergency = 1',
      [emergencyId]
    );

    if ((rows as any[]).length === 0) {
      connection.release();
      res.status(404).json({ error: 'Emergency booking not found' });
      return;
    }

    const emergencyBooking = (rows as any)[0];

    // 2. Restore the original booking if exists
    if (emergencyBooking.overridden_booking_id) {
      await connection.query(
        'UPDATE bookings SET status = ? WHERE id = ?',
        ['scheduled', emergencyBooking.overridden_booking_id]
      );
    }

    // 3. Delete the emergency booking
    await connection.query('DELETE FROM bookings WHERE id = ?', [emergencyId]);

    connection.release();
    res.status(200).json({
      message: 'Emergency booking cancelled and original booking restored',
      restoredBookingId: emergencyBooking.overridden_booking_id || null,
    });
  } catch (error) {
    console.error('Cancel emergency error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/check-conflicts', async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const [conflictingBookings] = await pool.query(
      `SELECT * FROM bookings
       WHERE theater = 'Theater 1' AND is_emergency = 0 AND status = 'scheduled'
       AND start_time < ? AND end_time > ?
       ORDER BY start_time ASC`,
      [oneHourLater, now]
    );

    console.log('Manual Conflicting bookings:', conflictingBookings);

    res.status(200).json({ conflicts: conflictingBookings });
  } catch (error) {
    console.error('Error checking conflicts manually:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 🚀 New: Direct emergency creation (fresh patient, not escalation)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const {
    patient_id,
    patient_first_name,
    patient_last_name,
    doctor,
    theater,
    operation_type,
    start_time,
    end_time,
    emergency_reason,
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
  } = req.body;

  if (!patient_id || !patient_first_name || !doctor || !theater || !start_time || !end_time || !emergency_reason) {
    res.status(400).json({ error: 'Missing required fields for emergency booking' });
    return;
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO emergency_bookings (
        patient_id, patient_first_name, patient_last_name, doctor, theater, operation_type,
        start_time, end_time, status, date_of_birth, gender, phone_contact, anesthesia_review,
        classification, urgency_level, diagnosis, special_requirements, mode_of_payment,
        patient_location, emergency_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_id,
        patient_first_name,
        patient_last_name || '',
        doctor,
        theater,
        operation_type || 'Emergency Operation',
        start_time,
        end_time,
        'scheduled',
        null,
        null,
        null,
        null,
        'Unclassified',
        'Critical',
        'Pending Diagnosis',
        'None',
        'Emergency - To be billed',
        'Emergency Room',
        emergency_reason
      ]
    );
    

    res.status(201).json({
      message: 'Emergency booking created successfully',
      id: (result as any).insertId,
    });
  } catch (error) {
    console.error('Error creating emergency booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// routes/emergency.ts
router.get('/list', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM emergency_bookings ORDER BY start_time DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching emergency bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    await pool.query(
      `UPDATE emergency_bookings SET
        patient_first_name = ?, patient_last_name = ?, patient_id = ?, doctor = ?, theater = ?, operation_type = ?,
        start_time = ?, end_time = ?, emergency_reason = ?
      WHERE id = ?`,
      [
        updatedData.patient_first_name,
        updatedData.patient_last_name,
        updatedData.patient_id,
        updatedData.doctor,
        updatedData.theater,
        updatedData.operation_type,
        updatedData.start_time,
        updatedData.end_time,
        updatedData.emergency_reason,
        id
      ]
    );

    res.json({ message: 'Emergency updated successfully' });
  } catch (error) {
    console.error('Error updating emergency:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


export default router;
