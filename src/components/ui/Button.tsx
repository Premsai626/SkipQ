import React from 'react';
import { Loader2 } from 'lucide-react';
import { soundFX } from '../../utils/sound';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      soundFX.playTap();
      onClick?.(e);
    }
  };

  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#09090b] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-bold',
  };

  const variantStyles = {
    primary:
      'bg-[#CCFF00] text-black hover:bg-[#b8e600] focus:ring-[#CCFF00] shadow-lg shadow-[#CCFF00]/20 font-black',
    secondary:
      'bg-white/10 text-white hover:bg-white/15 border border-white/10 focus:ring-white/30 backdrop-blur-md',
    outline:
      'border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 focus:ring-[#CCFF00] shadow-sm backdrop-blur-md',
    danger:
      'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 focus:ring-rose-500 shadow-sm',
    ghost:
      'text-white/70 hover:text-white hover:bg-white/10 focus:ring-white/20',
    success:
      'bg-emerald-500 text-black font-black hover:bg-emerald-400 focus:ring-emerald-500 shadow-lg shadow-emerald-500/20',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
