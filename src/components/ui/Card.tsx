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
    solid: 'glass-card-dark rounded-2xl',
    glass: 'glass-card-dark rounded-2xl backdrop-blur-2xl',
    interactive:
      'glass-card-dark rounded-2xl hover:border-white/25 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer',
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
