-- =============================================
-- DEBUG: Check if user exists in public.users
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Check all users in auth.users
SELECT id, email FROM auth.users;

-- 2. Check all users in public.users
SELECT * FROM public.users;

-- 3. Find users in auth.users that are NOT in public.users
SELECT au.id, au.email, 'MISSING FROM PUBLIC.USERS' as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- If you see your email in the result above, run this to add yourself:
-- INSERT INTO public.users (id, email, name, role)
-- VALUES (
--   'YOUR-UUID-FROM-AUTH-USERS',
--   'your@email.com',
--   'Your Name',
--   'super_admin'
-- );
