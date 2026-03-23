import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import AppointmentCard from '@/components/AppointmentCard';
import { mockAppointments } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00',
];

const Agenda = () => {
  const [selectedDate] = useState('2026-03-23');
  const dayAppointments = mockAppointments.filter(a => a.date === selectedDate);

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Agenda</h1>
            <p className="text-muted-foreground mt-1">Gerencie seus horários</p>
          </div>
          <Button className="bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        {/* Date navigation */}
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {['Seg 21', 'Ter 22', 'Qua 23', 'Qui 24', 'Sex 25', 'Sáb 26'].map((day, i) => (
              <button
                key={day}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  i === 2
                    ? 'bg-gradient-gold text-accent-foreground shadow-gold'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="font-display text-xl font-semibold text-foreground mb-6">
            Quarta-feira, 23 de Março
          </h2>
          <div className="space-y-2">
            {timeSlots.map((time) => {
              const apt = dayAppointments.find(a => a.time === time);
              return (
                <div key={time} className="flex items-stretch gap-4 min-h-[48px]">
                  <div className="w-14 text-right pt-3">
                    <span className="text-xs text-muted-foreground font-medium">{time}</span>
                  </div>
                  <div className="w-px bg-border relative">
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-border" />
                  </div>
                  <div className="flex-1">
                    {apt ? (
                      <AppointmentCard appointment={apt} />
                    ) : (
                      <div className="py-3 px-4 border border-dashed border-border rounded-xl text-xs text-muted-foreground hover:border-primary/30 hover:text-primary/50 transition-colors cursor-pointer">
                        Horário disponível
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Agenda;
