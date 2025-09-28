import React from 'react';

interface SelectProps {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const Select = ({ children, onValueChange, className }: SelectProps) => {
  return (
    <select
      onChange={(e) => onValueChange?.(e.target.value)}
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className || ""}`}
    >
      {children}
    </select>
  );
};

export const SelectTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SelectValue = ({ placeholder }: { placeholder?: string }) => <span className="text-gray-400">{placeholder}</span>;
export const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <option value={value}>{children}</option>
);