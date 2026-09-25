import React from 'react';

interface VeloraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

export const VeloraEmblem: React.FC<{ size?: number; className?: string }> = ({
  size = 28,
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Abstract V emblem constructed from two converging flowing forms */}
    <path
      d="M7 6C7 6 12.2 18.2 16 26.5C19.8 18.2 25 6 25 6"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 7C11 7 14.5 15.2 16 19C17.5 15.2 21 7 21 7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.45"
    />
    <circle cx="16" cy="6" r="2" fill="currentColor" />
  </svg>
);

export const VeloraLogo: React.FC<VeloraLogoProps> = ({
  size = 'md',
  showWordmark = true,
  className = ''
}) => {
  const iconSizes = { sm: 20, md: 26, lg: 34 };
  const textSizes = {
    sm: 'text-base font-semibold tracking-wider',
    md: 'text-xl font-bold tracking-[0.2em]',
    lg: 'text-2xl font-bold tracking-[0.2em]'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="text-[#713F5A] dark:text-[#D8C3CF] transition-colors">
        <VeloraEmblem size={iconSizes[size]} />
      </div>
      {showWordmark && (
        <span
          className={`font-serif-display uppercase text-[#211A20] dark:text-[#F4F0E8] ${textSizes[size]}`}
          style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
        >
          VELORA
        </span>
      )}
    </div>
  );
};
