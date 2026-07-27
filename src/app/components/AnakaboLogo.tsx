interface AnakaboLogoProps {
  size?: number;
  className?: string;
}

export function AnakaboLogo({ size = 48, className = '' }: AnakaboLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Pin body */}
      <path
        d="M28 4C19.163 4 12 11.163 12 20C12 30.5 28 52 28 52C28 52 44 30.5 44 20C44 11.163 36.837 4 28 4Z"
        fill="#2563EB"
      />
      {/* Pin highlight */}
      <path
        d="M28 4C19.163 4 12 11.163 12 20C12 24 13.5 28.5 16 33C18 28 20 22 28 18C36 22 38 28 40 33C42.5 28.5 44 24 44 20C44 11.163 36.837 4 28 4Z"
        fill="#3B82F6"
      />
      {/* Inner circle white */}
      <circle cx="28" cy="20" r="8" fill="white" />
      {/* Navigation arrow inside */}
      <path
        d="M28 14L32 24L28 22L24 24L28 14Z"
        fill="#2563EB"
      />
    </svg>
  );
}

export function AnakaboLogoFull({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <AnakaboLogo size={38} />
      <div className="flex flex-col leading-none">
        <span className="text-xl font-extrabold tracking-widest text-gray-900" style={{ letterSpacing: '0.15em' }}>
          ANAKABO
        </span>
        <span className="text-[10px] text-blue-500 font-semibold tracking-widest uppercase">Navigation</span>
      </div>
    </div>
  );
}
