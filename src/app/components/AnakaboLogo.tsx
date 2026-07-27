interface AnakaboLogoProps {
  size?: number;
  className?: string;
}

export function AnakaboLogo({ size = 48, className = '' }: AnakaboLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circle */}
      <circle cx="24" cy="24" r="23" fill="#1a1a2e" />
      {/* Navigation arrow pointing up-right */}
      <path
        d="M14 34L22 14L34 22L22 26L14 34Z"
        fill="white"
        fillOpacity="0.15"
      />
      <path
        d="M15 33L23 15L35 23L23 27L15 33Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Inner dot at origin */}
      <circle cx="23" cy="27" r="2" fill="#60a5fa" />
      {/* Accent arc */}
      <path
        d="M10 38 Q24 8 38 38"
        stroke="#3b82f6"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}

export function AnakaboLogoFull({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <AnakaboLogo size={44} />
      <div className="flex flex-col leading-none">
        <span className="text-2xl font-bold tracking-wider text-gray-900" style={{ letterSpacing: '0.12em' }}>
          ANAKABO
        </span>
        <span className="text-xs text-blue-500 font-medium tracking-widest uppercase">Navigation</span>
      </div>
    </div>
  );
}
