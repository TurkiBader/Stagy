import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

function OfferDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [offer, setOffer] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [updatingStatusId, setUpdatingStatusId] = useState(null)
  const [updatingOfferStatus, setUpdatingOfferStatus] = useState(false)
  const [selectedCandidateId, setSelectedCandidateId] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) { navigate('/'); return }

    Promise.all([
      API.get(`/internships/${id}`),
      API.get(`/internships/${id}/applications`),
    ])
      .then(([offerRes, applicantsRes]) => {
        setOffer(offerRes.data)
        setApplicants(applicantsRes.data)
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

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
        setApplicants((prev) =>
          prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus } : a))
        )
      })
      .catch((err) => {
        console.error(err)
        alert('Could not update status. Please try again.')
      })
      .finally(() => setUpdatingStatusId(null))
  }

  const handleToggleOfferStatus = () => {
    const goingToClose = offer.status !== 'closed'
    const confirmMessage = goingToClose
      ? 'Close this offer? It will be hidden from students but you can reopen it anytime.'
      : 'Reopen this offer? It will become visible to students again.'

    if (!window.confirm(confirmMessage)) return

    const newStatus = goingToClose ? 'closed' : 'active'
    setUpdatingOfferStatus(true)
    API.put(`/internships/${id}/status`, { status: newStatus })
      .then(() => setOffer((prev) => ({ ...prev, status: newStatus })))
      .catch((err) => {
        console.error(err)
        alert('Could not update the offer status. Please try again.')
      })
      .finally(() => setUpdatingOfferStatus(false))
  }

  const handleDelete = () => {
    if (!window.confirm('Delete this offer permanently? This cannot be undone.')) return
    setDeleting(true)
    API.delete(`/internships/${id}`)
      .then(() => navigate('/company/offers'))
      .catch((err) => {
        console.error(err)
        alert('Could not delete this offer. Please try again.')
        setDeleting(false)
      })
  }


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

  if (!offer) {
    return (
      <GlowWrapper>
        <CompanySidebar />
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-4">Offer not found.</p>
            <button
              onClick={() => navigate('/company/offers')}
              className="hover:underline text-sm"
              style={{ color: '#6d28d9' }}
            >
              Back to My Offers
            </button>
          </div>
        </div>
      </GlowWrapper>
    )
  }

  const skillsList = offer.skills_required
    ? offer.skills_required.split(',').map((s) => s.trim())
    : []

  return (
    <GlowWrapper>
      <CompanySidebar />

      <div className="flex-1 p-8 relative z-10">

        <button
          onClick={() => navigate('/company/offers')}
          className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
        >
          ← Back to My Offers
        </button>

        <div className="flex gap-6">

          {/* Left column */}
          <div className="flex-1">

            {/* Header card */}
            <div className="bg-white rounded-2xl border border-white shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      offer.status === 'closed'
                        ? 'bg-gray-100 text-gray-500'
                        : offer.status === 'draft'
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-green-50 text-green-600'
                    }`}>
                      {offer.status?.toUpperCase()}
                    </span>
                    <span className="text-xs bg-purple-50 text-purple-600 font-semibold px-2 py-1 rounded-full">
                      {offer.difficulty}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{offer.title}</h1>
                  <p className="text-gray-400 text-sm mt-1">{offer.location} • {offer.employment_type}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleToggleOfferStatus}
                    disabled={updatingOfferStatus}
                    className={`font-semibold px-4 py-2 rounded-xl text-sm transition disabled:opacity-50 border
                      ${offer.status === 'closed'
                        ? 'border-green-200 text-green-600 hover:bg-green-50'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {updatingOfferStatus
                      ? 'Updating...'
                      : offer.status === 'closed'
                      ? '↻ Reopen Offer'
                      : '✓ Close Offer'}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="border border-red-200 text-red-500 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete Offer'}
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-white shadow-sm p-6 mb-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{offer.description}</p>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-white shadow-sm p-6 mb-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, i) => (
                  <span key={i} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Applicants */}
            <div className="bg-white rounded-2xl border border-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">
                  Applicants ({applicants.length})
                </h2>
              </div>
              {applicants.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No applicants yet for this offer.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-widest">Candidate</th>
                      <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-widest">University</th>
                      <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-widest">Match Score</th>
                      <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-widest">Status</th>
                      <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-widest">Applied</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map((app) => (
                      <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => setSelectedCandidateId(app.id)}
                          >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' }}>
                              {app.full_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm group-hover:underline">{app.full_name}</p>
                              <p className="text-xs text-gray-400">{app.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">{app.university || '—'}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-sm" style={{ color: '#8B5CF6' }}>
                            {app.match_score}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={app.status || 'pending'}
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
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`mailto:${app.email}?subject=${encodeURIComponent(
                                  `Welcome aboard — ${offer.title}`
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
              )}
            </div>

          </div>

          {/* Right column */}
          <div className="w-72 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-white shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Offer Insights</h2>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <span>💰</span> Salary
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{offer.salary}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <span>👥</span> Applicants
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{applicants.length} applied</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <span>📅</span> Duration
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{offer.duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <span>📌</span> Posted
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {new Date(offer.created_at).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CandidateProfileModal
        candidate={applicants.find((a) => a.id === selectedCandidateId)}
        onClose={() => setSelectedCandidateId(null)}
        onStatusChange={handleStatusChange}
        updatingStatus={updatingStatusId === selectedCandidateId}
      />
    </GlowWrapper>
  )
}

export default OfferDetails