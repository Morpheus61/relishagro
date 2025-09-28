// src/components/ui/card.tsx
import React from 'react';

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`rounded-lg border bg-white shadow ${className || ''}`}>
      {children}
    </div>
  );
};