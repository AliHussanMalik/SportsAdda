const express = require('express');

// Known Landmark Map Coordinates for Custom Location Search
const KNOWN_LANDMARKS = [
  { name: 'DHA Phase 5 Commercial', lat: 31.4720, lng: 74.4080 },
  { name: 'FAST NUCES University Campus', lat: 31.4815, lng: 74.3030 },
  { name: 'Gulberg Main Boulevard', lat: 31.5204, lng: 74.3587 },
  { name: 'Model Town Park', lat: 31.4842, lng: 74.3262 },
  { name: 'Johar Town Doctors Hospital', lat: 31.4697, lng: 74.2728 },
  { name: 'Lahore Cantt Station', lat: 31.5497, lng: 74.3736 }
];

function createSearchRouter(pool) {
  const router = express.Router();

  // 1. Landmark & Address Geocoding Search
  router.get('/landmarks', (req, res) => {
    const { query } = req.query;
    if (!query) {
      return res.json({ success: true, landmarks: KNOWN_LANDMARKS });
    }

    const filtered = KNOWN_LANDMARKS.filter(l =>
      l.name.toLowerCase().includes(query.toLowerCase())
    );

    res.json({ success: true, landmarks: filtered });
  });

  // 2. Smart Geo-Distance Search & Multi-Filter Combination
  router.get('/arenas', async (req, res) => {
    try {
      const {
        lat,
        lng,
        radius_km = 20,
        min_rating = 0,
        has_ac,
        has_parking,
        has_cameras,
        has_changing_room,
        has_canteen,
        has_prayer_area,
        sport_type
      } = req.query;

      const userLat = parseFloat(lat) || 31.4700;
      const userLng = parseFloat(lng) || 74.4100;
      const maxDistanceKm = parseFloat(radius_km);
      const minRatingVal = parseFloat(min_rating);

      // SQL Haversine Distance Formula in KM:
      // 6371 * acos(cos(radians(userLat)) * cos(radians(latitude)) * cos(radians(longitude) - radians(userLng)) + sin(radians(userLat)) * sin(radians(latitude)))
      let querySQL = `
        SELECT 
          a.id,
          a.name,
          a.address,
          a.latitude,
          a.longitude,
          a.avg_rating,
          a.total_reviews,
          a.has_ac,
          a.has_parking,
          a.has_cameras,
          a.has_changing_room,
          a.has_canteen,
          a.has_prayer_area,
          ROUND(
            CAST(
              6371 * acos(
                LEAST(1.0, GREATEST(-1.0,
                  cos(radians($1)) * cos(radians(COALESCE(a.latitude, $1))) * 
                  cos(radians(COALESCE(a.longitude, $2)) - radians($2)) + 
                  sin(radians($1)) * sin(radians(COALESCE(a.latitude, $1)))
                ))
              ) AS numeric
            ), 2
          ) AS distance_km
        FROM indoor_arenas a
        WHERE 1=1
      `;

      const queryParams = [userLat, userLng];
      let paramIdx = 3;

      // Filter by min rating
      if (minRatingVal > 0) {
        querySQL += ` AND a.avg_rating >= $${paramIdx}`;
        queryParams.push(minRatingVal);
        paramIdx++;
      }

      // Filter by amenities
      if (has_ac === 'true') querySQL += ` AND a.has_ac = true`;
      if (has_parking === 'true') querySQL += ` AND a.has_parking = true`;
      if (has_cameras === 'true') querySQL += ` AND a.has_cameras = true`;
      if (has_changing_room === 'true') querySQL += ` AND a.has_changing_room = true`;
      if (has_canteen === 'true') querySQL += ` AND a.has_canteen = true`;
      if (has_prayer_area === 'true') querySQL += ` AND a.has_prayer_area = true`;

      querySQL += ` ORDER BY distance_km ASC, a.avg_rating DESC`;

      const arenasResult = await pool.query(querySQL, queryParams);

      // Filter by distance radius in JS if maxDistanceKm requested
      const filteredArenas = arenasResult.rows.filter(r => parseFloat(r.distance_km) <= maxDistanceKm);

      // Fetch courts for each arena
      for (let arena of filteredArenas) {
        let courtsQuery = 'SELECT * FROM arena_courts WHERE arena_id = $1';
        let courtsParams = [arena.id];
        if (sport_type) {
          courtsQuery += ' AND sport_type = $2';
          courtsParams.push(sport_type.toUpperCase());
        }
        const courtsRes = await pool.query(courtsQuery, courtsParams);
        arena.courts = courtsRes.rows;
      }

      res.json({
        success: true,
        userLocation: { latitude: userLat, longitude: userLng },
        radiusKm: maxDistanceKm,
        totalFound: filteredArenas.length,
        arenas: filteredArenas
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = createSearchRouter;
