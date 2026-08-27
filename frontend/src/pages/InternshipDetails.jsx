import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import API from '../api'

function GlowWrapper({ children }) {
  return (
    <div className="flex min-h-screen relative overflow-hidden" style={{ background: '#eef0fb' }}>
      <div className="absolute top-0 right-0 pointer-events-none"
        style={{ width: '800px', height: '700px', background: 'radial-gradient(ellipse at top right, rgba(255,150,190,0.5), transparent 60%)', zIndex: 0 }}></div>
      <div className="absolute bottom-0 pointer-events-none"
        style={{ left: '224px', width: '800px', height: '600px', background: 'radial-gradient(ellipse at bottom left, rgba(147,160,255,0.65), transparent 60%)', zIndex: 0 }}></div>
      {children}
    </div>
  )
}

function InternshipDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [internship, setInternship] = useState(null)
  const [matchScore, setMatchScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState(null)
  const [applying, setApplying] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) {
      navigate('/')
      return
    }

    API.get(`/internships/${id}`)
      .then((res) => setInternship(res.data))
      .catch((err) => console.error(err))

    API.get(`/users/${user.id}/matches`)
      .then((res) => {
        const match = res.data.find((m) => m.id === parseInt(id))
        if (match) setMatchScore(match.match_score)
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))

    API.get(`/applications/${user.id}`)
      .then((res) => {
        const alreadyApplied = res.data.find(
          (app) => app.internship_id === parseInt(id)
        )
        if (alreadyApplied) setApplication(alreadyApplied)
      })
      .catch((err) => console.error(err))
  }, [id])

  const handleApply = async () => {
    const user = JSON.parse(localStorage.getItem('user'))
    setApplying(true)
    setError('')
    try {
      await API.post('/applications', {
        student_id: user.id,
        internship_id: parseInt(id),
        match_score: matchScore
      })
      setApplication({ status: 'pending', internship_id: parseInt(id) })
    } catch (err) {
      setError(err.response?.data?.message || 'Error applying. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem('user'))
    setSaving(true)
    try {
      await API.post('/applications/save', {
        student_id: user.id,
        internship_id: parseInt(id)
      })
      setSaved(true)
    } catch (err) {
      if (err.response?.data?.message === 'Already saved') {
        setSaved(true)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }


  if (loading) {
    return (
      <GlowWrapper>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center relative z-10">
          <p className="text-gray-400">Loading...</p>
        </div>
      </GlowWrapper>
    )
  }

  if (!internship) {
    return (
      <GlowWrapper>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-4">Internship not found.</p>
            <button
              onClick={() => navigate('/student/explorer')}
              className="hover:underline text-sm"
              style={{ color: '#6d28d9' }}
            >
              Back to Explorer
            </button>
          </div>
        </div>
      </GlowWrapper>
    )
  }

  const skillsList = internship.skills_required
    ? internship.skills_required.split(',').map((s) => s.trim())
    : []

  return (
    <GlowWrapper>
      <Sidebar />

      <div className="flex-1 p-8 relative z-10">

        <button
          onClick={() => navigate('/student/explorer')}
          className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
        >
          ← Back to Explorer
        </button>

        <div className="flex gap-6">

          {/* Left column */}
          <div className="flex-1">

            {/* Header card */}
            <div className="bg-white rounded-2xl border border-white shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-green-50 text-green-600 font-semibold px-2 py-1 rounded-full">
                      {internship.status?.toUpperCase()}
                    </span>
                    <span className="text-xs bg-purple-50 text-purple-600 font-semibold px-2 py-1 rounded-full">
                      {matchScore}% MATCH
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{internship.title}</h1>
                  <p className="text-gray-400 text-sm mt-1">
                    {internship.company_name} • {internship.location}
                  </p>
                </div>
                <div className="text-right">
                  {error && (
                    <p className="text-red-500 text-xs mb-2">{error}</p>
                  )}
                  {application ? (
                    <button disabled
                      className="bg-green-500 text-white font-semibold px-6 py-2 rounded-xl text-sm cursor-not-allowed">
                      ✓ Applied
                    </button>
                  ) : (
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="text-white font-semibold px-6 py-2 rounded-xl transition text-sm disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #312e81, #6d28d9)' }}
                    >
                      {applying ? 'Applying...' : 'Apply Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Accepted banner */}
            {application?.status === 'accepted' && (
              <div className="rounded-2xl p-5 mb-6 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #ecfdf5, #f5f3ff)' }}>
                <div>
                  <p className="text-sm font-bold text-green-700 mb-0.5">🎉 You've been accepted!</p>
                  <p className="text-xs text-gray-500">
                    {application.company_email
                      ? `Reach out to ${internship.company_name} to arrange next steps.`
                      : 'Contact details will appear here once available.'}
                  </p>
                </div>
                {application.company_email && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={`mailto:${application.company_email}?subject=${encodeURIComponent(
                        `Regarding my internship offer — ${internship.title}`
                      )}`}
                      className="text-sm font-semibold text-purple-600 hover:underline whitespace-nowrap"
                    >
                      📧 {application.company_email}
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(application.company_email)
                        alert('Email copied to clipboard!')
                      }}
                      title="Copy email"
                      className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1 rounded-lg hover:bg-white transition"
                    >
                      ⧉
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl border border-white shadow-sm p-6 mb-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{internship.description}</p>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-white shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, i) => (
                  <span key={i} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Right column */}
          <div className="w-72 flex flex-col gap-4">

            {/* Role Insights */}
            <div className="bg-white rounded-2xl border border-white shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Role Insights</h2>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <span>💰</span> Salary
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{internship.salary}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <span>👥</span> Applicants
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{internship.applicants_count} applied</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <span>⚡</span> Difficulty
                  </span>
                  <span className={`text-sm font-semibold
                    ${internship.difficulty === 'Easy' ? 'text-green-500' :
                      internship.difficulty === 'Medium' ? 'text-orange-500' :
                      'text-red-500'}`}>
                    {internship.difficulty}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <span>📅</span> Duration
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{internship.duration}</span>
                </div>

                {/* Hire rate circle */}
                <div className="flex flex-col items-center mt-2 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-3 tracking-widest">HIRE RATE</p>
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10"/>
                      <circle cx="50" cy="50" r="40" fill="none"
                        stroke="#6d28d9" strokeWidth="10"
                        strokeDasharray={`${internship.hire_rate * 2.51} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-900">{internship.hire_rate}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    of previous interns received full-time offers
                  </p>
                </div>
              </div>
            </div>

            {/* Company card */}
            <div className="bg-white rounded-2xl border border-white shadow-sm overflow-hidden">
              <div className="h-16 w-full"
                style={{ background: 'linear-gradient(135deg, #f9a8d4 0%, #f472b6 100%)' }}>
              </div>
              <div className="px-5 pt-4 pb-5">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg -mt-10 mb-3 shadow-md border-2 border-white flex-shrink-0"
                    style={{ background: 'white', border: '2px solid #f0f0f5', color: '#4F46E5' }}>
                    {internship.company_name?.charAt(0)}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">{internship.company_name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Leading tech company in Tunisia</p>
                </div>
                <button className="w-full border border-gray-200 text-gray-600 font-semibold text-xs py-2.5 rounded-xl hover:bg-gray-50 transition">
                  View Company Profile
                </button>
              </div>

              {/* Share and Save */}
              <div className="flex border-t border-gray-100">
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-400 hover:bg-gray-50 transition border-r border-gray-100"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  Share
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs hover:bg-gray-50 transition"
                  style={{ color: saved ? '#6d28d9' : '#9ca3af' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    style={{ fill: saved ? '#6d28d9' : 'none' }}>
                    <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  {saved ? 'Saved!' : 'Save'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </GlowWrapper>
  )
}

export default InternshipDetails