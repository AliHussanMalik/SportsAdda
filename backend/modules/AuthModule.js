const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');

const JWT_SECRET = process.env.JWT_SECRET || '';
const REFRESH_SECRET = process.env.REFRESH_SECRET || '';

// Rate Limiter middleware for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  message: { success: false, error: 'Too many authentication attempts. Please try again later.' }
});

// Zod Validation Schemas
const RegisterSchema = z.object({
  display_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'SCORER', 'PLAYER']).optional().default('PLAYER'),
  primary_sport: z.string().optional().default('FUTSAL'),
  preferred_role: z.string().optional(),
  jersey_number: z.number().int().optional()
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Helper JWT generation functions
function generateAccessToken(user) {
  return jwt.sign(
    { user_id: user.user_id, email: user.email, role: user.role, display_name: user.display_name },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { user_id: user.user_id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

// Authentication & RBAC Middleware Exports
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token missing or invalid' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Token expired or invalid' });
    }
    req.user = decoded;
    next();
  });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Unauthorized access. Role '${req.user?.role || 'GUEST'}' does not have required permissions.`
      });
    }
    next();
  };
}

function createAuthRouter(pool) {
  const router = express.Router();

  // Register User
  router.post('/register', authLimiter, async (req, res) => {
    try {
      const validated = RegisterSchema.parse(req.body);
      const { display_name, email, password, role, primary_sport, preferred_role, jersey_number } = validated;

      // Check existing email
      const existing = await pool.query('SELECT user_id FROM player_profiles WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, error: 'Email is already registered' });
      }

      const password_hash = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `INSERT INTO player_profiles (display_name, email, password_hash, role, primary_sport, preferred_role, jersey_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING user_id, display_name, email, role, subscription_tier, created_at`,
        [display_name, email, password_hash, role, primary_sport, preferred_role || 'All-Rounder', jersey_number || 10]
      );

      const newUser = result.rows[0];
      const accessToken = generateAccessToken(newUser);
      const refreshToken = generateRefreshToken(newUser);

      res.status(201).json({
        success: true,
        user: newUser,
        accessToken,
        refreshToken
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation Error', details: err.errors });
      }
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Login User
  router.post('/login', authLimiter, async (req, res) => {
    try {
      const { email, password } = LoginSchema.parse(req.body);

      const result = await pool.query('SELECT * FROM player_profiles WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      const user = result.rows[0];

      if (user.password_hash) {
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
          return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res.json({
        success: true,
        user: {
          user_id: user.user_id,
          display_name: user.display_name,
          email: user.email,
          role: user.role,
          subscription_tier: user.subscription_tier,
          is_captain: user.is_captain,
          is_keeper: user.is_keeper
        },
        accessToken,
        refreshToken
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation Error', details: err.errors });
      }
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Refresh Token Rotation
  router.post('/refresh', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, error: 'Refresh token required' });
    }

    jwt.verify(refreshToken, REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ success: false, error: 'Invalid refresh token' });

      const result = await pool.query('SELECT * FROM player_profiles WHERE user_id = $1', [decoded.user_id]);
      if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' });

      const user = result.rows[0];
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      res.json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });
    });
  });

  // Fetch Profiles List
  router.get('/profiles', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT p.*, k.total_saves, k.clean_sheets, k.stumpings, k.penalties_saved
         FROM player_profiles p
         LEFT JOIN keeper_stats k ON p.user_id = k.user_id
         ORDER BY p.created_at DESC`
      );
      res.json({ success: true, profiles: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Toggle Subscription Tier
  router.patch('/profiles/:user_id', async (req, res) => {
    try {
      const { user_id } = req.params;
      const { subscription_tier } = req.body;
      const result = await pool.query(
        'UPDATE player_profiles SET subscription_tier = $1 WHERE user_id = $2 RETURNING *',
        [subscription_tier, user_id]
      );
      res.json({ success: true, profile: result.rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = createAuthRouter;
module.exports.authenticateToken = authenticateToken;
module.exports.authorizeRoles = authorizeRoles;
