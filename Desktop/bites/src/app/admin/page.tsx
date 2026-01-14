import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ReactNode } from 'react'

// Icons
const icons = {
    newSession: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
    ),
    openSession: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 13h-.68l-2 2h1.91L19 17H5l1.78-2h2.05l-2-2H6l-3 3v4c0 1.1.89 2 1.99 2H19c1.1 0 2-.89 2-2v-4l-3-3zm-1-5.05l-4.95 4.95-3.54-3.54 4.95-4.95 3.54 3.54zM13.95 3l-1.41 1.41 3.54 3.54 1.41-1.41c.78-.78.78-2.05 0-2.83l-.71-.71c-.78-.78-2.05-.78-2.83 0z" />
        </svg>
    ),
    closedSession: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
    ),
    mySessions: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
    ),
    restaurants: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
        </svg>
    ),
    newRestaurant: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
        </svg>
    ),
    users: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
    ),
    groups: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
    ),
    voteCategories: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
    ),
    restaurantCategories: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
        </svg>
    ),
}

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Get user profile to check role
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user?.id)
        .single()

    const isSuperAdmin = profile?.role === 'super_admin'

    // Get counts for dashboard
    const [
        { count: openSessionsCount },
        { count: closedSessionsCount },
        { count: mySessionsCount },
        { count: restaurantsCount },
    ] = await Promise.all([
        supabase.from('voting_sessions').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('voting_sessions').select('*', { count: 'exact', head: true }).eq('status', 'closed'),
        supabase.from('voting_sessions').select('*', { count: 'exact', head: true }).eq('owner_id', user?.id),
        supabase.from('restaurants').select('*', { count: 'exact', head: true }),
    ])

    return (
        <div className="space-y-8 pb-20 md:pb-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-stone-900">Pannello Admin</h1>
                <p className="text-stone-500 mt-1">Gestisci sessioni, ristoranti e impostazioni</p>
            </div>

            {/* Sessions Section */}
            <section>
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                        {icons.openSession}
                    </span>
                    Sessioni
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <AdminCard
                        href="/admin/sessions/new"
                        icon={icons.newSession}
                        title="Nuova Sessione"
                        description="Avvia una votazione"
                        color="orange"
                        highlight
                    />
                    <AdminCard
                        href="/admin/sessions?status=open"
                        icon={icons.openSession}
                        title="Sessioni Aperte"
                        description={`${openSessionsCount || 0} in corso`}
                        color="green"
                    />
                    <AdminCard
                        href="/admin/sessions?status=closed"
                        icon={icons.closedSession}
                        title="Sessioni Chiuse"
                        description={`${closedSessionsCount || 0} completate`}
                        color="blue"
                    />
                    <AdminCard
                        href="/admin/sessions?owner=me"
                        icon={icons.mySessions}
                        title="Le Mie Sessioni"
                        description={`${mySessionsCount || 0} sessioni`}
                        color="purple"
                    />
                </div>
            </section>

            {/* Restaurants Section */}
            <section>
                <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        {icons.restaurants}
                    </span>
                    Ristoranti
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <AdminCard
                        href="/admin/restaurants"
                        icon={icons.restaurants}
                        title="Ristoranti"
                        description={`${restaurantsCount || 0} locali`}
                        color="blue"
                    />
                    <AdminCard
                        href="/admin/restaurants/new"
                        icon={icons.newRestaurant}
                        title="Nuovo Ristorante"
                        description="Aggiungi locale"
                        color="teal"
                        highlight
                    />
                </div>
            </section>

            {/* Super Admin Section */}
            {isSuperAdmin && (
                <section>
                    <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                            </svg>
                        </span>
                        Super Admin
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <AdminCard
                            href="/admin/users"
                            icon={icons.users}
                            title="Gestione Admin"
                            description="Utenti e ruoli"
                            color="red"
                        />
                        <AdminCard
                            href="/admin/groups"
                            icon={icons.groups}
                            title="Gruppi"
                            description="Gestione gruppi"
                            color="amber"
                        />
                        <AdminCard
                            href="/admin/categories"
                            icon={icons.voteCategories}
                            title="Categorie Voto"
                            description="Location, Menu..."
                            color="pink"
                        />
                        <AdminCard
                            href="/admin/categories"
                            icon={icons.restaurantCategories}
                            title="Tipi Ristorante"
                            description="Pizzeria, Sushi..."
                            color="indigo"
                        />
                    </div>
                </section>
            )}
        </div>
    )
}

function AdminCard({
    href,
    icon,
    title,
    description,
    color,
    highlight = false,
}: {
    href: string
    icon: ReactNode
    title: string
    description: string
    color: 'orange' | 'green' | 'blue' | 'purple' | 'teal' | 'red' | 'amber' | 'pink' | 'indigo'
    highlight?: boolean
}) {
    const colorClasses = {
        orange: { bg: 'bg-orange-100', text: 'text-orange-600', gradient: 'from-orange-500 to-red-500' },
        green: { bg: 'bg-green-100', text: 'text-green-600', gradient: 'from-green-500 to-emerald-500' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-600', gradient: 'from-blue-500 to-indigo-500' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-600', gradient: 'from-purple-500 to-violet-500' },
        teal: { bg: 'bg-teal-100', text: 'text-teal-600', gradient: 'from-teal-500 to-cyan-500' },
        red: { bg: 'bg-red-100', text: 'text-red-600', gradient: 'from-red-500 to-rose-500' },
        amber: { bg: 'bg-amber-100', text: 'text-amber-600', gradient: 'from-amber-500 to-yellow-500' },
        pink: { bg: 'bg-pink-100', text: 'text-pink-600', gradient: 'from-pink-500 to-rose-500' },
        indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', gradient: 'from-indigo-500 to-violet-500' },
    }

    const colors = colorClasses[color]

    if (highlight) {
        return (
            <Link
                href={href}
                className={`p-4 rounded-2xl bg-gradient-to-r ${colors.gradient} text-white shadow-lg hover:shadow-xl transition-all`}
            >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                    {icon}
                </div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-white/80">{description}</p>
            </Link>
        )
    }

    return (
        <Link
            href={href}
            className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all"
        >
            <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <p className="font-semibold text-stone-900">{title}</p>
            <p className="text-sm text-stone-500">{description}</p>
        </Link>
    )
}
