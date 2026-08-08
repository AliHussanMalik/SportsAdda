const express = require('express');

/**
 * Universal Notification Dispatcher Helper
 * Inserts a record into user_notifications and emits a real-time Socket.io event.
 */
async function sendNotification(pool, io, { user_id, type, title, message, payload = {} }) {
  if (!user_id) return null;
  try {
    const query = `
      INSERT INTO user_notifications (user_id, type, title, message, payload)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [user_id, type, title, message, JSON.stringify(payload)]);
    const notification = rows[0];

    // Emit real-time WebSocket event to specific user room and broadcast
    if (io) {
      io.to(`user_${user_id}`).emit('user_notification', notification);
      io.emit('global_notification_broadcast', notification);
    }
    return notification;
  } catch (err) {
    console.error('Failed to dispatch notification:', err);
    return null;
  }
}

function createNotificationRouter(pool) {
  const router = express.Router();

  // GET /api/notifications?user_id=...&unread_only=true
  router.get('/', async (req, res) => {
    try {
      const { user_id, unread_only } = req.query;
      if (!user_id) {
        return res.status(400).json({ success: false, error: 'user_id is required' });
      }

      let query = `SELECT * FROM user_notifications WHERE user_id = $1`;
      const params = [user_id];

      if (unread_only === 'true') {
        query += ` AND is_read = FALSE`;
      }
      query += ` ORDER BY created_at DESC LIMIT 50;`;

      const { rows } = await pool.query(query, params);
      const unreadCountRes = await pool.query(
        `SELECT COUNT(id) AS unread_count FROM user_notifications WHERE user_id = $1 AND is_read = FALSE;`,
        [user_id]
      );

      res.json({
        success: true,
        notifications: rows,
        unreadCount: parseInt(unreadCountRes.rows[0]?.unread_count || '0', 10)
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // PATCH /api/notifications/:id/read - Mark single notification as read
  router.patch('/:id/read', async (req, res) => {
    try {
      const { id } = req.params;
      const { rows } = await pool.query(
        `UPDATE user_notifications SET is_read = TRUE WHERE id = $1 RETURNING *;`,
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Notification not found' });
      }
      res.json({ success: true, notification: rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // PATCH /api/notifications/read-all - Mark all user notifications as read
  router.patch('/read-all', async (req, res) => {
    try {
      const { user_id } = req.body;
      if (!user_id) {
        return res.status(400).json({ success: false, error: 'user_id is required' });
      }
      await pool.query(
        `UPDATE user_notifications SET is_read = TRUE WHERE user_id = $1;`,
        [user_id]
      );
      res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = {
  createNotificationRouter,
  sendNotification
};
