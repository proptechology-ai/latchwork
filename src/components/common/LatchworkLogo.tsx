import React from 'react';

interface LatchworkLogoProps {
  className?: string;
  showText?: boolean;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only';
}

export const LatchworkLogo: React.FC<LatchworkLogoProps> = ({
  className = '',
  showText = true,
  textColor = 'text-slate-900',
  size = 'md',
  variant = 'full',
}) => {
  const sizeMap = {
    sm: { iconWidth: 28, iconHeight: 18, textClass: 'text-base font-black tracking-tight' },
    md: { iconWidth: 36, iconHeight: 22, textClass: 'text-xl font-extrabold tracking-tight' },
    lg: { iconWidth: 46, iconHeight: 28, textClass: 'text-2xl font-extrabold tracking-tight' },
    xl: { iconWidth: 60, iconHeight: 36, textClass: 'text-3xl font-extrabold tracking-tight' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Authentic Latchwork Interlocking Links SVG */}
      <svg
        width={currentSize.iconWidth}
        height={currentSize.iconHeight}
        viewBox="0 0 72 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-2xs"
      >
        <defs>
          <linearGradient id="latchworkGrad1" x1="4" y1="4" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="50%" stopColor="#C2410C" />
            <stop offset="100%" stopColor="#9A3412" />
          </linearGradient>
          <linearGradient id="latchworkGrad2" x1="32" y1="4" x2="68" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="50%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
        </defs>

        {/* Link 1 (Left loop) */}
        <path
          d="M22 6C13.1634 6 6 13.1634 6 22C6 30.8366 13.1634 38 22 38C28.2 38 33.6 34.4 36.2 29.2L30.6 25.8C29 28.8 25.8 30.8 22 30.8C17.1399 30.8 13.2 26.8601 13.2 22C13.2 17.1399 17.1399 13.2 22 13.2C25.8 13.2 29 15.2 30.6 18.2L36.2 14.8C33.6 9.6 28.2 6 22 6Z"
          fill="url(#latchworkGrad1)"
        />

        {/* Link 2 (Right loop intertwined) */}
        <path
          d="M50 6C43.8 6 38.4 9.6 35.8 14.8L41.4 18.2C43 15.2 46.2 13.2 50 13.2C54.8601 13.2 58.8 17.1399 58.8 22C58.8 26.8601 54.8601 30.8 50 30.8C46.2 30.8 43 28.8 41.4 25.8L35.8 29.2C38.4 34.4 43.8 38 50 38C58.8366 38 66 30.8366 66 22C66 13.1634 58.8366 6 50 6Z"
          fill="url(#latchworkGrad2)"
        />

        {/* Interlocking crossover node */}
        <path
          d="M32 17C33.5 15.5 35 14.5 37 14L39 19C37.5 19.5 36.5 20.5 35 22L32 17Z"
          fill="#EA580C"
          opacity="0.95"
        />
        <path
          d="M37 25C35.5 26.5 34 27.5 32 28L30 23C31.5 22.5 32.5 21.5 34 20L37 25Z"
          fill="#C2410C"
          opacity="0.95"
        />
      </svg>

      {/* Brand Text */}
      {showText && variant !== 'icon-only' && (
        <span className={`${currentSize.textClass} ${textColor} font-sans flex items-center`}>
          Latchwork
        </span>
      )}
    </div>
  );
};
