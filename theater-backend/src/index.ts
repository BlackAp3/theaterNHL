import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import { authRouter } from './routes/auth';
import bookingsRouter from './routes/bookings'; // ✅ CORRECT
import reportsRouter from './routes/reports';
import { authenticateToken } from './middleware/auth'; // ✅ Middleware import
import usersRouter from './routes/users';
import auditLogsRouter from './routes/auditLogs';
import emergencyRoutes from './routes/emergency'; // ✅ CORRECT





const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // 👈 critical for parsing JSON

// Routes
app.use('/api/auth', authRouter); // Login, Register, etc.
app.use('/api/bookings', authenticateToken, bookingsRouter); // ✅ CORRECT
app.use('/api/reports', authenticateToken, reportsRouter);
app.use('/api/users', usersRouter); // 👈 mount route
app.use('/api/audit-logs', auditLogsRouter);
app.use('/api/emergency', emergencyRoutes); // ✅ CORRECT





// Default route for sanity check
app.get('/', (_req, res) => {
  res.send('🎯 Theater Management API is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
