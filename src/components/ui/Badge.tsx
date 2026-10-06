import React from 'react';
import { OrderStatus } from '../../types';
import { getStatusStyle } from '../../utils/formatting';

interface BadgeProps {
  status?: OrderStatus;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'live';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  label,
  variant,
  size = 'md',
  className = '',
  showDot = true,
}) => {
  if (status) {
    const style = getStatusStyle(status);
    const sizeClasses =
      size === 'sm'
        ? 'text-xs px-2 py-0.5'
        : size === 'lg'
        ? 'text-sm px-3 py-1 font-semibold'
        : 'text-xs px-2.5 py-1 font-medium';

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses} ${className}`}
      >
        {showDot && (
          <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`} />
        )}
        <span>{style.label}</span>
      </span>
    );
  }

  // Generic variant badges
  let variantStyle = 'bg-white/5 text-white/70 border-white/10';
  let dotStyle = 'bg-white/40';

  if (variant === 'success') {
    variantStyle = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    dotStyle = 'bg-emerald-400';
  } else if (variant === 'warning') {
    variantStyle = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    dotStyle = 'bg-amber-400';
  } else if (variant === 'error') {
    variantStyle = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    dotStyle = 'bg-rose-400';
  } else if (variant === 'info') {
    variantStyle = 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/30';
    dotStyle = 'bg-[#00F0FF]';
  } else if (variant === 'live') {
    variantStyle = 'bg-[#CCFF00]/15 text-[#CCFF00] border-[#CCFF00]/40 font-bold';
    dotStyle = 'bg-[#CCFF00] live-indicator-dot';
  }

  const sizeClasses =
    size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3 py-1 font-semibold' : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyle} ${sizeClasses} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />}
      <span>{label}</span>
    </span>
  );
};
