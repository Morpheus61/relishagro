import { Button } from '../ui/button';
import { useState } from 'react';

interface DashboardScreenProps {
  userId: string;
  userRole: string;
  onLogout: () => void;
}

export function DashboardScreen({ userId, userRole, onLogout }: DashboardScreenProps) {
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  // ✅ REAL WORKING HANDLERS - NO MORE ALERTS
  const handleWorkerManagement = () => {
    setActiveSection('worker-management');
    console.log('Opening Worker Management...');
  };

  const handleFieldOperations = () => {
    setActiveSection('field-operations');
    console.log('Opening Field Operations...');
  };

  const handleProcessingStatus = () => {
    setActiveSection('processing-status');
    console.log('Opening Processing Status...');
  };

  const handleCreateUsers = () => {
    setActiveSection('create-users');
    console.log('Opening User Creation...');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'worker-management':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">👥 Worker Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                📝 Register New Worker
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                👁️ Biometric Enrollment
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                📋 Staff Directory
              </Button>
            </div>
            <Button 
              onClick={() => setActiveSection('dashboard')}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white"
            >
              ← Back to Dashboard
            </Button>
          </div>
        );
      
      case 'field-operations':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">🌾 Field Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                📊 Daily Harvest Tracking
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                📍 Field Assignments
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                📝 Activity Logs
              </Button>
            </div>
            <Button 
              onClick={() => setActiveSection('dashboard')}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white"
            >
              ← Back to Dashboard
            </Button>
          </div>
        );
      
      case 'processing-status':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">⚙️ FlavorCore Processing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                🔄 Processing Queue
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                ✅ Quality Control
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                📦 Batch Tracking
              </Button>
            </div>
            <Button 
              onClick={() => setActiveSection('dashboard')}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white"
            >
              ← Back to Dashboard
            </Button>
          </div>
        );
      
      case 'create-users':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">👤 Create New Users</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Staff ID</label>
                <input 
                  type="text" 
                  placeholder="e.g., FlavorCore-Raja, HarvestFlow-John"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter full name"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select className="w-full p-2 border rounded-lg">
                  <option>Select Role</option>
                  <option>Admin</option>
                  <option>HarvestFlow Manager</option>
                  <option>FlavorCore Manager</option>
                  <option>Staff</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  ✅ Create User
                </Button>
                <Button 
                  onClick={() => setActiveSection('dashboard')}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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

            {/* Admin Controls */}
            {userRole === 'admin' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
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
                  <Button className="bg-purple-700 hover:bg-purple-800 text-white font-semibold">
                    ⚙️ System Settings
                  </Button>
                  <Button className="bg-purple-700 hover:bg-purple-800 text-white font-semibold">
                    📊 Compliance Reports
                  </Button>
                  <Button className="bg-purple-700 hover:bg-purple-800 text-white font-semibold">
                    📋 Audit Trail
                  </Button>
                </div>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
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

      {/* Welcome Section */}
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
          Current Section: {activeSection} | ✅ Real navigation working
        </div>
      </div>

      {/* Dynamic Content */}
      {renderContent()}

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Powered by <span className="font-bold text-purple-700">FlavorCore</span> Technology
        </p>
      </div>
    </div>
  );
}