/**
 * Stand-in for the uploaded survey photograph.
 * Real images arrive from the DMS; until then this keeps the viewer,
 * the overlays and the thumbnail strip laid out exactly as they will be.
 */
export default function SurveyPhoto({ className = '' }) {
    return (
        <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
            <defs>
                <linearGradient id="survey-bg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="survey-body" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
            </defs>

            <rect width="320" height="200" fill="url(#survey-bg)" />
            <ellipse cx="160" cy="182" rx="120" ry="12" fill="#000" opacity="0.35" />

            {/* windscreen + roof */}
            <path d="M92 82c8-26 18-38 68-38s60 12 68 38Z" fill="#94a3b8" opacity="0.55" />
            {/* body */}
            <path
                d="M62 96c4-14 14-20 30-22h136c16 2 26 8 30 22l6 34c1 8-4 14-12 14H68c-8 0-13-6-12-14Z"
                fill="url(#survey-body)"
            />
            {/* grille */}
            <rect x="118" y="118" width="84" height="18" rx="6" fill="#1e293b" opacity="0.8" />
            {/* head lamps */}
            <path d="M70 104h34l6 12H72Z" fill="#f8fafc" opacity="0.9" />
            <path d="M250 104h-34l-6 12h34Z" fill="#f8fafc" opacity="0.9" />
            {/* bumper */}
            <rect x="62" y="140" width="196" height="16" rx="6" fill="#475569" />
            {/* wheels */}
            <rect x="70" y="152" width="30" height="20" rx="8" fill="#0f172a" />
            <rect x="220" y="152" width="30" height="20" rx="8" fill="#0f172a" />
        </svg>
    );
}
