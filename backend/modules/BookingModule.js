const express = require('express');
const QRCode = require('qrcode');
const { sendNotification } = require('./NotificationModule');

function createBookingRouter(pool, io) {
  const router = express.Router();

  // Get all indoor arenas with court details & facilities
  router.get('/arenas', async (req, res) => {
    try {
      const query = `
        SELECT a.id AS arena_id, a.name AS arena_name, a.address, a.city, a.hourly_rate AS arena_hourly_rate,
               a.facilities, a.owner_id, a.has_ac, a.has_parking, a.has_cameras, a.has_changing_room, a.has_canteen,
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
            city: r.city || 'Lahore',
            hourly_rate: parseFloat(r.arena_hourly_rate || 2500),
            facilities: typeof r.facilities === 'string' ? JSON.parse(r.facilities) : (r.facilities || []),
            owner_id: r.owner_id,
            amenities: {
              ac: r.has_ac,
              parking: r.has_parking,
              cameras: r.has_cameras,
              changing_room: r.has_changing_room,
              canteen: r.has_canteen
            },
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

  // Get venues owned by specific Indoor Owner
  router.get('/owner/arenas', async (req, res) => {
    try {
      const ownerId = req.query.owner_id || req.headers['x-user-id'];
      if (!ownerId) {
        return res.status(400).json({ success: false, error: 'owner_id required' });
      }
      const { rows } = await pool.query(
        `SELECT * FROM indoor_arenas WHERE owner_id = $1 ORDER BY created_at DESC;`,
        [ownerId]
      );
      res.json({ success: true, arenas: rows });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create new indoor arena & facility setup for Indoor Owner
  router.post('/arenas', async (req, res) => {
    try {
      const { name, address, city, hourly_rate, facilities, owner_id, courts, amenities } = req.body;
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const facilitiesJson = JSON.stringify(facilities || ['Turf', 'AC Lounge', 'Floodlights']);
        const hasAc = amenities?.has_ac || (facilities || []).includes('AC Lounge');
        const hasParking = amenities?.has_parking || (facilities || []).includes('Parking');
        const hasCameras = amenities?.has_cameras || (facilities || []).includes('Live Stream Camera');
        const hasChangingRoom = amenities?.has_changing_room || (facilities || []).includes('Changing Rooms');
        const hasCanteen = amenities?.has_canteen || (facilities || []).includes('Refreshments Canteen');

        const arenaRes = await client.query(
          `INSERT INTO indoor_arenas (
             name, address, city, hourly_rate, facilities, owner_id,
             has_ac, has_parking, has_cameras, has_changing_room, has_canteen
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;`,
          [
            name,
            address,
            city || 'Lahore',
            hourly_rate || 2500.0,
            facilitiesJson,
            owner_id || null,
            hasAc,
            hasParking,
            hasCameras,
            hasChangingRoom,
            hasCanteen
          ]
        );
        const newArena = arenaRes.rows[0];

        const createdCourts = [];
        if (courts && Array.isArray(courts)) {
          for (const c of courts) {
            const courtRes = await client.query(
              `INSERT INTO arena_courts (arena_id, court_name, sport_type, hourly_rate)
               VALUES ($1, $2, $3, $4) RETURNING *;`,
              [newArena.id, c.court_name, c.sport_type || 'CRICKET', c.hourly_rate || hourly_rate || 2500.0]
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

  // --- INDOOR CRICKET PITCHES & TIME-SLOTS ---

  // 1. Create Indoor Cricket Pitch (Tapeball, Leatherball, Bowling Machine Net, Box Cricket)
  router.post('/cricket-pitches', async (req, res) => {
    try {
      const {
        arena_id,
        pitch_name,
        pitch_type,
        length_yards,
        has_bowling_machine,
        hourly_rate,
        peak_hourly_rate,
        bowling_machine_fee
      } = req.body;

      if (!arena_id || !pitch_name) {
        return res.status(400).json({ success: false, error: 'arena_id and pitch_name are required' });
      }

      const { rows } = await pool.query(
        `INSERT INTO indoor_cricket_pitches (
           arena_id, pitch_name, pitch_type, length_yards, has_bowling_machine,
           hourly_rate, peak_hourly_rate, bowling_machine_fee
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
        [
          arena_id,
          pitch_name,
          pitch_type || 'TAPE_BALL',
          length_yards || 22,
          has_bowling_machine || false,
          hourly_rate || 2500.0,
          peak_hourly_rate || 3500.0,
          bowling_machine_fee || 500.0
        ]
      );

      res.json({ success: true, pitch: rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Get Indoor Cricket Pitches for an Owner or Arena
  router.get('/owner/cricket-pitches', async (req, res) => {
    try {
      const { owner_id, arena_id } = req.query;
      let query = `
        SELECT p.*, a.name AS arena_name, a.city
        FROM indoor_cricket_pitches p
        JOIN indoor_arenas a ON p.arena_id = a.id
      `;
      const params = [];
      if (owner_id) {
        params.push(owner_id);
        query += ` WHERE a.owner_id = $1`;
      } else if (arena_id) {
        params.push(arena_id);
        query += ` WHERE p.arena_id = $1`;
      }
      query += ` ORDER BY p.created_at DESC;`;

      const { rows } = await pool.query(query, params);
      res.json({ success: true, pitches: rows });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Generate Daily Time Slots for a Cricket Pitch (08:00 to 24:00)
  router.post('/cricket-pitches/:pitch_id/generate-slots', async (req, res) => {
    try {
      const { pitch_id } = req.params;
      const { slot_date, peak_start_hour, peak_end_hour } = req.body;
      const dateStr = slot_date || new Date().toISOString().split('T')[0];

      // Fetch pitch details for hourly rates
      const pitchRes = await pool.query(`SELECT * FROM indoor_cricket_pitches WHERE id = $1;`, [pitch_id]);
      if (pitchRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Cricket pitch not found' });
      }
      const pitch = pitchRes.rows[0];

      const peakStart = peak_start_hour !== undefined ? parseInt(peak_start_hour, 10) : 20; // default 8 PM
      const peakEnd = peak_end_hour !== undefined ? parseInt(peak_end_hour, 10) : 24;   // default 12 AM

      const slotsCreated = [];
      for (let hour = 8; hour < 24; hour++) {
        const startTimeStr = `${hour.toString().padStart(2, '0')}:00`;
        const endTimeStr = `${(hour + 1).toString().padStart(2, '0')}:00`;
        const isPeak = hour >= peakStart && hour < peakEnd;
        const slotPrice = isPeak ? parseFloat(pitch.peak_hourly_rate) : parseFloat(pitch.hourly_rate);

        const slotRes = await pool.query(
          `INSERT INTO indoor_pitch_slots (pitch_id, slot_date, start_time, end_time, is_peak_hour, price, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'OPEN')
           ON CONFLICT DO NOTHING RETURNING *;`,
          [pitch_id, dateStr, startTimeStr, endTimeStr, isPeak, slotPrice]
        );

        if (slotRes.rows.length > 0) {
          slotsCreated.push(slotRes.rows[0]);
        }
      }

      // Return all slots for date
      const allSlots = await pool.query(
        `SELECT * FROM indoor_pitch_slots WHERE pitch_id = $1 AND slot_date = $2 ORDER BY start_time ASC;`,
        [pitch_id, dateStr]
      );

      res.json({ success: true, createdCount: slotsCreated.length, slots: allSlots.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Get Time Slots for a Cricket Pitch
  router.get('/cricket-pitches/:pitch_id/slots', async (req, res) => {
    try {
      const { pitch_id } = req.params;
      const { slot_date } = req.query;
      const dateStr = slot_date || new Date().toISOString().split('T')[0];

      const { rows } = await pool.query(
        `SELECT s.*, b.team_name, b.booking_status, b.include_bowling_machine
         FROM indoor_pitch_slots s
         LEFT JOIN indoor_cricket_bookings b ON s.id = b.slot_id
         WHERE s.pitch_id = $1 AND s.slot_date = $2
         ORDER BY s.start_time ASC;`,
        [pitch_id, dateStr]
      );
      res.json({ success: true, slots: rows });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Book an Indoor Cricket Pitch Slot (with add-ons and QR code generation)
  router.post('/cricket-bookings/book-slot', async (req, res) => {
    try {
      const { slot_id, booked_by_user_id, team_name, include_bowling_machine, include_equipment_kit } = req.body;

      if (!slot_id || !booked_by_user_id || !team_name) {
        return res.status(400).json({ success: false, error: 'slot_id, booked_by_user_id, and team_name are required' });
      }

      // Check slot status
      const slotRes = await pool.query(`SELECT s.*, p.bowling_machine_fee FROM indoor_pitch_slots s JOIN indoor_cricket_pitches p ON s.pitch_id = p.id WHERE s.id = $1;`, [slot_id]);
      if (slotRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Slot not found' });
      }
      const slot = slotRes.rows[0];
      if (slot.status === 'BOOKED') {
        return res.status(400).json({ success: false, error: 'Slot is already booked' });
      }

      let totalPrice = parseFloat(slot.price);
      if (include_bowling_machine) {
        totalPrice += parseFloat(slot.bowling_machine_fee || 500.0);
      }
      if (include_equipment_kit) {
        totalPrice += 300.0; // equipment kit fee
      }

      const qrCodePayload = `SPORTSADDA-INDOOR-${slot.pitch_id}-${slot_id}-${Date.now()}`;
      const qrDataUrl = await QRCode.toDataURL(qrCodePayload);

      // Begin transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Mark slot as booked
        await client.query(`UPDATE indoor_pitch_slots SET status = 'BOOKED' WHERE id = $1;`, [slot_id]);

        // Insert booking record
        const bookingRes = await client.query(
          `INSERT INTO indoor_cricket_bookings (
             slot_id, pitch_id, booked_by_user_id, team_name,
             include_bowling_machine, include_equipment_kit, total_price,
             booking_status, qr_checkin_code
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'APPROVED', $8) RETURNING *;`,
          [
            slot_id,
            slot.pitch_id,
            booked_by_user_id,
            team_name,
            include_bowling_machine || false,
            include_equipment_kit || false,
            totalPrice,
            qrCodePayload
          ]
        );

        await client.query('COMMIT');

        // Dispatch notifications to Owner & Player
        const pitchInfoRes = await pool.query(
          `SELECT p.pitch_name, a.owner_id, a.name AS arena_name 
           FROM indoor_cricket_pitches p 
           JOIN indoor_arenas a ON p.arena_id = a.id 
           WHERE p.id = $1;`,
          [slot.pitch_id]
        );
        const arenaInfo = pitchInfoRes.rows[0];

        if (arenaInfo && arenaInfo.owner_id) {
          sendNotification(pool, io, {
            user_id: arenaInfo.owner_id,
            type: 'BOOKING_RESERVED',
            title: '🔔 New Pitch Slot Reservation Alert!',
            message: `Team '${team_name}' reserved ${arenaInfo.pitch_name} at ${arenaInfo.arena_name} for ${slot.slot_date} (${slot.start_time} - ${slot.end_time}). Total: PKR ${totalPrice}.`,
            payload: { booking_id: bookingRes.rows[0].id, slot_id }
          });
        }

        sendNotification(pool, io, {
          user_id: booked_by_user_id,
          type: 'BOOKING_CONFIRMED',
          title: '✅ Indoor Cricket Booking Confirmed!',
          message: `Your match booking for Team '${team_name}' at ${arenaInfo?.pitch_name || 'Indoor Pitch'} on ${slot.slot_date} (${slot.start_time} - ${slot.end_time}) is confirmed.`,
          payload: { booking_id: bookingRes.rows[0].id, slot_id }
        });

        res.json({
          success: true,
          booking: bookingRes.rows[0],
          qrCodeDataUrl,
          qrCodePayload
        });
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

  // 6. Get Bookings for Indoor Owner
  router.get('/owner/cricket-bookings', async (req, res) => {
    try {
      const { owner_id } = req.query;
      const { rows } = await pool.query(
        `SELECT b.*, s.slot_date, s.start_time, s.end_time, s.is_peak_hour,
                p.pitch_name, p.pitch_type, a.name AS arena_name, u.display_name AS captain_name
         FROM indoor_cricket_bookings b
         JOIN indoor_pitch_slots s ON b.slot_id = s.id
         JOIN indoor_cricket_pitches p ON b.pitch_id = p.id
         JOIN indoor_arenas a ON p.arena_id = a.id
         LEFT JOIN player_profiles u ON b.booked_by_user_id = u.user_id
         ${owner_id ? 'WHERE a.owner_id = $1' : ''}
         ORDER BY b.created_at DESC;`,
        owner_id ? [owner_id] : []
      );
      res.json({ success: true, bookings: rows });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Update Booking Status / Mark Kiosk QR Check-in
  router.patch('/cricket-bookings/:booking_id/status', async (req, res) => {
    try {
      const { booking_id } = req.params;
      const { booking_status } = req.body; // APPROVED, CHECKED_IN, CANCELLED

      const { rows } = await pool.query(
        `UPDATE indoor_cricket_bookings SET booking_status = $1 WHERE id = $2 RETURNING *;`,
        [booking_status, booking_id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }
      res.json({ success: true, booking: rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Indoor Owner Dashboard Stats
  router.get('/owner/stats', async (req, res) => {
    try {
      const { owner_id } = req.query;

      const pitchesRes = await pool.query(
        `SELECT COUNT(p.id) AS total_pitches
         FROM indoor_cricket_pitches p
         JOIN indoor_arenas a ON p.arena_id = a.id
         ${owner_id ? 'WHERE a.owner_id = $1' : ''};`,
        owner_id ? [owner_id] : []
      );

      const bookingsRes = await pool.query(
        `SELECT COUNT(b.id) AS total_bookings,
                COALESCE(SUM(b.total_price), 0) AS total_revenue,
                COUNT(CASE WHEN b.include_bowling_machine THEN 1 END) AS bowling_machine_rentals,
                COUNT(CASE WHEN b.booking_status = 'CHECKED_IN' THEN 1 END) AS checked_in_count
         FROM indoor_cricket_bookings b
         JOIN indoor_cricket_pitches p ON b.pitch_id = p.id
         JOIN indoor_arenas a ON p.arena_id = a.id
         ${owner_id ? 'WHERE a.owner_id = $1' : ''};`,
        owner_id ? [owner_id] : []
      );

      res.json({
        success: true,
        stats: {
          totalPitches: parseInt(pitchesRes.rows[0].total_pitches || '0', 10),
          totalBookings: parseInt(bookingsRes.rows[0].total_bookings || '0', 10),
          totalRevenue: parseFloat(bookingsRes.rows[0].total_revenue || '0'),
          bowlingMachineRentals: parseInt(bookingsRes.rows[0].bowling_machine_rentals || '0', 10),
          checkedInCount: parseInt(bookingsRes.rows[0].checked_in_count || '0', 10)
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. Customer Booking History
    router.get('/customer/cricket-bookings', async (req, res) => {
      try {
        const { user_id, status } = req.query;
        if (!user_id) {
          return res.status(400).json({ success: false, error: 'user_id is required' });
        }

        let query = `
        SELECT b.*, s.slot_date, s.start_time, s.end_time, s.is_peak_hour,
               p.pitch_name, p.pitch_type, p.length_yards, a.name AS arena_name, a.address AS arena_address, a.city
        FROM indoor_cricket_bookings b
        JOIN indoor_pitch_slots s ON b.slot_id = s.id
        JOIN indoor_cricket_pitches p ON b.pitch_id = p.id
        JOIN indoor_arenas a ON p.arena_id = a.id
        WHERE b.booked_by_user_id = $1
      `;
        const params = [user_id];
        if (status && status !== 'ALL') {
          params.push(status);
          query += ` AND b.booking_status = $2`;
        }
        query += ` ORDER BY b.created_at DESC;`;

        const { rows } = await pool.query(query, params);

        // Generate digital QR code Data URLs for history pass view
        const bookingsWithQR = await Promise.all(
          rows.map(async (booking) => {
            const qrCodeDataUrl = await QRCode.toDataURL(booking.qr_checkin_code);
            return { ...booking, qrCodeDataUrl };
          })
        );

        res.json({ success: true, bookings: bookingsWithQR });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    // 10. Cancel Booking (Player / Owner) & Release Slot to OPEN
    router.post('/cricket-bookings/:booking_id/cancel', async (req, res) => {
      try {
        const { booking_id } = req.params;

        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          // Fetch booking record to get slot_id
          const bookingRes = await client.query(
            `SELECT * FROM indoor_cricket_bookings WHERE id = $1;`,
            [booking_id]
          );
          if (bookingRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'Booking not found' });
          }
          const booking = bookingRes.rows[0];

          // Update booking status to CANCELLED
          const updatedBooking = await client.query(
            `UPDATE indoor_cricket_bookings SET booking_status = 'CANCELLED' WHERE id = $1 RETURNING *;`,
            [booking_id]
          );

          // Reset slot status to OPEN
          await client.query(
            `UPDATE indoor_pitch_slots SET status = 'OPEN' WHERE id = $1;`,
            [booking.slot_id]
          );

          await client.query('COMMIT');

          // Notify Player & Owner of Cancellation
          sendNotification(pool, io, {
            user_id: booking.booked_by_user_id,
            type: 'BOOKING_CANCELLED',
            title: '❌ Match Booking Cancelled',
            message: `Booking for Team '${booking.team_name}' has been cancelled and the slot is released to OPEN.`,
            payload: { booking_id }
          });

          res.json({
            success: true,
            booking: updatedBooking.rows[0],
            message: 'Booking cancelled successfully and slot released to OPEN.'
          });
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

    // 11. Register / Update Indoor Arena Details (Name, Address, Rates, Operating Days & Times)
    router.post('/owner/arenas', async (req, res) => {
      try {
        const { owner_id, name, address, city, hourly_rate, facilities, operating_days, opening_time, closing_time } = req.body;
        if (!owner_id || !name || !address) {
          return res.status(400).json({ success: false, error: 'owner_id, name, and address are required' });
        }

        const { rows } = await pool.query(
          `INSERT INTO indoor_arenas (
             owner_id, name, address, city, hourly_rate, facilities, operating_days, opening_time, closing_time
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,
          [
            owner_id,
            name,
            address,
            city || 'Lahore',
            parseFloat(hourly_rate || 2500),
            JSON.stringify(facilities || []),
            JSON.stringify(operating_days || ["MON","TUE","WED","THU","FRI","SAT","SUN"]),
            opening_time || '08:00:00',
            closing_time || '24:00:00'
          ]
        );

        res.json({ success: true, arena: rows[0] });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    // 12. Add Pitch to Arena
    router.post('/owner/pitches', async (req, res) => {
      try {
        const { arena_id, pitch_name, pitch_type, hourly_rate, bowling_machine_fee, has_bowling_machine } = req.body;
        if (!arena_id || !pitch_name) {
          return res.status(400).json({ success: false, error: 'arena_id and pitch_name are required' });
        }

        const { rows } = await pool.query(
          `INSERT INTO indoor_cricket_pitches (
             arena_id, pitch_name, pitch_type, hourly_rate, bowling_machine_fee, has_bowling_machine
           ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
          [
            arena_id,
            pitch_name,
            pitch_type || 'TURF',
            parseFloat(hourly_rate || 2500),
            parseFloat(bowling_machine_fee || 500),
            has_bowling_machine !== undefined ? has_bowling_machine : true
          ]
        );

        res.json({ success: true, pitch: rows[0] });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    // 13. Accept / Approve Booking Reservation Request
    router.patch('/cricket-bookings/:booking_id/approve', async (req, res) => {
      try {
        const { booking_id } = req.params;
        const { rows } = await pool.query(
          `UPDATE indoor_cricket_bookings SET booking_status = 'APPROVED' WHERE id = $1 RETURNING *;`,
          [booking_id]
        );
        if (rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        const booking = rows[0];

        sendNotification(pool, io, {
          user_id: booking.booked_by_user_id,
          type: 'BOOKING_APPROVED',
          title: '✅ Reservation Request Approved!',
          message: `Your booking for Team '${booking.team_name}' has been approved by the Indoor Arena Owner.`,
          payload: { booking_id }
        });

        res.json({ success: true, booking, message: 'Reservation request approved.' });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    // 14. Decline / Reject Booking Reservation Request
    router.patch('/cricket-bookings/:booking_id/reject', async (req, res) => {
      try {
        const { booking_id } = req.params;
        const { rows } = await pool.query(
          `UPDATE indoor_cricket_bookings SET booking_status = 'REJECTED' WHERE id = $1 RETURNING *;`,
          [booking_id]
        );
        if (rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Booking not found' });
        }
        const booking = rows[0];

        // Release slot back to OPEN
        await pool.query(`UPDATE indoor_pitch_slots SET status = 'OPEN' WHERE id = $1;`, [booking.slot_id]);

        sendNotification(pool, io, {
          user_id: booking.booked_by_user_id,
          type: 'BOOKING_REJECTED',
          title: '❌ Reservation Request Declined',
          message: `Your booking request for Team '${booking.team_name}' was declined by the Indoor Arena Owner. Slot released.`,
          payload: { booking_id }
        });

        res.json({ success: true, booking, message: 'Reservation request declined and slot released.' });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    // 11. Retrieve Digital QR Pass & Receipt metadata
    router.get('/cricket-bookings/:booking_id/pass', async (req, res) => {
      try {
        const { booking_id } = req.params;
        const { rows } = await pool.query(
          `SELECT b.*, s.slot_date, s.start_time, s.end_time,
                p.pitch_name, p.pitch_type, a.name AS arena_name, a.address AS arena_address
         FROM indoor_cricket_bookings b
         JOIN indoor_pitch_slots s ON b.slot_id = s.id
         JOIN indoor_cricket_pitches p ON b.pitch_id = p.id
         JOIN indoor_arenas a ON p.arena_id = a.id
         WHERE b.id = $1;`,
          [booking_id]
        );
        if (rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Booking pass not found' });
        }

        const booking = rows[0];
        const qrCodeDataUrl = await QRCode.toDataURL(booking.qr_checkin_code);

        res.json({
          success: true,
          pass: {
            ...booking,
            qrCodeDataUrl
          }
        });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    return router;
  }

module.exports = createBookingRouter;
