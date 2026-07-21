import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase } from 'lucide-react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type BusinessType = 'barbearia' | 'clinica_estetica' | 'manicure' | 'clinica_odontologica';

const BUSINESS_OPTIONS: { value: BusinessType; label: string }[] = [
  { value: 'barbearia', label: 'Barbearia' },
  { value: 'clinica_estetica', label: 'Clínica de Estética' },
  { value: 'manicure', label: 'Manicure/Nail Designer' },
  { value: 'clinica_odontologica', label: 'Clínica Odontológica' },
];

const Configuracoes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('barbearia');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('business_name, name, phone, business_type')
        .eq('id', user.id)
        .maybeSingle();
      if (error) {
        toast({ title: 'Erro ao carregar perfil', description: error.message, variant: 'destructive' });
      } else if (data) {
        setBusinessName(data.business_name ?? '');
        setName(data.name ?? '');
        setPhone(data.phone ?? '');
        setBusinessType((data.business_type as BusinessType) ?? 'barbearia');
      }
      setLoading(false);
    })();
  }, [user, toast]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        business_name: businessName,
        name,
        phone,
        business_type: businessType,
      })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Configurações salvas' });
    }
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Personalize seu perfil</p>
        </div>

        {/* Profile */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">Perfil</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Nome do Estabelecimento</Label>
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Meu Estabelecimento"
                className="bg-secondary border-border"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Seu Nome</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="bg-secondary border-border"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">WhatsApp</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-0000"
                className="bg-secondary border-border"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Tipo de negócio
              </Label>
              <Select
                value={businessType}
                onValueChange={(v) => setBusinessType(v as BusinessType)}
                disabled={loading}
              >
                <SelectTrigger className="bg-secondary border-border">
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
        </div>

        <Button
          onClick={handleSave}
          disabled={loading || saving}
          className="bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90"
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </motion.div>
    </Layout>
  );
};

export default Configuracoes;
