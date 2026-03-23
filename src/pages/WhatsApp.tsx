import { motion } from 'framer-motion';
import { MessageSquare, Zap, Clock, CheckCircle2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Zap,
    title: 'Agendamento Automático',
    description: 'Clientes agendam direto pelo WhatsApp, sem intervenção manual.',
  },
  {
    icon: Clock,
    title: 'Lembretes Automáticos',
    description: 'Envio automático de lembretes 1h antes do horário.',
  },
  {
    icon: CheckCircle2,
    title: 'Confirmação Instantânea',
    description: 'Cliente recebe confirmação assim que o horário é reservado.',
  },
  {
    icon: MessageSquare,
    title: 'Mensagens Personalizadas',
    description: 'Configure mensagens de boas-vindas e pós-atendimento.',
  },
];

const WhatsApp = () => {
  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Integração <span className="text-gradient-gold">WhatsApp</span>
          </h1>
          <p className="text-muted-foreground mt-1">Automatize seus agendamentos via WhatsApp</p>
        </div>

        {/* Status card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-card text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-success" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Configure seu WhatsApp</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Conecte seu número de WhatsApp para começar a receber agendamentos automáticos dos seus clientes.
          </p>
          <Button className="bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90 px-8">
            Conectar WhatsApp
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-6 shadow-card"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Layout>
  );
};

export default WhatsApp;
