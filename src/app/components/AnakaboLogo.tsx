import logoSrc from "@/imports/image-6.png";

interface AnakaboLogoProps {
  size?: number;
  className?: string;
}

export function AnakaboLogo({ size = 48, className = '' }: AnakaboLogoProps) {
  return (
    <img
      src={logoSrc}
      alt="Anakabo"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}

export function AnakaboLogoFull({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  const imgSize = compact ? 36 : 48;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={logoSrc}
        alt="Anakabo"
        width={imgSize}
        height={imgSize}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}
