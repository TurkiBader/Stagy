import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CompanySidebar from '../components/CompanySidebar'
import CandidateProfileModal from '../components/CandidateProfileModal'
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

function CompanyApplicants() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingStatusId, setUpdatingStatusId] = useState(null)
  const [selectedCandidateId, setSelectedCandidateId] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) { navigate('/'); return }

    API.get(`/users/${user.id}/company`)
      .then((res) => {
        const companyId = res.data.id
        return API.get(`/internships/company/${companyId}/applications`)
      })
      .then((res) => setApplications(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted': return 'bg-green-100 text-green-600'
      case 'interviewing': return 'bg-blue-100 text-blue-600'
      case 'accepted': return 'bg-purple-100 text-purple-600'
      case 'rejected': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const handleStatusChange = (applicationId, newStatus) => {
    setUpdatingStatusId(applicationId)
    API.put(`/applications/${applicationId}/status`, { status: newStatus })
      .then(() => {
        setApplications((prev) =>
          prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus } : a))
        )
      })
      .catch((err) => {
        console.error(err)
        alert('Could not update status. Please try again.')
      })
      .finally(() => setUpdatingStatusId(null))
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      app.internship_title?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })


  if (loading) {
    return (
      <GlowWrapper>
        <CompanySidebar />
        <div className="flex-1 flex items-center justify-center relative z-10">
          <p className="text-gray-400">Loading...</p>
        </div>
      </GlowWrapper>
    )
  }

  return (
    <GlowWrapper>
      <CompanySidebar />

      <div className="flex-1 p-8 relative z-10">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
            <p className="text-gray-400 text-sm mt-1">Everyone who applied across all your offers.</p>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search by name or offer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interviewing">Interviewing</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-white p-16 text-center text-gray-400 text-sm">
            {applications.length === 0
              ? 'No applications yet. Post an offer to start receiving candidates.'
              : 'No applicants match your search or filter.'}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-widest">Candidate</th>
                  <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-widest">Applied For</th>
                  <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-widest">Match Score</th>
                  <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-widest">Status</th>
                  <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-widest">Applied</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/company/offer/${app.internship_id}`)}
                    className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCandidateId(app.id)
                        }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' }}>
                          {app.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm group-hover:underline">{app.full_name}</p>
                          <p className="text-xs text-gray-400">{app.skills?.split(',')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{app.internship_title}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-sm" style={{ color: '#8B5CF6' }}>
                        {app.match_score}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={app.status || 'pending'}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        disabled={updatingStatusId === app.id}
                        className={`text-xs font-semibold px-2 py-1.5 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer disabled:opacity-50 ${getStatusColor(app.status)}`}
                      >
                        <option value="pending">PENDING</option>
                        <option value="shortlisted">SHORTLISTED</option>
                        <option value="interviewing">INTERVIEWING</option>
                        <option value="accepted">ACCEPTED</option>
                        <option value="rejected">REJECTED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(app.applied_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4">
                      {app.status === 'accepted' && app.email && (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`mailto:${app.email}?subject=${encodeURIComponent(
                              `Welcome aboard — ${app.internship_title}`
                            )}`}
                            className="text-xs font-semibold text-purple-600 hover:underline whitespace-nowrap"
                          >
                            📧 Contact
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(app.email)
                              alert(`Email copied: ${app.email}`)
                            }}
                            title="Copy email address"
                            className="text-gray-400 hover:text-gray-600 text-xs"
                          >
                            ⧉
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      <CandidateProfileModal
        candidate={applications.find((a) => a.id === selectedCandidateId)}
        onClose={() => setSelectedCandidateId(null)}
        onStatusChange={handleStatusChange}
        updatingStatus={updatingStatusId === selectedCandidateId}
      />
    </GlowWrapper>
  )
}

export default CompanyApplicants