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

  // Predefined valid credentials for demo
  const validCredentials = [
    // Admin accounts
    { id: 'Admin-Motty', role: 'admin', name: 'Administrator' },
    { id: 'Admin-System', role: 'admin', name: 'System Admin' },
    
    // HarvestFlow Manager accounts  
    { id: 'HarvestFlow-Regu', role: 'harvestflow_manager', name: 'Harvest Manager' },
    { id: 'HarvestFlow-Manager', role: 'harvestflow_manager', name: 'Harvest Manager' },
    
    // FlavorCore Manager accounts
    { id: 'FlavorCore-Raja', role: 'flavorcore_manager', name: 'Flavor Manager' },
    { id: 'FlavorCore-Manager', role: 'flavorcore_manager', name: 'Flavor Manager' },
    
    // Supervisor accounts
    { id: 'HarvestSup-Johnson', role: 'harvest_supervisor', name: 'Harvest Supervisor' },
    { id: 'FlavorSup-George', role: 'flavorcore_supervisor', name: 'FlavorCore Supervisor' },
    
    // Staff accounts
    { id: 'Staff-001', role: 'staff', name: 'Field Worker' },
    { id: 'Staff-002', role: 'staff', name: 'Field Worker' },
    
    // Legacy numeric ID (for backward compatibility)
    { id: '9446012324', role: 'admin', name: 'Legacy Admin' }
  ];

  const handleLogin = async () => {
    if (!staffId.trim()) {
      setError('Please enter your Staff ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check against valid credentials
      const credential = validCredentials.find(cred => cred.id === staffId.trim());
      
      if (credential) {
        console.log(`Login successful: ${credential.name} (${credential.role})`);
        onLogin(credential.id, credential.role);
      } else {
        // Try role detection for new IDs
        let role: string;
        const trimmedId = staffId.trim();
        
        if (trimmedId.startsWith('Admin-')) {
          role = 'admin';
        } else if (trimmedId.startsWith('HarvestFlow-')) {
          role = 'harvestflow_manager';
        } else if (trimmedId.startsWith('FlavorCore-')) {
          role = 'flavorcore_manager';
        } else if (trimmedId.startsWith('HarvestSup-')) {
          role = 'harvest_supervisor';
        } else if (trimmedId.startsWith('FlavorSup-')) {
          role = 'flavorcore_supervisor';
        } else if (trimmedId.startsWith('Staff-')) {
          role = 'staff';
        } else if (/^\d+$/.test(trimmedId)) {
          // Numeric IDs default to staff role
          role = 'staff';
        } else {
          setError('Invalid Staff ID format. Please use the correct format (e.g., Admin-Name)');
          return;
        }

        console.log(`New login detected: ${trimmedId} (${role})`);
        onLogin(trimmedId, role);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-green-800 text-white p-4">
        <div className="flex items-center justify-center">
          <h1 className="text-xl font-bold">🌾 RelishAgro</h1>
        </div>
        <p className="text-center text-sm text-green-100 mt-1">Agricultural Worker Management System</p>
      </div>

      <div className="p-6 space-y-6 max-w-md mx-auto">
        {/* Login Form */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">Staff Login</h2>
            <p className="text-sm text-gray-600">Enter your Staff ID to access the system</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Staff ID</label>
            <Input
              type="text"
              placeholder="Enter your Staff ID (e.g., Admin-Motty)"
              value={staffId}
              onChange={(e) => {
                setStaffId(e.target.value);
                setError(''); // Clear error when user types
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
            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400"
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

        {/* Usage Guide */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
            📋 Valid Staff ID Formats
          </h3>
          <div className="space-y-2 text-xs text-blue-800">
            <div className="grid grid-cols-1 gap-1">
              <div><strong>Administrator:</strong> <code>Admin-Motty</code></div>
              <div><strong>Harvest Manager:</strong> <code>HarvestFlow-Regu</code></div>
              <div><strong>Flavor Manager:</strong> <code>FlavorCore-Raja</code></div>
              <div><strong>Harvest Supervisor:</strong> <code>HarvestSup-Johnson</code></div>
              <div><strong>Flavor Supervisor:</strong> <code>FlavorSup-George</code></div>
              <div><strong>Field Worker:</strong> <code>Staff-001</code></div>
              <div><strong>Legacy:</strong> <code>9446012324</code></div>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            🚀 Demo Credentials
          </h3>
          <div className="text-xs text-yellow-800 space-y-1">
            <p><strong>Quick Login:</strong> Try <code>Admin-Motty</code> for full access</p>
            <p><strong>Manager:</strong> <code>HarvestFlow-Regu</code> or <code>FlavorCore-Raja</code></p>
            <p><strong>Legacy:</strong> <code>9446012324</code> (backward compatibility)</p>
          </div>
        </div>

        {/* System Status */}
        <div className="text-center text-xs text-gray-500">
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>System Online</span>
          </div>
          <p className="mt-1">🛡️ UIDAI Compliant • 🔒 Secure Login</p>
        </div>
      </div>
    </div>
  );
}