-- =============================================
-- USER FAVORITES TABLE
-- =============================================
CREATE TABLE public.user_favorites (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, restaurant_id)
);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own favorites" ON public.user_favorites
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites" ON public.user_favorites
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their favorites" ON public.user_favorites
    FOR DELETE USING (user_id = auth.uid());

-- Index for faster lookups
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_restaurant_id ON public.user_favorites(restaurant_id);
