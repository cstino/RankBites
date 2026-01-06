import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewUserForm from './NewUserForm'

export const dynamic = 'force-dynamic'

export default async function NewUserPage() {
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

    // Get all groups for assignment
    const { data: groups } = await supabase
        .from('groups')
        .select('*')
        .order('name')

    return (
        <div className="max-w-2xl">
            <div className="mb-6">
                <a
                    href="/admin/users"
                    className="text-stone-500 hover:text-stone-700 text-sm flex items-center gap-1"
                >
                    ← Torna agli admin
                </a>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-6">
                <h1 className="text-xl font-bold text-stone-900 mb-6">Nuovo Admin</h1>
                <NewUserForm groups={groups || []} />
            </div>
        </div>
    )
}
