import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'solid' | 'glass' | 'interactive';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'solid',
  className = '',
  ...props
}) => {
  const variantStyles = {
    solid: 'bg-[#111827] border border-[#273244] rounded-2xl shadow-lg',
    glass: 'bg-[#111827]/85 backdrop-blur-xl border border-[#273244] rounded-2xl shadow-xl',
    interactive:
      'bg-[#111827] border border-[#273244] rounded-2xl hover:border-[#00D4FF]/50 hover:bg-[#1A2232] hover:shadow-[0_4px_24px_rgba(0,212,255,0.08)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer',
  };

  return (
    <div
      className={`p-5 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
