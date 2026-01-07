'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useToast } from '@/components/ui/Toast'

interface SessionDetailProps {
    session: any
    isOwner: boolean
    currentUserId: string
    votes: any[] | null
    categoryAverages: { id: string; name: string; average: number }[] | null
}

export default function SessionDetail({
    session,
    isOwner,
    currentUserId,
    votes,
    categoryAverages,
}: SessionDetailProps) {
    const [closing, setClosing] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const { showToast } = useToast()

    const handleCloseSession = async () => {
        if (!confirm('Sei sicuro di voler chiudere questa sessione? I voti saranno visibili a tutti.')) return

        setClosing(true)

        // Call the close API which also generates AI review
        const response = await fetch(`/api/sessions/${session.id}/close`, {
            method: 'POST',
        })

        if (!response.ok) {
            const data = await response.json()
            showToast('error', 'Errore!', 'Errore durante la chiusura: ' + (data.error || 'Errore sconosciuto'))
            setClosing(false)
            return
        }

        showToast('success', 'Sessione chiusa!', 'I voti sono ora visibili a tutti.')
        router.refresh()
    }

    const votedCount = session.session_voters?.filter((v: any) => v.has_voted).length || 0
    const totalVoters = session.session_voters?.length || 0

    return (
        <div className="max-w-3xl space-y-6">
            <div className="mb-6">
                <a
                    href="/admin/sessions"
                    className="text-stone-500 hover:text-stone-700 text-sm flex items-center gap-1"
                >
                    ← Torna alle sessioni
                </a>
            </div>

            {/* Session Header */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900">
                            {session.restaurant?.name}
                        </h1>
                        <p className="text-stone-500 mt-1">
                            {session.restaurant?.category} • {session.restaurant?.address}
                        </p>
                        {session.visit_date && (
                            <p className="text-sm text-stone-400 mt-2">
                                Visita del {new Date(session.visit_date).toLocaleDateString('it-IT')}
                            </p>
                        )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${session.status === 'open'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-green-100 text-green-600'
                        }`}>
                        {session.status === 'open' ? 'In corso' : 'Chiusa'}
                    </span>
                </div>

                {session.restaurant?.maps_link && (
                    <a
                        href={session.restaurant.maps_link.startsWith('http')
                            ? session.restaurant.maps_link
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(session.restaurant.maps_link)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-4 text-sm text-orange-500 hover:text-orange-600"
                    >
                        📍 Apri su Google Maps
                    </a>
                )}
            </div>

            {/* Voters Status */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
                <h2 className="font-semibold text-stone-900 mb-4">
                    Stato Votazioni ({votedCount}/{totalVoters})
                </h2>
                <div className="space-y-2">
                    {session.session_voters?.map((voter: any) => (
                        <div
                            key={voter.id}
                            className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-stone-900">{voter.user?.name}</span>
                                {voter.user_id === session.owner_id && (
                                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">
                                        Owner
                                    </span>
                                )}
                            </div>
                            {voter.has_voted ? (
                                <span className="text-green-500 text-sm">✓ Votato</span>
                            ) : (
                                <span className="text-stone-400 text-sm">In attesa</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Close Session Button (only for owner of open session) */}
                {isOwner && session.status === 'open' && (
                    <button
                        onClick={handleCloseSession}
                        disabled={closing}
                        className="w-full mt-6 py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {closing ? 'Chiusura in corso...' : '🔒 Chiudi Sessione e Rivela Voti'}
                    </button>
                )}
            </div>

            {/* Results (only if closed) */}
            {session.status === 'closed' && categoryAverages && (
                <div className="bg-white rounded-xl border border-stone-200 p-6">
                    <h2 className="font-semibold text-stone-900 mb-4">Risultati</h2>

                    {/* Category Averages */}
                    <div className="space-y-4 mb-6">
                        {categoryAverages.map((cat) => (
                            <div key={cat.id} className="flex items-center gap-4">
                                <span className="w-24 text-stone-600">{cat.name}</span>
                                <div className="flex-1 bg-stone-100 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${cat.average >= 8 ? 'bg-green-500' :
                                            cat.average >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${cat.average * 10}%` }}
                                    />
                                </div>
                                <span className="w-12 text-right font-bold text-stone-900">
                                    {cat.average.toFixed(1)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Overall Rating */}
                    {session.restaurant?.overall_rating && (
                        <div className="text-center pt-4 border-t border-stone-200">
                            <p className="text-stone-500 text-sm">Voto Complessivo</p>
                            <p className="text-4xl font-bold text-orange-500">
                                {session.restaurant.overall_rating.toFixed(1)}
                            </p>
                        </div>
                    )}

                    {/* AI Review */}
                    {session.restaurant?.ai_review && (
                        <div className="mt-6 p-4 bg-stone-50 rounded-lg">
                            <p className="text-sm font-medium text-stone-700 mb-2">🤖 Mini-review IA</p>
                            <p className="text-stone-600">{session.restaurant.ai_review}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
