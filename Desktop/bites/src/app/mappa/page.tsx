import { createClient } from '@/lib/supabase/server'
import MapClient from './MapClient'

export const dynamic = 'force-dynamic'

export default async function MapPage() {
    const supabase = await createClient()

    const { data: restaurants } = await supabase
        .from('restaurants')
        .select('id, name, category, address, overall_rating, cover_photo_url, latitude, longitude')
        .not('overall_rating', 'is', null)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('overall_rating', { ascending: false })

    return <MapClient restaurants={restaurants || []} />
}
