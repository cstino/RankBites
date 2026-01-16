'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'

export default function AdminInviteForm() {
    const [email, setEmail] = useState('')
    const [role, setRole] = useState<'admin' | 'super_admin'>('admin')
    const [loading, setLoading] = useState(false)
    const { showToast } = useToast()
    const router = useRouter()
    const supabase = createClient()

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email.trim()) {
            showToast('warning', 'Email mancante', 'Inserisci un indirizzo email')
            return
        }

        setLoading(true)

        try {
            // Get current user to set invited_by
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                showToast('error', 'Errore', 'Devi essere loggato')
                return
            }

            // Create invite
            const { error } = await supabase
                .from('admin_invites')
                .insert({
                    email: email.toLowerCase().trim(),
                    role,
                    invited_by: user.id
                })

            if (error) {
                if (error.code === '23505') { // Unique violation
                    showToast('warning', 'Invito esistente', 'Questa email ha già un invito pendente')
                } else {
                    showToast('error', 'Errore', error.message)
                }
            } else {
                showToast('success', 'Invito creato!', `Invito per ${email} salvato nel database`)
                setEmail('')
                setRole('admin')
                router.refresh()
            }
        } catch (err) {
            showToast('error', 'Errore', 'Qualcosa èandato storto')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Invita Nuovo Admin</h3>
            <form onSubmit={handleInvite} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                        Ruolo
                    </label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'admin' | 'super_admin')}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Invio in corso...' : 'Invia Invito'}
                </button>
            </form>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                    <strong>⚠️ Email non configurate:</strong> L'invito viene salvato ma l'email non viene inviata.
                    L'utente verrà promosso automaticamente quando si registrerà con l'email invitata.
                </p>
            </div>
        </div>
    )
}
