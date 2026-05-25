ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS sessoes_total integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS sessoes_realizadas integer NOT NULL DEFAULT 0;