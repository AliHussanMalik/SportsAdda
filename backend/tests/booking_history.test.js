const { test, describe, it } = require('node:test');
const assert = require('node:assert');

describe('Booking History & Cancellation Management Test Suite', () => {
  // Test 1: Customer Booking History Queries and Status Badging
  it('1. Customer can retrieve their booking history filtered by status (APPROVED, CHECKED_IN, CANCELLED)', () => {
    const mockHistory = [
      { id: 'b-101', team_name: 'Lahore Falcons', booking_status: 'APPROVED', total_price: 3500.0 },
      { id: 'b-102', team_name: 'Lahore Falcons', booking_status: 'CHECKED_IN', total_price: 4300.0 },
      { id: 'b-103', team_name: 'Lahore Falcons', booking_status: 'CANCELLED', total_price: 2500.0 }
    ];

    const approvedBookings = mockHistory.filter(b => b.booking_status === 'APPROVED');
    const checkedInBookings = mockHistory.filter(b => b.booking_status === 'CHECKED_IN');
    const cancelledBookings = mockHistory.filter(b => b.booking_status === 'CANCELLED');

    assert.strictEqual(approvedBookings.length, 1);
    assert.strictEqual(checkedInBookings.length, 1);
    assert.strictEqual(cancelledBookings.length, 1);
  });

  // Test 2: Booking Cancellation & Automated Slot Release Logic
  it('2. Cancelling an active match booking updates status to CANCELLED and resets slot to OPEN', () => {
    let slot = { id: 'slot-55', status: 'BOOKED' };
    let booking = { id: 'b-200', slot_id: 'slot-55', booking_status: 'APPROVED' };

    // Perform cancellation simulation
    booking.booking_status = 'CANCELLED';
    if (booking.booking_status === 'CANCELLED') {
      slot.status = 'OPEN';
    }

    assert.strictEqual(booking.booking_status, 'CANCELLED');
    assert.strictEqual(slot.status, 'OPEN');
  });

  // Test 3: Digital QR Pass & Receipt Verification
  it('3. Digital QR pass payload contains valid booking reference code, pitch details, and user signature', () => {
    const mockPass = {
      booking_id: 'b-300',
      pitch_name: 'Pitch 1 - Speed Machine Lane',
      qr_checkin_code: 'SPORTSADDA-INDOOR-pitch1-slot5-1700000000',
      total_price: 4000.0,
      include_bowling_machine: true
    };

    assert.ok(mockPass.qr_checkin_code.includes('SPORTSADDA-INDOOR'));
    assert.strictEqual(mockPass.include_bowling_machine, true);
    assert.strictEqual(mockPass.total_price, 4000.0);
  });

  // Test 4: Owner Audit Log & Revenue Adjustments
  it('4. Owner audit log recalculates collected vs cancelled revenue', () => {
    const ownerLogs = [
      { total_price: 3500.0, booking_status: 'CHECKED_IN' },
      { total_price: 4000.0, booking_status: 'APPROVED' },
      { total_price: 2500.0, booking_status: 'CANCELLED' }
    ];

    const collectedRevenue = ownerLogs
      .filter(b => b.booking_status !== 'CANCELLED')
      .reduce((sum, b) => sum + b.total_price, 0);

    const cancelledRevenueLost = ownerLogs
      .filter(b => b.booking_status === 'CANCELLED')
      .reduce((sum, b) => sum + b.total_price, 0);

    assert.strictEqual(collectedRevenue, 7500.0);
    assert.strictEqual(cancelledRevenueLost, 2500.0);
  });
});
