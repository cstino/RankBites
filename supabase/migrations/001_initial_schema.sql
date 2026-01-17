-- =============================================
-- FOOD RATING APP - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE (extends Supabase auth.users)
-- =============================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- GROUPS TABLE
-- =============================================
CREATE TABLE public.groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER_GROUPS (many-to-many)
-- =============================================
CREATE TABLE public.user_groups (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, group_id)
);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.categories (name, "order") VALUES
    ('Location', 1),
    ('Menu', 2),
    ('Servizio', 3),
    ('Conto', 4);

-- =============================================
-- RESTAURANTS TABLE
-- =============================================
CREATE TABLE public.restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    address TEXT NOT NULL,
    maps_link TEXT,
    cover_photo_url TEXT,
    overall_rating DECIMAL(3,1),
    category_ratings JSONB,
    ai_review TEXT,
    current_session_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RESTAURANT_PHOTOS TABLE
-- =============================================
CREATE TABLE public.restaurant_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- VOTING_SESSIONS TABLE
-- =============================================
CREATE TABLE public.voting_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    visit_date DATE,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- Add foreign key for current_session_id after voting_sessions exists
ALTER TABLE public.restaurants
ADD CONSTRAINT fk_current_session
FOREIGN KEY (current_session_id)
REFERENCES public.voting_sessions(id)
ON DELETE SET NULL;

-- =============================================
-- SESSION_VOTERS TABLE
-- =============================================
CREATE TABLE public.session_voters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.voting_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    has_voted BOOLEAN DEFAULT FALSE,
    voted_at TIMESTAMPTZ,
    UNIQUE(session_id, user_id)
);

-- =============================================
-- VOTES TABLE
-- =============================================
CREATE TABLE public.votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.voting_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, user_id, category_id)
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Users can view all users" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Super admins can manage users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- GROUPS POLICIES
CREATE POLICY "Authenticated users can view groups" ON public.groups
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Super admins can manage groups" ON public.groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- USER_GROUPS POLICIES
CREATE POLICY "Authenticated users can view user_groups" ON public.user_groups
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Super admins can manage user_groups" ON public.user_groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- CATEGORIES POLICIES
CREATE POLICY "Anyone can view active categories" ON public.categories
    FOR SELECT USING (active = true);

CREATE POLICY "Super admins can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- RESTAURANTS POLICIES
CREATE POLICY "Anyone can view restaurants" ON public.restaurants
    FOR SELECT USING (true);

CREATE POLICY "Admins can create restaurants" ON public.restaurants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update restaurants" ON public.restaurants
    FOR UPDATE USING (auth.role() = 'authenticated');

-- RESTAURANT_PHOTOS POLICIES
CREATE POLICY "Anyone can view restaurant photos" ON public.restaurant_photos
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage restaurant photos" ON public.restaurant_photos
    FOR ALL USING (auth.role() = 'authenticated');

-- VOTING_SESSIONS POLICIES
CREATE POLICY "Admins can view all sessions" ON public.voting_sessions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can create sessions" ON public.voting_sessions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Session owner can update session" ON public.voting_sessions
    FOR UPDATE USING (owner_id = auth.uid());

-- SESSION_VOTERS POLICIES
CREATE POLICY "Admins can view session voters" ON public.session_voters
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Session owner can manage voters" ON public.session_voters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.voting_sessions
            WHERE id = session_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Voters can update their own status" ON public.session_voters
    FOR UPDATE USING (user_id = auth.uid());

-- VOTES POLICIES
-- During open session: users can only see their own votes
-- After closed: everyone can see all votes for that session
CREATE POLICY "Users can see their own votes" ON public.votes
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can see all votes in closed sessions" ON public.votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.voting_sessions
            WHERE id = session_id AND status = 'closed'
        )
    );

CREATE POLICY "Invited users can vote" ON public.votes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.session_voters
            WHERE session_id = votes.session_id
            AND user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1 FROM public.voting_sessions
            WHERE id = votes.session_id AND status = 'open'
        )
    );

CREATE POLICY "Users can update their own votes in open sessions" ON public.votes
    FOR UPDATE USING (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.voting_sessions
            WHERE id = session_id AND status = 'open'
        )
    );

CREATE POLICY "Users can delete their own votes in open sessions" ON public.votes
    FOR DELETE USING (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.voting_sessions
            WHERE id = session_id AND status = 'open'
        )
    );

-- =============================================
-- STORAGE BUCKET FOR PHOTOS
-- =============================================
-- Run this separately in Supabase Dashboard > Storage
-- Create bucket named 'photos' with public access

-- =============================================
-- FUNCTION: Calculate session averages
-- =============================================
CREATE OR REPLACE FUNCTION calculate_session_averages(p_session_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_object_agg(
        c.name,
        sub.avg_score
    ) INTO result
    FROM (
        SELECT
            v.category_id,
            ROUND(AVG(v.score)::numeric, 1) as avg_score
        FROM public.votes v
        WHERE v.session_id = p_session_id
        GROUP BY v.category_id
    ) sub
    JOIN public.categories c ON c.id = sub.category_id;

    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION: Close session and calculate results
-- =============================================
CREATE OR REPLACE FUNCTION close_voting_session(p_session_id UUID)
RETURNS JSONB AS $$
DECLARE
    category_avgs JSONB;
    overall DECIMAL(3,1);
    v_restaurant_id UUID;
BEGIN
    -- Get restaurant ID
    SELECT restaurant_id INTO v_restaurant_id
    FROM public.voting_sessions
    WHERE id = p_session_id;

    -- Calculate category averages
    category_avgs := calculate_session_averages(p_session_id);

    -- Calculate overall average
    SELECT ROUND(AVG(value::numeric), 1) INTO overall
    FROM jsonb_each_text(category_avgs);

    -- Update session status
    UPDATE public.voting_sessions
    SET status = 'closed', closed_at = NOW()
    WHERE id = p_session_id;

    -- Update restaurant with new ratings
    UPDATE public.restaurants
    SET
        category_ratings = category_avgs,
        overall_rating = overall,
        current_session_id = p_session_id
    WHERE id = v_restaurant_id;

    RETURN jsonb_build_object(
        'category_ratings', category_avgs,
        'overall_rating', overall
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
