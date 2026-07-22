import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Phone, Calendar, Plus, History, RefreshCw, MessageCircle, Activity, Pencil, Trash2, FileText } from 'lucide-react';
import Layout from '@/components/Layout';
import { useClients, useAddClient, useUpdateClient, useDeleteClient, useAppointments, useServices, useAddAppointment, type Client } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const timeSlots = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30',
  '16:00','16:30','17:00','17:30','18:00','18:30','19:00',
];

const notesPlaceholderByType: Record<string, string> = {
  barbearia: 'Ex: prefere máquina 2, corte social',
  clinica_estetica: 'Ex: alergias, tipo de pele, restrições',
  manicure: 'Ex: alergia a acetona, unha fraca',
  clinica_odontologica: 'Ex: condições de saúde, medicações em uso',
};

const Clientes = () => {
  const { user } = useAuth();
  const { data: clients = [], isLoading } = useClients();
  const { data: allAppointments = [] } = useAppointments();
  const { data: services = [] } = useServices();
  const addClient = useAddClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();
  const addAppointment = useAddAppointment();
  const { toast } = useToast();

  const [businessType, setBusinessType] = useState<string>('barbearia');
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('business_type').eq('id', user.id).maybeSingle()
      .then(({ data }) => { if (data?.business_type) setBusinessType(data.business_type); });
  }, [user]);
  const notesPlaceholder = notesPlaceholderByType[businessType] ?? notesPlaceholderByType.barbearia;

  const [search, setSearch] = useState('');
  const [openNew, setOpenNew] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [editClient, setEditClient] = useState<Client | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const [historyClient, setHistoryClient] = useState<Client | null>(null);
  const [rebookClient, setRebookClient] = useState<Client | null>(null);
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [time, setTime] = useState('');

  const aptsByClient = useMemo(() => {
    const map = new Map<string, typeof allAppointments>();
    allAppointments.forEach(a => {
      if (!a.client_id) return;
      const arr = map.get(a.client_id) ?? [];
      arr.push(a);
      map.set(a.client_id, arr);
    });
    return map;
  }, [allAppointments]);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      toast({ title: 'Informe o nome do cliente', variant: 'destructive' });
      return;
    }
    try {
      await addClient.mutateAsync({ name: cleanName, phone: phone.trim(), notes: notes.trim() || null });
      setName(''); setPhone(''); setNotes(''); setOpenNew(false);
      toast({ title: 'Cliente cadastrado!' });
    } catch {
      toast({ title: 'Erro ao cadastrar cliente', variant: 'destructive' });
    }
  };

  const openEdit = (c: Client) => {
    setEditClient(c);
    setEditName(c.name);
    setEditPhone(c.phone ?? '');
    setEditNotes(c.notes ?? '');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClient) return;
    const cleanName = editName.trim();
    if (!cleanName) {
      toast({ title: 'Informe o nome do cliente', variant: 'destructive' });
      return;
    }
    try {
      await updateClient.mutateAsync({
        id: editClient.id,
        name: cleanName,
        phone: editPhone.trim(),
        notes: editNotes.trim() || null,
      });
      setEditClient(null);
      toast({ title: 'Cliente atualizado!' });
    } catch {
      toast({ title: 'Erro ao atualizar cliente', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!editClient) return;
    try {
      await deleteClient.mutateAsync({ id: editClient.id });
      setEditClient(null);
      toast({ title: 'Cliente excluído' });
    } catch {
      toast({ title: 'Erro ao excluir cliente', variant: 'destructive' });
    }
  };

  const handleRebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rebookClient) return;
    const service = services.find(s => s.id === serviceId);
    if (!service || !time) {
      toast({ title: 'Selecione serviço e horário', variant: 'destructive' });
      return;
    }
    try {
      await addAppointment.mutateAsync({
        client_id: rebookClient.id,
        service_id: service.id,
        client_name: rebookClient.name,
        client_phone: rebookClient.phone,
        service_name: service.name,
        price: Number(service.price),
        date,
        time: time + ':00',
        status: 'confirmed',
      });
      setRebookClient(null); setServiceId(''); setTime('');
      toast({ title: 'Re-agendamento criado!' });
    } catch {
      toast({ title: 'Erro ao re-agendar', variant: 'destructive' });
    }
  };

  const openRebook = (client: Client) => {
    const last = aptsByClient.get(client.id)?.[0];
    setRebookClient(client);
    setServiceId(last?.service_id ?? '');
    setTime('');
    setDate(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  };

  const whatsappLink = (client: Client) => {
    const digits = client.phone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá ${client.name}, tudo bem? Que tal agendar seu próximo horário?`);
    return `https://wa.me/55${digits}?text=${msg}`;
  };

  return (
    <Layout>
      <TooltipProvider delayDuration={200}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground mt-1">Cadastro rápido + histórico para fidelizar</p>
          </div>
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" /> Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display">Cadastro rápido</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João Silva" required maxLength={100} className="bg-secondary border-border" autoFocus />
                </div>
                <div className="space-y-2">
                  <Label>Telefone (WhatsApp)</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" maxLength={20} inputMode="tel" className="bg-secondary border-border" />
                  <p className="text-xs text-muted-foreground">Opcional, mas necessário para enviar lembretes.</p>
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={notesPlaceholder} maxLength={500} rows={3} className="bg-secondary border-border resize-none" />
                </div>
                <Button type="submit" disabled={addClient.isPending} className="w-full bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90">
                  {addClient.isPending ? 'Salvando...' : 'Cadastrar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou telefone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
            <p className="mb-3">{clients.length === 0 ? 'Nenhum cliente cadastrado ainda.' : 'Nenhum cliente encontrado.'}</p>
            {clients.length === 0 && (
              <Button onClick={() => setOpenNew(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" /> Cadastrar primeiro cliente
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((client, i) => {
              const apts = aptsByClient.get(client.id) ?? [];
              const visits = apts.length;
              const last = apts[0];
              const activePackages = apts.filter(
                (a) => (a.sessoes_total ?? 1) > 1 && (a.sessoes_realizadas ?? 0) < (a.sessoes_total ?? 1),
              );
              const sessoesRestantes = activePackages.reduce(
                (sum, a) => sum + ((a.sessoes_total ?? 1) - (a.sessoes_realizadas ?? 0)),
                0,
              );
              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-card border border-border rounded-xl p-4 shadow-card hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-gold flex items-center justify-center shrink-0">
                      <span className="text-base font-semibold text-accent-foreground">{client.name[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-foreground truncate">{client.name}</p>
                        {client.notes && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs whitespace-pre-wrap">{client.notes}</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      {client.phone && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {client.phone}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">{visits} {visits === 1 ? 'visita' : 'visitas'}</Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-secondary/50 rounded-lg px-3 py-2">
                      <p className="text-muted-foreground">Última visita</p>
                      <p className="text-foreground font-medium mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {last ? format(new Date(last.date), 'dd/MM/yy') : '—'}
                      </p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg px-3 py-2">
                      <p className="text-muted-foreground">Total gasto</p>
                      <p className="text-primary font-semibold mt-0.5">R$ {Number(client.total_spent).toFixed(2)}</p>
                    </div>
                  </div>

                  {activePackages.length > 0 && (
                    <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold text-primary flex items-center gap-1">
                          <Activity className="w-3 h-3" /> Pacotes ativos
                        </p>
                        <span className="text-[11px] font-bold text-primary">
                          {sessoesRestantes} {sessoesRestantes === 1 ? 'sessão' : 'sessões'} restantes
                        </span>
                      </div>
                      {activePackages.slice(0, 3).map((a) => {
                        const tot = a.sessoes_total ?? 1;
                        const fei = a.sessoes_realizadas ?? 0;
                        return (
                          <p key={a.id} className="text-[11px] text-muted-foreground truncate">
                            • {a.service_name}: <span className="font-medium text-foreground">{fei}/{tot}</span>
                          </p>
                        );
                      })}
                      {activePackages.length > 3 && (
                        <p className="text-[10px] text-muted-foreground">+{activePackages.length - 3} pacote(s)</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setHistoryClient(client)}>
                      <History className="w-3.5 h-3.5 mr-1" /> Histórico
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(client)} aria-label="Editar cliente">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" className="flex-1 bg-gradient-gold text-accent-foreground hover:opacity-90" onClick={() => openRebook(client)}>
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-agendar
                    </Button>
                    {client.phone && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={whatsappLink(client)} target="_blank" rel="noopener noreferrer" aria-label="Enviar WhatsApp">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Editar cliente */}
      <Dialog open={!!editClient} onOpenChange={(o) => !o && setEditClient(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Editar cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} required maxLength={100} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Telefone (WhatsApp)</Label>
              <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="(11) 99999-9999" maxLength={20} inputMode="tel" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder={notesPlaceholder} maxLength={500} rows={3} className="bg-secondary border-border resize-none" />
            </div>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="outline" size="icon" className="text-destructive hover:text-destructive" aria-label="Excluir cliente">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso remove apenas o cadastro de <strong>{editClient?.name}</strong>. O histórico de agendamentos não será apagado.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button type="submit" disabled={updateClient.isPending} className="flex-1 bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90">
                {updateClient.isPending ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Histórico */}
      <Dialog open={!!historyClient} onOpenChange={(o) => !o && setHistoryClient(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Histórico — {historyClient?.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-2">
            {historyClient && (aptsByClient.get(historyClient.id) ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum atendimento registrado ainda.</p>
            ) : (
              historyClient && (aptsByClient.get(historyClient.id) ?? []).map(a => {
                const tot = a.sessoes_total ?? 1;
                const fei = a.sessoes_realizadas ?? 0;
                const showSes = tot > 1;
                return (
                  <div key={a.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{a.service_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(a.date), "dd 'de' MMM yyyy", { locale: ptBR })} às {a.time.slice(0,5)}
                      </p>
                      {showSes && (
                        <p className="text-[11px] text-primary font-medium mt-0.5 flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          Sessões: {fei}/{tot} {fei >= tot ? '· concluído' : `· faltam ${tot - fei}`}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-sm font-semibold text-primary">R$ {Number(a.price).toFixed(2)}</p>
                      <Badge variant="outline" className="text-[10px] mt-0.5">{a.status}</Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {historyClient && (
            <Button onClick={() => { const c = historyClient; setHistoryClient(null); openRebook(c); }} className="w-full bg-gradient-gold text-accent-foreground hover:opacity-90">
              <RefreshCw className="w-4 h-4 mr-2" /> Re-agendar agora
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* Re-agendar */}
      <Dialog open={!!rebookClient} onOpenChange={(o) => !o && setRebookClient(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Re-agendar — {rebookClient?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRebook} className="space-y-4">
            <div className="space-y-2">
              <Label>Serviço</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name} — R$ {Number(s.price).toFixed(2)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={addAppointment.isPending} className="w-full bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90">
              {addAppointment.isPending ? 'Salvando...' : 'Confirmar agendamento'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      </TooltipProvider>
    </Layout>
  );
};

export default Clientes;
