const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const createAuthRouter = require('./modules/AuthModule');
const createTeamRouter = require('./modules/TeamModule');
const createBookingRouter = require('./modules/BookingModule');
const createMatchRouter = require('./modules/MatchModule');
const createScoringRouter = require('./modules/ScoringModule');
const createAnalyticsRouter = require('./modules/AnalyticsModule');
const createFinanceRouter = require('./modules/FinanceModule');
const createRatingRouter = require('./modules/RatingModule');
const createSearchRouter = require('./modules/SearchModule');
const { createNotificationRouter } = require('./modules/NotificationModule');

const compression = require('compression');

const app = express();
const server = http.createServer(app);

// Socket.io for live WebSocket broadcasts
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

app.use(cors());
app.use(compression());
app.use(express.json());

// Real-Time HTTP API Terminal Request & Developer Error Logger
app.use((req, res, next) => {
  const start = Date.now();

  // Intercept res.json to capture response payload for developer error printing
  const originalJson = res.json;
  let responseBody = null;
  res.json = function (body) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const timeStr = new Date().toISOString().split('T')[1].slice(0, 8);

    if (status >= 400) {
      const errorMsg = responseBody?.error || responseBody?.message || (responseBody?.details ? JSON.stringify(responseBody.details) : 'Request Failed');
      console.error(`[ERROR] [${timeStr}] ${req.method} ${req.originalUrl} - Status: ${status} (${duration}ms) | Message: ${errorMsg}`);
      if (req.body && Object.keys(req.body).length > 0) {
        console.error(`        Payload:`, JSON.stringify(req.body));
      }
    } else {
      console.log(`[INFO] [${timeStr}] ${req.method} ${req.originalUrl} - Status: ${status} (${duration}ms)`);
    }
  });
  next();
});

// PostgreSQL pool connection
const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'sports_adda',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// Socket.io event listeners
io.on('connection', (socket) => {
  console.log('Client connected to SportsAdda Live WebSocket:', socket.id);

  socket.on('join_match', (matchId) => {
    socket.join(`match_${matchId}`);
    console.log(`Socket ${socket.id} joined room match_${matchId}`);
  });

  socket.on('leave_match', (matchId) => {
    socket.leave(`match_${matchId}`);
    console.log(`Socket ${socket.id} left room match_${matchId}`);
  });

  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined user notification room user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected from SportsAdda Live WebSocket:', socket.id);
  });
});

// Mount Modular Routers
app.use('/api/auth', createAuthRouter(pool));
app.use('/api/teams', createTeamRouter(pool));
app.use('/api/bookings', createBookingRouter(pool, io));
app.use('/api/notifications', createNotificationRouter(pool));
app.use('/api/matches', createMatchRouter(pool));
app.use('/api/scoring', createScoringRouter(pool, io));
app.use('/api/analytics', createAnalyticsRouter(pool));
app.use('/api/finance', createFinanceRouter(pool));
app.use('/api/ratings', createRatingRouter(pool));
app.use('/api/search', createSearchRouter(pool));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW()');
    res.json({
      status: 'UP',
      appName: 'SportsAdda Backend',
      modules: ['Auth', 'Teams', 'Bookings', 'Matches', 'Scoring', 'Analytics', 'Finance', 'Ratings', 'Search'],
      dbTime: dbRes.rows[0].now
    });
  } catch (err) {
    res.status(500).json({ status: 'DOWN', error: err.message });
  }
});

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`SportsAdda Production API Server & Engine running on port ${PORT}`);
});
