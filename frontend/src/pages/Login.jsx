import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import Logo from '../components/Logo'
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const response = await API.post('/auth/login', { email, password })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      if (response.data.user.role === 'student') {
        navigate('/student/dashboard')
      } else {
        navigate('/company/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #c8d8f8 0%, #dcd4f0 30%, #ede4f5 55%, #f5dde8 75%, #f8e4ee 100%)'
      }}>

      {/* Left blue soft glow */}
      <div className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(180,200,255,0.6) 0%, transparent 65%)'
        }}></div>

      {/* Right pink soft glow */}
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(255,210,230,0.5) 0%, transparent 65%)'
        }}></div>

      {/* Bottom right ribbon/wave illustration */}
      <div className="absolute bottom-0 right-0 pointer-events-none select-none"
        style={{ width: '420px', height: '420px', opacity: 0.35 }}>
        <svg viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Flowing ribbon shape */}
          <path d="M380 420 C340 380, 280 360, 260 300 C240 240, 300 200, 320 150 C340 100, 320 40, 380 20"
            stroke="#9B8FCE" strokeWidth="28" fill="none" strokeLinecap="round" opacity="0.5"/>
          <path d="M420 380 C380 340, 320 320, 300 260 C280 200, 340 160, 360 110 C380 60, 360 10, 420 0"
            stroke="#B8A8E0" strokeWidth="22" fill="none" strokeLinecap="round" opacity="0.4"/>
          <path d="M360 420 C300 370, 240 350, 230 280 C220 210, 290 170, 300 110 C310 50, 280 10, 340 0"
            stroke="#C8B8EC" strokeWidth="18" fill="none" strokeLinecap="round" opacity="0.35"/>
          <path d="M420 420 C360 390, 300 370, 290 310 C280 250, 340 210, 350 160 C360 110, 340 60, 400 40"
            stroke="#D4C4F5" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.3"/>
          <path d="M400 420 C350 400, 290 385, 278 330 C266 275, 318 238, 325 190 C332 142, 310 95, 370 75"
            stroke="#DDD0F8" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.25"/>
        </svg>
      </div>

      {/* Navbar */}
      
      <nav className="flex items-center justify-between px-8 py-4 relative z-10">
      <Logo size="md" />
    </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">

        {/* Login card */}
        <div className="w-full bg-white rounded-3xl p-10 relative"
          style={{
            maxWidth: '480px',
            boxShadow: '0 8px 40px rgba(120,100,200,0.08)',
          }}>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-3">
            Welcome to Stagy
          </h1>
          <p className="text-gray-400 text-center mb-10 text-sm leading-relaxed">
            Elevate your internship journey with<br />the next generation platform.
          </p>

          {/* Social buttons */}
          <div className="flex gap-4 mb-8">
            <button
            onClick={() => alert('Google authentication coming soon!')}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-gray-600 text-sm hover:bg-gray-50 transition bg-white">
              {/* Person/Google icon matching Figma */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              Google
            </button>
            <button
            onClick={() => alert('Apple authentication coming soon!')}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-gray-600 text-sm hover:bg-gray-50 transition bg-white">
              {/* Monitor icon matching Figma */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8M12 17v4"/>
              </svg>
              Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-xs tracking-widest">OR CONTINUE WITH EMAIL</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest block mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-600 placeholder-gray-300"
            />
          </div>

          {/* Password */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                Password
              </label>
              <button
              onClick={() => alert('Password reset feature coming soon!')}
              className="text-sm hover:underline"
              style={{ color: '#be185d' }}
            >
               Forgot Password?
            </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white pr-12 placeholder-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 9.943 7.523 5 12 5c4.478 0 8.268 4.943 9.542 7-1.274 2.057-5.064 7-9.542 7-4.477 0-8.268-4.943-9.542-7z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Sign in button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full text-white font-bold py-4 rounded-xl transition tracking-widest text-sm disabled:opacity-50 mb-6"
            style={{ background: '#1e293b' }}
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN TO DASHBOARD'}
          </button>

          {/* Register link */}
          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <a href="/register" className="font-semibold hover:underline" style={{ color: '#be185d' }}>
              Register now
            </a>
          </p>

        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between px-8 py-4 relative z-10">
        <span className="text-xs text-gray-400">© 2026 Stagy Inc. All rights reserved.</span>
        <div className="flex gap-8">
          <a href="#" className="text-xs text-gray-400 hover:text-gray-600 tracking-widest uppercase">Privacy Policy</a>
          <a href="#" className="text-xs text-gray-400 hover:text-gray-600 tracking-widest uppercase">Terms of Service</a>
        </div>
      </footer>

    </div>
  )
}

export default Login