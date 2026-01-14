import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RestaurantCategoriesTable from './RestaurantCategoriesTable'

export const dynamic = 'force-dynamic'

export default async function RestaurantCategoriesPage() {
    const supabase = await createClient()

    // Check if user is super_admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'super_admin') {
        redirect('/admin')
    }

    // Get unique restaurant categories from restaurants table
    const { data: restaurants } = await supabase
        .from('restaurants')
        .select('category')

    // Extract unique categories
    const categoriesSet = new Set(restaurants?.map(r => r.category).filter(Boolean) || [])
    const categories = Array.from(categoriesSet).sort()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">Tipi di Ristorante</h1>
                    <p className="text-stone-500 mt-1">Gestisci le categorie dei ristoranti (Pizzeria, Sushi, ecc.)</p>
                </div>
            </div>

            <RestaurantCategoriesTable categories={categories} />
        </div>
    )
}
