import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import API from '../api'

function StudentProfile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadError, setLoadError] = useState(false)

  // Read-only (account-level, not editable via this endpoint yet)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  // Editable (student_profiles table)
  const [location, setLocation] = useState('')
  const [university, setUniversity] = useState('')
  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState([])
  const [profileStrength, setProfileStrength] = useState(0)
  const [newSkill, setNewSkill] = useState('')
  const [cvUrl, setCvUrl] = useState(null)
  const [uploadingCv, setUploadingCv] = useState(false)
  const [cvError, setCvError] = useState('')
  const fileInputRef = useRef(null)

  // Snapshot of last-saved/loaded values, used by Discard
  const [original, setOriginal] = useState(null)

  const loadProfile = (userId) => {
    setLoading(true)
    setLoadError(false)
    API.get(`/users/${userId}`)
      .then((res) => {
        const data = res.data
        const skillsArray = data.skills
          ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : []

        setFullName(data.full_name || '')
        setEmail(data.email || '')
        setLocation(data.location || '')
        setUniversity(data.university || '')
        setBio(data.bio || '')
        setSkills(skillsArray)
        setProfileStrength(data.profile_strength ?? 0)
        setCvUrl(data.cv_url || null)

        setOriginal({
          location: data.location || '',
          university: data.university || '',
          bio: data.bio || '',
          skills: skillsArray,
        })
      })
      .catch((err) => {
        console.error(err)
        setLoadError(true)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'))
    if (!savedUser) { navigate('/'); return }
    setUser(savedUser)
    loadProfile(savedUser.id)
  }, [])

  const handleAddSkill = () => {
    if (newSkill.trim() !== '' && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove))
  }

  const handleDiscard = () => {
    if (!original) return
    setLocation(original.location)
    setUniversity(original.university)
    setBio(original.bio)
    setSkills(original.skills)
  }

  // Files are stored as "<userId>-<timestamp>-<sanitizedName>.<ext>" — recover a readable name from that
  const displayCvName = (url) => {
    if (!url) return ''
    const filename = url.split('/').pop()
    const parts = filename.split('-')
    if (parts.length >= 3) {
      return parts.slice(2).join('-')
    }
    return filename
  }

  const handleBrowseClick = () => {
    setCvError('')
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file || !user) return

    const allowedExtensions = ['.pdf', '.doc', '.docx']
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!allowedExtensions.includes(ext)) {
      setCvError('Only PDF, DOC, or DOCX files are allowed.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setCvError('File is too large — max 10MB.')
      return
    }

    setCvError('')
    setUploadingCv(true)

    const formData = new FormData()
    formData.append('cv', file)

    API.post(`/users/${user.id}/cv`, formData)
      .then((res) => {
        setCvUrl(res.data.cv_url)
      })
      .catch((err) => {
        console.error(err)
        setCvError(err.response?.data?.message || 'Upload failed. Please try again.')
      })
      .finally(() => setUploadingCv(false))
  }

  const handleDeleteCv = () => {
    if (!user || !cvUrl) return
    if (!window.confirm('Remove your uploaded CV?')) return

    API.delete(`/users/${user.id}/cv`)
      .then(() => setCvUrl(null))
      .catch((err) => {
        console.error(err)
        alert('Could not delete the CV. Please try again.')
      })
  }

  const handleSave = () => {
    if (!user) return
    setSaving(true)
    API.put(`/users/${user.id}`, {
      university,
      location,
      bio,
      skills: skills.join(','),
    })
      .then(() => {
        setOriginal({ location, university, bio, skills })
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      })
      .catch((err) => {
        console.error(err)
        alert('Something went wrong saving your profile. Please try again.')
      })
      .finally(() => setSaving(false))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen relative overflow-hidden" style={{ background: '#eef0fb' }}>
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
    style={{
      width: '800px',
      height: '700px',
      background: 'radial-gradient(ellipse at top right, rgba(147,160,255,0.65), transparent 60%)',
      zIndex: 0
    }}></div>

  {/* Bottom left pink glow */}
  <div className="absolute bottom-0 pointer-events-none"
    style={{
      left: '224px',
      width: '800px',
      height: '600px',
      background: 'radial-gradient(ellipse at bottom left, rgba(255,150,190,0.5), transparent 60%)',
      zIndex: 0
    }}></div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 p-8 relative z-10">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-400 text-sm mt-1">
              Customize your public presence and internship preferences.
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
              style={{ background: 'linear-gradient(135deg, #312e81, #6d28d9)' }}
            >
              {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {loadError && (
          <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-xl p-4 mb-6">
            Couldn't load your profile. Make sure the backend and database are running, then refresh.
          </div>
        )}

        <div className="flex gap-6">

          {/* Left column */}
          <div className="flex-1 flex flex-col gap-6">

            {/* Personal information */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-6">Personal Information</h2>

              <div className="flex gap-6 mb-4">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl flex-shrink-0">
                  {fullName?.charAt(0) || '?'}
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Full Name
                    </label>
                    <input
                      value={fullName}
                      readOnly
                      title="Name changes aren't supported yet — contact support to update this."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Email Address
                    </label>
                    <input
                      value={email}
                      readOnly
                      title="Email changes aren't supported yet — contact support to update this."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Location
                    </label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      University
                    </label>
                    <input
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-gray-900">Skills & Expertise</h2>
              </div>

              {/* Skill tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.length === 0 && (
                  <p className="text-sm text-gray-400">No skills added yet.</p>
                )}
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-gray-400 hover:text-red-500 ml-1 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add skill input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddSkill}
                  className="text-white text-sm px-4 py-2 rounded-lg transition"
                  style={{ background: 'linear-gradient(135deg, #312e81, #6d28d9)' }}
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Resume */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Resume & Portfolio</h2>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />

              {!cvUrl && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-2">
                  <p className="text-3xl mb-2">☁</p>
                  <p className="text-sm font-semibold text-gray-600">Upload your latest CV</p>
                  <p className="text-xs text-gray-400 mb-3">PDF or DOCX, max 10MB</p>
                  <button
                    onClick={handleBrowseClick}
                    disabled={uploadingCv}
                    className="text-blue-600 text-sm font-semibold hover:underline disabled:opacity-60"
                  >
                    {uploadingCv ? 'Uploading...' : 'Browse files'}
                  </button>
                </div>
              )}

              {cvUrl && (
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-red-500">📄</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">{displayCvName(cvUrl)}</p>
                      <p className="text-xs text-gray-400">Uploaded successfully</p>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <a
                      href={`http://localhost:5000${cvUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View CV"
                      className="text-gray-400 hover:text-blue-500 text-sm"
                    >
                      👁
                    </a>
                    <button
                      onClick={handleBrowseClick}
                      disabled={uploadingCv}
                      title="Replace CV"
                      className="text-gray-400 hover:text-indigo-500 text-sm disabled:opacity-60"
                    >
                      ⟳
                    </button>
                    <button
                      onClick={handleDeleteCv}
                      title="Delete CV"
                      className="text-gray-400 hover:text-red-500 text-sm"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              )}

              {cvError && (
                <p className="text-xs text-red-500 mt-1">{cvError}</p>
              )}
            </div>

          </div>

          {/* Right column */}
          <div className="w-72 flex flex-col gap-4">

            {/* Profile strength */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Profile Strength
              </p>
              <div className="flex flex-col items-center mb-4">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10"/>
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="#6d28d9" strokeWidth="10"
                      strokeDasharray={`${(profileStrength / 100) * 251} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">{profileStrength}%</span>
                    <span className="text-xs font-semibold" style={{ color: '#6d28d9' }}>
                      {profileStrength >= 80 ? 'STRONG' : profileStrength >= 50 ? 'GOOD' : 'INCOMPLETE'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className={`flex items-center gap-2 text-sm ${bio ? 'text-green-500' : 'text-gray-400'}`}>
                  <span>{bio ? '✓' : '○'}</span> Bio added
                </div>
                <div className={`flex items-center gap-2 text-sm ${skills.length > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                  <span>{skills.length > 0 ? '✓' : '○'}</span> Skills added
                </div>
                <div className={`flex items-center gap-2 text-sm ${university ? 'text-green-500' : 'text-gray-400'}`}>
                  <span>{university ? '✓' : '○'}</span> University added
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentProfile