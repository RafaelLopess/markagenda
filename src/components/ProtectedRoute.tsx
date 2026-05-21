import { useAuth } from '@/contexts/AuthContext';
import Auth from '@/pages/Auth';
import TrialGuard from '@/components/TrialGuard';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return <TrialGuard>{children}</TrialGuard>;
};

export default ProtectedRoute;
