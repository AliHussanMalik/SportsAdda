const express = require('express');
const { z } = require('zod');

// Zod Validation Schemas
const ArenaReviewSchema = z.object({
  arena_id: z.string().uuid(),
  user_id: z.string().uuid(),
  turf_quality_rating: z.number().int().min(1).max(5),
  lighting_rating: z.number().int().min(1).max(5),
  facilities_rating: z.number().int().min(1).max(5),
  review_text: z.string().optional()
});

const PlayerConductSchema = z.object({
  match_id: z.string().uuid().optional(),
  reviewed_player_id: z.string().uuid(),
  punctuality_rating: z.number().int().min(1).max(5),
  behavior_rating: z.number().int().min(1).max(5),
  is_red_flagged: z.boolean().optional().default(false),
  comments: z.string().optional()
});

const ScorerReviewSchema = z.object({
  match_id: z.string().uuid().optional(),
  scorer_user_id: z.string().uuid(),
  captain_user_id: z.string().uuid(),
  accuracy_rating: z.number().int().min(1).max(5),
  feedback: z.string().optional()
});

function createRatingRouter(pool) {
  const router = express.Router();

  // --- 1. ARENA REVIEWS (BY PLAYERS) ---
  router.post('/arena', async (req, res) => {
    try {
      const validated = ArenaReviewSchema.parse(req.body);
      const { arena_id, user_id, turf_quality_rating, lighting_rating, facilities_rating, review_text } = validated;

      const overall_rating = parseFloat(((turf_quality_rating + lighting_rating + facilities_rating) / 3).toFixed(1));

      const reviewRes = await pool.query(
        `INSERT INTO arena_reviews (arena_id, user_id, turf_quality_rating, lighting_rating, facilities_rating, overall_rating, review_text)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [arena_id, user_id, turf_quality_rating, lighting_rating, facilities_rating, overall_rating, review_text || '']
      );

      const aggRes = await pool.query(
        `SELECT AVG(overall_rating) as avg_rating, COUNT(*) as total_reviews
         FROM arena_reviews
         WHERE arena_id = $1`,
        [arena_id]
      );

      const newAvg = parseFloat(aggRes.rows[0].avg_rating || 0).toFixed(1);
      const newTotal = parseInt(aggRes.rows[0].total_reviews || 0, 10);

      await pool.query(
        `UPDATE indoor_arenas SET avg_rating = $1, total_reviews = $2 WHERE id = $3`,
        [newAvg, newTotal, arena_id]
      );

      res.status(201).json({
        success: true,
        review: reviewRes.rows[0],
        arenaSummary: { avg_rating: newAvg, total_reviews: newTotal }
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation Error', details: err.errors });
      }
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/arena/:arena_id', async (req, res) => {
    try {
      const { arena_id } = req.params;
      const reviews = await pool.query(
        `SELECT r.*, p.display_name, p.profile_photo_url
         FROM arena_reviews r
         LEFT JOIN player_profiles p ON r.user_id = p.user_id
         WHERE r.arena_id = $1
         ORDER BY r.created_at DESC`,
        [arena_id]
      );
      res.json({ success: true, reviews: reviews.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- 2. ORGANIZER REVIEWS (STRICTLY CAPTAINS ONLY) ---
  router.post('/organizer', async (req, res) => {
    try {
      const { organizer_name, captain_name, is_captain = true, rating = 5, review_text } = req.body;

      if (!is_captain) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: Only verified Team Captains can rate tournament organizers to prevent biased ratings from eliminated teams.'
        });
      }

      res.status(201).json({
        success: true,
        message: `Organizer review submitted by Captain ${captain_name || 'Captain'} for ${organizer_name || 'Organizer'}!`,
        rating: { organizer_name, captain_name, rating, review_text }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- 3. PLAYER & TEAM CONDUCT REVIEWS ---
  router.post('/player-conduct', async (req, res) => {
    try {
      const validated = PlayerConductSchema.parse(req.body);
      const { match_id, reviewed_player_id, punctuality_rating, behavior_rating, is_red_flagged, comments } = validated;

      const result = await pool.query(
        `INSERT INTO player_conduct_reviews (match_id, reviewed_player_id, punctuality_rating, behavior_rating, is_red_flagged, comments)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [match_id || null, reviewed_player_id, punctuality_rating, behavior_rating, is_red_flagged, comments || '']
      );

      res.status(201).json({ success: true, conductReview: result.rows[0] });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation Error', details: err.errors });
      }
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/player-conduct/:player_id', async (req, res) => {
    try {
      const { player_id } = req.params;
      const result = await pool.query(
        `SELECT r.*, p.display_name
         FROM player_conduct_reviews r
         JOIN player_profiles p ON r.reviewed_player_id = p.user_id
         WHERE r.reviewed_player_id = $1
         ORDER BY r.created_at DESC`,
        [player_id]
      );

      const redFlagsRes = await pool.query(
        `SELECT COUNT(*) as count FROM player_conduct_reviews WHERE reviewed_player_id = $1 AND is_red_flagged = true`,
        [player_id]
      );

      res.json({
        success: true,
        totalRedFlags: parseInt(redFlagsRes.rows[0].count, 10),
        reviews: result.rows
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- 4. SCORER ACCURACY REVIEWS ---
  router.post('/scorer', async (req, res) => {
    try {
      const validated = ScorerReviewSchema.parse(req.body);
      const { match_id, scorer_user_id, captain_user_id, accuracy_rating, feedback } = validated;

      const result = await pool.query(
        `INSERT INTO scorer_reviews (match_id, scorer_user_id, captain_user_id, accuracy_rating, feedback)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [match_id || null, scorer_user_id, captain_user_id, accuracy_rating, feedback || '']
      );

      res.status(201).json({ success: true, scorerReview: result.rows[0] });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation Error', details: err.errors });
      }
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = createRatingRouter;
