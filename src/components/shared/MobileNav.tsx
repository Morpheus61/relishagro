import { useState } from 'react';
import { Menu, X, Home, Users, Package, Clipboard, Settings, LogOut, Smartphone, Beaker, QrCode, CheckCircle, Box, Send } from 'lucide-react';
import { Button } from '../ui/button';

interface MobileNavProps {
  userRole: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  currentRoute: string;
}

export function MobileNav({ userRole, onNavigate, onLogout, currentRoute }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavigate = (route: string) => {
    onNavigate(route);
    setIsOpen(false);
  };

  // Define navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', route: 'dashboard' },
    ];

    const roleItems: Record<string, any[]> = {
      admin: [
        { icon: Users, label: 'User Management', route: 'users' },
        { icon: Clipboard, label: 'Onboarding Approvals', route: 'onboarding' },
        { icon: Package, label: 'Attendance Records', route: 'attendance' },
        { icon: Package, label: 'Provision Requests', route: 'provisions' },
        { icon: Settings, label: 'System Settings', route: 'settings' },
        { icon: Clipboard, label: 'Reports & Analytics', route: 'reports' },
      ],
      harvestflow_manager: [
        { icon: Users, label: 'Staff Onboarding', route: 'onboarding' },
        { icon: Clipboard, label: 'Attendance Management', route: 'attendance' },
        { icon: Package, label: 'Procurement', route: 'procurement' },
        { icon: Clipboard, label: 'Daily Work Assignment', route: 'daily-work' },
        { icon: Package, label: 'Harvest Jobs', route: 'harvest-jobs' },
        { icon: Package, label: 'Lot Management', route: 'lot-management' },
        { icon: Smartphone, label: 'RFID Dispatch Packing', route: 'dispatch-rfid' },
        { icon: Package, label: 'Dispatch Management', route: 'dispatch' },
        { icon: Clipboard, label: 'Wage Management', route: 'wages' },
      ],
      flavorcore_manager: [
        { icon: Package, label: 'Lot Review & Approval', route: 'lots' },
        { icon: Clipboard, label: 'Processing Status', route: 'processing' },
        { icon: Package, label: 'Quality Control', route: 'quality' },
        { icon: Package, label: 'Provision Approvals', route: 'provisions' },
        { icon: Users, label: 'Staff Management', route: 'staff' },
        { icon: Users, label: 'Staff Onboarding', route: 'onboarding' },
        { icon: CheckCircle, label: 'Final Approvals', route: 'approvals' },
      ],
      flavorcore_supervisor: [
        { icon: Smartphone, label: 'RFID Scanning', route: 'rfid' },
        { icon: Beaker, label: 'Drying Samples', route: 'samples' },
        { icon: Box, label: 'Final Packing', route: 'packing' },
        { icon: QrCode, label: 'QR Generation', route: 'qr' },
        { icon: Send, label: 'My Submissions', route: 'submissions' },
        { icon: CheckCircle, label: 'Lot Completion', route: 'completion' },
      ],
    };

    return [...baseItems, ...(roleItems[userRole] || [])];
  };

  const navItems = getNavItems();

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      admin: 'System Administrator',
      harvestflow_manager: 'HarvestFlow Manager',
      flavorcore_manager: 'FlavorCore Manager',
      flavorcore_supervisor: 'FlavorCore Supervisor',
    };
    return roleNames[role] || role.replace('_', ' ');
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 p-3 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={toggleMenu}
        />
      )}

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with FlavorCore Branding */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/flavorcore-logo.png"
              alt="FlavorCore"
              className="w-12 h-12 bg-white p-1 rounded"
              onError={(e) => {
                // Fallback if logo doesn't exist
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.classList.remove('hidden');
                  fallback.classList.add('flex');
                }
              }}
            />
            <div className="w-12 h-12 bg-white text-purple-600 rounded hidden items-center justify-center font-bold text-lg">
              🌿
            </div>
            <div>
              <h2 className="text-xl font-bold">FlavorCore</h2>
              <p className="text-purple-200 text-sm">Agricultural Management</p>
            </div>
          </div>
          <div className="text-sm border-t border-purple-500 pt-3 mt-3">
            <p className="font-semibold">{getRoleDisplayName(userRole)}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${
                navigator.onLine ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span className="text-xs text-purple-200">
                {navigator.onLine ? 'Online' : 'Offline Mode'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            
            return (
              <button
                key={item.route}
                onClick={() => handleNavigate(item.route)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer with Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
          
          {/* App Info */}
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              FlavorCore v1.0 • RelishAgro Systems
            </p>
          </div>
        </div>
      </div>
    </>
  );
}