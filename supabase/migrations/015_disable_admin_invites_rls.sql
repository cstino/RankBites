-- Fix per permettere la registrazione utenti
-- Aggiungi policy per SELECT publico su admin_invites (contiene solo email di invito, non dati sensibili)

-- Abilita RLS su admin_invites
ALTER TABLE admin_invites ENABLE ROW LEVEL SECURITY;

-- Permetti a TUTTI (anche utenti non autenticati) di leggere gli inviti per email
-- Questo serve durante la registrazione per verificare se l'email ha un invito admin
CREATE POLICY "Anyone can check invites by email"
ON admin_invites
FOR SELECT
TO anon, authenticated
USING (true);

-- Solo gli admin autenticati possono inserire nuovi inviti
CREATE POLICY "Admins can create invites"
ON admin_invites
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
);

-- Solo gli utenti autenticati possono marcare un invito come usato
CREATE POLICY "Authenticated users can mark invite as used"
ON admin_invites
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (used_at IS NOT NULL);
