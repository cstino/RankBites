import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Get counts for dashboard
    const [
        { count: openSessionsCount },
        { count: closedSessionsCount },
        { count: restaurantsCount },
    ] = await Promise.all([
        supabase.from('voting_sessions').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('voting_sessions').select('*', { count: 'exact', head: true }).eq('status', 'closed'),
        supabase.from('restaurants').select('*', { count: 'exact', head: true }),
    ])

    // Get recent open sessions
    const { data: openSessions } = await supabase
        .from('voting_sessions')
        .select(`
      *,
      restaurant:restaurants(name, category),
      owner:users(name)
    `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(5)

    // Get top rated restaurants
    const { data: topRestaurants } = await supabase
        .from('restaurants')
        .select('id, name, category, overall_rating, cover_photo_url')
        .not('overall_rating', 'is', null)
        .order('overall_rating', { ascending: false })
        .limit(5)

    return (
        <div className="space-y-6 pb-20 md:pb-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
                <p className="text-stone-500 mt-1">Panoramica delle attività</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard
                    icon="🗳️"
                    label="Sessioni Aperte"
                    value={openSessionsCount || 0}
                    color="orange"
                    href="/admin/sessions"
                />
                <StatCard
                    icon="✅"
                    label="Sessioni Chiuse"
                    value={closedSessionsCount || 0}
                    color="green"
                    href="/admin/sessions"
                />
                <StatCard
                    icon="🍕"
                    label="Ristoranti"
                    value={restaurantsCount || 0}
                    color="blue"
                    href="/admin/restaurants"
                    className="col-span-2 md:col-span-1"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <a
                    href="/admin/sessions/new"
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all"
                >
                    <span className="text-2xl">🗳️</span>
                    <div>
                        <p className="font-semibold">Nuova Sessione</p>
                        <p className="text-xs text-white/80">Avvia una votazione</p>
                    </div>
                </a>
                <a
                    href="/admin/restaurants/new"
                    className="flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-2xl hover:border-orange-300 hover:shadow-lg transition-all"
                >
                    <span className="text-2xl">🍕</span>
                    <div>
                        <p className="font-semibold text-stone-900">Nuovo Ristorante</p>
                        <p className="text-xs text-stone-500">Aggiungi locale</p>
                    </div>
                </a>
            </div>

            {/* Open Sessions */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-stone-100 flex justify-between items-center">
                    <h2 className="font-semibold text-stone-900">🗳️ Sessioni Aperte</h2>
                    <a href="/admin/sessions" className="text-sm text-orange-500 font-medium">
                        Vedi tutte →
                    </a>
                </div>

                {openSessions && openSessions.length > 0 ? (
                    <div className="divide-y divide-stone-100">
                        {openSessions.map((session: any) => (
                            <a
                                key={session.id}
                                href={`/admin/sessions/${session.id}`}
                                className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors"
                            >
                                <div className="min-w-0">
                                    <p className="font-medium text-stone-900 truncate">
                                        {session.restaurant?.name || 'Ristorante'}
                                    </p>
                                    <p className="text-sm text-stone-500 truncate">
                                        {session.restaurant?.category}
                                    </p>
                                </div>
                                <span className="flex-shrink-0 text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full font-medium">
                                    In corso
                                </span>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="px-4 py-8 text-center text-stone-500">
                        <p className="text-3xl mb-2">🍽️</p>
                        <p className="text-sm">Nessuna sessione aperta</p>
                    </div>
                )}
            </div>

            {/* Top Restaurants */}
            {topRestaurants && topRestaurants.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-stone-100 flex justify-between items-center">
                        <h2 className="font-semibold text-stone-900">🏆 Top Ristoranti</h2>
                        <a href="/admin/restaurants" className="text-sm text-orange-500 font-medium">
                            Vedi tutti →
                        </a>
                    </div>
                    <div className="divide-y divide-stone-100">
                        {topRestaurants.map((restaurant: any, index: number) => (
                            <a
                                key={restaurant.id}
                                href={`/admin/restaurants/${restaurant.id}`}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors"
                            >
                                <span className="text-lg font-bold text-stone-300 w-6">#{index + 1}</span>
                                <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0">
                                    {restaurant.cover_photo_url ? (
                                        <img
                                            src={restaurant.cover_photo_url}
                                            alt={restaurant.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">🍽️</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-stone-900 truncate">{restaurant.name}</p>
                                    <p className="text-xs text-stone-500">{restaurant.category}</p>
                                </div>
                                <div className="text-lg font-bold text-green-500">
                                    {restaurant.overall_rating?.toFixed(1)}
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function StatCard({
    icon,
    label,
    value,
    color,
    href,
    className = '',
}: {
    icon: string
    label: string
    value: number
    color: 'orange' | 'green' | 'blue'
    href: string
    className?: string
}) {
    const colorClasses = {
        orange: 'from-orange-500 to-red-500',
        green: 'from-green-500 to-emerald-500',
        blue: 'from-blue-500 to-indigo-500',
    }

    return (
        <a
            href={href}
            className={`bg-white rounded-2xl border border-stone-200 p-4 hover:shadow-lg transition-all ${className}`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg`}>
                    {icon}
                </div>
                <div>
                    <p className="text-2xl font-bold text-stone-900">{value}</p>
                    <p className="text-xs text-stone-500">{label}</p>
                </div>
            </div>
        </a>
    )
}
