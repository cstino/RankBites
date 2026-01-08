import { createClient } from '@/lib/supabase/server'
import { ReactNode } from 'react'

// Icone SVG Material Design
const icons = {
    sessions: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 13h-.68l-2 2h1.91L19 17H5l1.78-2h2.05l-2-2H6l-3 3v4c0 1.1.89 2 1.99 2H19c1.1 0 2-.89 2-2v-4l-3-3zm-1-5.05l-4.95 4.95-3.54-3.54 4.95-4.95 3.54 3.54zM13.95 3l-1.41 1.41 3.54 3.54 1.41-1.41c.78-.78.78-2.05 0-2.83l-.71-.71c-.78-.78-2.05-.78-2.83 0z" />
        </svg>
    ),
    check: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
    ),
    restaurants: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
        </svg>
    ),
    trophy: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
        </svg>
    ),
    plate: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
        </svg>
    ),
}

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
                    icon={icons.sessions}
                    label="Sessioni Aperte"
                    value={openSessionsCount || 0}
                    color="orange"
                    href="/admin/sessions"
                />
                <StatCard
                    icon={icons.check}
                    label="Sessioni Chiuse"
                    value={closedSessionsCount || 0}
                    color="green"
                    href="/admin/sessions"
                />
                <StatCard
                    icon={icons.restaurants}
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
                    <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        {icons.sessions}
                    </span>
                    <div>
                        <p className="font-semibold">Nuova Sessione</p>
                        <p className="text-xs text-white/80">Avvia una votazione</p>
                    </div>
                </a>
                <a
                    href="/admin/restaurants/new"
                    className="flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-2xl hover:border-orange-300 hover:shadow-lg transition-all"
                >
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center">
                        {icons.restaurants}
                    </span>
                    <div>
                        <p className="font-semibold text-stone-900">Nuovo Ristorante</p>
                        <p className="text-xs text-stone-500">Aggiungi locale</p>
                    </div>
                </a>
            </div>

            {/* Open Sessions */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-stone-100 flex justify-between items-center">
                    <h2 className="font-semibold text-stone-900 flex items-center gap-2">
                        <span className="text-orange-500">{icons.sessions}</span>
                        Sessioni Aperte
                    </h2>
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
                        <span className="text-3xl mb-2 block text-stone-300">{icons.plate}</span>
                        <p className="text-sm">Nessuna sessione aperta</p>
                    </div>
                )}
            </div>

            {/* Top Restaurants */}
            {topRestaurants && topRestaurants.length > 0 && (
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-stone-100 flex justify-between items-center">
                        <h2 className="font-semibold text-stone-900 flex items-center gap-2">
                            <span className="text-amber-500">{icons.trophy}</span>
                            Top Ristoranti
                        </h2>
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
                                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                                            {icons.restaurants}
                                        </div>
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
    icon: ReactNode
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
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg`}>
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

