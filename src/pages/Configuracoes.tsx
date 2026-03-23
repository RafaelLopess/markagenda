import { motion } from 'framer-motion';
import { User, Clock, MapPin } from 'lucide-react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const Configuracoes = () => {
  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Personalize seu perfil e horários</p>
        </div>

        {/* Profile */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">Perfil</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Nome da Barbearia</Label>
              <Input defaultValue="Barbearia do João" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Seu Nome</Label>
              <Input defaultValue="João Silva" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">WhatsApp</Label>
              <Input defaultValue="(11) 99999-1234" className="bg-secondary border-border" />
            </div>
          </div>
        </div>

        {/* Working hours */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">Horário de Funcionamento</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Abertura</Label>
              <Input type="time" defaultValue="08:00" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Fechamento</Label>
              <Input type="time" defaultValue="19:00" className="bg-secondary border-border" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Intervalo entre atendimentos (minutos)</Label>
            <Input type="number" defaultValue="30" className="bg-secondary border-border" />
          </div>
        </div>

        {/* Address */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">Endereço</h2>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Endereço completo</Label>
            <Input defaultValue="Rua das Flores, 123 - Centro" className="bg-secondary border-border" />
          </div>
        </div>

        <Button className="bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90">
          Salvar Configurações
        </Button>
      </motion.div>
    </Layout>
  );
};

export default Configuracoes;
