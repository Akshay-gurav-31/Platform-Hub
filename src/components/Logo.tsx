import logo from "@/assets/trinetra-logo.png";

export function Logo({ className = "h-10" }: { className?: string }) {
  return <img src={logo} alt="Trinetra Technologies" className={className} />;
}

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 64 64" className="h-full w-full">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.7 0.22 250)" />
            <stop offset="100%" stopColor="oklch(0.5 0.25 270)" />
          </linearGradient>
        </defs>
        <path d="M32 4 L60 32 L32 60 L4 32 Z" fill="none" stroke="url(#lg)" strokeWidth="2.5" />
        <ellipse cx="32" cy="32" rx="14" ry="9" fill="none" stroke="url(#lg)" strokeWidth="2.5" />
        <circle cx="32" cy="32" r="5" fill="url(#lg)" />
        <circle cx="32" cy="32" r="2" fill="white" />
      </svg>
    </div>
  );
}
