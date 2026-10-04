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
    solid: 'bg-white border border-slate-200/80 shadow-card',
    glass: 'glass-card shadow-card',
    interactive:
      'bg-white border border-slate-200/80 shadow-card hover:shadow-floating hover:border-brand-200 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
  };

  return (
    <div
      className={`rounded-2xl p-5 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
