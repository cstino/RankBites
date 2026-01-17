-- SOLUZIONE ALTERNATIVA: Database Trigger per auto-creazione utenti
-- Questo bypassa completamente le RLS policies creando l'utente via trigger server-side

-- Function per creare automaticamente il record user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserisce nella tabella users quando viene creato un nuovo auth user
  INSERT INTO public.users (id, email, name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    -- Use name from metadata, or extract username from email as fallback
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      SPLIT_PART(NEW.email, '@', 1)
    ),
    -- Check if there's an invite_role in metadata, otherwise default to 'user'
    COALESCE(NEW.raw_user_meta_data->>'invite_role', 'user'),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Evita errori se già esiste
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger se esiste
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger che si attiva quando viene creato un nuovo utente in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Commento
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a user record when auth user is created';
