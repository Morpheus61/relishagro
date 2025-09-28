// src/components/ui/badge.tsx
import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'outline';
  className?: string;
  children: React.ReactNode;
}

export const Badge = ({ variant = 'default', className, children }: BadgeProps) => {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold';
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700'
  };
  return <div className={`${base} ${variants[variant]} ${className}`}>{children}</div>;
};