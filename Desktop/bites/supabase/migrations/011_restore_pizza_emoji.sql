-- Restore pizza emoji for Pizza category

UPDATE restaurant_categories 
SET icon = '🍕' 
WHERE name = 'Pizza';
