-- =============================================
-- FIX: Infinite recursion in users RLS policy
-- The issue is that the policy for the "users" table
-- references the "users" table itself, causing infinite recursion.
-- =============================================

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Super admins can manage users" ON public.users;

-- Create a security definer function that can read the user role
-- without triggering RLS (runs with owner privileges)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

-- Recreate the policy using the function that bypasses RLS
CREATE POLICY "Super admins can manage users" ON public.users
    FOR ALL USING (
        public.get_current_user_role() = 'super_admin'
    );

-- Also ensure everyone can read their own row (important for the BottomNav check)
DROP POLICY IF EXISTS "Users can read own row" ON public.users;
CREATE POLICY "Users can read own row" ON public.users
    FOR SELECT USING (id = auth.uid());
