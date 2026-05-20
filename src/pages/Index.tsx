import { motion } from 'framer-motion';
import { DollarSign, Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import AppointmentCard from '@/components/AppointmentCard';
import { useAppointments, useClients } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const Index = () => {
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: todayAppointments = [] } = useAppointments(today);
  const { data: allAppointments = [] } = useAppointments();
  const { data: clients = [] } = useClients();

  const todayRevenue = todayAppointments
    .filter(a => a.status !== 'cancelled')
    .reduce((sum, a) => sum + Number(a.price), 0);

  const completedToday = todayAppointments.filter(a => a.status === 'completed');
  const pendingToday = todayAppointments.filter(a => a.status === 'pending').length;

  const weekRevenue = allAppointments
    .filter(a => a.status !== 'cancelled')
    .reduce((sum, a) => sum + Number(a.price), 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const userName = user?.user_metadata?.name || 'Profissional';

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {greeting()}, <span className="text-gradient-gold">{userName}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Aqui está o resumo do seu dia.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Faturamento Hoje"
            value={`R$ ${todayRevenue.toFixed(2)}`}
            subtitle={`${todayAppointments.length} agendamentos`}
            icon={DollarSign}
          />
          <StatCard
            title="Faturamento Total"
            value={`R$ ${weekRevenue.toFixed(2)}`}
            subtitle={`${allAppointments.filter(a => a.status === 'completed').length} atendimentos`}
            icon={TrendingUp}
          />
          <StatCard
            title="Agendamentos Hoje"
            value={`${todayAppointments.length}`}
            subtitle={`${pendingToday} pendentes`}
            icon={Calendar}
          />
          <StatCard
            title="Clientes"
            value={`${clients.length}`}
            subtitle="Cadastrados"
            icon={Users}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Agenda de Hoje</h2>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock className="w-4 h-4" />
                {format(new Date(), 'dd MMM, yyyy')}
              </div>
            </div>
            <div className="space-y-3">
              {todayAppointments.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">Nenhum agendamento hoje.</p>
              ) : (
                todayAppointments.map((apt) => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
            <h2 className="font-display text-xl font-semibold text-foreground mb-6">Últimos Atendimentos</h2>
            <div className="space-y-4">
              {completedToday.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">Nenhum atendimento concluído hoje.</p>
              ) : (
                completedToday.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{apt.client_name}</p>
                      <p className="text-xs text-muted-foreground">{apt.service_name}</p>
                    </div>
                    <p className="text-sm font-semibold text-primary">R$ {Number(apt.price).toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Index;
