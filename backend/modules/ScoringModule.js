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

  return router;
}

module.exports = createScoringRouter;
