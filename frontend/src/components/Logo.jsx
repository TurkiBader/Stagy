function Logo({ size = 'md', dark = false }) {
  const sizes = {
    sm: { width: 52, height: 36, text: 15 },
    md: { width: 70, height: 48, text: 20 },
    lg: { width: 100, height: 68, text: 28 },
  }

  const s = sizes[size]

  return (
    <div className="flex items-center gap-1.5">
      <svg
        width={s.width}
        height={s.height}
        viewBox="0 0 105 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="pGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>

        {/* Left puzzle piece — Student */}
        <path
          d="M4,14 L44,14 L44,30
             C44,30 52,25 52,33
             C52,41 44,36 44,36
             L44,58 L4,58
             L4,42
             C4,42 -4,47 -4,39
             C-4,31 4,36 4,36 Z"
          fill="url(#pGrad1)"
        />

        {/* Graduation cap on left piece */}
        <rect x="12" y="30" width="22" height="3" rx="1.5" fill="white" opacity="0.95"/>
        <polygon points="23,23 34,30 23,37 12,30" fill="white" opacity="0.95"/>
        <line x1="34" y1="30" x2="34" y2="37" stroke="white" strokeWidth="1.8" opacity="0.9"/>
        <circle cx="34" cy="38" r="2" fill="white" opacity="0.9"/>

        {/* Right puzzle piece — Company */}
        <path
          d="M52,14 L92,14 L92,36
             C92,36 100,31 100,39
             C100,47 92,42 92,42
             L92,58 L52,58
             L52,36
             C52,36 44,41 44,33
             C44,25 52,30 52,30 Z"
          fill="url(#pGrad2)"
        />

        {/* Building on right piece */}
        <rect x="56" y="22" width="30" height="26" rx="1.5" fill="white" opacity="0.12"/>
        <rect x="59" y="25" width="7" height="7" rx="1" fill="white" opacity="0.85"/>
        <rect x="69" y="25" width="7" height="7" rx="1" fill="white" opacity="0.85"/>
        <rect x="59" y="35" width="7" height="7" rx="1" fill="white" opacity="0.85"/>
        <rect x="69" y="35" width="7" height="7" rx="1" fill="white" opacity="0.85"/>
        <rect x="63" y="44" width="9" height="10" rx="1" fill="white" opacity="0.85"/>

        {/* Glow at connection point */}
        <ellipse cx="48" cy="36" rx="5" ry="14" fill="white" opacity="0.1"/>
      </svg>

      {/* Wordmark */}
      <span
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: s.text,
          fontWeight: '700',
          color: dark ? 'white' : '#4F46E5',
          letterSpacing: '-0.5px',
          lineHeight: 1,
        }}
      >
        Stagy
      </span>
    </div>
  )
}

export default Logo