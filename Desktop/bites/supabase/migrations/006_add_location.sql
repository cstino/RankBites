-- Add location columns to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS zone TEXT;

-- Create index for city/zone filtering
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_zone ON restaurants(zone);

-- Function to calculate distance between two points (in km)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lon1 DECIMAL,
    lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    R DECIMAL := 6371; -- Earth's radius in km
    dLat DECIMAL;
    dLon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dLat := radians(lat2 - lat1);
    dLon := radians(lon2 - lon1);
    a := sin(dLat/2) * sin(dLat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon/2) * sin(dLon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- Function to get restaurants sorted by distance
CREATE OR REPLACE FUNCTION get_nearby_restaurants(
    user_lat DECIMAL,
    user_lon DECIMAL,
    max_distance_km DECIMAL DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    category TEXT,
    address TEXT,
    overall_rating DECIMAL,
    cover_photo_url TEXT,
    ai_review TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    city TEXT,
    zone TEXT,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.name,
        r.category,
        r.address,
        r.overall_rating,
        r.cover_photo_url,
        r.ai_review,
        r.latitude,
        r.longitude,
        r.city,
        r.zone,
        calculate_distance(user_lat, user_lon, r.latitude, r.longitude) AS distance_km
    FROM restaurants r
    WHERE r.overall_rating IS NOT NULL
      AND r.latitude IS NOT NULL 
      AND r.longitude IS NOT NULL
      AND calculate_distance(user_lat, user_lon, r.latitude, r.longitude) <= max_distance_km
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;
