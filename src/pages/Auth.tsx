import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Sparkles, Briefcase } from 'lucide-react';
import Logo from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type BusinessType = 'barbearia' | 'clinica_estetica' | 'manicure' | 'clinica_odontologica';

const BUSINESS_OPTIONS: { value: BusinessType; label: string }[] = [
  { value: 'barbearia', label: 'Barbearia' },
  { value: 'clinica_estetica', label: 'Clínica de Estética' },
  { value: 'manicure', label: 'Manicure/Nail Designer' },
  { value: 'clinica_odontologica', label: 'Clínica Odontológica' },
];

const Auth = () => {
  const [searchParams] = useSearchParams();
  const trialAllowed = searchParams.get('signup') === 'trial';
  const [isLogin, setIsLogin] = useState(!trialAllowed);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType | ''>('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (!trialAllowed) {
          throw new Error('Para criar uma conta, escolha o plano de teste grátis na página inicial.');
        }
        if (!businessType) {
          throw new Error('Selecione o tipo de negócio.');
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, business_type: businessType },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: 'Conta criada! 7 dias grátis liberados',
          description: 'Verifique seu e-mail para confirmar a conta.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center mx-auto mb-4 shadow-gold text-accent-foreground">
            <Logo className="w-8 h-8" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gradient-gold">MarkAgenda</h1>
          <p className="text-muted-foreground mt-2">Agenda inteligente para barbearias e clínicas</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">
            {isLogin ? 'Entrar na sua conta' : 'Criar sua conta grátis'}
          </h2>
          {!isLogin && trialAllowed && (
            <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 mb-6">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>7 dias de acesso completo · sem cartão</span>
            </div>
          )}
          {isLogin && <div className="mb-6" />}

          <form onSubmit={handleSubmit} className="space-y-4">

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-secondary border-border"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_type">Tipo de negócio</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                    <Select value={businessType} onValueChange={(v) => setBusinessType(v as BusinessType)}>
                      <SelectTrigger id="business_type" className="pl-10 bg-secondary border-border">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUSINESS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90"
            >
              {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            {isLogin ? (
              <Link
                to="/#planos"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Não tem conta? <span className="font-semibold text-primary">Comece grátis por 7 dias</span>
              </Link>
            ) : (
              <button
                onClick={() => setIsLogin(true)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Já tem conta? Faça login
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
