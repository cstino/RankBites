-- =============================================
-- FIX: RLS Policies - Use auth.uid() instead of auth.role()
-- Run this in Supabase SQL Editor
-- =============================================

-- FIX VOTING_SESSIONS POLICIES
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.voting_sessions;
DROP POLICY IF EXISTS "Admins can create sessions" ON public.voting_sessions;

CREATE POLICY "Authenticated can view sessions" ON public.voting_sessions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can create sessions" ON public.voting_sessions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- FIX SESSION_VOTERS POLICIES
DROP POLICY IF EXISTS "Admins can view session voters" ON public.session_voters;

CREATE POLICY "Authenticated can view session voters" ON public.session_voters
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- FIX RESTAURANTS POLICIES
DROP POLICY IF EXISTS "Admins can create restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Admins can update restaurants" ON public.restaurants;

CREATE POLICY "Authenticated can create restaurants" ON public.restaurants
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update restaurants" ON public.restaurants
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- FIX RESTAURANT_PHOTOS POLICIES
DROP POLICY IF EXISTS "Admins can manage restaurant photos" ON public.restaurant_photos;

CREATE POLICY "Authenticated can manage restaurant photos" ON public.restaurant_photos
    FOR ALL USING (auth.uid() IS NOT NULL);

-- FIX GROUPS POLICIES
DROP POLICY IF EXISTS "Authenticated users can view groups" ON public.groups;

CREATE POLICY "Authenticated can view groups" ON public.groups
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- FIX USER_GROUPS POLICIES
DROP POLICY IF EXISTS "Authenticated users can view user_groups" ON public.user_groups;

CREATE POLICY "Authenticated can view user_groups" ON public.user_groups
    FOR SELECT USING (auth.uid() IS NOT NULL);
