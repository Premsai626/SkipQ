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

  // Generic variant badges using official palette
  let variantStyle = 'bg-[#1A2232] text-[#9CA3AF] border-[#273244]';
  let dotStyle = 'bg-[#9CA3AF]';

  if (variant === 'success') {
    variantStyle = 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30';
    dotStyle = 'bg-[#34D399]';
  } else if (variant === 'warning') {
    variantStyle = 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30';
    dotStyle = 'bg-[#FBBF24]';
  } else if (variant === 'error') {
    variantStyle = 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/30';
    dotStyle = 'bg-[#FB7185]';
  } else if (variant === 'info') {
    variantStyle = 'bg-[#00D4FF]/15 text-[#00D4FF] border-[#00D4FF]/30';
    dotStyle = 'bg-[#00D4FF]';
  } else if (variant === 'live') {
    variantStyle = 'bg-[#00D4FF]/15 text-[#00D4FF] border-[#00D4FF]/40 font-bold';
    dotStyle = 'bg-[#00D4FF] live-indicator-dot';
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
export default Badge;
