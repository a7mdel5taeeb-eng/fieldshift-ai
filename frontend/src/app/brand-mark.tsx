export function BrandMark({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="60" height="60" rx="18" fill="currentColor" />
    <path d="M12 42c10-12 29-14 40-8M12 49c12-9 28-9 40-4M19 33c8-10 19-14 30-12" stroke="#B8EC82" strokeWidth="3" strokeLinecap="round" />
    <path d="M19 24a18 18 0 0 1 27-9" stroke="#75CBA7" strokeWidth="2" strokeLinecap="round" />
    <circle cx="47" cy="18" r="4" fill="#F5C46E" />
  </svg>;
}
