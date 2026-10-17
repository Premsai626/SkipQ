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
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080B12] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-bold',
  };

  const variantStyles = {
    primary:
      'bg-[#00D4FF] text-black hover:bg-[#00b8e6] focus:ring-[#00D4FF] shadow-lg shadow-[#00D4FF]/25 font-black',
    secondary:
      'bg-[#1A2232] text-[#F9FAFB] hover:bg-[#202B3D] border border-[#273244] focus:ring-[#00D4FF]/40 backdrop-blur-md',
    outline:
      'border border-[#273244] bg-[#111827]/80 text-[#F9FAFB] hover:bg-[#1A2232] hover:border-[#00D4FF]/50 focus:ring-[#00D4FF] shadow-sm backdrop-blur-md',
    danger:
      'bg-[#FB7185]/15 border border-[#FB7185]/40 text-[#FB7185] hover:bg-[#FB7185]/25 focus:ring-[#FB7185] shadow-sm',
    ghost:
      'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#202B3D] focus:ring-[#00D4FF]/30',
    success:
      'bg-[#34D399] text-black font-black hover:bg-[#2ecc8f] focus:ring-[#34D399] shadow-lg shadow-[#34D399]/25',
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
export default Button;
