import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Logo from '../components/Logo'
import API from '../api'

function RegisterForm() {
  const { role } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async () => {
    setError('')

    // Validation
    if (!formData.full_name || !formData.email || !formData.password || !formData.confirm_password) {
      return setError('Please fill in all fields.')
    }
    if (formData.password !== formData.confirm_password) {
      return setError('Passwords do not match.')
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters.')
    }

    setLoading(true)

    try {
      // Register the user
      await API.post('/auth/register', {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: role
      })

      // Login immediately after register
      const loginRes = await API.post('/auth/login', {
        email: formData.email,
        password: formData.password
      })

      localStorage.setItem('token', loginRes.data.token)
      localStorage.setItem('user', JSON.stringify(loginRes.data.user))

      if (role === 'student') {
        navigate('/student/dashboard')
      } else {
        navigate('/company/dashboard')
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #c8d8f8 0%, #dcd4f0 30%, #ede4f5 55%, #f5dde8 75%, #f8e4ee 100%)' }}>

      {/* Left blue glow */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(180,200,255,0.5), transparent 70%)', transform: 'translate(-20%, -20%)' }}></div>

      {/* Right pink glow */}
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,180,220,0.4), transparent 70%)', transform: 'translate(20%, 20%)' }}></div>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 relative z-10">
        <Logo size="md" />
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Already have an account?
          <button
            onClick={() => navigate('/')}
            className="font-semibold hover:underline"
            style={{ color: '#8B5CF6' }}
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md bg-white rounded-3xl p-10"
          style={{ boxShadow: '0 8px 40px rgba(120,100,200,0.08)' }}>

          {/* Title */}
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: role === 'student' ? 'rgba(79,70,229,0.08)' : 'rgba(124,58,237,0.08)' }}>
              {role === 'student' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.8">
                  <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create {role === 'student' ? 'Student' : 'Company'} Account
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {role === 'student'
                ? 'Start finding your perfect internship today.'
                : 'Start recruiting top talent today.'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="flex flex-col gap-4">

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                {role === 'student' ? 'Full Name' : 'Company Name'}
              </label>
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                placeholder={role === 'student' ? 'Youssef Ben Ali' : 'Vermeg Tunisia'}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                placeholder="name@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                Confirm Password
              </label>
              <input
                name="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={handleChange}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full text-white font-bold py-3 rounded-xl transition text-sm disabled:opacity-50 mt-2"
              style={{ background: 'linear-gradient(135deg, #312e81, #6d28d9)' }}
            >
              {loading ? 'Creating Account...' : `Create ${role === 'student' ? 'Student' : 'Company'} Account`}
            </button>

          </div>

          {/* Back link */}
          <p className="text-center text-sm text-gray-400 mt-6">
            Wrong choice?{' '}
            <button
              onClick={() => navigate('/register')}
              className="font-semibold hover:underline"
              style={{ color: '#8B5CF6' }}
            >
              Go back
            </button>
          </p>

        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-4 relative z-10">
        © 2026 Stagy Internships. Empowering the future of technical talent.
      </footer>

    </div>
  )
}

export default RegisterForm