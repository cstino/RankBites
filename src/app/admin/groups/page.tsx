import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GroupsTable from './GroupsTable'

export const dynamic = 'force-dynamic'

export default async function GroupsPage() {
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

    // Get all groups with member count
    const { data: groups } = await supabase
        .from('groups')
        .select(`
      *,
      user_groups(count)
    `)
        .order('name')

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">Gruppi</h1>
                    <p className="text-stone-500 mt-1">Organizza gli admin in gruppi</p>
                </div>
                <a
                    href="/admin/groups/new"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    + Nuovo Gruppo
                </a>
            </div>

            <GroupsTable groups={groups || []} />
        </div>
    )
}
