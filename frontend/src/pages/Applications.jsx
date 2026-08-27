import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import API from '../api'

function Applications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [withdrawingId, setWithdrawingId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) {
      navigate('/')
      return
    }

    API.get(`/applications/${user.id}`)
      .then((res) => setApplications(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleWithdraw = (e, applicationId) => {
    e.stopPropagation()
    if (!window.confirm('Withdraw this application? You can re-apply later if you change your mind.')) return

    setWithdrawingId(applicationId)
    API.delete(`/applications/${applicationId}`)
      .then(() => {
        setApplications((prev) => prev.filter((a) => a.id !== applicationId))
      })
      .catch((err) => {
        console.error(err)
        alert('Could not withdraw this application. Please try again.')
      })
      .finally(() => setWithdrawingId(null))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted': return 'bg-green-100 text-green-600'
      case 'interviewing': return 'bg-blue-100 text-blue-600'
      case 'accepted': return 'bg-purple-100 text-purple-600'
      case 'rejected': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen relative overflow-hidden"
  style={{ background: '#eef0fb' }}>

  {/* Top right blue glow */}
  <div className="absolute top-0 right-0 pointer-events-none"
    style={{ width: '800px', height: '700px', background: 'radial-gradient(ellipse at top right, rgba(147,160,255,0.65), transparent 60%)', zIndex: 0 }}></div>

  {/* Bottom left pink glow */}
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

  {/* Top right blue glow */}
  <div className="absolute top-0 right-0 pointer-events-none"
    style={{ width: '800px', height: '700px', background: 'radial-gradient(ellipse at top right, rgba(147,160,255,0.65), transparent 60%)', zIndex: 0 }}></div>

  {/* Bottom left pink glow */}
  <div className="absolute bottom-0 pointer-events-none"
    style={{ left: '224px', width: '800px', height: '600px', background: 'radial-gradient(ellipse at bottom left, rgba(255,150,190,0.5), transparent 60%)', zIndex: 0 }}></div>

      <Sidebar />

      <div className="flex-1 p-8 relative z-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-400 text-sm mt-1">
            Track all your internship applications and their status.
          </p>
        </div>

        {/* Applications list */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
            <p className="text-4xl mb-4">📄</p>
            <p className="text-gray-500 font-semibold mb-2">No applications yet</p>
            <p className="text-gray-400 text-sm mb-6">
              Start exploring internships and apply to the ones that match your profile.
            </p>
            <button
              onClick={() => navigate('/student/explorer')}
              className="text-white text-sm font-semibold px-6 py-2 rounded-xl transition"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' }}
            >
              Explore Internships
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-4">COMPANY</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-4">POSITION</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-4">LOCATION</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-4">MATCH SCORE</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-4">STATUS</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-4">APPLIED AT</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => navigate(`/student/internship/${app.internship_id}`)}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {app.company_name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{app.title}</td>
                    <td className="px-6 py-4 text-gray-500">{app.location}</td>
                    <td className="px-6 py-4">
                      <span className="text-purple-600 font-bold">{app.match_score}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(app.status)}`}>
                        {app.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(app.applied_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4">
                      {app.status === 'accepted' && app.company_email && (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`mailto:${app.company_email}?subject=${encodeURIComponent(
                              `Regarding my internship offer — ${app.title}`
                            )}`}
                            className="text-xs font-semibold text-purple-600 hover:underline whitespace-nowrap"
                          >
                            📧 Contact Company
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(app.company_email)
                              alert(`Email copied: ${app.company_email}`)
                            }}
                            title="Copy email address"
                            className="text-gray-400 hover:text-gray-600 text-xs"
                          >
                            ⧉
                          </button>
                        </div>
                      )}
                      {['pending', 'shortlisted', 'interviewing'].includes(app.status) && (
                        <button
                          onClick={(e) => handleWithdraw(e, app.id)}
                          disabled={withdrawingId === app.id}
                          className="text-xs font-semibold text-gray-400 hover:text-red-500 whitespace-nowrap disabled:opacity-50"
                        >
                          {withdrawingId === app.id ? 'Withdrawing...' : '✕ Withdraw'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}

export default Applications