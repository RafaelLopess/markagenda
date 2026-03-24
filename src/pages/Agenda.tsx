import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import AppointmentCard from '@/components/AppointmentCard';
import { useAppointments, useAddAppointment, useServices, useClients } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00',
];

const Agenda = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const { data: appointments = [], isLoading } = useAppointments(dateStr);
  const { data: services = [] } = useServices();
  const { data: clients = [] } = useClients();
  const addAppointment = useAddAppointment();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [time, setTime] = useState('');

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);
    const service = services.find(s => s.id === serviceId);
    if (!client || !service || !time) return;

    try {
      await addAppointment.mutateAsync({
        client_id: client.id,
        service_id: service.id,
        client_name: client.name,
        client_phone: client.phone,
        service_name: service.name,
        price: Number(service.price),
        date: dateStr,
        time: time + ':00',
        status: 'confirmed',
      });
      setOpen(false);
      setClientId(''); setServiceId(''); setTime('');
      toast({ title: 'Agendamento criado!' });
    } catch {
      toast({ title: 'Erro ao criar agendamento', variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Agenda</h1>
            <p className="text-muted-foreground mt-1">Gerencie seus horários</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display">Novo Agendamento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Serviço</Label>
                  <Select value={serviceId} onValueChange={setServiceId}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name} - R$ {Number(s.price).toFixed(2)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={addAppointment.isPending} className="w-full bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90">
                  {addAppointment.isPending ? 'Salvando...' : 'Agendar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Date navigation */}
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <button onClick={() => setSelectedDate(d => addDays(d, -7))} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2 overflow-x-auto">
            {weekDays.map((day) => (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  format(day, 'yyyy-MM-dd') === dateStr
                    ? 'bg-gradient-gold text-accent-foreground shadow-gold'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {format(day, 'EEE dd', { locale: ptBR })}
              </button>
            ))}
          </div>
          <button onClick={() => setSelectedDate(d => addDays(d, 7))} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="font-display text-xl font-semibold text-foreground mb-6">
            {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {timeSlots.map((slot) => {
                const apt = appointments.find(a => a.time.slice(0, 5) === slot);
                return (
                  <div key={slot} className="flex items-stretch gap-4 min-h-[48px]">
                    <div className="w-14 text-right pt-3">
                      <span className="text-xs text-muted-foreground font-medium">{slot}</span>
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
          )}
        </div>
      </motion.div>
    </Layout>
  );
};

export default Agenda;
