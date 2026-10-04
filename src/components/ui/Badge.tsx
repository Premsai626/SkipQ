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
  let variantStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotStyle = 'bg-slate-400';

  if (variant === 'success') {
    variantStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotStyle = 'bg-emerald-500';
  } else if (variant === 'warning') {
    variantStyle = 'bg-amber-50 text-amber-800 border-amber-200';
    dotStyle = 'bg-amber-500';
  } else if (variant === 'error') {
    variantStyle = 'bg-rose-50 text-rose-800 border-rose-200';
    dotStyle = 'bg-rose-500';
  } else if (variant === 'info') {
    variantStyle = 'bg-brand-50 text-brand-700 border-brand-200';
    dotStyle = 'bg-brand-500';
  } else if (variant === 'live') {
    variantStyle = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-semibold';
    dotStyle = 'bg-emerald-500 live-indicator-dot';
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
