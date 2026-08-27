import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CompanySidebar from '../components/CompanySidebar'
import NotificationsBell from '../components/NotificationsBell'
import API from '../api'

// Buckets a list of applications (each with an applied_at timestamp) into a small
// number of chart-friendly buckets covering the last `rangeDays` days.
function buildChartData(applications, rangeDays) {
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - (rangeDays - 1))
  start.setHours(0, 0, 0, 0)

  const bucketCount = rangeDays <= 7 ? rangeDays : rangeDays <= 30 ? 6 : 9
  const bucketSizeDays = Math.ceil(rangeDays / bucketCount)

  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const bucketStart = new Date(start)
    bucketStart.setDate(bucketStart.getDate() + i * bucketSizeDays)
    const bucketEnd = new Date(bucketStart)
    bucketEnd.setDate(bucketEnd.getDate() + bucketSizeDays)
    return { start: bucketStart, end: bucketEnd, count: 0 }
  })

  applications.forEach((app) => {
    const appliedDate = new Date(app.applied_at)
    if (appliedDate < start) return
    const bucket = buckets.find((b) => appliedDate >= b.start && appliedDate < b.end)
    if (bucket) bucket.count++
  })

  return buckets.map((b) => ({
    label: rangeDays <= 7
      ? b.start.toLocaleDateString('en-GB', { weekday: 'short' })
      : b.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    count: b.count,
  }))
}

function CompanyDashboard() {
  const navigate = useNavigate()
  const [postedOffers, setPostedOffers] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [statusFilter, setStatusFilter] = useState('all')

  const offerColors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-pink-500']

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) { navigate('/'); return }

    API.get(`/users/${user.id}/company`)
      .then((res) => {
        const cId = res.data.id

        API.get(`/internships/company/${cId}`)
          .then((res) => setPostedOffers(res.data))
          .catch((err) => console.error(err))

        API.get(`/internships/company/${cId}/applications`)
          .then((res) => setApplications(res.data))
          .catch((err) => console.error(err))
          .finally(() => setLoading(false))
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const chartData = buildChartData(applications, Number(dateRange))
  const maxValue = Math.max(1, ...chartData.map((d) => d.count))

  const filteredApplications = applications.filter(
    (app) => statusFilter === 'all' || app.status === statusFilter
  )

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
      <div className="flex min-h-screen relative overflow-hidden" style={{ background: '#eef0fb' }}>
        <CompanySidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen relative overflow-hidden"
      style={{ background: '#eef0fb' }}>

      <div className="absolute top-0 right-0 pointer-events-none"
        style={{ width: '800px', height: '700px', background: 'radial-gradient(ellipse at top right, rgba(255,150,190,0.5), transparent 60%)', zIndex: 0 }}></div>
      <div className="absolute bottom-0 pointer-events-none"
        style={{ left: '224px', width: '800px', height: '600px', background: 'radial-gradient(ellipse at bottom left, rgba(147,160,255,0.65), transparent 60%)', zIndex: 0 }}></div>

      <CompanySidebar />

      <div className="flex-1 p-8 relative z-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Overview of your active recruitment pipelines.</p>
          </div>
          <div className="flex gap-3 items-center">
            <NotificationsBell />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 bg-white text-gray-600 text-sm px-3 py-2 rounded-xl focus:outline-none shadow-sm"
            >
              <option value="all">⊟ All Statuses</option>
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interviewing">Interviewing</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={() => navigate('/company/new-offer')}
              className="text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' }}
            >
              + Post New Offer
            </button>
          </div>
        </div>

        <div className="flex gap-6 mb-6">

          {/* Application trends chart */}
          <div className="flex-1 bg-white rounded-2xl border border-white shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-base font-bold text-gray-900">Application Trends</h2>
                <p className="text-xs text-gray-400 mt-1">Real incoming applications over time</p>
              </div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 text-gray-500 focus:outline-none bg-gray-50"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>
            {applications.length === 0 ? (
              <div className="flex items-center justify-center text-sm text-gray-400" style={{ height: '128px' }}>
                No applications yet — trends will appear here once candidates start applying.
              </div>
            ) : (
              <div className="flex items-end justify-between gap-2" style={{ height: '128px' }}>
                {chartData.map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center" style={{ height: '100%', justifyContent: 'flex-end' }}>
                    <span className="text-xs text-gray-400 mb-1">{bar.count > 0 ? bar.count : ''}</span>
                    <div className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${Math.max((bar.count / maxValue) * 108, bar.count > 0 ? 4 : 1)}px`,
                        background: bar.count > 0
                          ? 'linear-gradient(180deg, #8B5CF6, #4F46E5)'
                          : '#f3f4f6',
                      }}></div>
                    <span className="text-xs text-gray-400 mt-1">{bar.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-4 w-56">
            <div className="bg-white rounded-2xl border border-white shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-purple-500">👥</span>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Total Applicants</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
              <p className="text-xs text-green-500 mt-1">↑ Real time data</p>
            </div>
            <div className="bg-white rounded-2xl border border-white shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-orange-500">📋</span>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Active Listings</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{postedOffers.length}</p>
              <p className="text-xs text-orange-500 mt-1">⏰ Live count</p>
            </div>
          </div>
        </div>

        <div className="flex gap-6">

          {/* Posted offers */}
          <div className="w-72">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-gray-900">Posted Offers</h2>
              <button
                onClick={() => navigate('/company/offers')}
                className="text-sm font-semibold hover:underline"
                style={{ color: '#4F46E5' }}
              >
                View All
              </button>
            </div>
            {postedOffers.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm">
                No offers posted yet.
                <button
                  onClick={() => navigate('/company/new-offer')}
                  className="block mt-3 text-xs font-semibold mx-auto"
                  style={{ color: '#4F46E5' }}
                >
                  + Post your first offer
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {postedOffers.slice(0, 5).map((offer, index) => (
                  <div key={offer.id}
                    onClick={() => navigate(`/company/offer/${offer.id}`)}
                    className="bg-white rounded-2xl border border-white shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition cursor-pointer">
                    <div className={`w-8 h-8 rounded-xl ${offerColors[index % offerColors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {offer.title?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800">{offer.title}</p>
                        {offer.status && offer.status !== 'active' && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                            offer.status === 'closed' ? 'bg-gray-100 text-gray-500' : 'bg-yellow-50 text-yellow-600'
                          }`}>
                            {offer.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{offer.employment_type} • {offer.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{offer.applicants_count}</p>
                      <p className="text-xs text-gray-400">applies</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top talent matches */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-gray-900">Top Talent Matches</h2>
              <span className="flex items-center gap-1 text-xs text-green-500 font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live Updates
              </span>
            </div>
            {filteredApplications.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">
                {applications.length === 0
                  ? 'No applications yet. Post an offer to start receiving candidates.'
                  : 'No applicants match this status filter.'}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-widest">Candidate</th>
                      <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-widest">Match Score</th>
                      <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-widest">Applied For</th>
                      <th className="text-left text-xs text-gray-400 font-semibold px-6 py-3 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.slice(0, 6).map((app, index) => (
                      <tr
                        key={index}
                        onClick={() => navigate(`/company/offer/${app.internship_id}`)}
                        className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' }}>
                              {app.full_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{app.full_name}</p>
                              <p className="text-xs text-gray-400">{app.skills?.split(',')[0]}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-sm" style={{ color: '#8B5CF6' }}>
                            {app.match_score}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">{app.internship_title}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(app.status)}`}>
                            {app.status?.toUpperCase() || 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-center py-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate('/company/applicants')}
                    className="text-sm font-semibold hover:underline"
                    style={{ color: '#4F46E5' }}
                  >
                    View All Matching Talent
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyDashboard