import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import API from '../api'

function Explorer() {
  const [search, setSearch] = useState('')
  const [internships, setInternships] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) {
      navigate('/')
      return
    }

    API.get('/internships')
      .then((res) => setInternships(res.data))
      .catch((err) => console.error(err))

    API.get(`/users/${user.id}/matches`)
      .then((res) => setMatches(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const internshipsWithMatch = internships.map((item) => {
    const matchData = matches.find((m) => m.id === item.id)
    return {
      ...item,
      match_score: matchData ? matchData.match_score : 0,
    }
  })

  const filtered = internshipsWithMatch.filter(
    (item) =>
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      (item.skills_required && item.skills_required.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex min-h-screen relative overflow-hidden"
        style={{ background: '#eef0fb' }}>
        <div className="absolute top-0 right-0 pointer-events-none"
          style={{ width: '800px', height: '700px', background: 'radial-gradient(ellipse at top right, rgba(147,160,255,0.65), transparent 60%)', zIndex: 0 }}></div>
        <div className="absolute bottom-0 pointer-events-none"
          style={{ left: '224px', width: '800px', height: '600px', background: 'radial-gradient(ellipse at bottom left, rgba(255,150,190,0.5), transparent 60%)', zIndex: 0 }}></div>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center relative z-10">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen relative overflow-hidden"
      style={{ background: '#eef0fb' }}>

      <div className="absolute top-0 right-0 pointer-events-none"
        style={{ width: '800px', height: '700px', background: 'radial-gradient(ellipse at top right, rgba(147,160,255,0.65), transparent 60%)', zIndex: 0 }}></div>
      <div className="absolute bottom-0 pointer-events-none"
        style={{ left: '224px', width: '800px', height: '600px', background: 'radial-gradient(ellipse at bottom left, rgba(255,150,190,0.5), transparent 60%)', zIndex: 0 }}></div>

      <Sidebar />

      <div className="flex-1 p-8 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Explorer</h1>
            <p className="text-gray-400 text-sm mt-1">
              Discover internships that match your technical profile.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-100 shadow-sm flex-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by role, company or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm focus:outline-none text-gray-600 placeholder-gray-300 w-full bg-transparent"
            />
          </div>
        </div>

        {/* Internship cards grid */}
        <div className="grid grid-cols-3 gap-4">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-white shadow-sm p-5 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' }}>
                    {item.company_name?.charAt(0) || '?'}
                  </div>
                  <span className="text-xs bg-purple-50 text-purple-600 font-bold px-2 py-1 rounded-full">
                    {item.match_score}% MATCH
                  </span>
                </div>

                <p className="font-bold text-gray-900 text-sm mt-2">{item.title}</p>
                <p className="text-xs text-gray-400 mb-3">
                  {item.company_name} • {item.duration}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {item.skills_required &&
                    item.skills_required.split(',').map((skill, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {skill.trim()}
                      </span>
                    ))}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-sm font-semibold text-gray-700">{item.salary}</span>
                  <button
                    onClick={() => navigate(`/student/internship/${item.id}`)}
                    className="text-xs font-bold hover:underline"
                    style={{ color: '#4F46E5' }}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-400 py-16">
              No internships found for this search.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Explorer