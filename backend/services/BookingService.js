const BaseService = require('./BaseService');
const cacheService = require('./CacheService');
const QRCode = require('qrcode');

class BookingService extends BaseService {
  constructor(pool) {
    super(pool);
  }

  /**
   * Fetch pitch time-slots for a specific pitch & date with Redis / In-Memory caching
   */
  async getPitchSlots(pitchId, slotDate) {
    const cacheKey = `pitch_slots:${pitchId}:${slotDate}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return this.formatSuccess({ slots: cached, cached: true });
    }

    const { rows } = await this.pool.query(
      `SELECT s.*, b.team_name, b.booking_status
       FROM indoor_pitch_slots s
       LEFT JOIN indoor_cricket_bookings b ON s.id = b.slot_id AND b.booking_status != 'CANCELLED'
       WHERE s.pitch_id = $1 AND s.slot_date = $2
       ORDER BY s.start_time ASC;`,
      [pitchId, slotDate]
    );

    await cacheService.set(cacheKey, rows, 60); // Cache for 60s
    return this.formatSuccess({ slots: rows });
  }

  /**
   * Book an available indoor cricket slot atomically
   */
  async bookSlot({ slot_id, booked_by_user_id, team_name, include_bowling_machine, include_equipment_kit }) {
    if (!slot_id || !booked_by_user_id || !team_name) {
      this.formatError('slot_id, booked_by_user_id, and team_name are required', 400);
    }

    return await this.withTransaction(async (client) => {
      // Lock and fetch slot details
      const slotRes = await client.query(
        `SELECT s.*, p.bowling_machine_fee, p.pitch_name, a.name AS arena_name, a.owner_id
         FROM indoor_pitch_slots s 
         JOIN indoor_cricket_pitches p ON s.pitch_id = p.id
         JOIN indoor_arenas a ON p.arena_id = a.id
         WHERE s.id = $1 FOR UPDATE;`,
        [slot_id]
      );

      if (slotRes.rows.length === 0) {
        this.formatError('Pitch slot not found', 404);
      }
      const slot = slotRes.rows[0];
      if (slot.status === 'BOOKED') {
        this.formatError('Slot is already booked by another team', 400);
      }

      let totalPrice = parseFloat(slot.price);
      if (include_bowling_machine) {
        totalPrice += parseFloat(slot.bowling_machine_fee || 500.0);
      }
      if (include_equipment_kit) {
        totalPrice += 300.0;
      }

      const qrCodePayload = `SPORTSADDA-INDOOR-${slot.pitch_id}-${slot_id}-${Date.now()}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodePayload);

      // Lock slot to BOOKED
      await client.query(`UPDATE indoor_pitch_slots SET status = 'BOOKED' WHERE id = $1;`, [slot_id]);

      // Create booking record
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

      // Flush slots cache for this pitch & date
      await cacheService.del(`pitch_slots:${slot.pitch_id}:${slot.slot_date}`);

      return this.formatSuccess({
        booking: bookingRes.rows[0],
        qrCodeDataUrl,
        qrCodePayload,
        slotInfo: slot
      });
    });
  }

  /**
   * Cancel booking and release slot back to OPEN atomically
   */
  async cancelBooking(bookingId) {
    return await this.withTransaction(async (client) => {
      const bookingRes = await client.query(
        `SELECT * FROM indoor_cricket_bookings WHERE id = $1 FOR UPDATE;`,
        [bookingId]
      );
      if (bookingRes.rows.length === 0) {
        this.formatError('Booking not found', 404);
      }
      const booking = bookingRes.rows[0];

      // Update booking status to CANCELLED
      const updatedBooking = await client.query(
        `UPDATE indoor_cricket_bookings SET booking_status = 'CANCELLED' WHERE id = $1 RETURNING *;`,
        [bookingId]
      );

      // Reset slot to OPEN
      await client.query(
        `UPDATE indoor_pitch_slots SET status = 'OPEN' WHERE id = $1;`,
        [booking.slot_id]
      );

      // Invalidate slots cache
      await cacheService.flushPattern('pitch_slots');

      return this.formatSuccess({
        booking: updatedBooking.rows[0],
        message: 'Booking cancelled successfully and slot released to OPEN.'
      });
    });
  }
}

module.exports = BookingService;
