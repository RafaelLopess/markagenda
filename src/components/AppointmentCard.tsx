import { Clock, Phone } from 'lucide-react';
import type { Appointment } from '@/hooks/useSupabaseData';

const statusStyles = {
  confirmed: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

const statusLabels = {
  confirmed: 'Confirmado',
  pending: 'Pendente',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors">
      <div className="w-14 text-center">
        <p className="text-lg font-display font-bold text-primary">{appointment.time.slice(0, 5)}</p>
      </div>
      <div className="h-12 w-px bg-border" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{appointment.client_name}</p>
        <p className="text-xs text-muted-foreground">{appointment.service_name}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[appointment.status]}`}>
          {statusLabels[appointment.status]}
        </span>
        <p className="text-sm font-semibold text-primary">R$ {Number(appointment.price).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default AppointmentCard;
