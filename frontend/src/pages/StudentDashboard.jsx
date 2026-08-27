import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import NotificationsBell from '../components/NotificationsBell'
import API from '../api'

function StudentDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [internships, setInternships] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({ 
  applications_sent: 0, 
  interviews: 0, 
  saved_roles: 0,
  new_internships: 0
})
  const [appliedIds, setAppliedIds] = useState([])
  const [applyingId, setApplyingId] = useState(null)

  const handleQuickApply = (e, item) => {
    e.stopPropagation()
    if (!user || appliedIds.includes(item.id) || applyingId === item.id) return

    setApplyingId(item.id)
    API.post('/applications', {
      student_id: user.id,
      internship_id: item.id,
      match_score: item.match_score || 0,
    })
      .then(() => {
        setAppliedIds((prev) => [...prev, item.id])
      })
      .catch((err) => {
        if (err.response?.status === 400) {
          // Already applied - treat as applied in the UI
          setAppliedIds((prev) => [...prev, item.id])
        } else {
          console.error(err)
        }
      })
      .finally(() => setApplyingId(null))
  }

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'))
    if (!savedUser) { navigate('/'); return }
    setUser(savedUser)

    API.get('/internships')
      .then((res) => setInternships(res.data))
      .catch((err) => console.error(err))

    API.get(`/users/${savedUser.id}/matches`)
      .then((res) => setMatches(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))

    API.get(`/users/${savedUser.id}/stats`)
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
    }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen"
        style={{ background: '#eef0fb', position: 'relative', overflow: 'hidden' }}>
          {/* Top right blue glow */}
<div className="absolute top-0 right-0 pointer-events-none"
  style={{
    width: '800px',
    height: '700px',
    background: 'radial-gradient(ellipse at top right, rgba(147,160,255,0.65), transparent 60%)',
    zIndex: 0
  }}></div>

{/* Bottom left pink glow — after sidebar */}
<div className="absolute bottom-0 pointer-events-none"
  style={{
    left: '224px',
    width: '800px',
    height: '600px',
    background: 'radial-gradient(ellipse at bottom left, rgba(255,150,190,0.5), transparent 60%)',
    zIndex: 0
  }}></div>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  const internshipsWithScore = internships.map((item) => {
    const matchData = matches.find((m) => m.id === item.id)
    return { ...item, match_score: matchData ? matchData.match_score : 0 }
  })

  const filteredInternships = internshipsWithScore.filter(
    (item) =>
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(search.toLowerCase())) ||
      (item.skills_required && item.skills_required.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex min-h-screen"
      style={{ background: '#eef0fb', position: 'relative', overflow: 'hidden' }}>
        {/* Top right blue glow */}
<div className="absolute top-0 right-0 pointer-events-none"
  style={{
    width: '800px',
    height: '700px',
    background: 'radial-gradient(ellipse at top right, rgba(147,160,255,0.65), transparent 60%)',
    zIndex: 0
  }}></div>

{/* Bottom left pink glow — after sidebar */}
<div className="absolute bottom-0 pointer-events-none"
  style={{
    left: '224px',
    width: '800px',
    height: '600px',
    background: 'radial-gradient(ellipse at bottom left, rgba(255,150,190,0.5), transparent 60%)',
    zIndex: 0
  }}></div>

      <Sidebar />

      <div className="flex-1 p-8 relative z-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Good Morning, {user?.full_name}.
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Here is what's happening with your applications today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-100 shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search internships..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm focus:outline-none text-gray-600 placeholder-gray-300 w-44 bg-transparent"
              />
            </div>
            <NotificationsBell />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">

          <div className="bg-white rounded-2xl p-5 border border-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </div>
              <span className="text-xs text-green-500 font-bold">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.applications_sent}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Applications Sent</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span className="text-xs text-purple-500 font-bold">{stats.interviews} Active</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.interviews}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Interviews</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
                  <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <span className="text-xs text-orange-500 font-bold">{stats.new_internships} New</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.saved_roles}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Saved Roles</p>
          </div>

          {/* Profile strength */}
          <div className="bg-white rounded-2xl p-5 border border-white shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs text-gray-500 font-semibold">Profile Strength</p>
              <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-lg">85%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
              <div className="h-2 rounded-full"
                style={{ width: '85%', background: 'linear-gradient(90deg, #4F46E5, #8B5CF6)' }}></div>
            </div>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Add a portfolio link to reach Expert status and increase match accuracy.
            </p>
            <button
              onClick={() => navigate('/student/settings')}
              className="w-full border border-gray-200 text-gray-600 text-xs py-2 rounded-lg hover:bg-gray-50 transition font-semibold tracking-widest uppercase"
            >
              Complete Profile
            </button>
          </div>

        </div>

        {/* Top matches */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Top Matches for You</h2>
            <button
              onClick={() => navigate('/student/explorer')}
              className="text-blue-600 text-xs font-bold hover:underline tracking-widest uppercase"
            >
              View All Matches
            </button>
          </div>

          {matches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-white p-8 text-center text-gray-400">
              No matches yet. Complete your profile with skills to get matched!
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {matches.slice(0, 3).map((match, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`/student/internship/${match.id}`)}
                  className={`bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer
                    ${index === 0 ? 'border-2 border-blue-100' : 'border border-white'}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' }}>
                      {match.company_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{match.title}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{match.company_name}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-semibold uppercase tracking-wide">
                      {match.location}
                    </span>
                    <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                      {match.match_score}% Match
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-sm font-semibold text-gray-700">{match.salary}</span>
                    <span className="text-blue-500 font-bold">→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently added internships */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recently Added Internships</h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/student/explorer')}
                className="flex items-center gap-1 text-xs border border-white bg-white px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 font-semibold shadow-sm"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                Filter
              </button>
              <button
                onClick={() => navigate('/student/explorer')}
                className="flex items-center gap-1 text-xs border border-white bg-white px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 font-semibold shadow-sm"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <polyline points="19 12 12 19 5 12"/>
                </svg>
                Sort
              </button>
            </div>
          </div>

          {filteredInternships.length === 0 ? (
            <div className="bg-white rounded-2xl border border-white p-8 text-center text-gray-400">
              {internshipsWithScore.length === 0
                ? 'No internships available yet.'
                : `No internships match "${search}".`}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-white shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs text-gray-400 font-semibold px-6 py-4 uppercase tracking-widest">Company</th>
                    <th className="text-left text-xs text-gray-400 font-semibold px-6 py-4 uppercase tracking-widest">Position</th>
                    <th className="text-left text-xs text-gray-400 font-semibold px-6 py-4 uppercase tracking-widest">Location</th>
                    <th className="text-left text-xs text-gray-400 font-semibold px-6 py-4 uppercase tracking-widest">Posted</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInternships.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => navigate(`/student/internship/${item.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' }}>
                            {item.company_name?.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-800">{item.company_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{item.title}</td>
                      <td className="px-6 py-4 text-gray-500">{item.location}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">Just now</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => handleQuickApply(e, item)}
                          disabled={appliedIds.includes(item.id) || applyingId === item.id}
                          className={`font-bold text-xs tracking-widest uppercase ${
                            appliedIds.includes(item.id)
                              ? 'text-green-500 cursor-default'
                              : 'text-blue-600 hover:underline'
                          }`}
                        >
                          {appliedIds.includes(item.id)
                            ? 'Applied ✓'
                            : applyingId === item.id
                            ? 'Applying...'
                            : 'Quick Apply'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-center py-4 border-t border-gray-100">
                <button
                  onClick={() => navigate('/student/explorer')}
                  className="text-xs text-gray-400 hover:text-gray-600 tracking-widest uppercase font-semibold"
                >
                  Load More Listings
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default StudentDashboard