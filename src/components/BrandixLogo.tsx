import React from 'react';

interface BrandixLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'horizontal' | 'icon';
  theme?: 'light' | 'dark';
  showTagline?: boolean;
  onClick?: () => void;
  useImage?: boolean;
}

export default function BrandixLogo({
  className = '',
  size = 'md',
  theme = 'light',
  onClick,
  useImage = true
}: BrandixLogoProps) {
  const isDark = theme === 'dark';

  // Sizing container for the actual uploaded image
  const containerSizes = {
    sm: 'h-10 md:h-12',
    md: 'h-14 md:h-18 lg:h-20',
    lg: 'h-20 md:h-24 lg:h-28',
    xl: 'h-28 md:h-36 lg:h-44',
  };

  const selectedSizeClass = containerSizes[size] || containerSizes.md;

  return (
    <div 
      className={`inline-flex items-center cursor-pointer select-none transition-all duration-200 ${className}`}
      onClick={onClick}
    >
      <img 
        src="/brandix-logo.jpg" 
        alt="Brandix - Platform • Intelligence • Impact" 
        className={`${selectedSizeClass} w-auto object-contain ${
          isDark 
            ? 'bg-white p-1.5 rounded-xl shadow-md border border-white/20 hover:brightness-105' 
            : 'mix-blend-multiply hover:opacity-95'
        }`}
      />
    </div>
  );
}
