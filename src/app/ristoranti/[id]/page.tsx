import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import RestaurantDetailClient from './RestaurantDetailClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const supabase = await createClient()

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name, category, overall_rating')
        .eq('id', id)
        .single()

    if (!restaurant) {
        return { title: 'Ristorante non trovato' }
    }

    return {
        title: `${restaurant.name} - Bites`,
        description: `${restaurant.name} (${restaurant.category}) - Voto: ${restaurant.overall_rating?.toFixed(1) || 'N/A'}. Scopri la recensione completa su Bites.`,
    }
}

export default async function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single()

    if (!restaurant || !restaurant.overall_rating) {
        notFound()
    }

    // Get photos
    const { data: photos } = await supabase
        .from('restaurant_photos')
        .select('*')
        .eq('restaurant_id', id)
        .order('created_at', { ascending: false })

    return <RestaurantDetailClient restaurant={restaurant} photos={photos || []} />
}
