function CandidateProfileModal({ candidate, onClose, onStatusChange, updatingStatus }) {
  if (!candidate) return null

  const skillsList = candidate.skills
    ? candidate.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted': return 'bg-green-100 text-green-600'
      case 'interviewing': return 'bg-blue-100 text-blue-600'
      case 'accepted': return 'bg-purple-100 text-purple-600'
      case 'rejected': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)' }}>
              {candidate.full_name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="font-bold text-gray-900">{candidate.full_name}</p>
              <p className="text-xs text-gray-400">{candidate.email}</p>
              {candidate.university && (
                <p className="text-xs text-gray-400 mt-0.5">🎓 {candidate.university}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">

          <div className="flex gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Match Score</p>
              <p className="text-2xl font-bold" style={{ color: '#8B5CF6' }}>{candidate.match_score}%</p>
            </div>
            {candidate.location && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Location</p>
                <p className="text-sm text-gray-700 mt-1.5">{candidate.location}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Applied</p>
              <p className="text-sm text-gray-700 mt-1.5">
                {new Date(candidate.applied_at).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>

          {/* Bio */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">About</p>
            {candidate.bio ? (
              <p className="text-sm text-gray-600 leading-relaxed">{candidate.bio}</p>
            ) : (
              <p className="text-sm text-gray-300 italic">This student hasn't added a bio yet.</p>
            )}
          </div>

          {/* Skills */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Skills</p>
            {skillsList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-300 italic">No skills listed.</p>
            )}
          </div>

          {/* CV */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Resume / CV</p>
            {candidate.cv_url ? (
              <a
                href={`http://localhost:5000${candidate.cv_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                style={{ color: '#4F46E5' }}
              >
                📄 View CV
              </a>
            ) : (
              <p className="text-sm text-gray-300 italic">No CV uploaded.</p>
            )}
          </div>

          {/* Status control */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Application Status</p>
            <select
              value={candidate.status || 'pending'}
              onChange={(e) => onStatusChange(candidate.id, e.target.value)}
              disabled={updatingStatus}
              className={`text-sm font-semibold px-3 py-2 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer disabled:opacity-50 ${getStatusColor(candidate.status)}`}
            >
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interviewing">Interviewing</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {candidate.status === 'accepted' && (
            <a
              href={`mailto:${candidate.email}?subject=${encodeURIComponent('Welcome aboard!')}`}
              className="text-sm font-semibold hover:underline text-center"
              style={{ color: '#8B5CF6' }}
            >
              📧 Contact {candidate.full_name?.split(' ')[0]}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default CandidateProfileModal