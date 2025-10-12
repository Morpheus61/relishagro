import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// CORRECT IMPORTS - Using named imports to match your component exports
import { LoginScreen } from './components/shared/LoginScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { HarvestFlowDashboard } from './components/harvestflow/HarvestFlowDashboard';
import { FlavorCoreManagerDashboard } from './components/flavorcore/FlavorCoreManagerDashboard';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
// REMOVED: import './App.css'; - File doesn't exist, causing build failure

// Define the navigation routes
type Route = 'dashboard' | 'users' | 'farms' | 'harvest' | 'processing' | 'quality' | 'reports' | 'settings';

const AppContent: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');

  // Navigation handler
  const handleNavigation = (route: Route) => {
    setCurrentRoute(route);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Handle login from LoginScreen
  const handleLogin = (staffId: string, role: string) => {
    // The AuthContext should handle this through its login method
    console.log('Login attempt:', { staffId, role });
    // You might need to implement this based on your AuthContext setup
  };

  // Render appropriate dashboard based on user role with CORRECT PROPS
  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        // AdminDashboard expects: userId, userRole, onLogout
        return (
          <AdminDashboard 
            userId={user.id} 
            userRole={user.role} 
            onLogout={logout} 
          />
        );
      
      case 'harvestflow_manager':
        // HarvestFlowDashboard expects: currentUser
        return (
          <HarvestFlowDashboard 
            currentUser={{
              id: user.id,
              staff_id: user.username, // Using username as staff_id
              full_name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username,
              role: user.role
            }} 
          />
        );
      
      case 'flavorcore_manager':
        // FlavorCoreManagerDashboard expects: userId, userRole, onLogout
        return (
          <FlavorCoreManagerDashboard 
            userId={user.id}
            userRole={user.role}
            onLogout={logout}
          />
        );
      
      case 'flavorcore_supervisor':
        // SupervisorDashboard expects: currentUser, onLogout
        return (
          <SupervisorDashboard 
            currentUser={{
              id: user.id,
              staff_id: user.username, // Using username as staff_id
              full_name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username,
              role: user.role
            }}
            onLogout={logout}
          />
        );
      
      default:
        return (
          <div style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            margin: '24px'
          }}>
            <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>Access Error</h2>
            <p style={{ color: '#7f1d1d', marginBottom: '24px' }}>Unknown user role: {user.role}</p>
            <button 
              onClick={logout}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        );
    }
  };

  // If user is not authenticated, show login screen with proper props
  if (!user) {
    return (
      <LoginScreen 
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header with user info and navigation */}
      <header style={{
        backgroundColor: '#6366f1',
        color: 'white',
        padding: '16px 24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img 
              src="/src/assets/flavorcore-logo.png" 
              alt="FlavorCore" 
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            />
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              FlavorCore Agricultural Management
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '14px', opacity: 0.9 }}>
                Welcome, {user.username}
              </span>
              <br />
              <span style={{ fontSize: '12px', opacity: 0.8 }}>
                ({user.role.replace('_', ' ')})
              </span>
            </div>
            <button 
              onClick={logout}
              style={{
                backgroundColor: '#4338ca',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Optional: Navigation menu using currentRoute and handleNavigation */}
        <nav style={{
          marginTop: '16px',
          display: 'flex',
          gap: '8px',
          maxWidth: '1200px',
          margin: '16px auto 0'
        }}>
          <button 
            onClick={() => handleNavigation('dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentRoute === 'dashboard' ? '#4338ca' : 'transparent',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Dashboard
          </button>
          <button 
            onClick={() => handleNavigation('reports')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentRoute === 'reports' ? '#4338ca' : 'transparent',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reports
          </button>
          <button 
            onClick={() => handleNavigation('settings')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentRoute === 'settings' ? '#4338ca' : 'transparent',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Settings
          </button>
        </nav>
      </header>

      {/* Main content area */}
      <main style={{ padding: '24px' }}>
        {renderDashboard()}
      </main>

      {/* Add CSS animation for loading spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
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