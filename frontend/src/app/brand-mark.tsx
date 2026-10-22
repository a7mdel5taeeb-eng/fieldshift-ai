export function BrandMark({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="58" height="58" rx="17" fill="currentColor" />
    <path d="M14 21.5C22 17.8 31.5 18 50 13.8M14 31.5c10-4.2 20.5-3.4 36-8.7M14 41.6c8.8-3 18.5-2.8 34.5-7.8" stroke="#DCEF9A" strokeWidth="3.4" strokeLinecap="round" />
    <path d="M14 49.5c10.2-2.3 20.3-1.4 34-6.3" stroke="#80D6BA" strokeWidth="3.4" strokeLinecap="round" />
    <path d="M43 18.5v27" stroke="#F4F5E9" strokeWidth="3.2" strokeLinecap="round" />
    <circle cx="43" cy="18" r="5" fill="#F2A86C" stroke="currentColor" strokeWidth="2.5" />
  </svg>;
}
