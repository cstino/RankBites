'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
import { User } from '@/types'

interface PromoteUserFormProps {
    users: User[]
}

export default function PromoteUserForm({ users }: PromoteUserFormProps) {
    const [selectedUserId, setSelectedUserId] = useState('')
    const [targetRole, setTargetRole] = useState<'admin' | 'super_admin'>('admin')
    const [loading, setLoading] = useState(false)
    const { showToast } = useToast()
    const router = useRouter()
    const supabase = createClient()

    // Filter only promotable users (not already super_admin)
    const promotableUsers = users.filter(u => u.role !== 'super_admin')

    const handlePromote = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedUserId) {
            showToast('warning', 'Utente non selezionato', 'Seleziona un utente da promuovere')
            return
        }

        const user = users.find(u => u.id === selectedUserId)
        if (!user) return

        const confirmed = confirm(
            `Sei sicuro di voler promuovere "${user.name || user.email}" a ${targetRole === 'admin' ? 'Admin' : 'Super Admin'}?`
        )

        if (!confirmed) return

        setLoading(true)

        try {
            const { error } = await supabase
                .from('users')
                .update({ role: targetRole })
                .eq('id', selectedUserId)

            if (error) {
                showToast('error', 'Errore', error.message)
            } else {
                showToast('success', 'Promosso!', `${user.name || user.email} è ora ${targetRole}`)
                setSelectedUserId('')
                setTargetRole('admin')
                router.refresh()
            }
        } catch (err) {
            showToast('error', 'Errore', 'Qualcosa è andato storto')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Promuovi Utente ad Admin</h3>
            <form onSubmit={handlePromote} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                        Seleziona Utente
                    </label>
                    <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="">Seleziona un utente...</option>
                        {promotableUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name || 'N/A'} ({user.email}) - {user.role === 'admin' ? 'Admin' : 'Utente'}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                        Nuovo Ruolo
                    </label>
                    <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value as 'admin' | 'super_admin')}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading || !selectedUserId}
                    className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Promozione in corso...' : 'Promuovi Utente'}
                </button>
            </form>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>💡 Info:</strong> Puoi promuovere solo utenti che non sono già Super Admin.
                    La promozione è immediata.
                </p>
            </div>
        </div>
    )
}

