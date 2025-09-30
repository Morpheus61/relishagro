// src/components/shared/LoginScreen.tsx
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface LoginScreenProps {
  onLogin: (userId: string, role: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [staffId, setStaffId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!staffId.trim()) {
      setError('Please enter your Staff ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // ✅ Connect to Supabase for real authentication
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ staff_id: staffId.trim() })
});

      const data = await response.json();

      if (response.ok && data.authenticated) {
        onLogin(data.user.id, data.user.role);
      } else {
        setError(data.error || 'Invalid Staff ID or network error');
      }
    } catch (err) {
      setError('Login failed. Please check your connection.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Logo */}
        <div className="text-center mb-6">
  <img 
    src="/flavorcore-logo.png" 
    alt="FlavorCore" 
    className="w-12 h-12 mx-auto mb-2"
  />
  <h1 className="text-2xl font-bold text-purple-800">FlavorCore</h1>
</div>
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Relish Agro</h2>
          <p className="text-sm text-gray-600">Agricultural Management System</p>
        </div>

        {/* Login Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Staff ID</label>
            <Input
              type="text"
              placeholder="Enter your ID"
              value={staffId}
              onChange={(e) => {
                setStaffId(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              className={`w-full ${error ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {error && (
              <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
          </div>
          
          <Button 
            onClick={handleLogin}
            disabled={!staffId.trim() || isLoading}
            className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-gray-400"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </div>
            ) : (
              'Login'
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Powered by RelishAgro • Version 1.0
          </p>
        </div>
      </div>
    </div>
  );
}