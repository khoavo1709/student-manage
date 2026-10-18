// Con cu nup trong bong toi, chi lo ra khi den pin roi toi.
export function Owl({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 56" className={className} aria-hidden="true">
      {/* Canh cay */}
      <rect x="2" y="50" width="44" height="4" rx="2" fill="#6b4f3a" />
      {/* Than */}
      <ellipse cx="24" cy="32" rx="15" ry="18" fill="#8a7158" />
      <ellipse cx="24" cy="37" rx="9" ry="12" fill="#c8b597" />
      {/* Tai */}
      <polygon points="11,18 14,6 19,15" fill="#8a7158" />
      <polygon points="37,18 34,6 29,15" fill="#8a7158" />
      {/* Mat */}
      <circle cx="18" cy="24" r="6.5" fill="#f8f1dc" />
      <circle cx="30" cy="24" r="6.5" fill="#f8f1dc" />
      <circle cx="18" cy="24" r="3.6" fill="#f59e0b" />
      <circle cx="30" cy="24" r="3.6" fill="#f59e0b" />
      <circle cx="18" cy="24" r="1.8" fill="#1c1917" />
      <circle cx="30" cy="24" r="1.8" fill="#1c1917" />
      <circle cx="18.8" cy="23" r="0.7" fill="#fff" />
      <circle cx="30.8" cy="23" r="0.7" fill="#fff" />
      {/* Mo */}
      <polygon points="22,29 26,29 24,33" fill="#f59e0b" />
      {/* Long nguc */}
      <path d="M20 38 q2 2 4 0 q2 2 4 0 M20 43 q2 2 4 0 q2 2 4 0" stroke="#a8916f" strokeWidth="1" fill="none" />
      {/* Chan */}
      <path d="M19 50 v-2 M21 50 v-2 M27 50 v-2 M29 50 v-2" stroke="#f59e0b" strokeWidth="1.4" />
    </svg>
  );
}
