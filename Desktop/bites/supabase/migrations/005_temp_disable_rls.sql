-- =============================================
-- TEMPORARY FIX: Disable RLS on voting_sessions
-- Run this to test if RLS is the issue
-- =============================================

-- Option 1: Disable RLS completely (for testing only!)
ALTER TABLE public.voting_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_voters DISABLE ROW LEVEL SECURITY;

-- After testing, to re-enable:
-- ALTER TABLE public.voting_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.session_voters ENABLE ROW LEVEL SECURITY;
