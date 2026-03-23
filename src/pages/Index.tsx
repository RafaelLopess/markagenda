import { motion } from 'framer-motion';
import { DollarSign, Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import AppointmentCard from '@/components/AppointmentCard';
import { mockAppointments } from '@/lib/mock-data';

const todayAppointments = mockAppointments.filter(a => a.date === '2026-03-23');
const completedToday = mockAppointments.filter(a => a.date === '2026-03-22');
const todayRevenue = todayAppointments.reduce((sum, a) => sum + a.price, 0);
const weekRevenue = mockAppointments.reduce((sum, a) => sum + a.price, 0);

const Index = () => {
  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Bom dia, <span className="text-gradient-gold">Barbeiro</span>
          </h1>
          <p className="text-muted-foreground mt-1">Aqui está o resumo do seu dia.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Faturamento Hoje"
            value={`R$ ${todayRevenue}`}
            subtitle="5 agendamentos"
            icon={DollarSign}
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            title="Faturamento Semanal"
            value={`R$ ${weekRevenue}`}
            subtitle="8 atendimentos"
            icon={TrendingUp}
            trend={{ value: 8, positive: true }}
          />
          <StatCard
            title="Agendamentos Hoje"
            value={`${todayAppointments.length}`}
            subtitle="2 pendentes"
            icon={Calendar}
          />
          <StatCard
            title="Clientes Ativos"
            value="5"
            subtitle="Este mês"
            icon={Users}
            trend={{ value: 3, positive: true }}
          />
        </div>

        {/* Today's schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Agenda de Hoje</h2>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock className="w-4 h-4" />
                23 Mar, 2026
              </div>
            </div>
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
            <h2 className="font-display text-xl font-semibold text-foreground mb-6">Últimos Atendimentos</h2>
            <div className="space-y-4">
              {completedToday.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{apt.clientName}</p>
                    <p className="text-xs text-muted-foreground">{apt.service}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">R$ {apt.price}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Total ontem</p>
                <p className="text-lg font-display font-bold text-primary">
                  R$ {completedToday.reduce((s, a) => s + a.price, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Index;
