// src/components/shared/LoginScreen.tsx
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [manualId, setManualId] = useState('');

  const handleLogin = () => {
    if (manualId.trim()) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        
        {/* === LOGO SECTION === */}
        <div className="text-center mb-8">
          <img 
            src="/src/assets/flavorcore-logo.png" 
            alt="FlavorCore Logo" 
            className="h-20 mx-auto mb-4 object-contain"
            onError={(e) => {
              console.warn("Logo failed to load");
              e.currentTarget.src = "https://via.placeholder.com/150?text=FlavorCore";
            }}
          />
          <h1 className="text-2xl font-bold text-gray-800">FlavorCore</h1>
          <p className="text-gray-600 mt-1">Agricultural Management System</p>
        </div>

        {/* === LOGIN FORM === */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID</label>
            <Input
              value={manualId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualId(e.target.value)}
              placeholder="Enter your ID"
              className="w-full"
            />
          </div>

          <Button 
            onClick={handleLogin} 
            disabled={!manualId.trim()}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 text-lg"
          >
            Login
          </Button>
        </div>

        {/* === FOOTER === */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>Powered by RelishAgro • Version 1.0</p>
        </div>
      </div>
    </div>
  );
}