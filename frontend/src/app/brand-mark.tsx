export function BrandMark({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="60" height="60" rx="11" fill="currentColor" />
    <path d="m13 19 34-7 9 15-7 22-27 5-13-16Z" fill="#E7E6D6" />
    <path d="m13 19 34-7 9 15-24 8-23-10Z" fill="#70D8C0" />
    <path d="M9 25 32 35 22 54 9 38Z" fill="#E2A46F" />
    <path d="m32 35 24-8-7 22-27 5Z" fill="#B5D672" />
    <path d="M9 25 32 35l24-8M32 35 22 54" stroke="#263B43" strokeWidth="2" />
    <circle cx="33" cy="34" r="4" fill="#D95538" stroke="#263B43" strokeWidth="2" />
  </svg>;
}
