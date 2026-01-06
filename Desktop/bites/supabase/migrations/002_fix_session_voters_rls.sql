-- =============================================
-- FIX: Session Voters RLS Policies
-- Run this in Supabase SQL Editor to fix session creation
-- =============================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Session owner can manage voters" ON public.session_voters;

-- Create separate policies for each operation

-- INSERT: session owner can add voters
CREATE POLICY "Session owner can insert voters" ON public.session_voters
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.voting_sessions
            WHERE id = session_id AND owner_id = auth.uid()
        )
    );

-- UPDATE: voters can update their own status, or session owner can update
CREATE POLICY "Session owner or voter can update" ON public.session_voters
    FOR UPDATE USING (
        user_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.voting_sessions
            WHERE id = session_id AND owner_id = auth.uid()
        )
    );

-- DELETE: session owner can remove voters
CREATE POLICY "Session owner can delete voters" ON public.session_voters
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.voting_sessions
            WHERE id = session_id AND owner_id = auth.uid()
        )
    );

-- Also drop the old update policy if it exists
DROP POLICY IF EXISTS "Voters can update their own status" ON public.session_voters;
