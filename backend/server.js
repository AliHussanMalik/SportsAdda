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
app.use(express.json());

// Real-Time HTTP API Terminal Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusEmoji = status >= 500 ? '💥' : status >= 400 ? '❌' : status >= 300 ? '➡️' : '✅';
    console.log(`${statusEmoji} [${new Date().toISOString().split('T')[1].slice(0, 8)}] ${req.method} ${req.originalUrl} - Status: ${status} (${duration}ms)`);
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
  console.log('⚡ Client connected to SportsAdda Live WebSocket:', socket.id);

  socket.on('join_match', (matchId) => {
    socket.join(`match_${matchId}`);
    console.log(`Socket ${socket.id} joined room match_${matchId}`);
  });

  socket.on('leave_match', (matchId) => {
    socket.leave(`match_${matchId}`);
    console.log(`Socket ${socket.id} left room match_${matchId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected from SportsAdda Live WebSocket:', socket.id);
  });
});

// Mount Modular Routers
app.use('/api/auth', createAuthRouter(pool));
app.use('/api/teams', createTeamRouter(pool));
app.use('/api/bookings', createBookingRouter(pool));
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`SportsAdda Production API Server & Engine running on port ${PORT}`);
});
