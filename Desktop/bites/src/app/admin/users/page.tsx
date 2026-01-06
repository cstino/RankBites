import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UsersTable from './UsersTable'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
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

    // Get all users with their groups
    const { data: users } = await supabase
        .from('users')
        .select(`
      *,
      user_groups(
        group:groups(id, name)
      )
    `)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">Gestione Admin</h1>
                    <p className="text-stone-500 mt-1">Crea e gestisci gli amministratori</p>
                </div>
                <a
                    href="/admin/users/new"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    + Nuovo Admin
                </a>
            </div>

            <UsersTable users={users || []} />
        </div>
    )
}
