const express = require('express');

function createAnalyticsRouter(pool) {
  const router = express.Router();

  // Calculate automated post-match awards for a match
  router.get('/awards/:match_id', async (req, res) => {
    try {
      const { match_id } = req.params;

      const eventsRes = await pool.query(
        `SELECT me.*, p.display_name, p.is_keeper, p.keeper_type
         FROM match_events me
         LEFT JOIN player_profiles p ON me.player_id = p.user_id
         WHERE me.match_id = $1`,
        [match_id]
      );

      const events = eventsRes.rows;

      // Aggregators per player
      const playerStats = {};

      events.forEach((ev) => {
        const pid = ev.player_id;
        if (!pid) return;

        if (!playerStats[pid]) {
          playerStats[pid] = {
            user_id: pid,
            display_name: ev.display_name,
            goals: 0,
            runs: 0,
            wickets: 0,
            saves: 0,
            stumpings: 0,
            mvp_score: 0
          };
        }

        const stats = playerStats[pid];
        const details = ev.details || {};

        if (ev.event_type === 'GOAL') {
          stats.goals += 1;
          stats.mvp_score += 10;
        } else if (ev.event_type === 'RUN') {
          const r = details.runs || 1;
          stats.runs += r;
          stats.mvp_score += r * 2;
        } else if (ev.event_type === 'WICKET') {
          stats.wickets += 1;
          stats.mvp_score += 12;
        } else if (ev.event_type === 'SAVE') {
          stats.saves += 1;
          stats.mvp_score += 5;
        } else if (ev.event_type === 'STUMPING') {
          stats.stumpings += 1;
          stats.mvp_score += 8;
        }
      });

      const players = Object.values(playerStats);

      // MVP = highest overall score
      let mvp = null;
      let topScorer = null;
      let bestBowler = null;
      let bestKeeper = null;

      if (players.length > 0) {
        // Sorted arrays
        const sortedMvp = [...players].sort((a, b) => b.mvp_score - a.mvp_score);
        mvp = sortedMvp[0];

        const sortedScorers = [...players].sort((a, b) => (b.goals * 10 + b.runs) - (a.goals * 10 + a.runs));
        topScorer = sortedScorers[0];

        const sortedBowlers = [...players].sort((a, b) => b.wickets - a.wickets);
        if (sortedBowlers[0] && sortedBowlers[0].wickets > 0) {
          bestBowler = sortedBowlers[0];
        }

        const sortedKeepers = [...players].sort((a, b) => (b.saves * 2 + b.stumpings * 3) - (a.saves * 2 + a.stumpings * 3));
        if (sortedKeepers[0] && (sortedKeepers[0].saves > 0 || sortedKeepers[0].stumpings > 0)) {
          bestKeeper = sortedKeepers[0];
        }
      }

      res.json({
        success: true,
        awards: {
          mvp: mvp || null,
          top_scorer: topScorer || null,
          best_bowler: bestBowler || null,
          best_keeper: bestKeeper || null
        },
        allPlayerStats: players
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save finalized post-match awards into DB & finalize match
  router.post('/awards/:match_id/finalize', async (req, res) => {
    try {
      const { match_id } = req.params;
      const { mvp_player_id, top_scorer_player_id, best_keeper_player_id, winner_team_id } = req.body;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Insert into match_awards
        const awardInsert = `
          INSERT INTO match_awards (match_id, mvp_player_id, top_scorer_player_id, best_keeper_player_id)
          VALUES ($1, $2, $3, $4)
          RETURNING *;
        `;
        const awardRes = await client.query(awardInsert, [
          match_id, mvp_player_id || null, top_scorer_player_id || null, best_keeper_player_id || null
        ]);

        // Update match status to FINISHED
        await client.query(
          `UPDATE match_fixtures SET match_status = 'FINISHED', winner_team_id = $1 WHERE id = $2`,
          [winner_team_id || null, match_id]
        );

        await client.query('COMMIT');
        res.json({ success: true, matchAward: awardRes.rows[0] });
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

  return router;
}

module.exports = createAnalyticsRouter;
