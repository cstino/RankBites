import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CategoriesTable from './CategoriesTable'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
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

    // Get all categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('order')

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">Categorie di Valutazione</h1>
                    <p className="text-stone-500 mt-1">Gestisci le categorie per i voti</p>
                </div>
                <a
                    href="/admin/categories/new"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    + Nuova Categoria
                </a>
            </div>

            <CategoriesTable categories={categories || []} />
        </div>
    )
}
