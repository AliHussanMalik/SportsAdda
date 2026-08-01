const express = require('express');
const { z } = require('zod');

const CustomGroundSchema = z.object({
  created_by_user_id: z.string().uuid().optional(),
  ground_name: z.string().min(3),
  address_text: z.string().min(3),
  latitude: z.number(),
  longitude: z.number(),
  ground_type: z.string().optional().default('OPEN_FIELD')
});

function createMatchRouter(pool) {
  const router = express.Router();

  // --- CUSTOM GROUNDS (BYOG - Bring Your Own Ground) ---

  // Get Custom / Open Pitch Grounds
  router.get('/custom-grounds', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT g.*, p.display_name as creator_name
         FROM custom_grounds g
         LEFT JOIN player_profiles p ON g.created_by_user_id = p.user_id
         ORDER BY g.created_at DESC`
      );
      res.json({ success: true, customGrounds: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create Custom Ground (BYOG)
  router.post('/custom-grounds', async (req, res) => {
    try {
      const validated = CustomGroundSchema.parse(req.body);
      const { created_by_user_id, ground_name, address_text, latitude, longitude, ground_type } = validated;

      const result = await pool.query(
        `INSERT INTO custom_grounds (created_by_user_id, ground_name, address_text, latitude, longitude, ground_type)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [created_by_user_id || null, ground_name, address_text, latitude, longitude, ground_type]
      );

      res.status(201).json({ success: true, customGround: result.rows[0] });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation Error', details: err.errors });
      }
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- MATCH FIXTURES ---

  // Get all match fixtures with team & arena/custom ground details
  router.get('/', async (req, res) => {
    try {
      const query = `
        SELECT m.*, 
               ta.team_name AS team_a_name, ta.logo_url AS team_a_logo,
               tb.team_name AS team_b_name, tb.logo_url AS team_b_logo,
               tw.team_name AS toss_winner_name,
               wt.team_name AS winner_team_name,
               c.court_name, c.sport_type,
               cg.ground_name AS custom_ground_name, cg.address_text AS custom_ground_address
        FROM match_fixtures m
        JOIN teams ta ON m.team_a_id = ta.id
        JOIN teams tb ON m.team_b_id = tb.id
        LEFT JOIN teams tw ON m.toss_winner_id = tw.id
        LEFT JOIN teams wt ON m.winner_team_id = wt.id
        LEFT JOIN court_bookings cb ON m.court_booking_id = cb.id
        LEFT JOIN arena_courts c ON cb.court_id = c.id
        LEFT JOIN custom_grounds cg ON m.custom_ground_id = cg.id
        ORDER BY m.created_at DESC;
      `;
      const { rows } = await pool.query(query);
      res.json({ success: true, matches: rows });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get single match details
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const matchRes = await pool.query(
        `SELECT m.*, 
                ta.team_name AS team_a_name, ta.logo_url AS team_a_logo,
                tb.team_name AS team_b_name, tb.logo_url AS team_b_logo,
                tw.team_name AS toss_winner_name,
                wt.team_name AS winner_team_name,
                cg.ground_name AS custom_ground_name, cg.address_text AS custom_ground_address
         FROM match_fixtures m
         JOIN teams ta ON m.team_a_id = ta.id
         JOIN teams tb ON m.team_b_id = tb.id
         LEFT JOIN teams tw ON m.toss_winner_id = tw.id
         LEFT JOIN teams wt ON m.winner_team_id = wt.id
         LEFT JOIN custom_grounds cg ON m.custom_ground_id = cg.id
         WHERE m.id = $1`,
        [id]
      );

      if (matchRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Match not found' });
      }

      const match = matchRes.rows[0];

      // Fetch team rosters
      const teamARoster = await pool.query(
        `SELECT tr.*, p.display_name, p.primary_sport, p.preferred_role, p.jersey_number, p.is_captain, p.is_coach, p.is_keeper
         FROM team_roster tr JOIN player_profiles p ON tr.player_id = p.user_id WHERE tr.team_id = $1`,
        [match.team_a_id]
      );
      const teamBRoster = await pool.query(
        `SELECT tr.*, p.display_name, p.primary_sport, p.preferred_role, p.jersey_number, p.is_captain, p.is_coach, p.is_keeper
         FROM team_roster tr JOIN player_profiles p ON tr.player_id = p.user_id WHERE tr.team_id = $1`,
        [match.team_b_id]
      );

      res.json({
        success: true,
        match,
        team_a_roster: teamARoster.rows,
        team_b_roster: teamBRoster.rows
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create Flexible Match Fixture (Commercial Turf OR Custom Ground)
  router.post('/', async (req, res) => {
    try {
      const {
        team_a_id,
        team_b_id,
        court_booking_id,
        custom_ground_id,
        is_custom_ground = false,
        scorer_user_id
      } = req.body;

      const query = `
        INSERT INTO match_fixtures (team_a_id, team_b_id, court_booking_id, custom_ground_id, is_custom_ground, scorer_user_id, match_status)
        VALUES ($1, $2, $3, $4, $5, $6, 'SCHEDULED')
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [
        team_a_id,
        team_b_id,
        court_booking_id || null,
        custom_ground_id || null,
        is_custom_ground,
        scorer_user_id
      ]);

      res.status(201).json({ success: true, match: rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Record Pre-Match Toss decision
  router.post('/:id/toss', async (req, res) => {
    try {
      const { id } = req.params;
      const { toss_winner_id, toss_decision } = req.body;

      const query = `
        UPDATE match_fixtures
        SET toss_winner_id = $1,
            toss_decision = $2,
            match_status = 'LIVE'
        WHERE id = $3
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [toss_winner_id, toss_decision, id]);
      res.json({ success: true, match: rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update match status
  router.patch('/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { match_status, winner_team_id } = req.body;

      const query = `
        UPDATE match_fixtures
        SET match_status = COALESCE($1, match_status),
            winner_team_id = COALESCE($2, winner_team_id)
        WHERE id = $3
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [match_status, winner_team_id, id]);
      res.json({ success: true, match: rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = createMatchRouter;
