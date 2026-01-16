-- FIX per errore signup: "new row violates row-level security policy"
-- Applica questa migration per permettere agli utenti di crearsi un account

-- Enable RLS se non già abilitato
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert own record during signup" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admins can update user roles" ON users;

-- Policy per permettere INSERT durante signup
-- Un utente può inserire il proprio record quando auth.uid() corrisponde all'id
CREATE POLICY "Users can insert own record during signup"
ON users
FOR INSERT  
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy per permettere SELECT del proprio profile
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy per permettere UPDATE del proprio profile
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy per permettere ad admin di vedere tutti gli utenti
CREATE POLICY "Admins can view all users"
ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (role = 'admin' OR role = 'super_admin')
  )
);

-- Policy per super_admin di modificare ruoli
CREATE POLICY "Super admins can update user roles"
ON users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'super_admin'
  )
);
