type EmblemProps = {
  className?: string;
  mono?: boolean;
};

export function Emblem({ className = "", mono = false }: EmblemProps) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className={className}>
      <path d="M44 3 12 25C5 30 2 36 2 45v43l14-5V45c0-5 2-8 6-11l22-15V3ZM52 3l32 22c7 5 10 11 10 20v43l-14-5V45c0-5-2-8-6-11L52 19V3Z" fill="currentColor" />
      <path d="M19 43h10c4 0 7 2 9 6l10 25 10-25c2-4 5-6 9-6h10L55 96H41L19 43Z" fill="currentColor" />
      <circle cx="48" cy="42" r="7.5" fill={mono ? "currentColor" : "#C77B53"} />
    </svg>
  );
}

export function Brand({ className = "" }: { className?: string }) {
  return (
    <span className={`brand ${className}`}>
      <Emblem className="brand-emblem" />
      <span className="brand-wordmark">VIHAR</span>
    </span>
  );
}
