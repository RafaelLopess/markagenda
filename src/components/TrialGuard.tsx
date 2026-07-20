import { useEffect, useState } from 'react';
import { Clock, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TrialGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('profiles').select('trial_ends_at').eq('id', user.id).maybeSingle(),
      (supabase.from as any)('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle(),
    ]).then(([profileRes, roleRes]: any) => {
      if (profileRes.data?.trial_ends_at) setTrialEndsAt(new Date(profileRes.data.trial_ends_at));
      if (roleRes.data) setIsAdmin(true);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const now = new Date();
  const expired = !isAdmin && trialEndsAt && trialEndsAt < now;
  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (expired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-card text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center mx-auto mb-4 shadow-gold text-accent-foreground">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Seu período de teste terminou
          </h1>
          <p className="text-muted-foreground mb-6">
            Você usou os 7 dias gratuitos do MarkAgenda. Escolha um plano para continuar gerenciando sua agenda sem interrupções.
          </p>
          <div className="space-y-2">
            <Button
              className="w-full bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90"
              onClick={() => navigate('/#planos')}
            >
              Ver planos
            </Button>
            <Button variant="ghost" className="w-full" onClick={signOut}>
              Sair
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {daysLeft <= 3 && (
        <div className="bg-gradient-gold text-accent-foreground px-4 py-2 text-sm font-medium flex items-center justify-center gap-2">
          <Clock className="w-4 h-4" />
          {daysLeft === 0
            ? 'Seu teste gratuito termina hoje'
            : `Restam ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'} do seu teste gratuito`}
          <button
            onClick={() => navigate('/#planos')}
            className="underline font-semibold ml-2"
          >
            Assinar agora
          </button>
        </div>
      )}
      {children}
    </>
  );
};

export default TrialGuard;
