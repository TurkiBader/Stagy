import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CompanySidebar from '../components/CompanySidebar'
import API from '../api'

function NewOffer() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [employmentType, setEmploymentType] = useState('Full-time')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    department: 'Engineering',
    duration: '',
    salary: '',
    difficulty: 'Medium',
    description: '',
    skills: [],
  })
  const [newSkill, setNewSkill] = useState('')

  const steps = ['Basic Info', 'Role Details', 'Requirements', 'Perks']

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddSkill = () => {
    if (newSkill.trim() !== '' && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] })
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    })
  }

  const validateStep = (currentStep) => {
    const newErrors = {}
    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required'
      if (!formData.location.trim()) newErrors.location = 'Location is required'
    }
    if (currentStep === 3) {
      if (!formData.description.trim()) newErrors.description = 'Description is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep(step)) return
    setStep(step + 1)
  }

  const handlePrevious = () => {
    setStep(Math.max(1, step - 1))
  }

  const submitOffer = async (status) => {
    if (!validateStep(1) || !validateStep(3)) {
      alert('Please fill in the offer title, location, and description before submitting.')
      return
    }

    const user = JSON.parse(localStorage.getItem('user'))
    setSubmitting(true)

    try {
      const companyRes = await API.get(`/users/${user.id}/company`)
      const company_id = companyRes.data.id

      await API.post('/internships', {
        company_id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        duration: formData.duration || 'Not specified',
        salary: formData.salary || 'To be discussed',
        employment_type: employmentType,
        skills_required: formData.skills.join(', '),
        difficulty: formData.difficulty,
        status,
      })

      alert(status === 'draft' ? 'Offer saved as draft!' : 'Offer published successfully!')
      navigate('/company/dashboard')
    } catch (err) {
      console.error(err)
      alert('Error saving offer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const filledCount = [
    formData.title,
    formData.location,
    formData.duration,
    formData.salary,
    formData.description,
    formData.skills.length > 0 ? 'x' : '',
  ].filter((v) => v && v.length > 0).length

  return (
    <div className="flex min-h-screen relative overflow-hidden"
      style={{ background: '#eef0fb' }}>

      {/* Top right blue glow */}
      <div className="absolute top-0 right-0 pointer-events-none"
        style={{ width: '800px', height: '700px', background: 'radial-gradient(ellipse at top right, rgba(147,160,255,0.65), transparent 60%)', zIndex: 0 }}></div>

      {/* Bottom left pink glow */}
      <div className="absolute bottom-0 pointer-events-none"
        style={{ left: '224px', width: '800px', height: '600px', background: 'radial-gradient(ellipse at bottom left, rgba(255,150,190,0.5), transparent 60%)', zIndex: 0 }}></div>

      <CompanySidebar />

      <div className="flex-1 p-8 relative z-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Offer</h1>
          <p className="text-gray-400 text-sm mt-1">
            Post a new internship opportunity and find the perfect match for your team.
          </p>
        </div>

        <div className="flex gap-6">

          {/* Form */}
          <div className="flex-1">

            {/* Steps */}
            <div className="flex items-center gap-2 mb-8">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => (i + 1 < step ? setStep(i + 1) : null)}
                    className="flex items-center gap-2"
                    style={{ cursor: i + 1 < step ? 'pointer' : 'default' }}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition
                        ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'text-white' : 'bg-gray-200 text-gray-500'}`}
                      style={step === i + 1 ? { background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' } : {}}
                    >
                      {step > i + 1 ? '✓' : i + 1}
                    </div>
                    <span className={`text-sm font-medium ${step === i + 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                      {s}
                    </span>
                  </button>
                  {i < steps.length - 1 && (
                    <div className="w-12 h-px bg-gray-200 mx-1"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Form card */}
            <div className="bg-white rounded-2xl border border-white shadow-sm p-6">

              {/* STEP 1 — Basic Info */}
              {step === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                        Offer Title
                      </label>
                      <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Senior Frontend Intern"
                        className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50
                          ${errors.title ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                        Location
                      </label>
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Tunis, Tunisia (or Remote)"
                        className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50
                          ${errors.location ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                      Internal Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50"
                    >
                      <option>Engineering</option>
                      <option>Design</option>
                      <option>Data & Analytics</option>
                      <option>Marketing</option>
                      <option>Finance</option>
                    </select>
                  </div>
                </>
              )}

              {/* STEP 2 — Role Details */}
              {step === 2 && (
                <>
                  <div className="mb-4">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                      Employment Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Full-time', 'Part-time', 'Contract'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setEmploymentType(type)}
                          className={`border rounded-xl py-3 text-sm font-medium transition bg-white
                            ${employmentType === type
                              ? 'border-pink-400 text-pink-500'
                              : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                        Duration
                      </label>
                      <input
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="e.g. 3 Months, 6 Months"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                        Salary
                      </label>
                      <input
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        placeholder="e.g. 800 TND/month"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Easy', 'Medium', 'Hard'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData({ ...formData, difficulty: level })}
                          className={`border rounded-xl py-3 text-sm font-medium transition bg-white
                            ${formData.difficulty === level
                              ? 'border-indigo-400 text-indigo-600'
                              : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* STEP 3 — Requirements */}
              {step === 3 && (
                <>
                  <div className="mb-4">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                      Role Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Describe the daily responsibilities and team culture..."
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 resize-none
                        ${errors.description ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
                      Key Skills (Tags)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.skills.map((skill, i) => (
                        <span key={i}
                          className="flex items-center gap-1 text-sm px-3 py-1 rounded-full text-white"
                          style={{ background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' }}>
                          {skill}
                          <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-white/70 hover:text-white ml-1 font-bold">×</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a skill..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="text-white text-sm px-4 py-2 rounded-xl transition font-semibold"
                        style={{ background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' }}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* STEP 4 — Perks & Review */}
              {step === 4 && (
                <>
                  <div className="rounded-xl p-4 flex items-start gap-3 mb-4"
                    style={{ background: '#f5f3ff' }}>
                    <span className="text-purple-500 text-lg">✦</span>
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-1">Company Perks Preview</p>
                      <p className="text-xs text-gray-400 mb-3">
                        These perks will be automatically added to the listing based on your company profile.
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full">🏠 Hybrid Policy</span>
                        <span className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full">🍽 Free Lunch</span>
                        <span className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full">💪 Gym Membership</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-4">
                    <p className="text-sm font-bold text-gray-700 mb-3">Review Your Offer</p>
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-400">Title</span><span className="font-semibold text-gray-700">{formData.title || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Location</span><span className="font-semibold text-gray-700">{formData.location || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Type</span><span className="font-semibold text-gray-700">{employmentType}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Duration</span><span className="font-semibold text-gray-700">{formData.duration || 'Not specified'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Salary</span><span className="font-semibold text-gray-700">{formData.salary || 'To be discussed'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Difficulty</span><span className="font-semibold text-gray-700">{formData.difficulty}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Skills</span><span className="font-semibold text-gray-700">{formData.skills.length > 0 ? formData.skills.join(', ') : '—'}</span></div>
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* Bottom actions */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => submitOffer('draft')}
                disabled={submitting}
                className="text-sm text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                Save as Draft
              </button>
              <div className="flex gap-3">
                {step > 1 ? (
                  <button
                    onClick={handlePrevious}
                    className="border border-gray-200 bg-white text-gray-600 text-sm px-4 py-2 rounded-xl hover:bg-gray-50 transition"
                  >
                    ← Previous
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/company/dashboard')}
                    className="border border-gray-200 bg-white text-gray-600 text-sm px-4 py-2 rounded-xl hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => (step < 4 ? handleNext() : submitOffer('active'))}
                  disabled={submitting}
                  className="text-white text-sm font-semibold px-6 py-2 rounded-xl transition disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' }}
                >
                  {step < 4 ? 'Next Step →' : submitting ? 'Publishing...' : '🎉 Publish Offer'}
                </button>
              </div>
            </div>

          </div>

          {/* Right sidebar tips */}
          <div className="w-64 flex flex-col gap-4">

            <div className="bg-white rounded-2xl border border-white shadow-sm p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Offer Strength
              </p>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${(filledCount / 6) * 100}%`,
                    background: 'linear-gradient(90deg, #4F46E5, #8B5CF6)'
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Add a detailed description to increase your offer's visibility by up to 40%.
              </p>
            </div>

            <div className="rounded-2xl p-5 border border-purple-100"
              style={{ background: '#f5f3ff' }}>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">
                💡 Pro Tip
              </p>
              <p className="text-xs text-purple-500 leading-relaxed">
                Listings that specify a salary range get 3x more relevant applicants.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default NewOffer