-- Rename category "Pizzeria" to "Pizza"

-- Update in restaurant_categories table
UPDATE restaurant_categories 
SET name = 'Pizza' 
WHERE LOWER(name) IN ('pizzeria', 'pizza');

-- Update in restaurants.category arrays
UPDATE restaurants
SET category = array_replace(category, 'Pizzeria', 'Pizza')
WHERE 'Pizzeria' = ANY(category);

-- Also handle lowercase variants
UPDATE restaurants
SET category = array_replace(category, 'pizzeria', 'Pizza')
WHERE 'pizzeria' = ANY(category);
