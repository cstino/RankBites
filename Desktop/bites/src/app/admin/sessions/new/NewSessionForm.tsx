'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Restaurant {
    id: string
    name: string
    category: string
}

interface Admin {
    id: string
    name: string
    email: string
}

export default function NewSessionForm({
    restaurants,
    admins,
    currentUserId,
}: {
    restaurants: Restaurant[]
    admins: Admin[]
    currentUserId: string
}) {
    const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id || '')
    const [visitDate, setVisitDate] = useState('')
    const [selectedAdmins, setSelectedAdmins] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!restaurantId) {
            setError('Seleziona un ristorante')
            setLoading(false)
            return
        }

        // Create session
        const { data: session, error: sessionError } = await supabase
            .from('voting_sessions')
            .insert({
                restaurant_id: restaurantId,
                owner_id: currentUserId,
                visit_date: visitDate || null,
                status: 'open',
            })
            .select()
            .single()

        if (sessionError) {
            setError(sessionError.message)
            setLoading(false)
            return
        }

        // Add owner as voter
        const voters = [
            { session_id: session.id, user_id: currentUserId },
            ...selectedAdmins.map((adminId) => ({
                session_id: session.id,
                user_id: adminId,
            })),
        ]

        const { error: votersError } = await supabase
            .from('session_voters')
            .insert(voters)

        if (votersError) {
            setError(votersError.message)
            setLoading(false)
            return
        }

        router.push('/admin/sessions')
        router.refresh()
    }

    const toggleAdmin = (adminId: string) => {
        setSelectedAdmins((prev) =>
            prev.includes(adminId)
                ? prev.filter((id) => id !== adminId)
                : [...prev, adminId]
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                    Ristorante
                </label>
                {restaurants.length > 0 ? (
                    <select
                        value={restaurantId}
                        onChange={(e) => setRestaurantId(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                        {restaurants.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name} ({r.category})
                            </option>
                        ))}
                    </select>
                ) : (
                    <div className="text-stone-500 text-sm">
                        <p>Nessun ristorante disponibile.</p>
                        <a href="/admin/restaurants/new" className="text-orange-500">
                            Crea prima un ristorante →
                        </a>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                    Data visita (opzionale)
                </label>
                <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                    Invita Admin ({selectedAdmins.length} selezionati)
                </label>
                <div className="border border-stone-300 rounded-lg max-h-48 overflow-y-auto">
                    {admins.length > 0 ? (
                        <div className="divide-y divide-stone-100">
                            {admins.map((admin) => (
                                <label
                                    key={admin.id}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedAdmins.includes(admin.id)}
                                        onChange={() => toggleAdmin(admin.id)}
                                        className="w-4 h-4 text-orange-500 border-stone-300 rounded focus:ring-orange-500"
                                    />
                                    <div>
                                        <p className="text-stone-900">{admin.name}</p>
                                        <p className="text-xs text-stone-500">{admin.email}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <p className="px-4 py-3 text-stone-500 text-sm">
                            Nessun altro admin disponibile
                        </p>
                    )}
                </div>
                <p className="text-xs text-stone-500 mt-1">
                    Tu sarai automaticamente aggiunto come votante
                </p>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={loading || !restaurantId}
                    className="flex-1 py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                    {loading ? 'Creazione...' : 'Crea Sessione'}
                </button>
                <a
                    href="/admin/sessions"
                    className="py-2 px-4 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-50 transition-colors"
                >
                    Annulla
                </a>
            </div>
        </form>
    )
}
