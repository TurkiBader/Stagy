import { useNavigate, useLocation } from 'react-router-dom'
import Logo from './Logo'

function Sidebar() {
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: '⊞' },
    { label: 'Explorer', path: '/student/explorer', icon: '◎' },
    { label: 'Applications', path: '/student/applications', icon: '📄' },
    { label: 'Settings', path: '/student/settings', icon: '⚙' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <div className="w-56 min-h-screen flex flex-col justify-between py-6 px-4"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8f6ff 100%)',
        borderRight: '1px solid #e8e4f5'
      }}>

      {/* Logo */}
      <div>
        <div className="px-2 mb-8">
          <Logo size="sm" />
        </div>

        {/* Menu items */}
        <nav className="flex flex-col gap-1 mt-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition text-left w-full
                ${location.pathname === item.path
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              style={location.pathname === item.path
                ? { background: 'linear-gradient(135deg, #ede9fe, #fce7f3)' }
                : {}}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-3">

        {/* User info */}
        <div className="flex items-center gap-3 px-2 py-3 border-t border-gray-100">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #312e81, #6d28d9)' }}>
            {user?.full_name?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{user?.full_name}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>

        {/* Find internships button */}
        <button
          onClick={() => navigate('/student/explorer')}
          className="w-full text-white text-sm font-semibold py-2 rounded-lg transition"
          style={{ background: 'linear-gradient(135deg, #312e81, #6d28d9)' }}
        >
          FIND INTERNSHIPS
        </button>

        {/* Help and logout */}
        <button className="text-left text-sm text-gray-400 hover:text-gray-600 px-2">
          Help
        </button>
        <button
          onClick={handleLogout}
          className="text-left text-sm text-gray-400 hover:text-red-500 px-2"
        >
          Logout
        </button>

      </div>
    </div>
  )
}

export default Sidebar