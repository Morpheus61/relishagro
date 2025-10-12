import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// CORRECT IMPORTS - Using named imports to match your component exports
import { LoginScreen } from './components/shared/LoginScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { HarvestFlowDashboard } from './components/harvestflow/HarvestFlowDashboard';
import { FlavorCoreManagerDashboard } from './components/flavorcore/FlavorCoreManagerDashboard';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

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
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
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
          <div className="error-container">
            <h2>Access Error</h2>
            <p>Unknown user role: {user.role}</p>
            <button onClick={logout}>Logout</button>
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
    <div className="app">
      {/* Header with user info and navigation */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <img 
              src="/src/assets/flavorcore-logo.png" 
              alt="FlavorCore" 
              className="app-logo"
            />
            <h1>FlavorCore Agricultural Management</h1>
          </div>
          
          <div className="user-section">
            <div className="user-info">
              <span className="welcome-text">Welcome, {user.username}</span>
              <span className="user-role">({user.role.replace('_', ' ')})</span>
            </div>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
        
        {/* Optional: Navigation menu using currentRoute and handleNavigation */}
        <nav className="main-navigation">
          <button 
            className={currentRoute === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => handleNavigation('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={currentRoute === 'reports' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => handleNavigation('reports')}
          >
            Reports
          </button>
          <button 
            className={currentRoute === 'settings' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => handleNavigation('settings')}
          >
            Settings
          </button>
        </nav>
      </header>

      {/* Main content area */}
      <main className="app-main">
        {renderDashboard()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
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