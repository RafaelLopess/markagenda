interface LogoProps {
  className?: string;
}

const Logo = ({ className = 'w-5 h-5' }: LogoProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="4.5" width="18" height="16" rx="3.5" fill="currentColor" opacity="0.15" />
    <rect x="3" y="4.5" width="18" height="16" rx="3.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 9.5h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M8 3v3M16 3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path
      d="M8.5 14.5l2.4 2.4 4.6-4.6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Logo;
