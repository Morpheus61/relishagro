import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LoginScreen } from './components/shared/LoginScreen';
import { DashboardScreen } from './components/shared/DashboardScreen';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const role = session.user?.user_metadata?.role || 'staff';
        setUserRole(role);
        setSession(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const role = session.user?.user_metadata?.role || 'staff';
        setUserRole(role);
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
    <DashboardScreen session={session} />
  );
}