import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewSessionForm from './NewSessionForm'

export const dynamic = 'force-dynamic'

export default async function NewSessionPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get all restaurants
    const { data: restaurants } = await supabase
        .from('restaurants')
        .select('id, name, category')
        .order('name')

    // Get all admins (excluding current user)
    const { data: admins } = await supabase
        .from('users')
        .select('id, name, email')
        .neq('id', user.id)
        .order('name')

    return (
        <div className="max-w-2xl w-full overflow-hidden">
            <div className="mb-6">
                <a
                    href="/admin/sessions"
                    className="text-stone-500 hover:text-stone-700 text-sm flex items-center gap-1"
                >
                    ← Torna alle sessioni
                </a>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-6 overflow-hidden">
                <h1 className="text-xl font-bold text-stone-900 mb-6">Nuova Sessione di Voto</h1>
                <NewSessionForm
                    restaurants={restaurants || []}
                    admins={admins || []}
                    currentUserId={user.id}
                />
            </div>
        </div>
    )
}
