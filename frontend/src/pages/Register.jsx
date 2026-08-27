import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

function Register() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #c8d8f8 0%, #dcd4f0 30%, #ede4f5 55%, #f5dde8 75%, #f8e4ee 100%)', position: 'relative' }}>
    {/* Left blue glow */}
<div className="absolute left-0 pointer-events-none"
  style={{ top: '70px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(150,185,255,0.45), transparent 65%)', transform: 'translateX(-30%)' }}></div>

{/* Right pink glow */}
<div className="absolute right-0 pointer-events-none"
  style={{ top: '70px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,160,210,0.4), transparent 65%)', transform: 'translateX(30%)' }}></div>

{/* Bottom left soft glow */}
<div className="absolute bottom-0 left-0 pointer-events-none"
  style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(180,200,255,0.35), transparent 65%)', transform: 'translate(-20%, 20%)' }}></div>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 relative z-10">
        <Logo size="md" />
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Already have an account?
          <button
            onClick={() => navigate('/')}
            className="font-semibold hover:underline" style={{ color: '#8B5CF6' }}
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">

        {/* Title */}
        <h1 className="text-5xl font-bold text-gray-900 text-center mb-5">
          Join the Elite
        </h1>
        <p className="text-gray-500 text-center max-w-2xl mb-14 leading-relaxed text-sm">
          Select your account type to begin your journey. Whether you're seeking high-impact
          internships or top-tier technical talent, Stagy connects the best with the best.
        </p>

        {/* Cards */}
        <div className="flex gap-8 w-full max-w-4xl mb-14">

          {/* Student card */}
          <div
            onClick={() => navigate('/register/student')}
            className="flex-1 bg-white rounded-2xl p-10 cursor-pointer hover:shadow-lg transition-all duration-300"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #eeeeef' }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8"
              style={{ background: '#f0f0f5' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8">
                <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Account</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-10">
              Discover exclusive internships at high-growth startups and tech giants.
              Build your professional network and match with roles that align with your
              technical DNA.
            </p>
            <span className="font-semibold text-sm flex items-center gap-1" style={{ color: '#1e293b' }}>
            Choose Student →
            </span>
          </div>

          {/* Company card */}
          <div
            onClick={() => navigate('/register/company')}
            className="flex-1 bg-white rounded-2xl p-10 cursor-pointer hover:shadow-lg transition-all duration-300"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #eeeeef' }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8"
              style={{ background: '#f0f0f5' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Account</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-10">
              Recruit the next generation of engineers and designers. Access a curated pool
              of elite students and streamline your technical hiring process with precision.
            </p>
            <span className="text-purple-600 font-semibold text-sm flex items-center gap-1">
              Choose Company →
            </span>
          </div>

        </div>

        {/* Bottom badges */}
        <div className="flex justify-center gap-4 w-full max-w-4xl">
          <div className="flex-1 flex items-center justify-center gap-2 text-xs text-gray-400 font-semibold tracking-widest uppercase py-4 rounded-xl"
            style={{ background: '#ededf5' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            Vetted Talent Pool
          </div>
          <div className="flex-1 flex items-center justify-center gap-2 text-xs text-gray-400 font-semibold tracking-widest uppercase py-4 rounded-xl"
            style={{ background: '#ededf5' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Instant Matching
          </div>
          <div className="flex-1 flex items-center justify-center gap-2 text-xs text-gray-400 font-semibold tracking-widest uppercase py-4 rounded-xl"
            style={{ background: '#ededf5' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            Enterprise Security
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-5">
        © 2026 Stagy Internships. Empowering the future of technical talent.
      </footer>

    </div>
  )
}

export default Register