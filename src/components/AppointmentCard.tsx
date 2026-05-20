import { MapPin, CreditCard } from 'lucide-react';
import type { Appointment } from '@/hooks/useSupabaseData';

const statusStyles = {
  confirmed: 'bg-success/10 text-success border border-success/20',
  pending: 'bg-warning/10 text-warning border border-warning/20',
  completed: 'bg-muted text-muted-foreground border border-border',
  cancelled: 'bg-destructive/10 text-destructive border border-destructive/20',
};

const statusLabels = {
  confirmed: 'Confirmado',
  pending: 'Pendente',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
  const total = Number(appointment.parcelas_total) || 1;
  const paid = Number(appointment.parcelas_pagas) || 0;
  const remaining = Math.max(total - paid, 0);
  const valorParcela = Number(appointment.price) / total;
  const showParcelas = total > 1;

  return (
    <div className="flex flex-col gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/40 hover:shadow-card transition-all">
      <div className="flex items-center gap-4">
        <div className="w-14 text-center">
          <p className="text-lg font-display font-bold text-primary">{appointment.time.slice(0, 5)}</p>
        </div>
        <div className="h-12 w-px bg-border" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{appointment.client_name}</p>
          <p className="text-xs text-muted-foreground truncate">{appointment.service_name}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusStyles[appointment.status]}`}>
            {statusLabels[appointment.status]}
          </span>
          <p className="text-sm font-semibold text-foreground">R$ {Number(appointment.price).toFixed(2)}</p>
        </div>
      </div>

      {(appointment.sala || showParcelas) && (
        <div className="flex flex-wrap items-center gap-2 pl-[72px] -mt-1">
          {appointment.sala && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
              <MapPin className="w-3 h-3" />
              {appointment.sala}
            </span>
          )}
          {showParcelas && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                remaining === 0
                  ? 'bg-success/10 text-success'
                  : 'bg-primary/10 text-primary'
              }`}
              title={`Parcela de R$ ${valorParcela.toFixed(2)}`}
            >
              <CreditCard className="w-3 h-3" />
              {remaining === 0
                ? `Quitado · ${total}x`
                : `${paid}/${total} pagas · faltam ${remaining}`}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
