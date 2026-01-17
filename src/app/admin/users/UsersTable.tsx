'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
import { User } from '@/types'

interface UserWithGroups extends User {
    user_groups: { group: { id: string; name: string } }[]
}

interface UsersTableProps {
    users: UserWithGroups[]
    currentUserRole: string
}

export default function UsersTable({ users, currentUserRole }: UsersTableProps) {
    const [promoting, setPromoting] = useState<string | null>(null)
    const { showToast } = useToast()
    const router = useRouter()
    const supabase = createClient()

    const handlePromote = async (userId: string, currentRole: string) => {
        // Determine new role
        const newRole = currentRole === 'user' ? 'admin' : currentRole === 'admin' ? 'super_admin' : null

        if (!newRole) {
            showToast('warning', 'Già super admin', 'Questo utente ha già il ruolo massimo')
            return
        }

        const confirmed = confirm(
            `Sei sicuro di voler promuovere questo utente a "${newRole === 'admin' ? 'Admin' : 'Super Admin'}"?`
        )

        if (!confirmed) return

        setPromoting(userId)

        try {
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId)

            if (error) {
                showToast('error', 'Errore', error.message)
            } else {
                showToast('success', 'Promosso!', `Utente promosso a ${newRole}`)
                router.refresh()
            }
        } catch (err) {
            showToast('error', 'Errore', 'Qualcosa è andato storto')
        } finally {
            setPromoting(null)
        }
    }

    const getRoleLabel = (role: string) => {
        if (role === 'super_admin') return 'Super Admin'
        if (role === 'admin') return 'Admin'
        return 'Utente'
    }

    const getRoleBadgeClass = (role: string) => {
        if (role === 'super_admin') return 'bg-purple-100 text-purple-700'
        if (role === 'admin') return 'bg-blue-100 text-blue-700'
        return 'bg-stone-100 text-stone-700'
    }

    const canPromote = (role: string) => {
        return role !== 'super_admin' && currentUserRole === 'super_admin'
    }

    return (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                    <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                Nome
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                Ruolo
                            </th>
                            <th className="text-right px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                Azioni
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-stone-500">
                                    <p className="text-4xl mb-2">👥</p>
                                    <p>Nessun utente trovato</p>
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-stone-50">
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-stone-900">{user.name || 'N/A'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-stone-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(user.role)}`}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            {canPromote(user.role) && (
                                                <button
                                                    onClick={() => handlePromote(user.id, user.role)}
                                                    disabled={promoting === user.id}
                                                    className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {promoting === user.id ? '...' : 'Promuovi'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
