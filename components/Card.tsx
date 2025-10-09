import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`rounded-2xl border-2 border-blue-200 bg-white/80 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-shadow ${className}`}>
      {children}
    </div>
  );
};

export default Card;
