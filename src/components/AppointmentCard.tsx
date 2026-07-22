import { MapPin, CreditCard, Activity, Plus, Check, CheckCircle, XCircle } from 'lucide-react';
import type { Appointment } from '@/hooks/useSupabaseData';
import { useUpdateAppointmentSessoes, useUpdateAppointmentStatus } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

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

  const sTotal = Number(appointment.sessoes_total) || 1;
  const sFeitas = Number(appointment.sessoes_realizadas) || 0;
  const sRestantes = Math.max(sTotal - sFeitas, 0);
  const showSessoes = sTotal > 1;

  const updateSessoes = useUpdateAppointmentSessoes();
  const updateStatus = useUpdateAppointmentStatus();
  const { toast } = useToast();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleAddSessao = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sRestantes === 0) return;
    try {
      await updateSessoes.mutateAsync({
        id: appointment.id,
        sessoes_realizadas: sFeitas + 1,
      });
      toast({ title: `Sessão registrada (${sFeitas + 1}/${sTotal})` });
    } catch {
      toast({ title: 'Erro ao atualizar sessão', variant: 'destructive' });
    }
  };

  const handleConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateStatus.mutateAsync({ id: appointment.id, status: 'confirmed' });
      toast({ title: 'Agendamento confirmado' });
    } catch {
      toast({ title: 'Erro ao confirmar agendamento', variant: 'destructive' });
    }
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateStatus.mutateAsync({ id: appointment.id, status: 'completed' });
      toast({ title: 'Agendamento concluído' });
    } catch {
      toast({ title: 'Erro ao concluir agendamento', variant: 'destructive' });
    }
  };

  const handleCancel = async () => {
    try {
      await updateStatus.mutateAsync({ id: appointment.id, status: 'cancelled' });
      toast({ title: 'Agendamento cancelado' });
    } catch {
      toast({ title: 'Erro ao cancelar agendamento', variant: 'destructive' });
    } finally {
      setCancelDialogOpen(false);
    }
  };

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

      {(appointment.sala || showParcelas || showSessoes) && (
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
          {showSessoes && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                sRestantes === 0
                  ? 'bg-success/10 text-success'
                  : 'bg-accent/10 text-accent-foreground border border-accent/30'
              }`}
            >
              <Activity className="w-3 h-3" />
              {sRestantes === 0
                ? `Pacote concluído · ${sTotal} sessões`
                : `${sFeitas}/${sTotal} sessões · faltam ${sRestantes}`}
            </span>
          )}
          {showSessoes && sRestantes > 0 && (
            <button
              onClick={handleAddSessao}
              disabled={updateSessoes.isPending}
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              title="Registrar mais uma sessão realizada"
            >
              <Plus className="w-3 h-3" />
              Sessão feita
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
