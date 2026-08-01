const express = require('express');
const QRCode = require('qrcode');

function createBookingRouter(pool) {
  const router = express.Router();

  // Get all indoor arenas and their courts
  router.get('/arenas', async (req, res) => {
    try {
      const query = `
        SELECT a.id AS arena_id, a.name AS arena_name, a.address,
               c.id AS court_id, c.court_name, c.sport_type, c.hourly_rate
        FROM indoor_arenas a
        LEFT JOIN arena_courts c ON a.id = c.arena_id
        ORDER BY a.name ASC, c.court_name ASC;
      `;
      const { rows } = await pool.query(query);

      // Group courts by arena
      const arenasMap = {};
      rows.forEach((r) => {
        if (!arenasMap[r.arena_id]) {
          arenasMap[r.arena_id] = {
            id: r.arena_id,
            name: r.arena_name,
            address: r.address,
            courts: []
          };
        }
        if (r.court_id) {
          arenasMap[r.arena_id].courts.push({
            id: r.court_id,
            court_name: r.court_name,
            sport_type: r.sport_type,
            hourly_rate: parseFloat(r.hourly_rate)
          });
        }
      });

      res.json({ success: true, arenas: Object.values(arenasMap) });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create new indoor arena & court setup
  router.post('/arenas', async (req, res) => {
    try {
      const { name, address, courts } = req.body;
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const arenaRes = await client.query(
          `INSERT INTO indoor_arenas (name, address) VALUES ($1, $2) RETURNING *;`,
          [name, address]
        );
        const newArena = arenaRes.rows[0];

        const createdCourts = [];
        if (courts && Array.isArray(courts)) {
          for (const c of courts) {
            const courtRes = await client.query(
              `INSERT INTO arena_courts (arena_id, court_name, sport_type, hourly_rate)
               VALUES ($1, $2, $3, $4) RETURNING *;`,
              [newArena.id, c.court_name, c.sport_type || 'FUTSAL', c.hourly_rate || 40.0]
            );
            createdCourts.push(courtRes.rows[0]);
          }
        }

        await client.query('COMMIT');
        res.json({ success: true, arena: newArena, courts: createdCourts });
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

  // Generate dynamic hourly slots for a court on a date with Peak/Off-peak calculation
  router.get('/slots', async (req, res) => {
    try {
      const { court_id, date } = req.query; // date e.g. YYYY-MM-DD
      if (!court_id) {
        return res.status(400).json({ success: false, error: 'court_id required' });
      }

      // Fetch court base rate
      const courtRes = await pool.query(`SELECT * FROM arena_courts WHERE id = $1`, [court_id]);
      if (courtRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Court not found' });
      }
      const court = courtRes.rows[0];
      const baseRate = parseFloat(court.hourly_rate);

      // Fetch existing bookings for this court
      const selectedDateStr = date || new Date().toISOString().split('T')[0];
      const bookingsRes = await pool.query(
        `SELECT start_time, end_time FROM court_bookings 
         WHERE court_id = $1 AND DATE(start_time) = $2 AND payment_status != 'CANCELLED'`,
        [court_id, selectedDateStr]
      );
      const bookedSlots = bookingsRes.rows.map((b) => ({
        start: new Date(b.start_time).getHours(),
        end: new Date(b.end_time).getHours()
      }));

      // Generate 12 hourly slots from 10:00 to 22:00
      const slots = [];
      for (let hour = 10; hour < 22; hour++) {
        const isPeak = hour >= 18 && hour <= 21; // 6 PM - 9 PM Peak hours
        const rate = isPeak ? baseRate * 1.25 : baseRate;
        const isBooked = bookedSlots.some((b) => hour >= b.start && hour < b.end);

        const startTime = `${selectedDateStr}T${String(hour).padStart(2, '0')}:00:00`;
        const endTime = `${selectedDateStr}T${String(hour + 1).padStart(2, '0')}:00:00`;

        slots.push({
          hour,
          timeLabel: `${hour}:00 - ${hour + 1}:00`,
          isPeak,
          rate: Math.round(rate * 100) / 100,
          isBooked,
          startTime,
          endTime
        });
      }

      res.json({ success: true, court, date: selectedDateStr, slots });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create court booking + return QR Code check-in payload
  router.post('/', async (req, res) => {
    try {
      const { court_id, booked_by_user_id, start_time, end_time, payment_status = 'CONFIRMED' } = req.body;

      const insertBooking = `
        INSERT INTO court_bookings (court_id, booked_by_user_id, start_time, end_time, payment_status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const { rows } = await pool.query(insertBooking, [
        court_id, booked_by_user_id, start_time, end_time, payment_status
      ]);
      const newBooking = rows[0];

      // Generate QR Code Payload JSON string
      const qrPayload = JSON.stringify({
        sportsAddaBookingId: newBooking.id,
        courtId: court_id,
        userId: booked_by_user_id,
        startTime: start_time,
        endTime: end_time,
        status: payment_status,
        timestamp: new Date().toISOString()
      });

      // Generate Base64 Data URL for QR Code
      const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

      res.json({
        success: true,
        booking: newBooking,
        qrCode: qrCodeDataUrl,
        qrPayload
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get active user bookings
  router.get('/my', async (req, res) => {
    try {
      const { user_id } = req.query;
      const query = `
        SELECT b.*, c.court_name, c.sport_type, c.hourly_rate, a.name AS arena_name, a.address
        FROM court_bookings b
        JOIN arena_courts c ON b.court_id = c.id
        JOIN indoor_arenas a ON c.arena_id = a.id
        ${user_id ? 'WHERE b.booked_by_user_id = $1' : ''}
        ORDER BY b.start_time DESC;
      `;
      const { rows } = await pool.query(query, user_id ? [user_id] : []);
      res.json({ success: true, bookings: rows });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = createBookingRouter;
