
DO $$ BEGIN
  CREATE TYPE public.business_type AS ENUM ('barbearia', 'clinica_estetica', 'manicure', 'clinica_odontologica');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS business_type public.business_type NOT NULL DEFAULT 'barbearia';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, trial_ends_at, business_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    now() + interval '7 days',
    COALESCE((NEW.raw_user_meta_data ->> 'business_type')::public.business_type, 'barbearia'::public.business_type)
  );
  RETURN NEW;
END;
$function$;
