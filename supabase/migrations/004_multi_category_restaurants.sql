-- Migration: Multi-category support for restaurants
-- This migration:
-- 1. Creates a restaurant_categories table to store available categories with icons
-- 2. Changes restaurants.category from TEXT to TEXT[] (array)

-- Step 1: Create restaurant_categories table
CREATE TABLE IF NOT EXISTS restaurant_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT '🍽️',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE restaurant_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read categories
CREATE POLICY "Anyone can read restaurant categories"
    ON restaurant_categories FOR SELECT
    TO authenticated, anon
    USING (true);

-- Only super_admin can modify categories
CREATE POLICY "Super admins can manage restaurant categories"
    ON restaurant_categories FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- Step 2: Seed with initial categories
INSERT INTO restaurant_categories (name, icon) VALUES
    ('Pizzeria', '🍕'),
    ('Ristorante Italiano', '🍝'),
    ('Sushi', '🍣'),
    ('Steakhouse', '🥩'),
    ('Pub', '🍺'),
    ('Fine Dining', '🍷'),
    ('Fast Food', '🍔'),
    ('Trattoria', '🍲'),
    ('Paninoteca', '🥪'),
    ('Pesce', '🐟'),
    ('Carne', '🍖'),
    ('Vegetariano', '🥗'),
    ('Cinese', '🥡'),
    ('Messicano', '🌮'),
    ('Indiano', '🍛'),
    ('Altro', '🍽️')
ON CONFLICT (name) DO NOTHING;

-- Step 3: Convert category column from TEXT to TEXT[]
-- First, rename the old column
ALTER TABLE restaurants RENAME COLUMN category TO category_old;

-- Add new array column
ALTER TABLE restaurants ADD COLUMN category TEXT[] DEFAULT ARRAY['Altro'];

-- Migrate existing data (single category becomes array with one element)
UPDATE restaurants SET category = ARRAY[category_old] WHERE category_old IS NOT NULL;

-- Drop old column
ALTER TABLE restaurants DROP COLUMN category_old;
