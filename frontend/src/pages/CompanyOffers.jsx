import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CompanySidebar from '../components/CompanySidebar'
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

function CompanyOffers() {
  const navigate = useNavigate()
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const offerColors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-pink-500']

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) { navigate('/'); return }

    API.get(`/users/${user.id}/company`)
      .then((res) => {
        const companyId = res.data.id
        return API.get(`/internships/company/${companyId}`)
      })
      .then((res) => setOffers(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const filteredOffers = offers.filter(
    (o) =>
      o.title?.toLowerCase().includes(search.toLowerCase()) ||
      (o.location && o.location.toLowerCase().includes(search.toLowerCase()))
  )


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
            <h1 className="text-3xl font-bold text-gray-900">My Offers</h1>
            <p className="text-gray-400 text-sm mt-1">All internships posted by your company.</p>
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Search offers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            />
            <button
              onClick={() => navigate('/company/new-offer')}
              className="text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' }}
            >
              + Post New Offer
            </button>
          </div>
        </div>

        {filteredOffers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-white p-16 text-center">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-gray-500 font-semibold mb-2">
              {offers.length === 0 ? 'No offers posted yet' : `No offers match "${search}"`}
            </p>
            {offers.length === 0 && (
              <>
                <p className="text-gray-400 text-sm mb-6">
                  Post your first internship offer to start receiving applications.
                </p>
                <button
                  onClick={() => navigate('/company/new-offer')}
                  className="text-white text-sm font-semibold px-6 py-2 rounded-xl transition"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' }}
                >
                  + Post New Offer
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredOffers.map((offer, index) => (
              <div
                key={offer.id}
                onClick={() => navigate(`/company/offer/${offer.id}`)}
                className="bg-white rounded-2xl border border-white shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl ${offerColors[index % offerColors.length]} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                  {offer.title?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">{offer.title}</p>
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
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">{offer.applicants_count}</p>
                  <p className="text-xs text-gray-400">applies</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </GlowWrapper>
  )
}

export default CompanyOffers