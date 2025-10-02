import { useState } from 'react';
import { LoginScreen } from './components/shared/LoginScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { FlavorCoreDashboard } from './components/flavorcore/FlavorCoreDashboard';
import { HarvestFlowDashboard } from './components/harvestflow/HarvestFlowDashboard';
import { HarvestingDashboard } from './components/harvesting/HarvestingDashboard';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';

interface User {
  id: string;
  role: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userId: string, role: string) => {
    console.log('🔍 App.tsx received login:', { userId, role });
    setUser({ id: userId, role: role });
  };

  const handleLogout = () => {
    setUser(null);
  };

  // ✅ ROLE-BASED DASHBOARD ROUTING
  const renderDashboard = () => {
    if (!user) return null;

    console.log('🎯 Routing user to dashboard:', { role: user.role });

    switch (user.role.toLowerCase()) {
      case 'admin':
        return (
          <AdminDashboard 
            userId={user.id} 
            userRole={user.role} 
            onLogout={handleLogout} 
          />
        );
      
      case 'flavorcore_manager':
      case 'flavorcore-manager':
        return (
          <FlavorCoreDashboard 
            userId={user.id} 
            userRole={user.role} 
            onLogout={handleLogout} 
          />
        );
      
      case 'harvestflow_manager':
      case 'harvestflow-manager':
        return (
          <HarvestFlowDashboard 
            userId={user.id} 
            userRole={user.role} 
            onLogout={handleLogout} 
          />
        );
      
      case 'supervisor':
      case 'flavorcore_supervisor':
        return (
          <SupervisorDashboard 
            userId={user.id} 
            userRole={user.role} 
            onLogout={handleLogout} 
          />
        );
      
      case 'harvesting':
      case 'staff':
        return (
          <HarvestingDashboard 
            userId={user.id} 
            userRole={user.role} 
            onLogout={handleLogout} 
          />
        );
      
      default:
        console.warn('🚨 Unknown role, using generic dashboard:', user.role);
        return (
          <HarvestingDashboard 
            userId={user.id} 
            userRole={user.role} 
            onLogout={handleLogout} 
          />
        );
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return renderDashboard();
}

export default App;