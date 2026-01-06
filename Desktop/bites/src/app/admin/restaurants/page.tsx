import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RestaurantListClient from './RestaurantListClient'

export const dynamic = 'force-dynamic'

export default async function RestaurantsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get all restaurants
    const { data: restaurants } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">Ristoranti</h1>
                    <p className="text-stone-500 mt-1">{restaurants?.length || 0} ristoranti totali</p>
                </div>
                <a
                    href="/admin/restaurants/new"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/25 transition-all font-medium"
                >
                    <span className="text-lg">+</span>
                    Nuovo Ristorante
                </a>
            </div>

            <RestaurantListClient restaurants={restaurants || []} />
        </div>
    )
}
