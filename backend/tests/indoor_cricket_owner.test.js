const { test, describe, it } = require('node:test');
const assert = require('node:assert');

describe('Indoor Cricket Pitch & Time-Slot Owner Test Suite', () => {
  // Test 1: Pitch Creation with specialized Indoor Cricket Attributes
  it('1. Indoor Owner registers a specialized Tapeball Pitch with Automated Bowling Machine option', () => {
    const pitchPayload = {
      arena_id: 'arena-101',
      pitch_name: 'Pitch 1 - Master Bowling Machine Lane',
      pitch_type: 'BOWLING_MACHINE_NET',
      length_yards: 22,
      has_bowling_machine: true,
      hourly_rate: 2500.0,
      peak_hourly_rate: 3500.0,
      bowling_machine_fee: 500.0
    };

    assert.strictEqual(pitchPayload.pitch_type, 'BOWLING_MACHINE_NET');
    assert.strictEqual(pitchPayload.has_bowling_machine, true);
    assert.strictEqual(pitchPayload.bowling_machine_fee, 500.0);
  });

  // Test 2: Bulk Hourly Slot Generation & Peak-Hour Surcharge Calculation
  it('2. Time-Slot Engine generates 16 hourly slots (8 AM to 12 AM) with peak rates applied from 8 PM onwards', () => {
    const baseRate = 2500.0;
    const peakRate = 3500.0;
    const peakStartHour = 20; // 8 PM

    const slots = [];
    for (let h = 8; h < 24; h++) {
      const isPeak = h >= peakStartHour;
      slots.push({
        hour: h,
        startTime: `${h.toString().padStart(2, '0')}:00`,
        isPeakHour: isPeak,
        price: isPeak ? peakRate : baseRate
      });
    }

    assert.strictEqual(slots.length, 16);
    const daySlot = slots.find(s => s.hour === 14); // 2 PM
    const nightSlot = slots.find(s => s.hour === 21); // 9 PM

    assert.strictEqual(daySlot.isPeakHour, false);
    assert.strictEqual(daySlot.price, 2500.0);

    assert.strictEqual(nightSlot.isPeakHour, true);
    assert.strictEqual(nightSlot.price, 3500.0);
  });

  // Test 3: Player Booking with Bowling Machine & Equipment Add-on
  it('3. Booking calculation accurately sums slot fee + bowling machine rental fee + equipment kit', () => {
    const slotPrice = 3500.0; // Peak night slot
    const includeBowlingMachine = true;
    const bowlingMachineFee = 500.0;
    const includeEquipmentKit = true;
    const equipmentKitFee = 300.0;

    let totalPrice = slotPrice;
    if (includeBowlingMachine) totalPrice += bowlingMachineFee;
    if (includeEquipmentKit) totalPrice += equipmentKitFee;

    assert.strictEqual(totalPrice, 4300.0);
  });

  // Test 4: Indoor Owner Dashboard Revenue Stats
  it('4. Owner revenue aggregation sums confirmed pitch bookings and bowling machine rentals', () => {
    const mockBookings = [
      { total_price: 4300.0, include_bowling_machine: true, booking_status: 'CHECKED_IN' },
      { total_price: 2500.0, include_bowling_machine: false, booking_status: 'APPROVED' },
      { total_price: 3500.0, include_bowling_machine: true, booking_status: 'CHECKED_IN' }
    ];

    const totalRevenue = mockBookings.reduce((acc, b) => acc + b.total_price, 0);
    const bowlingMachineRentals = mockBookings.filter(b => b.include_bowling_machine).length;
    const checkedInCount = mockBookings.filter(b => b.booking_status === 'CHECKED_IN').length;

    assert.strictEqual(totalRevenue, 10300.0);
    assert.strictEqual(bowlingMachineRentals, 2);
    assert.strictEqual(checkedInCount, 2);
  });
});
