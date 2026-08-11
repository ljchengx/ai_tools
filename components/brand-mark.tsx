interface BrandMarkProps {
  className?: string;
  size?: number;
}

export function BrandMark({ className, size = 32 }: BrandMarkProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="60" height="60" rx="15" fill="#405A50" />
      <path d="M18 13H36L46 23V51H18V13Z" fill="#F8F9FA" />
      <path d="M36 13V23H46" fill="#D9E3DE" />
      <path d="M25 29H39L25 43H39" stroke="#647B72" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="25" cy="29" r="2.5" fill="#405A50" />
      <circle cx="39" cy="29" r="2.5" fill="#405A50" />
      <circle cx="25" cy="43" r="2.5" fill="#405A50" />
      <circle cx="39" cy="43" r="2.5" fill="#405A50" />
    </svg>
  );
}
