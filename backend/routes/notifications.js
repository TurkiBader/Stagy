const express = require('express')
const router = express.Router()
const { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead } = require('../controllers/notificationController')
const { verifyToken } = require('../middleware/auth')

router.use(verifyToken)

router.get('/:user_id', getUserNotifications)
router.get('/:user_id/unread-count', getUnreadCount)
router.put('/:id/read', markAsRead)
router.put('/:user_id/read-all', markAllAsRead)

module.exports = router