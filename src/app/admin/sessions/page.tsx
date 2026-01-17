import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SessionsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get all session_voters entries for this user
    const { data: myVoterEntries } = await supabase
        .from('session_voters')
        .select('session_id, has_voted')
        .eq('user_id', user.id)

    const mySessionIds = myVoterEntries?.map(v => v.session_id) || []

    // Get all sessions where user is invited
    let openSessions: any[] = []
    let closedSessions: any[] = []

    if (mySessionIds.length > 0) {
        // Get session details
        const { data: sessions } = await supabase
            .from('voting_sessions')
            .select('*')
            .in('id', mySessionIds)
            .order('created_at', { ascending: false })

        if (sessions) {
            // Get restaurant names
            const restaurantIds = [...new Set(sessions.map(s => s.restaurant_id))]
            const { data: restaurants } = await supabase
                .from('restaurants')
                .select('id, name, category')
                .in('id', restaurantIds)

            // Get vote counts for each session
            const { data: allVoters } = await supabase
                .from('session_voters')
                .select('session_id, has_voted')
                .in('session_id', mySessionIds)

            // Process sessions
            sessions.forEach(session => {
                const restaurant = restaurants?.find(r => r.id === session.restaurant_id)
                const sessionVoters = allVoters?.filter(v => v.session_id === session.id) || []
                const votedCount = sessionVoters.filter(v => v.has_voted).length
                const totalVoters = sessionVoters.length
                const myVote = myVoterEntries?.find(v => v.session_id === session.id)

                const enrichedSession = {
                    ...session,
                    restaurant_name: restaurant?.name || 'Ristorante',
                    restaurant_category: restaurant?.category || '',
                    voted_count: votedCount,
                    total_voters: totalVoters,
                    has_voted: myVote?.has_voted || false,
                    is_owner: session.owner_id === user.id
                }

                if (session.status === 'open') {
                    openSessions.push(enrichedSession)
                } else {
                    closedSessions.push(enrichedSession)
                }
            })
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">Sessioni di Voto</h1>
                    <p className="text-stone-500 mt-1">Gestisci le votazioni dei ristoranti</p>
                </div>
                <a
                    href="/admin/sessions/new"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    + Nuova Sessione
                </a>
            </div>

            {/* Sessions to vote - OPEN sessions where user is invited */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-200 bg-orange-50">
                    <h2 className="font-semibold text-stone-900 flex items-center gap-2">
                        🗳️ Da Votare
                    </h2>
                </div>

                {openSessions.length > 0 ? (
                    <div className="divide-y divide-stone-100">
                        {openSessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between px-6 py-4"
                            >
                                <div className="flex-1">
                                    <p className="font-medium text-stone-900">
                                        {session.restaurant_name}
                                        {session.is_owner && (
                                            <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">
                                                Owner
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-sm text-stone-500">
                                        {session.restaurant_category} • {session.voted_count}/{session.total_voters} voti
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {session.has_voted ? (
                                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                            ✓ Votato
                                        </span>
                                    ) : (
                                        <a
                                            href={`/admin/sessions/${session.id}/vote`}
                                            className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full hover:bg-orange-200 transition-colors"
                                        >
                                            Vota →
                                        </a>
                                    )}
                                    {session.is_owner && (
                                        <a
                                            href={`/admin/sessions/${session.id}`}
                                            className="text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
                                        >
                                            Gestisci
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-6 py-8 text-center text-stone-500">
                        <p>Nessuna sessione aperta per te</p>
                    </div>
                )}
            </div>

            {/* Closed sessions - sessions user participated in */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-200">
                    <h2 className="font-semibold text-stone-900 flex items-center gap-2">
                        📋 Sessioni Concluse
                    </h2>
                </div>

                {closedSessions.length > 0 ? (
                    <div className="divide-y divide-stone-100">
                        {closedSessions.map((session) => (
                            <a
                                key={session.id}
                                href={`/admin/sessions/${session.id}`}
                                className="flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-colors"
                            >
                                <div>
                                    <p className="font-medium text-stone-900">
                                        {session.restaurant_name}
                                    </p>
                                    <p className="text-sm text-stone-500">
                                        {session.restaurant_category} • {session.voted_count} voti raccolti
                                    </p>
                                </div>
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                    Conclusa
                                </span>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="px-6 py-8 text-center text-stone-500">
                        <p>Nessuna sessione conclusa</p>
                    </div>
                )}
            </div>
        </div>
    )
}
