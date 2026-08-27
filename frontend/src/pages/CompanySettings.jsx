import { useEffect, useState } from 'react'
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

function CompanySettings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadError, setLoadError] = useState(false)

  const [companyName, setCompanyName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [original, setOriginal] = useState(null)

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'))
    if (!savedUser) { navigate('/'); return }
    setUser(savedUser)

    API.get(`/users/${savedUser.id}/company`)
      .then((res) => {
        const data = res.data
        setCompanyName(data.company_name || '')
        setLocation(data.location || '')
        setDescription(data.description || '')
        setOriginal({
          company_name: data.company_name || '',
          location: data.location || '',
          description: data.description || '',
        })
      })
      .catch((err) => {
        console.error(err)
        setLoadError(true)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDiscard = () => {
    if (!original) return
    setCompanyName(original.company_name)
    setLocation(original.location)
    setDescription(original.description)
  }

  const handleSave = () => {
    if (!user) return
    if (!companyName.trim()) {
      alert('Company name cannot be empty.')
      return
    }
    setSaving(true)
    API.put(`/users/${user.id}/company`, {
      company_name: companyName,
      location,
      description,
    })
      .then(() => {
        setOriginal({ company_name: companyName, location, description })
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      })
      .catch((err) => {
        console.error(err)
        alert('Something went wrong saving your company profile. Please try again.')
      })
      .finally(() => setSaving(false))
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

  return (
    <GlowWrapper>
      <CompanySidebar />

      <div className="flex-1 p-8 relative z-10">

        <div className="max-w-2xl mx-auto">

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>
            <p className="text-gray-400 text-sm mt-1">
              This information appears on every offer you post — keep it accurate.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDiscard}
              className="border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-white text-sm px-4 py-2 rounded-lg transition disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' }}
            >
              {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {loadError && (
          <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl p-4 mb-6">
            Couldn't load your company profile. Make sure the backend and database are running, then refresh.
          </div>
        )}

        <div className="bg-white rounded-2xl border border-white shadow-sm p-6">

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' }}>
                {companyName?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-bold text-gray-900">{companyName || 'Your Company'}</p>
                <p className="text-xs text-gray-400">This is how students will see you</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Company Name
                </label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Location
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Tunis, Tunisia"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Company Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Tell students what your company does and what makes it a great place to intern..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-white shadow-sm p-6 mt-6">
            <h2 className="text-sm font-bold text-gray-900 mb-1">Hire Rate</h2>
            <p className="text-xs text-gray-400">
              Your hire rate is calculated automatically from your real application history
              (accepted applications ÷ total applications) — it isn't something you set manually,
              and will start showing once you have applicants.
            </p>
          </div>
        </div>

      </div>
    </GlowWrapper>
  )
}

export default CompanySettings