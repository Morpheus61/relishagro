import { useState } from 'react';
import { Menu, X, Home, Users, Package, Clipboard, Settings, LogOut } from 'lucide-react';
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
        { icon: Users, label: 'Onboarding Approvals', route: 'onboarding' },
        { icon: Clipboard, label: 'Attendance Records', route: 'attendance' },
        { icon: Package, label: 'Provision Requests', route: 'provisions' },
        { icon: Settings, label: 'System Settings', route: 'settings' },
      ],
      harvestflow_manager: [
        { icon: Clipboard, label: 'Daily Work', route: 'daily' },
        { icon: Package, label: 'Harvest Jobs', route: 'harvest' },
        { icon: Users, label: 'Staff Onboarding', route: 'onboarding' },
        { icon: Clipboard, label: 'Attendance', route: 'attendance' },
        { icon: Package, label: 'Procurement', route: 'procurement' },
      ],
      flavorcore_manager: [
        { icon: Package, label: 'Lot Review', route: 'lots' },
        { icon: Clipboard, label: 'Processing Status', route: 'processing' },
        { icon: Package, label: 'Provision Requests', route: 'provisions' },
        { icon: Users, label: 'Staff Management', route: 'staff' },
      ],
      flavorcore_supervisor: [
        { icon: Package, label: 'RFID Scanning', route: 'rfid' },
        { icon: Clipboard, label: 'Drying Samples', route: 'samples' },
        { icon: Package, label: 'QR Generation', route: 'qr' },
        { icon: Clipboard, label: 'Lot Completion', route: 'completion' },
      ],
    };

    return [...baseItems, ...(roleItems[userRole] || [])];
  };

  const navItems = getNavItems();

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
              className="w-12 h-12 rounded-lg bg-white p-1"
            />
            <div>
              <h2 className="text-xl font-bold">FlavorCore</h2>
              <p className="text-purple-200 text-sm">RelishAgro Management</p>
            </div>
          </div>
          <div className="text-sm border-t border-purple-500 pt-3 mt-3">
            <p className="font-semibold capitalize">{userRole.replace('_', ' ')}</p>
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
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
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
          
          {/* Offline Indicator */}
          <div className="mt-2 text-center">
            <div className="flex items-center justify-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                navigator.onLine ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-gray-600">
                {navigator.onLine ? 'Online' : 'Offline Mode'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}