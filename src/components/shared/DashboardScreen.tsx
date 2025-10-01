import { Button } from '../ui/button';

interface DashboardScreenProps {
  userId: string;      // ✅ Add userId prop
  userRole: string;    // ✅ Add userRole prop  
  onLogout: () => void; // ✅ Add onLogout prop
}

export function DashboardScreen({ userId, userRole, onLogout }: DashboardScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header with FlavorCore branding */}
      <div className="bg-gradient-to-r from-purple-800 to-blue-800 text-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🌟 FlavorCore Dashboard</h1>
            <p className="text-purple-100">Agricultural Management System</p>
          </div>
          <Button 
            onClick={onLogout}
            className="bg-white text-purple-800 hover:bg-gray-100"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome, {userId}
        </h2>
        <p className="text-gray-600">
          Role: <span className="font-semibold text-purple-700">{userRole}</span>
        </p>
        <p className="text-gray-500 mt-2">
          Your FlavorCore dashboard is ready for agricultural operations.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Worker Management</h3>
          <p className="text-gray-600 mb-4">Manage agricultural workers and onboarding</p>
          <Button className="w-full bg-purple-600 hover:bg-purple-700">
            Manage Workers
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Field Operations</h3>
          <p className="text-gray-600 mb-4">Track daily activities and harvests</p>
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            View Operations
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">FlavorCore Processing</h3>
          <p className="text-gray-600 mb-4">Monitor processing and quality control</p>
          <Button className="w-full bg-green-600 hover:bg-green-700">
            Processing Status
          </Button>
        </div>
      </div>

      {/* Admin-specific features */}
      {userRole === 'admin' && (
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-3">
            🔧 Admin Controls
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="bg-purple-700 hover:bg-purple-800">
              Create New Users
            </Button>
            <Button className="bg-purple-700 hover:bg-purple-800">
              System Settings
            </Button>
            <Button className="bg-purple-700 hover:bg-purple-800">
              Compliance Reports
            </Button>
            <Button className="bg-purple-700 hover:bg-purple-800">
              Audit Trail
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