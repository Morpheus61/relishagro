// src/App.tsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// === Use named imports ===
import { LoginScreen } from './components/shared/LoginScreen';
import { DashboardScreen } from './components/shared/DashboardScreen';
import { HarvestFlowDashboard } from './components/harvestflow/HarvestFlowDashboard';
import { FlavorCoreDashboard } from './components/flavorcore/FlavorCoreDashboard';

// Initialize Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'harvestflow_manager' | 'flavorcore_manager' | 'staff' | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const role = session.user?.user_metadata?.role || 'staff';
        setUserRole(role as any);
        setSession(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const role = session.user?.user_metadata?.role || 'staff';
        setUserRole(role as any);
        setSession(session);
      } else {
        setSession(null);
        setUserRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!session) {
    return <LoginScreen onLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {userRole === 'admin' && <DashboardScreen session={session} />}
      {userRole === 'harvestflow_manager' && <HarvestFlowDashboard />}
      {userRole === 'flavorcore_manager' && <FlavorCoreDashboard />}
      {userRole === 'staff' && <DashboardScreen session={session} />}
    </div>
  );
}