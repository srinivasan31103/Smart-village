import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import resourceRoutes from './routes/resources.js';
import complaintRoutes from './routes/complaints.js';
import dashboardRoutes from './routes/dashboard.js';
import aiRoutes from './routes/ai.js';
import reportRoutes from './routes/reports.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';
import auditRoutes from './routes/audit.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

// Import utilities
import { initializeWebSocket } from './utils/websocket.js';
import { startScheduler } from './utils/scheduler.js';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Initialize WebSocket
const io = initializeWebSocket(httpServer);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    features: {
      websocket: true,
      scheduler: true,
      ai: true,
      analytics: true,
      notifications: true,
      auditLogs: true
    }
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log('========================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log('========================================');
    console.log('✅ Features enabled:');
    console.log('   - WebSocket (Real-time notifications)');
    console.log('   - Scheduled Tasks (Cron jobs)');
    console.log('   - AI Integration (Claude)');
    console.log('   - Advanced Analytics');
    console.log('   - Audit Logging');
    console.log('   - Email/SMS Notifications');
    console.log('========================================');

    // Start scheduled tasks
    startScheduler();
  });
});

export default app;
