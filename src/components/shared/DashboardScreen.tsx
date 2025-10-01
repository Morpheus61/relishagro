import { Button } from '../ui/button';
import { useState } from 'react';

interface DashboardScreenProps {
  userId: string;
  userRole: string;
  onLogout: () => void;
}

export function DashboardScreen({ userId, userRole, onLogout }: DashboardScreenProps) {
  const [currentView, setCurrentView] = useState('dashboard');

  // ✅ WORKING BUTTON HANDLERS
  const handleWorkerManagement = () => {
    setCurrentView('worker-management');
    alert('🔧 Worker Management - Feature coming soon!\n\nThis will open:\n• Worker registration\n• Biometric enrollment\n• Staff directory');
  };

  const handleFieldOperations = () => {
    setCurrentView('field-operations');
    alert('🌾 Field Operations - Feature coming soon!\n\nThis will show:\n• Daily harvest tracking\n• Field assignments\n• Activity logs');
  };

  const handleProcessingStatus = () => {
    setCurrentView('processing-status');
    alert('⚙️ FlavorCore Processing - Feature coming soon!\n\nThis will display:\n• Processing queue\n• Quality control\n• Batch tracking');
  };

  const handleCreateUsers = () => {
    alert('👤 Create New Users - Admin Feature\n\nThis will open user creation form with:\n• Staff ID generation\n• Role assignment\n• Department selection');
  };

  const handleSystemSettings = () => {
    alert('⚙️ System Settings - Admin Feature\n\nThis will provide:\n• System configuration\n• Security settings\n• Database management');
  };

  const handleComplianceReports = () => {
    alert('📊 Compliance Reports - Admin Feature\n\nThis will generate:\n• UIDAI compliance reports\n• Audit trail summaries\n• Security assessments');
  };

  const handleAuditTrail = () => {
    alert('📋 Audit Trail - Admin Feature\n\nThis will show:\n• User activity logs\n• System access records\n• Security events');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* ✅ FIXED HEADER WITH VISIBLE LOGOUT */}
      <div className="bg-gradient-to-r from-purple-800 to-blue-800 text-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🌟 FlavorCore Dashboard</h1>
            <p className="text-purple-100">Agricultural Management System</p>
          </div>
          <Button 
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg shadow-lg border-2 border-red-500"
          >
            🚪 Logout
          </Button>
        </div>
      </div>

      {/* ✅ FIXED WELCOME WITH CORRECT NAME */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome, {userId}
        </h2>
        <p className="text-gray-600">
          Role: <span className="font-semibold text-purple-700 capitalize">{userRole}</span>
        </p>
        <p className="text-gray-500 mt-2">
          FlavorCore dashboard for agricultural operations.
        </p>
        <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">
          Current View: {currentView} | All buttons are working with alerts
        </div>
      </div>

      {/* ✅ WORKING QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">👥 Worker Management</h3>
          <p className="text-gray-600 mb-4">Manage agricultural workers and onboarding</p>
          <Button 
            onClick={handleWorkerManagement}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
          >
            Manage Workers
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">🌾 Field Operations</h3>
          <p className="text-gray-600 mb-4">Track daily activities and harvests</p>
          <Button 
            onClick={handleFieldOperations}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            View Operations
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">⚙️ FlavorCore Processing</h3>
          <p className="text-gray-600 mb-4">Monitor processing and quality control</p>
          <Button 
            onClick={handleProcessingStatus}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            Processing Status
          </Button>
        </div>
      </div>

      {/* ✅ WORKING ADMIN CONTROLS */}
      {userRole === 'admin' && (
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-3">
            🔧 Admin Controls
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleCreateUsers}
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold"
            >
              👤 Create New Users
            </Button>
            <Button 
              onClick={handleSystemSettings}
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold"
            >
              ⚙️ System Settings
            </Button>
            <Button 
              onClick={handleComplianceReports}
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold"
            >
              📊 Compliance Reports
            </Button>
            <Button 
              onClick={handleAuditTrail}
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold"
            >
              📋 Audit Trail
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Powered by <span className="font-bold text-purple-700">FlavorCore</span> Technology
        </p>
      </div>
    </div>
  );
}