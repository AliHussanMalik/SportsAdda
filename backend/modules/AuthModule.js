const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_sportsadda_jwt_secret_key_2026_local';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'dev_sportsadda_refresh_secret_key_2026_local';

if (!process.env.JWT_SECRET || !process.env.REFRESH_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET or REFRESH_SECRET environment variable is missing. Using development fallback key.');
}

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
  role: z.enum(['ADMIN', 'SCORER', 'PLAYER', 'INDOOR_OWNER']).optional().default('PLAYER'),
  primary_sport: z.string().optional().default('FUTSAL'),
  preferred_role: z.string().optional(),
  jersey_number: z.number().int().optional()
});

const LoginSchema = z.object({
  identifier: z.string().optional(),
  display_name: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
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

  // Register User with Name + Password
  router.post('/register', authLimiter, async (req, res) => {
    try {
      const { display_name, email, password, role, primary_sport, preferred_role, jersey_number } = req.body;

      if (!display_name || display_name.trim().length < 2) {
        return res.status(400).json({ success: false, error: 'Display Name is required (min 2 characters)' });
      }
      if (!password || password.trim().length < 4) {
        return res.status(400).json({ success: false, error: 'Password must be at least 4 characters long' });
      }

      // Check existing display_name or email
      const existing = await pool.query(
        'SELECT user_id FROM player_profiles WHERE LOWER(display_name) = LOWER($1) OR (email IS NOT NULL AND LOWER(email) = LOWER($2))',
        [display_name.trim(), email ? email.trim() : '']
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, error: 'Name or Email is already taken' });
      }

      const password_hash = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `INSERT INTO player_profiles (display_name, email, password_hash, role, primary_sport, preferred_role, jersey_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          display_name.trim(),
          email ? email.trim() : null,
          password_hash,
          role || 'PLAYER',
          primary_sport || 'FUTSAL',
          preferred_role || 'All-Rounder',
          jersey_number || 10
        ]
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
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Login User with Name or Email + Password
  router.post('/login', authLimiter, async (req, res) => {
    try {
      const parsed = LoginSchema.parse(req.body);
      const queryParam = parsed.identifier || parsed.display_name || parsed.name || parsed.email;
      const { password } = parsed;

      if (!queryParam) {
        return res.status(400).json({ success: false, error: 'Please enter your Name or Email' });
      }

      const result = await pool.query(
        'SELECT * FROM player_profiles WHERE LOWER(display_name) = LOWER($1) OR LOWER(email) = LOWER($1)',
        [queryParam.trim()]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Invalid Name/Email or Password' });
      }

      const user = result.rows[0];

      if (user.password_hash) {
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
          return res.status(401).json({ success: false, error: 'Invalid Name/Email or Password' });
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
          primary_sport: user.primary_sport,
          preferred_role: user.preferred_role,
          jersey_number: user.jersey_number,
          is_captain: user.is_captain,
          is_coach: user.is_coach,
          is_keeper: user.is_keeper,
          keeper_type: user.keeper_type
        },
        accessToken,
        refreshToken
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error('[DEV AUTH ERROR] Validation Error Details:', JSON.stringify(err.errors));
        return res.status(400).json({ success: false, error: 'Validation Error', details: err.errors });
      }
      console.error('[DEV AUTH ERROR] Exception:', err.message);
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

  // Get Current Authenticated User Profile
  router.get('/me', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM player_profiles WHERE user_id = $1', [req.user.user_id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User profile not found' });
      }
      res.json({ success: true, user: result.rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
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

  // Create Player Profile Endpoint
  router.post('/profiles', async (req, res) => {
    try {
      const {
        display_name,
        email,
        role = 'PLAYER',
        primary_sport = 'FUTSAL',
        preferred_role = 'All-Rounder',
        jersey_number = 10,
        subscription_tier = 'PRO',
        is_captain = false,
        is_coach = false,
        is_keeper = false,
        keeper_type = 'NONE'
      } = req.body;

      if (!display_name || display_name.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Display name is required' });
      }

      const result = await pool.query(
        `INSERT INTO player_profiles 
          (display_name, email, role, primary_sport, preferred_role, jersey_number, subscription_tier, is_captain, is_coach, is_keeper, keeper_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [display_name, email || null, role, primary_sport, preferred_role, jersey_number, subscription_tier, is_captain, is_coach, is_keeper, keeper_type]
      );

      const newProfile = result.rows[0];

      if (is_keeper) {
        await pool.query(
          `INSERT INTO keeper_stats (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
          [newProfile.user_id]
        );
      }

      res.status(201).json({ success: true, profile: newProfile });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update Player Profile Fields (with Ownership Check)
  router.patch('/profiles/:user_id', authenticateToken, async (req, res) => {
    try {
      const { user_id } = req.params;

      // Ownership enforcement: User can ONLY edit their own profile unless ADMIN
      if (req.user.role !== 'ADMIN' && req.user.user_id !== user_id) {
        return res.status(403).json({ success: false, error: 'Unauthorized: You can only edit your own profile' });
      }
      const {
        display_name,
        primary_sport,
        preferred_role,
        jersey_number,
        subscription_tier,
        is_captain,
        is_coach,
        is_keeper,
        keeper_type,
        role
      } = req.body;

      const currentRes = await pool.query('SELECT * FROM player_profiles WHERE user_id = $1', [user_id]);
      if (currentRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Profile not found' });
      }

      const current = currentRes.rows[0];

      const updated = {
        display_name: display_name !== undefined ? display_name : current.display_name,
        primary_sport: primary_sport !== undefined ? primary_sport : current.primary_sport,
        preferred_role: preferred_role !== undefined ? preferred_role : current.preferred_role,
        jersey_number: jersey_number !== undefined ? jersey_number : current.jersey_number,
        subscription_tier: subscription_tier !== undefined ? subscription_tier : current.subscription_tier,
        is_captain: is_captain !== undefined ? is_captain : current.is_captain,
        is_coach: is_coach !== undefined ? is_coach : current.is_coach,
        is_keeper: is_keeper !== undefined ? is_keeper : current.is_keeper,
        keeper_type: keeper_type !== undefined ? keeper_type : current.keeper_type,
        role: role !== undefined ? role : current.role
      };

      const result = await pool.query(
        `UPDATE player_profiles SET
          display_name = $1,
          primary_sport = $2,
          preferred_role = $3,
          jersey_number = $4,
          subscription_tier = $5,
          is_captain = $6,
          is_coach = $7,
          is_keeper = $8,
          keeper_type = $9,
          role = $10
         WHERE user_id = $11
         RETURNING *`,
        [
          updated.display_name,
          updated.primary_sport,
          updated.preferred_role,
          updated.jersey_number,
          updated.subscription_tier,
          updated.is_captain,
          updated.is_coach,
          updated.is_keeper,
          updated.keeper_type,
          updated.role,
          user_id
        ]
      );

      if (updated.is_keeper) {
        await pool.query(
          `INSERT INTO keeper_stats (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
          [user_id]
        );
      }

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
