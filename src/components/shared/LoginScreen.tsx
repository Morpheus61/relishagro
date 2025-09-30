// src/components/shared/LoginScreen.tsx
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface LoginScreenProps {
  onLogin: (userId: string, role: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [staffId, setStaffId] = useState('');

  const handleLogin = () => {
    if (!staffId.trim()) return;

    // Simulate login with Staff ID
    let role: string;
    if (staffId.startsWith('Admin-')) {
      role = 'admin';
    } else if (staffId.startsWith('HarvestFlow-')) {
      role = 'harvestflow_manager';
    } else if (staffId.startsWith('FlavorCore-')) {
      role = 'flavorcore_manager';
    } else if (staffId.startsWith('HarvestSup-')) {
      role = 'harvest_supervisor';
    } else if (staffId.startsWith('FlavorSup-')) {
      role = 'flavorcore_supervisor';
    } else if (staffId.startsWith('Staff-')) {
      role = 'staff';
    } else {
      alert('Invalid Staff ID format');
      return;
    }

    onLogin(staffId, role);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-purple-900 text-white p-4">
        <h1 className="text-xl text-center">RelishAgro</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Login Form */}
        <div className="space-y-4">
          <h2 className="text-lg mb-4">Login</h2>
          <div>
            <label className="block text-sm mb-1">Staff ID</label>
            <Input
              placeholder="Enter your ID (e.g. Admin-Motty)"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <Button 
            onClick={handleLogin}
            disabled={!staffId}
            className="w-full bg-purple-700 hover:bg-purple-800"
          >
            Login
          </Button>
        </div>

        {/* Usage Guide */}
        <div className="bg-blue-50 border-blue-200 p-4 rounded-md">
          <h3 className="text-sm font-medium mb-2">Login ID Format</h3>
          <ul className="text-xs space-y-1 text-blue-700">
            <li><strong>Admin:</strong> Admin-Motty</li>
            <li><strong>HarvestFlow Manager:</strong> HarvestFlow-Regu</li>
            <li><strong>FlavorCore Manager:</strong> FlavorCore-Raja</li>
            <li><strong>Harvest Supervisor:</strong> HarvestSup-Johnson</li>
            <li><strong>FlavorCore Supervisor:</strong> FlavorSup-George</li>
            <li><strong>Worker:</strong> Staff-001</li>
          </ul>
        </div>
      </div>
    </div>
  );
}