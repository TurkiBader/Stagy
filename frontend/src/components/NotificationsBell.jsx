import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

function NotificationsBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef(null)

  const user = JSON.parse(localStorage.getItem('user'))

  const fetchUnreadCount = () => {
    if (!user) return
    API.get(`/notifications/${user.id}/unread-count`)
      .then((res) => setUnreadCount(res.data.count))
      .catch((err) => console.error(err))
  }

  const fetchNotifications = () => {
    if (!user) return
    setLoading(true)
    API.get(`/notifications/${user.id}`)
      .then((res) => setNotifications(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUnreadCount()
    // Light polling so the badge stays fresh without needing a full push/socket setup
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next) fetchNotifications()
  }

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      API.put(`/notifications/${notif.id}/read`).catch((err) => console.error(err))
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: 1 } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
    setOpen(false)
    if (notif.link) navigate(notif.link)
  }

  const handleMarkAllRead = () => {
    API.put(`/notifications/${user.id}/read-all`)
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })))
        setUnreadCount(0)
      })
      .catch((err) => console.error(err))
  }

  const timeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={handleToggle}
        className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:bg-gray-50 relative"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-lg z-50 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold hover:underline"
                style={{ color: '#6d28d9' }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No notifications yet.</p>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition flex gap-2 items-start ${
                    !notif.is_read ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                  )}
                  <div className={!notif.is_read ? '' : 'ml-4'}>
                    <p className="text-xs text-gray-700 leading-snug">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.created_at)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationsBell