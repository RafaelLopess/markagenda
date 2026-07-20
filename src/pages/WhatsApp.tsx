import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Save, RefreshCw, CheckCircle2, XCircle, Clock, Info } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

interface WhatsAppConfig {
  user_id: string;
  phone_number_id: string;
  access_token: string;
  waba_id: string;
  display_phone: string;
  template_language: string;
  template_confirmation_name: string;
  template_reminder_name: string;
  template_cancellation_name: string;
  template_confirmation_text: string;
  template_reminder_text: string;
  template_cancellation_text: string;
  reminder_hours: number[];
  active: boolean;
}

const DEFAULTS: WhatsAppConfig = {
  user_id: '',
  phone_number_id: '',
  access_token: '',
  waba_id: '',
  display_phone: '',
  template_language: 'pt_BR',
  template_confirmation_name: '',
  template_reminder_name: '',
  template_cancellation_name: '',
  template_confirmation_text:
    'Olá {nome}, seu horário para {servico} foi agendado para {data} às {hora} com {profissional}. Para confirmar, responda SIM.',
  template_reminder_text:
    'Olá {nome}, lembrando do seu horário amanhã às {hora} para {servico}. Nos vemos lá!',
  template_cancellation_text:
    'Olá {nome}, seu agendamento do dia {data} foi cancelado. Entre em contato para reagendar.',
  reminder_hours: [24, 2],
  active: false,
};

const WhatsApp = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<WhatsAppConfig>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [reminderHoursStr, setReminderHoursStr] = useState('24, 2');

  const { data: config, isLoading } = useQuery({
    queryKey: ['whatsapp_config', user?.id],
    queryFn: async () => {
      const { data } = await (supabase.from as any)('whatsapp_config')
        .select('*').eq('user_id', user!.id).maybeSingle();
      return data as WhatsAppConfig | null;
    },
    enabled: !!user,
  });

  const { data: messages } = useQuery({
    queryKey: ['whatsapp_messages', user?.id],
    queryFn: async () => {
      const { data } = await (supabase.from as any)('whatsapp_messages')
        .select('*').order('created_at', { ascending: false }).limit(100);
      return (data ?? []) as any[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (config) {
      setForm({ ...DEFAULTS, ...config });
      setReminderHoursStr((config.reminder_hours || [24, 2]).join(', '));
    } else if (user) {
      setForm({ ...DEFAULTS, user_id: user.id });
    }
  }, [config, user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const parsedHours = reminderHoursStr
        .split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n > 0);
      const payload = { ...form, user_id: user.id, reminder_hours: parsedHours.length ? parsedHours : [24, 2] };
      const { error } = await (supabase.from as any)('whatsapp_config')
        .upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
      toast({ title: 'Configuração salva' });
      qc.invalidateQueries({ queryKey: ['whatsapp_config'] });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const resend = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-send', {
        body: { resend_id: id, message_type: 'manual' },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({ title: 'Reenviada' });
      qc.invalidateQueries({ queryKey: ['whatsapp_messages'] });
    } catch (e: any) {
      toast({ title: 'Falha ao reenviar', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-16">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Integração <span className="text-gradient-gold">WhatsApp</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            WhatsApp Cloud API (Meta oficial) — envio automático de confirmações, lembretes e cancelamentos.
          </p>
        </div>

        {/* Config */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> Credenciais Meta
            </h2>
            <div className="flex items-center gap-3">
              <Label htmlFor="active" className="text-sm">Ativo</Label>
              <Switch id="active" checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 text-sm p-3 rounded-lg flex gap-2 text-muted-foreground">
            <Info className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span>
              Crie um app no <b>Meta for Developers</b> → adicione o produto <b>WhatsApp</b> → copie o
              <b> Phone Number ID</b> e gere um <b>Access Token permanente</b>. Os templates precisam ser aprovados
              pela Meta antes do uso fora da janela de 24h.
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Phone Number ID</Label>
              <Input value={form.phone_number_id} onChange={(e) => setForm({ ...form, phone_number_id: e.target.value })} placeholder="1234567890" />
            </div>
            <div>
              <Label>WhatsApp Business Account ID (WABA)</Label>
              <Input value={form.waba_id} onChange={(e) => setForm({ ...form, waba_id: e.target.value })} placeholder="opcional" />
            </div>
            <div className="md:col-span-2">
              <Label>Access Token (permanente)</Label>
              <Input type="password" value={form.access_token} onChange={(e) => setForm({ ...form, access_token: e.target.value })} placeholder="EAA..." />
            </div>
            <div>
              <Label>Número conectado (exibição)</Label>
              <Input value={form.display_phone} onChange={(e) => setForm({ ...form, display_phone: e.target.value })} placeholder="+55 11 99999-9999" />
            </div>
            <div>
              <Label>Idioma dos templates</Label>
              <Input value={form.template_language} onChange={(e) => setForm({ ...form, template_language: e.target.value })} placeholder="pt_BR" />
            </div>
          </div>
        </div>

        {/* Reminders */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Lembretes automáticos
          </h2>
          <div>
            <Label>Horas antes do agendamento (separadas por vírgula)</Label>
            <Input value={reminderHoursStr} onChange={(e) => setReminderHoursStr(e.target.value)} placeholder="24, 2" />
            <p className="text-xs text-muted-foreground mt-1">Ex: <code>24, 2</code> envia um lembrete 24h antes e outro 2h antes.</p>
          </div>
        </div>

        {/* Templates */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-5">
          <h2 className="font-display text-xl font-semibold">Templates de mensagem</h2>
          <p className="text-sm text-muted-foreground">
            Use as variáveis: <code>{'{nome}'}</code> <code>{'{servico}'}</code> <code>{'{data}'}</code> <code>{'{hora}'}</code> <code>{'{profissional}'}</code>.
            Preencha também o <b>nome do template aprovado</b> na Meta (obrigatório para enviar fora da janela de 24h).
          </p>

          {[
            { key: 'confirmation', label: 'Confirmação (ao criar agendamento)' },
            { key: 'reminder', label: 'Lembrete (antes do horário)' },
            { key: 'cancellation', label: 'Cancelamento' },
          ].map(({ key, label }) => (
            <div key={key} className="border border-border rounded-lg p-4 space-y-3">
              <div className="font-semibold text-foreground">{label}</div>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <Label>Nome do template (Meta)</Label>
                  <Input
                    value={(form as any)[`template_${key}_name`]}
                    onChange={(e) => setForm({ ...form, [`template_${key}_name`]: e.target.value } as any)}
                    placeholder="ex: confirmacao_agendamento"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Texto (preview + fallback)</Label>
                  <Textarea
                    rows={2}
                    value={(form as any)[`template_${key}_text`]}
                    onChange={(e) => setForm({ ...form, [`template_${key}_text`]: e.target.value } as any)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} className="bg-gradient-gold text-accent-foreground font-semibold">
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Salvando...' : 'Salvar configurações'}
          </Button>
        </div>

        {/* Message history */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="font-display text-xl font-semibold mb-4">Histórico de mensagens</h2>
          {(!messages || messages.length === 0) ? (
            <p className="text-sm text-muted-foreground">Nenhuma mensagem enviada ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="py-2 pr-3">Data</th>
                    <th className="py-2 pr-3">Tipo</th>
                    <th className="py-2 pr-3">Para</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Mensagem</th>
                    <th className="py-2 pr-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((m) => (
                    <tr key={m.id} className="border-b border-border/50 align-top">
                      <td className="py-2 pr-3 whitespace-nowrap">{format(new Date(m.created_at), 'dd/MM HH:mm')}</td>
                      <td className="py-2 pr-3">{m.message_type}</td>
                      <td className="py-2 pr-3">{m.to_phone}</td>
                      <td className="py-2 pr-3">
                        {m.status === 'sent' && <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="w-3.5 h-3.5"/>Enviada</span>}
                        {m.status === 'failed' && <span className="inline-flex items-center gap-1 text-destructive"><XCircle className="w-3.5 h-3.5"/>Falha</span>}
                        {m.status === 'pending' && <span className="text-muted-foreground">Pendente</span>}
                      </td>
                      <td className="py-2 pr-3 max-w-[400px]">
                        <div className="line-clamp-2">{m.rendered_text}</div>
                        {m.error && <div className="text-xs text-destructive mt-1">{m.error}</div>}
                      </td>
                      <td className="py-2 pr-3">
                        {m.status === 'failed' && (
                          <Button size="sm" variant="outline" onClick={() => resend(m.id)}>
                            <RefreshCw className="w-3 h-3 mr-1"/> Reenviar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </Layout>
  );
};

export default WhatsApp;
