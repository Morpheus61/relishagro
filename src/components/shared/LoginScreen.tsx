import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { supabase } from '../../lib/supabase';
import flavorCoreLogo from '../../assets/flavorcore-logo.png';

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
      const { data: user, error: dbError } = await supabase
        .from('person_records')
        .select('*')
        .eq('staff_id', staffId.trim())
        .single();

      if (dbError || !user) {
        setError('Invalid Staff ID');
        console.error('Database error:', dbError);
        return;
      }

      if (user.status !== 'active') {
        setError('Account is not active');
        return;
      }

      // ✅ FIXED: Determine role from staff_id prefix AND database
      let role = user.person_type || 'staff';
      
      // Override with staff_id prefix logic for proper routing
      if (staffId.startsWith('Admin-')) {
        role = 'admin';
      } else if (staffId.startsWith('HarvestFlow-')) {
        role = 'harvestflow_manager';
      } else if (staffId.startsWith('FlavorCore-')) {
        if (staffId.includes('Supervisor')) {
          role = 'supervisor';
        } else {
          role = 'flavorcore_manager';
        }
      } else if (staffId.startsWith('Harvest-')) {
        role = 'harvesting';
      }

      const displayName = user.full_name || staffId.trim();

      console.log('✅ LoginScreen passing to App:', { 
        displayName, 
        role,
        staffId: staffId.trim() 
      });
      
      // Pass the readable name and determined role
      onLogin(displayName, role);
      
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
        <div className="text-center mb-6">
          <img 
            src={flavorCoreLogo}
            alt="FlavorCore" 
            className="-38 h-38 mx-auto mb-3 object-contain"
          />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Relish Agro</h2>
          <p className="text-sm text-gray-600">Agricultural Management System</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Staff ID</label>
            <Input
              type="text"
              placeholder="Enter your Staff ID"
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

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Secure Access • Contact Admin for Staff ID
          </p>
        </div>
      </div>
    </div>
  );
}