
-- 1) whatsapp_config
CREATE TABLE IF NOT EXISTS public.whatsapp_config (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number_id text NOT NULL DEFAULT '',
  access_token text NOT NULL DEFAULT '',
  waba_id text NOT NULL DEFAULT '',
  display_phone text NOT NULL DEFAULT '',
  template_language text NOT NULL DEFAULT 'pt_BR',
  template_confirmation_name text NOT NULL DEFAULT '',
  template_reminder_name text NOT NULL DEFAULT '',
  template_cancellation_name text NOT NULL DEFAULT '',
  template_confirmation_text text NOT NULL DEFAULT 'Olá {nome}, seu horário para {servico} foi agendado para {data} às {hora} com {profissional}. Para confirmar, responda SIM.',
  template_reminder_text text NOT NULL DEFAULT 'Olá {nome}, lembrando do seu horário amanhã às {hora} para {servico}. Nos vemos lá!',
  template_cancellation_text text NOT NULL DEFAULT 'Olá {nome}, seu agendamento do dia {data} foi cancelado. Entre em contato para reagendar.',
  reminder_hours integer[] NOT NULL DEFAULT ARRAY[24, 2],
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_config TO authenticated;
GRANT ALL ON public.whatsapp_config TO service_role;

ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own whatsapp_config"
ON public.whatsapp_config FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- reuse or create updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_whatsapp_config_updated ON public.whatsapp_config;
CREATE TRIGGER trg_whatsapp_config_updated
BEFORE UPDATE ON public.whatsapp_config
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2) whatsapp_messages
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  to_phone text NOT NULL,
  message_type text NOT NULL, -- confirmation | reminder_24h | reminder_2h | cancellation | manual
  rendered_text text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending', -- pending | sent | failed
  error text,
  wa_message_id text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user ON public.whatsapp_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_appt ON public.whatsapp_messages(appointment_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_messages TO authenticated;
GRANT ALL ON public.whatsapp_messages TO service_role;

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own whatsapp_messages"
ON public.whatsapp_messages FOR SELECT
TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own whatsapp_messages"
ON public.whatsapp_messages FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own whatsapp_messages"
ON public.whatsapp_messages FOR UPDATE
TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users delete own whatsapp_messages"
ON public.whatsapp_messages FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- 3) reminders_sent no appointments
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS reminders_sent text[] NOT NULL DEFAULT ARRAY[]::text[];

-- 4) pg_cron + pg_net (para agendar lembretes)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
