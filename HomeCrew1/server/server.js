// HomeCrew Express Server
// Built by Team ShadowX Coders

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
import './config/firebase.admin.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import workerRoutes from './routes/worker.routes.js';
import jobRoutes from './routes/job.routes.js';
import offerRoutes from './routes/offer.routes.js';
import reviewRoutes from './routes/review.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import whatsappRoutes from './routes/whatsapp.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible to routes
app.set('io', io);

// ---- Middleware ----
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter limiter for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts.' },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- Routes ----
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'HomeCrew API',
    team: 'ShadowX Coders',
    timestamp: new Date().toISOString() 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[HomeCrew Server Error]', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.code === 'auth/id-token-expired') {
    return res.status(401).json({ error: 'Token expired, please re-authenticate.' });
  }
  
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ---- Socket.io Real-time ----
const connectedUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('[Socket.io] Client connected:', socket.id);

  socket.on('authenticate', (userId) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      socket.join(`user:${userId}`);
      console.log(`[Socket.io] User ${userId} authenticated`);
    }
  });

  socket.on('join:job', (jobId) => {
    socket.join(`job:${jobId}`);
    console.log(`[Socket.io] Socket ${socket.id} joined job room: ${jobId}`);
  });

  socket.on('leave:job', (jobId) => {
    socket.leave(`job:${jobId}`);
  });

  socket.on('worker:location', (data) => {
    // Broadcast worker location to job room participants
    const { jobId, lat, lng } = data;
    if (jobId && lat && lng && socket.userId) {
      socket.to(`job:${jobId}`).emit('worker:location:update', { 
        lat, lng, 
        workerId: socket.userId,
        timestamp: Date.now() 
      });
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
    }
    console.log('[Socket.io] Client disconnected:', socket.id);
  });
});

// Export io for use in routes
export { io, connectedUsers };

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🏠 HomeCrew Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`👥 Built by Team ShadowX Coders\n`);
});
