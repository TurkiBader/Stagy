const db = require('../config/db')

// Reusable helper — other controllers call this to fire a notification
// whenever something notification-worthy happens (new application, status change, etc).
// Not exposed as its own route; it's an internal building block.
const createNotification = (user_id, message, link = null) => {
  db.query(
    'INSERT INTO notifications (user_id, message, link) VALUES (?, ?, ?)',
    [user_id, message, link],
    (err) => {
      // Notifications are a nice-to-have — a failure here shouldn't break
      // the main action (applying, status change, etc), just log it.
      if (err) console.error('Failed to create notification:', err.message)
    }
  )
}

// Get a user's recent notifications (most recent first)
const getUserNotifications = (req, res) => {
  const { user_id } = req.params

  db.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json(results)
    }
  )
}

// Get just the unread count, for a badge on the bell icon
const getUnreadCount = (req, res) => {
  const { user_id } = req.params

  db.query(
    'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0',
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' })
      res.json({ count: results[0].count })
    }
  )
}

// Mark a single notification as read (e.g. when the user clicks it)
const markAsRead = (req, res) => {
  const { id } = req.params

  db.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    res.json({ message: 'Marked as read' })
  })
}

// Mark everything as read at once (e.g. "mark all read" button)
const markAllAsRead = (req, res) => {
  const { user_id } = req.params

  db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [user_id], (err) => {
    if (err) return res.status(500).json({ message: 'Database error' })
    res.json({ message: 'All marked as read' })
  })
}

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
}