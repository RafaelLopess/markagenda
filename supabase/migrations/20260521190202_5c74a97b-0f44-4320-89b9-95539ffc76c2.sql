
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '7 days');

-- Update existing profiles to have a trial ending 7 days from now
UPDATE public.profiles SET trial_ends_at = now() + interval '7 days' WHERE trial_ends_at IS NULL;

-- Update the new user trigger to set trial_ends_at
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, trial_ends_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    now() + interval '7 days'
  );
  RETURN NEW;
END;
$function$;
