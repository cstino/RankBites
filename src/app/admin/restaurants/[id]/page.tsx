import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import CoverPhotoEditor from './CoverPhotoEditor'

export const dynamic = 'force-dynamic'

export default async function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get restaurant
    const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single()

    if (!restaurant) {
        notFound()
    }

    // Get photos
    const { data: photos } = await supabase
        .from('restaurant_photos')
        .select('*')
        .eq('restaurant_id', id)
        .order('created_at', { ascending: false })

    // Get voting sessions for this restaurant
    const { data: sessions } = await supabase
        .from('voting_sessions')
        .select('*')
        .eq('restaurant_id', id)
        .order('created_at', { ascending: false })

    const getRatingColor = (rating: number) => {
        if (rating >= 8) return 'text-green-500'
        if (rating >= 6) return 'text-yellow-500'
        return 'text-red-500'
    }

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <a
                    href="/admin/restaurants"
                    className="text-stone-500 hover:text-stone-700 text-sm flex items-center gap-1"
                >
                    ← Torna ai ristoranti
                </a>
            </div>

            {/* Restaurant Header */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
                <div className="flex items-start gap-6">
                    <CoverPhotoEditor
                        restaurantId={restaurant.id}
                        currentPhotoUrl={restaurant.cover_photo_url}
                    />
                    <div className="flex-1">
                        <span className="text-sm text-orange-500 font-medium">{restaurant.category}</span>
                        <h1 className="text-2xl font-bold text-stone-900 mt-1">{restaurant.name}</h1>
                        <p className="text-stone-500 mt-1">📍 {restaurant.address || restaurant.city || 'Indirizzo non specificato'}</p>
                        {restaurant.maps_link && (
                            <a
                                href={restaurant.maps_link.startsWith('http')
                                    ? restaurant.maps_link
                                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.maps_link)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-2 text-sm text-orange-500 hover:text-orange-600"
                            >
                                📍 Apri su Google Maps →
                            </a>
                        )}
                    </div>
                    {restaurant.overall_rating && (
                        <div className="text-center bg-stone-50 rounded-xl p-4">
                            <p className={`text-4xl font-bold ${getRatingColor(restaurant.overall_rating)}`}>
                                {restaurant.overall_rating.toFixed(1)}
                            </p>
                            <p className="text-xs text-stone-500 mt-1">Voto Medio</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Category Ratings */}
            {restaurant.category_ratings && Object.keys(restaurant.category_ratings).length > 0 && (
                <div className="bg-white rounded-xl border border-stone-200 p-6">
                    <h2 className="font-semibold text-stone-900 mb-4">📊 Valutazioni per categoria</h2>
                    <div className="space-y-3">
                        {Object.entries(restaurant.category_ratings).map(([name, score]) => (
                            <div key={name} className="flex items-center gap-4">
                                <span className="w-24 text-stone-600 text-sm">{name}</span>
                                <div className="flex-1 bg-stone-100 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${(score as number) >= 8 ? 'bg-green-500' :
                                            (score as number) >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${(score as number) * 10}%` }}
                                    />
                                </div>
                                <span className={`w-10 text-right font-bold ${getRatingColor(score as number)}`}>
                                    {(score as number).toFixed(1)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Review */}
            {restaurant.ai_review && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                    <p className="text-sm font-medium text-orange-700 mb-2 flex items-center gap-2">
                        <span>✨</span> Mini-review IA
                    </p>
                    <p className="text-stone-700 leading-relaxed">{restaurant.ai_review}</p>
                </div>
            )}

            {/* Photo Gallery */}
            {photos && photos.length > 0 && (
                <div className="bg-white rounded-xl border border-stone-200 p-6">
                    <h2 className="font-semibold text-stone-900 mb-4">📸 Foto ({photos.length})</h2>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {photos.map((photo: any) => (
                            <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-stone-100">
                                <img
                                    src={photo.photo_url}
                                    alt={restaurant.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Voting Sessions */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
                <h2 className="font-semibold text-stone-900 mb-4">🗳️ Sessioni di voto</h2>
                {sessions && sessions.length > 0 ? (
                    <div className="space-y-2">
                        {sessions.map((session: any) => (
                            <a
                                key={session.id}
                                href={`/admin/sessions/${session.id}`}
                                className="flex items-center justify-between px-4 py-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
                            >
                                <div>
                                    <p className="text-sm font-medium text-stone-900">
                                        Visita del {new Date(session.visit_date).toLocaleDateString('it-IT')}
                                    </p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${session.status === 'open'
                                    ? 'bg-orange-100 text-orange-600'
                                    : 'bg-green-100 text-green-600'
                                    }`}>
                                    {session.status === 'open' ? 'In corso' : 'Conclusa'}
                                </span>
                            </a>
                        ))}
                    </div>
                ) : (
                    <p className="text-stone-500 text-sm">Nessuna sessione di voto ancora</p>
                )}
            </div>
        </div>
    )
}
