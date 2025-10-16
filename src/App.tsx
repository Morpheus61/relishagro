import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// CORRECTED IMPORTS - Based on actual component exports
import { LoginScreen } from './components/shared/LoginScreen';
import { MobileNav } from './components/shared/MobileNav';
import AdminDashboard from './components/admin/AdminDashboard';
import HarvestFlowDashboard from './components/harvestflow/HarvestFlowDashboard';
import FlavorCoreManagerDashboard from './components/flavorcore/FlavorCoreManagerDashboard';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Define the navigation routes
type Route = 'dashboard' | 'reports' | 'settings';

const AppContent: React.FC = () => {
  const { user, login, logout, isLoading, error } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');

  // FUNCTIONAL Navigation handler - NO MORE DUMMY BUTTONS
  const handleNavigation = (route: Route) => {
    console.log(`🎯 App.tsx: Navigation clicked: ${route}`);
    setCurrentRoute(route);
  };

  // Enhanced debug logging for user changes
  useEffect(() => {
    console.log('🔄 App.tsx: User state changed:', {
      user: user,
      hasUser: !!user,
      userId: user?.id,
      userRole: user?.role,
      userStaffId: user?.staff_id,
      userFullName: user?.full_name
    });
    console.log('🔄 App.tsx: isLoading:', isLoading);
    console.log('🔄 App.tsx: error:', error);
    console.log('🔄 App.tsx: currentRoute:', currentRoute);
    console.log('🔄 App.tsx: Will show:', !isLoading && !user ? 'LOGIN' : !isLoading && user ? 'DASHBOARD' : 'LOADING');
  }, [user, isLoading, error, currentRoute]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('⏳ App.tsx: Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FlavorCore...</p>
        </div>
      </div>
    );
  }

  // Enhanced login handler with better error handling
  const handleLogin = async (staffId: string, role: string) => {
    console.log('🚀 App.tsx: handleLogin called with:', { staffId, role });
    console.log('🚀 App.tsx: Current user state before login:', user);
    
    try {
      console.log('🚀 App.tsx: Calling AuthContext login...');
      await login(staffId);
      console.log('✅ App.tsx: AuthContext login call completed');
      console.log('✅ App.tsx: User state after login:', user);
      
      // Don't handle success here - let the useEffect handle user state changes
      
    } catch (error) {
      console.error('❌ App.tsx: Login error caught:', error);
      console.error('❌ App.tsx: Error type:', typeof error);
      console.error('❌ App.tsx: Error details:', error);
    }
  };

  // Convert user role to MobileNav format
  const getMobileNavRole = (userRole: string) => {
    switch (userRole) {
      case 'Admin':
        return 'admin';
      case 'HarvestFlow':
        return 'harvestflow_manager';
      case 'FlavorCore':
        return 'flavorcore_manager';
      case 'Supervisor':
        return 'flavorcore_supervisor';
      default:
        return userRole.toLowerCase();
    }
  };

  // FIXED: Render appropriate dashboard based on ACTUAL backend role values
  const renderDashboard = () => {
    if (!user) {
      console.log('❌ App.tsx: renderDashboard called but no user');
      return null;
    }

    console.log('🎯 App.tsx: Rendering dashboard for user:', {
      role: user.role,
      staff_id: user.staff_id,
      full_name: user.full_name,
      currentRoute: currentRoute
    });

    // Match the ACTUAL backend role values
    switch (user.role) {
      case 'Admin':  // Backend returns "Admin"
        console.log('📊 App.tsx: Rendering AdminDashboard');
        return <AdminDashboard currentRoute={currentRoute} onNavigate={handleNavigation} />;
      
      case 'HarvestFlow':  // Backend returns "HarvestFlow" 
        console.log('🌾 App.tsx: Rendering HarvestFlowDashboard');
        return <HarvestFlowDashboard />;
      
      case 'FlavorCore':  // Backend returns "FlavorCore"
        console.log('🏭 App.tsx: Rendering FlavorCoreManagerDashboard');
        return <FlavorCoreManagerDashboard />;
      
      case 'Supervisor':  // Backend returns "Supervisor"
        console.log('👨‍💼 App.tsx: Rendering SupervisorDashboard');
        return (
          <SupervisorDashboard 
            currentUser={{
              id: user.id,
              staff_id: user.staff_id,
              full_name: user.full_name,
              role: user.role
            }}
            onLogout={logout}
          />
        );
      
      // Legacy support for old role values (just in case)
      case 'admin':
        console.log('📊 App.tsx: Rendering AdminDashboard (legacy)');
        return <AdminDashboard currentRoute={currentRoute} onNavigate={handleNavigation} />;
      case 'harvestflow_manager':
        console.log('🌾 App.tsx: Rendering HarvestFlowDashboard (legacy)');
        return <HarvestFlowDashboard />;
      case 'flavorcore_manager':
        console.log('🏭 App.tsx: Rendering FlavorCoreManagerDashboard (legacy)');
        return <FlavorCoreManagerDashboard />;
      case 'flavorcore_supervisor':
        console.log('👨‍💼 App.tsx: Rendering SupervisorDashboard (legacy)');
        return (
          <SupervisorDashboard 
            currentUser={{
              id: user.id,
              staff_id: user.staff_id,
              full_name: user.full_name,
              role: user.role
            }}
            onLogout={logout}
          />
        );
      
      default:
        console.error('❌ App.tsx: Unknown user role:', user.role);
        return (
          <div className="p-12 text-center bg-red-50 border border-red-200 rounded-lg m-6">
            <h2 className="text-red-600 text-xl font-semibold mb-4">Access Error</h2>
            <p className="text-red-700 mb-4">
              Unknown user role: <strong>{user.role}</strong>
            </p>
            <p className="text-red-700 mb-6 text-sm">
              Expected roles: Admin, HarvestFlow, FlavorCore, Supervisor
            </p>
            <button 
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        );
    }
  };

  // If user is not authenticated, show login screen
  if (!user) {
    console.log('🔒 App.tsx: No user found, showing LoginScreen');
    return (
      <div>
        <LoginScreen />
        {/* Show error message if login failed */}
        {error && (
          <div className="fixed top-5 right-5 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 max-w-sm z-50">
            <strong>Login Error:</strong> {error}
          </div>
        )}
      </div>
    );
  }

  console.log('✅ App.tsx: User authenticated, showing dashboard for:', user);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation - Show only on mobile */}
      <div className="md:hidden">
        <MobileNav
          userRole={getMobileNavRole(user.role)}
          onNavigate={(route) => setCurrentRoute(route as Route)}
          onLogout={logout}
          currentRoute={currentRoute}
        />
      </div>

      {/* Desktop Header - Hide on mobile */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-indigo-600 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-xl font-bold">
                🌾
              </div>
              <h1 className="text-xl font-bold">
                Relish Agro - FlavorCore Management
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-sm opacity-90">
                  Welcome, {user.full_name}
                </span>
                <br />
                <span className="text-xs opacity-80">
                  {user.designation} • {user.staff_id}
                </span>
              </div>
              <button 
                onClick={logout}
                className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Desktop Navigation menu */}
          <nav className="mt-4 flex gap-2 max-w-7xl mx-auto">
            <button 
              onClick={() => handleNavigation('dashboard')}
              className={`px-4 py-2 text-sm border border-white/30 rounded transition-all ${
                currentRoute === 'dashboard' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-transparent text-white hover:bg-indigo-500'
              }`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => handleNavigation('reports')}
              className={`px-4 py-2 text-sm border border-white/30 rounded transition-all ${
                currentRoute === 'reports' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-transparent text-white hover:bg-indigo-500'
              }`}
            >
              Reports
            </button>
            <button 
              onClick={() => handleNavigation('settings')}
              className={`px-4 py-2 text-sm border border-white/30 rounded transition-all ${
                currentRoute === 'settings' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-transparent text-white hover:bg-indigo-500'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content - Mobile Responsive */}
      <main className="px-4 md:px-6 lg:px-8 pt-4 md:pt-36">
        <div className="max-w-7xl mx-auto">
          {renderDashboard()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="/login" element={<AppContent />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;