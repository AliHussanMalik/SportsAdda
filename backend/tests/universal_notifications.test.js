const { test, describe, it } = require('node:test');
const assert = require('node:assert');
const { sendNotification } = require('../modules/NotificationModule');

describe('Universal Real-Time Notification System Test Suite', () => {
  it('1. Notification payload correctly formats booking reservation alert for Indoor Owner', async () => {
    const fakePool = {
      query: async (sql, params) => {
        return {
          rows: [{
            id: 'n-100',
            user_id: params[0],
            type: params[1],
            title: params[2],
            message: params[3],
            payload: JSON.parse(params[4]),
            is_read: false,
            created_at: new Date()
          }]
        };
      }
    };

    const emittedEvents = [];
    const fakeIo = {
      to: (room) => ({
        emit: (event, data) => emittedEvents.push({ room, event, data })
      }),
      emit: (event, data) => emittedEvents.push({ room: 'global', event, data })
    };

    const notification = await sendNotification(fakePool, fakeIo, {
      user_id: 'u-owner-1',
      type: 'BOOKING_RESERVED',
      title: '🔔 New Pitch Slot Reservation Alert!',
      message: "Team 'Lahore Qalandars' reserved Pitch 1 for 2026-08-10 (20:00 - 21:00). Total: PKR 3000.",
      payload: { booking_id: 'b-999', slot_id: 's-888' }
    });

    assert.ok(notification);
    assert.strictEqual(notification.user_id, 'u-owner-1');
    assert.strictEqual(notification.type, 'BOOKING_RESERVED');
    assert.strictEqual(emittedEvents.length, 2);
    assert.strictEqual(emittedEvents[0].room, 'user_u-owner-1');
    assert.strictEqual(emittedEvents[0].event, 'user_notification');
  });

  it('2. Notification payload formats player confirmation and status update alerts', async () => {
    const fakePool = {
      query: async (sql, params) => {
        return {
          rows: [{
            id: 'n-101',
            user_id: params[0],
            type: params[1],
            title: params[2],
            message: params[3],
            is_read: false
          }]
        };
      }
    };

    const notification = await sendNotification(fakePool, null, {
      user_id: 'u-player-1',
      type: 'BOOKING_CONFIRMED',
      title: '✅ Indoor Cricket Booking Confirmed!',
      message: "Your match booking for Team 'Lahore Qalandars' is confirmed."
    });

    assert.ok(notification);
    assert.strictEqual(notification.user_id, 'u-player-1');
    assert.strictEqual(notification.type, 'BOOKING_CONFIRMED');
  });
});
