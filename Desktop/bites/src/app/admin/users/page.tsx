import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UsersTable from './UsersTable'
import AdminInviteForm from './AdminInviteForm'
import PromoteUserForm from './PromoteUserForm'

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

    // Get all users (not just admins - show all to allow promotion)
    const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

    // Get pending invites
    const { data: pendingInvites } = await supabase
        .from('admin_invites')
        .select('*')
        .is('used_at', null)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-stone-900">Gestione Admin</h1>
                <p className="text-stone-500 mt-1">Promuovi utenti ad admin e invia inviti</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Invite Form */}
                <AdminInviteForm />

                {/* Promote User Form */}
                <PromoteUserForm users={users || []} />
            </div>

            {/* Pending Invites */}
            {pendingInvites && pendingInvites.length > 0 && (
                <div className="bg-white rounded-xl border border-stone-200 p-6">
                    <h3 className="text-lg font-semibold text-stone-900 mb-4">
                        Inviti Pendenti ({pendingInvites.length})
                    </h3>
                    <div className="space-y-2">
                        {pendingInvites.map((invite) => (
                            <div key={invite.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-stone-900">{invite.email}</p>
                                    <p className="text-xs text-stone-500 capitalize">{invite.role.replace('_', ' ')}</p>
                                </div>
                                <span className="text-xs text-orange-600 font-medium">Pendente</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Users Table */}
            <UsersTable users={users || []} currentUserRole={profile?.role || 'admin'} />
        </div>
    )
}
