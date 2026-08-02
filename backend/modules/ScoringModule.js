const express = require('express');
const http = require('http');

function createScoringRouter(pool, io) {
  const router = express.Router();

  // Helper to compute live scoreboard state from match events
  async function computeLiveScoreboard(matchId) {
    const matchRes = await pool.query(
      `SELECT m.*, 
              ta.team_name AS team_a_name, ta.logo_url AS team_a_logo,
              tb.team_name AS team_b_name, tb.logo_url AS team_b_logo
       FROM match_fixtures m
       JOIN teams ta ON m.team_a_id = ta.id
       JOIN teams tb ON m.team_b_id = tb.id
       WHERE m.id = $1`,
      [matchId]
    );

    if (matchRes.rows.length === 0) return null;
    const match = matchRes.rows[0];

    const eventsRes = await pool.query(
      `SELECT me.*, p.display_name AS player_name
       FROM match_events me
       LEFT JOIN player_profiles p ON me.player_id = p.user_id
       WHERE me.match_id = $1
       ORDER BY me.event_time_seconds ASC, me.id ASC`,
      [matchId]
    );

    const events = eventsRes.rows;

    // Aggregate team scores
    let team_a_score = 0;
    let team_b_score = 0;
    let team_a_wickets = 0;
    let team_b_wickets = 0;

    events.forEach((ev) => {
      const details = ev.details || {};
      const teamId = details.team_id;

      if (ev.event_type === 'GOAL') {
        if (teamId === match.team_a_id) team_a_score += 1;
        else if (teamId === match.team_b_id) team_b_score += 1;
        else team_a_score += 1;
      } else if (ev.event_type === 'RUN') {
        const runs = details.runs || 1;
        if (teamId === match.team_a_id) team_a_score += runs;
        else if (teamId === match.team_b_id) team_b_score += runs;
        else team_a_score += runs;
      } else if (ev.event_type === 'WICKET') {
        if (teamId === match.team_a_id) team_a_wickets += 1;
        else if (teamId === match.team_b_id) team_b_wickets += 1;
        else team_b_wickets += 1;
      }
    });

    return {
      match,
      events,
      scores: {
        team_a_score,
        team_b_score,
        team_a_wickets,
        team_b_wickets
      }
    };
  }

  // Live Cricket RSS JSON Feed Proxy (Fixes XML parsing & CORS on mobile)
  router.get('/live-cricket-feed', (req, res) => {
    http.get('http://static.espncricinfo.com/rss/livescores.xml', (rssRes) => {
      let data = '';
      rssRes.on('data', (chunk) => { data += chunk; });
      rssRes.on('end', () => {
        try {
          const items = [];
          const itemRegex = /<item>([\s\S]*?)<\/item>/g;
          let match;

          while ((match = itemRegex.exec(data)) !== null) {
            const itemContent = match[1];
            const titleMatch = /<title>(.*?)<\/title>/.exec(itemContent);
            const linkMatch = /<link>(.*?)<\/link>/.exec(itemContent);

            if (titleMatch && titleMatch[1]) {
              const rawTitle = titleMatch[1]
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');

              const isPak = /Pakistan|PSL|Karachi|Lahore|Islamabad|Peshawar|Quetta|Multan|Rawalpindi/i.test(rawTitle);

              items.push({
                id: Math.random().toString(),
                title: rawTitle,
                link: linkMatch ? linkMatch[1].trim() : '',
                isPak,
                isLive: rawTitle.includes('*') || rawTitle.includes('/')
              });
            }
          }

          res.json({ success: true, matches: items });
        } catch (e) {
          res.status(500).json({ success: false, error: e.message });
        }
      });
    }).on('error', (err) => {
      res.status(500).json({ success: false, error: err.message });
    });
  });

  // Local Community Teams Live Broadcasts
  router.get('/broadcasts/community', async (req, res) => {
    try {
      // Return active community matches in Pakistan
      const matches = [
        {
          id: 'local-match-101',
          teamA: 'Lahore Qalandars Box CC 🏏',
          teamB: 'Karachi Kings Turf XI 🏏',
          scoreA: '142/3',
          oversA: '16.4',
          scoreB: '126/6',
          oversB: '20.0',
          venue: 'Velocity Sports Complex (DHA Lahore)',
          status: 'LIVE 🔴',
          isLocalBroadcast: true,
          shareUrl: 'https://sportsadda.app/live/local-match-101'
        },
        {
          id: 'local-match-102',
          teamA: 'Velocity Gunners FC ⚽',
          teamB: 'Rawalpindi Mavericks FC ⚽',
          scoreA: '3',
          scoreB: '2',
          time: '72 min',
          venue: 'Indoor Futsal Arena (Sector E)',
          status: 'LIVE 🔴',
          isLocalBroadcast: true,
          shareUrl: 'https://sportsadda.app/live/local-match-102'
        }
      ];

      res.json({ success: true, communityMatches: matches });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get live scoreboard & events
  router.get('/:match_id/events', async (req, res) => {
    try {
      const { match_id } = req.params;
      const liveData = await computeLiveScoreboard(match_id);
      if (!liveData) return res.status(404).json({ success: false, error: 'Match not found' });
      res.json({ success: true, ...liveData });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Record single event from Single Scorer Console
  router.post('/:match_id/events', async (req, res) => {
    try {
      const { match_id } = req.params;
      const { event_type, player_id, event_time_seconds = 0, details = {} } = req.body;

      const insertQuery = `
        INSERT INTO match_events (match_id, event_type, player_id, event_time_seconds, details)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const { rows } = await pool.query(insertQuery, [
        match_id, event_type, player_id || null, event_time_seconds, JSON.stringify(details)
      ]);
      const newEvent = rows[0];

      // Update specialized keeper stats if event is SAVE or STUMPING
      if (player_id && (event_type === 'SAVE' || event_type === 'STUMPING')) {
        const colName = event_type === 'SAVE' ? 'total_saves' : 'stumpings';
        await pool.query(
          `UPDATE keeper_stats SET ${colName} = ${colName} + 1 WHERE user_id = $1`,
          [player_id]
        );
      }

      // Recompute scoreboard
      const liveData = await computeLiveScoreboard(match_id);

      // Broadcast update over WebSockets
      if (io) {
        io.to(`match_${match_id}`).emit('score_update', liveData);
        io.emit('global_match_update', { match_id, ...liveData.scores });
      }

      res.json({ success: true, newEvent, ...liveData });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Instant Undo / Rollback last recorded event
  router.post('/:match_id/undo', async (req, res) => {
    try {
      const { match_id } = req.params;

      const lastEventRes = await pool.query(
        `SELECT * FROM match_events WHERE match_id = $1 ORDER BY id DESC LIMIT 1`,
        [match_id]
      );

      if (lastEventRes.rows.length === 0) {
        return res.status(400).json({ success: false, error: 'No events to undo' });
      }

      const lastEvent = lastEventRes.rows[0];
      await pool.query(`DELETE FROM match_events WHERE id = $1`, [lastEvent.id]);

      if (lastEvent.player_id && (lastEvent.event_type === 'SAVE' || lastEvent.event_type === 'STUMPING')) {
        const colName = lastEvent.event_type === 'SAVE' ? 'total_saves' : 'stumpings';
        await pool.query(
          `UPDATE keeper_stats SET ${colName} = GREATEST(0, ${colName} - 1) WHERE user_id = $1`,
          [lastEvent.player_id]
        );
      }

      const liveData = await computeLiveScoreboard(match_id);

      if (io) {
        io.to(`match_${match_id}`).emit('score_update', liveData);
        io.emit('global_match_update', { match_id, ...liveData.scores });
      }

      res.json({ success: true, undoneEvent: lastEvent, ...liveData });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- CRICKET BATTING ORDER & EXTRA PLAYERS QUEUE ---
  router.get('/:match_id/batting-order', async (req, res) => {
    try {
      const { match_id } = req.params;
      const { team_id } = req.query;

      if (!team_id) return res.status(400).json({ success: false, error: 'team_id query parameter is required' });

      // Fetch existing batting order
      const orderRes = await pool.query(
        `SELECT bo.*, p.display_name AS player_name, p.preferred_role
         FROM cricket_batting_order bo
         JOIN player_profiles p ON bo.player_id = p.user_id
         WHERE bo.match_id = $1 AND bo.team_id = $2
         ORDER BY bo.batting_position ASC`,
        [match_id, team_id]
      );

      let battingOrder = orderRes.rows;

      // Auto-initialize batting order from team roster if empty
      if (battingOrder.length === 0) {
        const rosterRes = await pool.query(
          `SELECT tr.player_id, p.display_name AS player_name, p.preferred_role
           FROM team_roster tr
           JOIN player_profiles p ON tr.player_id = p.user_id
           WHERE tr.team_id = $1`,
          [team_id]
        );

        for (let i = 0; i < rosterRes.rows.length; i++) {
          const player = rosterRes.rows[i];
          const defaultPos = i + 1;
          const defaultStatus = i === 0 ? 'STRIKER' : i === 1 ? 'NON_STRIKER' : 'QUEUED';

          const insertRes = await pool.query(
            `INSERT INTO cricket_batting_order (match_id, team_id, player_id, batting_position, is_extra_player, status)
             VALUES ($1, $2, $3, $4, false, $5)
             ON CONFLICT (match_id, team_id, player_id) DO NOTHING
             RETURNING *`,
            [match_id, team_id, player.player_id, defaultPos, defaultStatus]
          );

          if (insertRes.rows.length > 0) {
            battingOrder.push({ ...insertRes.rows[0], player_name: player.player_name, preferred_role: player.preferred_role });
          }
        }
      }

      let activeStriker = battingOrder.find((b) => b.status === 'STRIKER') || null;
      let activeNonStriker = battingOrder.find((b) => b.status === 'NON_STRIKER') || null;

      // Auto-assign striker & non-striker from available non-extra queued players if null
      if (!activeStriker) {
        const available = battingOrder.filter((b) => b.status !== 'OUT' && !b.is_extra_player);
        if (available.length > 0) {
          activeStriker = available[0];
          activeStriker.status = 'STRIKER';
          await pool.query(`UPDATE cricket_batting_order SET status = 'STRIKER' WHERE id = $1`, [activeStriker.id]);
        }
        if (available.length > 1 && !activeNonStriker) {
          activeNonStriker = available[1];
          activeNonStriker.status = 'NON_STRIKER';
          await pool.query(`UPDATE cricket_batting_order SET status = 'NON_STRIKER' WHERE id = $1`, [activeNonStriker.id]);
        }
      }

      const nextQueuedBatsman = battingOrder.find((b) => b.status === 'QUEUED' && !b.is_extra_player) || null;

      res.json({
        success: true,
        battingOrder,
        activeStriker,
        activeNonStriker,
        nextQueuedBatsman
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Swap On-Crease Strike (Striker <-> Non-Striker)
  router.post('/:match_id/swap-strike', async (req, res) => {
    try {
      const { match_id } = req.params;
      const { team_id } = req.body;

      if (!team_id) return res.status(400).json({ success: false, error: 'team_id is required' });

      const strikerRes = await pool.query(
        `SELECT * FROM cricket_batting_order WHERE match_id = $1 AND team_id = $2 AND status = 'STRIKER'`,
        [match_id, team_id]
      );
      const nonStrikerRes = await pool.query(
        `SELECT * FROM cricket_batting_order WHERE match_id = $1 AND team_id = $2 AND status = 'NON_STRIKER'`,
        [match_id, team_id]
      );

      if (strikerRes.rows.length > 0 && nonStrikerRes.rows.length > 0) {
        await pool.query(`UPDATE cricket_batting_order SET status = 'NON_STRIKER' WHERE id = $1`, [strikerRes.rows[0].id]);
        await pool.query(`UPDATE cricket_batting_order SET status = 'STRIKER' WHERE id = $1`, [nonStrikerRes.rows[0].id]);
      }

      res.json({ success: true, message: 'Striker and Non-Striker swapped successfully' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Fetch Squad Roster Players for Both Teams
  router.get('/:match_id/squad-players', async (req, res) => {
    try {
      const { match_id } = req.params;
      const matchRes = await pool.query(`SELECT team_a_id, team_b_id FROM match_fixtures WHERE id = $1`, [match_id]);
      if (matchRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Match not found' });

      const { team_a_id, team_b_id } = matchRes.rows[0];

      const teamAPlayersRes = await pool.query(
        `SELECT p.user_id, p.display_name, p.preferred_role
         FROM team_roster tr
         JOIN player_profiles p ON tr.player_id = p.user_id
         WHERE tr.team_id = $1`,
        [team_a_id]
      );
      const teamBPlayersRes = await pool.query(
        `SELECT p.user_id, p.display_name, p.preferred_role
         FROM team_roster tr
         JOIN player_profiles p ON tr.player_id = p.user_id
         WHERE tr.team_id = $1`,
        [team_b_id]
      );

      res.json({
        success: true,
        team_a_players: teamAPlayersRes.rows,
        team_b_players: teamBPlayersRes.rows
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save / Update Captain-Configured Batting Order & Extra Players
  router.post('/:match_id/batting-order', async (req, res) => {
    try {
      const { match_id } = req.params;
      const { team_id, order = [] } = req.body;

      if (!team_id || !Array.isArray(order)) {
        return res.status(400).json({ success: false, error: 'team_id and order array are required' });
      }

      for (const item of order) {
        await pool.query(
          `INSERT INTO cricket_batting_order (match_id, team_id, player_id, batting_position, is_extra_player, status)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (match_id, team_id, player_id)
           DO UPDATE SET
             batting_position = EXCLUDED.batting_position,
             is_extra_player = EXCLUDED.is_extra_player,
             status = CASE WHEN cricket_batting_order.status IN ('STRIKER', 'NON_STRIKER', 'OUT') THEN cricket_batting_order.status ELSE EXCLUDED.status END`,
          [match_id, team_id, item.player_id, item.batting_position, item.is_extra_player || false, item.status || 'QUEUED']
        );
      }

      res.json({ success: true, message: 'Batting order & extra players updated successfully' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- MATCH PRE-SETUP & COIN TOSS CONFIGURATION ---
  router.post('/:match_id/pre-setup', async (req, res) => {
    try {
      const { match_id } = req.params;
      const {
        total_overs = 10,
        playing_squad_count = 11,
        toss_winner_id = null,
        toss_decision = 'BAT',
        team_a_playing_ids = [],
        team_b_playing_ids = []
      } = req.body;

      const max_wickets = Math.max(1, playing_squad_count - 1);

      const updateRes = await pool.query(
        `UPDATE match_fixtures SET
           total_overs = $1,
           playing_squad_count = $2,
           max_wickets = $3,
           toss_winner_id = $4,
           toss_decision = $5,
           match_status = 'LIVE'
         WHERE id = $6
         RETURNING *`,
        [total_overs, playing_squad_count, max_wickets, toss_winner_id, toss_decision, match_id]
      );

      // Flag playing vs reserve players in batting order
      if (Array.isArray(team_a_playing_ids) && team_a_playing_ids.length > 0) {
        await pool.query(
          `UPDATE cricket_batting_order 
           SET is_reserve = (NOT (player_id = ANY($1::uuid[])))
           WHERE match_id = $2`,
          [team_a_playing_ids.concat(team_b_playing_ids), match_id]
        );
      }

      const liveData = await computeLiveScoreboard(match_id);
      if (io) {
        io.to(`match_${match_id}`).emit('score_update', liveData);
      }

      res.json({ success: true, match: updateRes.rows[0], ...liveData });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- DETAILED WICKET DISMISSAL & AUTOMATED BATSMAN ADVANCEMENT ---
  router.post('/:match_id/wicket', async (req, res) => {
    try {
      const { match_id } = req.params;
      const {
        team_id,
        dismissed_player_id,
        dismissal_type = 'BOWLED', // 'BOWLED', 'LBW', 'CATCH', 'RUN_OUT', 'STUMPED', 'HIT_WICKET'
        bowler_id = null,
        fielder_id = null,
        event_time_seconds = 0
      } = req.body;

      if (!team_id || !dismissed_player_id) {
        return res.status(400).json({ success: false, error: 'team_id and dismissed_player_id are required' });
      }

      // 0. Check Max Wicket Limit Enforcement (All Out Cap)
      const currentScoreboard = await computeLiveScoreboard(match_id);
      const matchConfig = currentScoreboard?.match || {};
      const maxWicketsAllowed = matchConfig.max_wickets || 10;
      const currentWickets = team_id === matchConfig.team_a_id 
        ? currentScoreboard?.scores?.team_a_wickets 
        : currentScoreboard?.scores?.team_b_wickets;

      if (currentWickets >= maxWicketsAllowed) {
        return res.status(400).json({
          success: false,
          error: `Innings Complete: All Out limit of ${maxWicketsAllowed} wickets reached!`,
          innings_completed: true
        });
      }

      // 1. Mark dismissed player as 'OUT'
      await pool.query(
        `UPDATE cricket_batting_order
         SET status = 'OUT'
         WHERE match_id = $1 AND team_id = $2 AND player_id = $3`,
        [match_id, team_id, dismissed_player_id]
      );

      // 2. Automatically select next queued batsman (excluding extra players)
      const nextBatsmanRes = await pool.query(
        `SELECT * FROM cricket_batting_order
         WHERE match_id = $1 AND team_id = $2 AND status = 'QUEUED' AND is_extra_player = false
         ORDER BY batting_position ASC LIMIT 1`,
        [match_id, team_id]
      );

      let nextBatsman = null;
      if (nextBatsmanRes.rows.length > 0) {
        nextBatsman = nextBatsmanRes.rows[0];
        await pool.query(
          `UPDATE cricket_batting_order SET status = 'STRIKER' WHERE id = $1`,
          [nextBatsman.id]
        );
      }

      // 3. Record rich event in match_events
      const eventDetails = {
        team_id,
        dismissal_type,
        dismissed_player_id,
        bowler_id,
        fielder_id,
        new_striker_id: nextBatsman ? nextBatsman.player_id : null
      };

      const eventRes = await pool.query(
        `INSERT INTO match_events (match_id, event_type, player_id, event_time_seconds, details)
         VALUES ($1, 'WICKET', $2, $3, $4)
         RETURNING *`,
        [match_id, dismissed_player_id, event_time_seconds, JSON.stringify(eventDetails)]
      );

      // 4. Update career stats for bowler & dismissed batsman
      if (bowler_id) {
        await pool.query(
          `INSERT INTO cricket_player_stats (user_id, wickets_taken)
           VALUES ($1, 1)
           ON CONFLICT (user_id) DO UPDATE SET wickets_taken = cricket_player_stats.wickets_taken + 1`,
          [bowler_id]
        );
      }

      await pool.query(
        `INSERT INTO cricket_player_stats (user_id, dismissals)
         VALUES ($1, 1)
         ON CONFLICT (user_id) DO UPDATE SET dismissals = cricket_player_stats.dismissals + 1`,
        [dismissed_player_id]
      );

      // Recompute live scoreboard & broadcast over WebSockets
      const liveData = await computeLiveScoreboard(match_id);
      if (io) {
        io.to(`match_${match_id}`).emit('score_update', liveData);
        io.to(`match_${match_id}`).emit('wicket_event', { dismissed_player_id, nextBatsman });
      }

      res.json({
        success: true,
        event: eventRes.rows[0],
        dismissed_player_id,
        nextBatsman,
        ...liveData
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- DUAL CAPTAIN VERIFICATION & CONFIRMATION SLOTS ---
  router.get('/:match_id/verification-status', async (req, res) => {
    try {
      const { match_id } = req.params;
      const resVal = await pool.query(
        `SELECT * FROM match_captain_verifications WHERE match_id = $1`,
        [match_id]
      );

      if (resVal.rows.length === 0) {
        const initRes = await pool.query(
          `INSERT INTO match_captain_verifications (match_id, interval_type, interval_value, status)
           VALUES ($1, 'EACH_OVER', 1, 'CONFIRMED')
           RETURNING *`,
          [match_id]
        );
        return res.json({ success: true, verification: initRes.rows[0] });
      }

      res.json({ success: true, verification: resVal.rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update Captain Confirmation Interval (Each Ball, Each Over, Every 2 Overs)
  router.post('/:match_id/verification-settings', async (req, res) => {
    try {
      const { match_id } = req.params;
      const { interval_type = 'EACH_OVER', interval_value = 1 } = req.body;

      const updated = await pool.query(
        `INSERT INTO match_captain_verifications (match_id, interval_type, interval_value, status)
         VALUES ($1, $2, $3, 'CONFIRMED')
         ON CONFLICT (match_id)
         DO UPDATE SET interval_type = EXCLUDED.interval_type, interval_value = EXCLUDED.interval_value
         RETURNING *`,
        [match_id, interval_type, interval_value]
      );

      res.json({ success: true, verification: updated.rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Captain Sign-Off Confirmation
  router.post('/:match_id/verify-score', async (req, res) => {
    try {
      const { match_id } = req.params;
      const { captain_team_role } = req.body; // 'TEAM_A' or 'TEAM_B'

      const existingRes = await pool.query(
        `SELECT * FROM match_captain_verifications WHERE match_id = $1`,
        [match_id]
      );

      let record = existingRes.rows[0];
      let captainA = record ? record.captain_a_confirmed : false;
      let captainB = record ? record.captain_b_confirmed : false;

      if (captain_team_role === 'TEAM_A') captainA = true;
      if (captain_team_role === 'TEAM_B') captainB = true;

      const isFullyConfirmed = captainA && captainB;
      const status = isFullyConfirmed ? 'CONFIRMED' : 'PENDING_CONFIRMATION';

      const updateRes = await pool.query(
        `INSERT INTO match_captain_verifications (match_id, captain_a_confirmed, captain_b_confirmed, status)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (match_id)
         DO UPDATE SET captain_a_confirmed = EXCLUDED.captain_a_confirmed, captain_b_confirmed = EXCLUDED.captain_b_confirmed, status = EXCLUDED.status
         RETURNING *`,
        [match_id, captainA, captainB, status]
      );

      if (io) {
        io.to(`match_${match_id}`).emit('verification_update', updateRes.rows[0]);
      }

      res.json({ success: true, verification: updateRes.rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = createScoringRouter;
