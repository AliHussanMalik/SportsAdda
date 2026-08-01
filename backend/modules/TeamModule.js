const express = require('express');

function createTeamRouter(pool) {
  const router = express.Router();

  // Get all teams with captain details and roster size
  router.get('/', async (req, res) => {
    try {
      const query = `
        SELECT t.*, 
               p.display_name AS captain_name,
               p.profile_photo_url AS captain_photo,
               COUNT(tr.player_id) AS roster_count
        FROM teams t
        LEFT JOIN player_profiles p ON t.captain_id = p.user_id
        LEFT JOIN team_roster tr ON t.id = tr.team_id
        GROUP BY t.id, p.display_name, p.profile_photo_url
        ORDER BY t.created_at DESC;
      `;
      const { rows } = await pool.query(query);
      res.json({ success: true, teams: rows });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get single team details & full roster
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const teamRes = await pool.query(
        `SELECT t.*, p.display_name AS captain_name FROM teams t LEFT JOIN player_profiles p ON t.captain_id = p.user_id WHERE t.id = $1`,
        [id]
      );

      if (teamRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Team not found' });
      }

      const rosterRes = await pool.query(
        `SELECT tr.*, p.display_name, p.primary_sport, p.preferred_role, p.jersey_number, p.is_captain, p.is_coach, p.is_keeper, p.subscription_tier
         FROM team_roster tr
         JOIN player_profiles p ON tr.player_id = p.user_id
         WHERE tr.team_id = $1
         ORDER BY tr.joined_at ASC;`,
        [id]
      );

      res.json({
        success: true,
        team: teamRes.rows[0],
        roster: rosterRes.rows
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create new team
  router.post('/', async (req, res) => {
    try {
      const { team_name, logo_url, captain_id } = req.body;
      const defaultLogo = logo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(team_name)}`;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const insertTeam = `
          INSERT INTO teams (team_name, logo_url, captain_id)
          VALUES ($1, $2, $3)
          RETURNING *;
        `;
        const teamRes = await client.query(insertTeam, [team_name, defaultLogo, captain_id]);
        const newTeam = teamRes.rows[0];

        if (captain_id) {
          await client.query(
            `INSERT INTO team_roster (team_id, player_id, role_in_team) VALUES ($1, $2, 'CAPTAIN') ON CONFLICT DO NOTHING;`,
            [newTeam.id, captain_id]
          );
        }

        await client.query('COMMIT');
        res.json({ success: true, team: newTeam });
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Add player to roster
  router.post('/:id/roster', async (req, res) => {
    try {
      const { id } = req.params;
      const { player_id, role_in_team = 'PLAYER' } = req.body;

      const query = `
        INSERT INTO team_roster (team_id, player_id, role_in_team)
        VALUES ($1, $2, $3)
        ON CONFLICT (team_id, player_id) 
        DO UPDATE SET role_in_team = EXCLUDED.role_in_team
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [id, player_id, role_in_team]);
      res.json({ success: true, rosterEntry: rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Remove player from roster
  router.delete('/:id/roster/:player_id', async (req, res) => {
    try {
      const { id, player_id } = req.params;
      await pool.query(`DELETE FROM team_roster WHERE team_id = $1 AND player_id = $2`, [id, player_id]);
      res.json({ success: true, message: 'Player removed from team roster' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Team performance history & win/loss stats
  router.get('/:id/performance', async (req, res) => {
    try {
      const { id } = req.params;
      const matchesQuery = `
        SELECT m.*, 
               ta.team_name AS team_a_name, tb.team_name AS team_b_name
        FROM match_fixtures m
        JOIN teams ta ON m.team_a_id = ta.id
        JOIN teams tb ON m.team_b_id = tb.id
        WHERE m.team_a_id = $1 OR m.team_b_id = $1
        ORDER BY m.created_at DESC;
      `;
      const { rows } = await pool.query(matchesQuery, [id]);

      let wins = 0;
      let losses = 0;
      let draws = 0;

      rows.forEach((m) => {
        if (m.match_status === 'FINISHED') {
          if (m.winner_team_id === id) wins++;
          else if (m.winner_team_id === null) draws++;
          else losses++;
        }
      });

      res.json({
        success: true,
        summary: { total: rows.length, wins, losses, draws },
        recentMatches: rows
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = createTeamRouter;
