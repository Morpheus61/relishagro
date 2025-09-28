// src/components/shared/DashboardScreen.tsx
import { useState } from 'react'; // ✅ Remove unused 'React' import
import { Button } from '../ui/button';

interface DashboardScreenProps {
  session: any; // ✅ Declare the prop
}

export function DashboardScreen({ session }: DashboardScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <h1 className="text-2xl font-bold">
        Welcome, {session?.user?.email || session?.user?.id || 'User'}
      </h1>
      <p>Your RelishAgro dashboard is loading...</p>
      <Button className="mt-4">Test Button</Button>
    </div>
  );
}