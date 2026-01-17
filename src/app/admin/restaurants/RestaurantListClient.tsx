'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Restaurant {
    id: string
    name: string
    category: string
    address: string
    overall_rating: number | null
    cover_photo_url: string | null
    city: string | null
}

interface RestaurantListClientProps {
    restaurants: Restaurant[]
}

export default function RestaurantListClient({ restaurants: initialRestaurants }: RestaurantListClientProps) {
    const [restaurants, setRestaurants] = useState(initialRestaurants)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [search, setSearch] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const filteredRestaurants = restaurants.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.category.toLowerCase().includes(search.toLowerCase()) ||
        r.city?.toLowerCase().includes(search.toLowerCase())
    )

    const handleDelete = async () => {
        if (!deleteId) return
        setDeleting(true)

        const { error } = await supabase
            .from('restaurants')
            .delete()
            .eq('id', deleteId)

        if (!error) {
            setRestaurants(restaurants.filter(r => r.id !== deleteId))
        }

        setDeleting(false)
        setDeleteId(null)
    }

    const getRatingColor = (rating: number) => {
        if (rating >= 8) return 'bg-green-500'
        if (rating >= 6) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    return (
        <>
            {/* Search */}
            <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cerca ristorante..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
            </div>

            {/* Restaurant List */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                {filteredRestaurants.length > 0 ? (
                    <div className="divide-y divide-stone-100">
                        {filteredRestaurants.map((restaurant, index) => (
                            <motion.div
                                key={restaurant.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors"
                            >
                                {/* Photo */}
                                <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                                    {restaurant.cover_photo_url ? (
                                        <img
                                            src={restaurant.cover_photo_url}
                                            alt={restaurant.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">
                                            🍽️
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-stone-900 truncate">{restaurant.name}</p>
                                    <p className="text-sm text-stone-500 truncate">
                                        {restaurant.category} • {restaurant.city || restaurant.address}
                                    </p>
                                </div>

                                {/* Rating */}
                                {restaurant.overall_rating && (
                                    <div className={`px-3 py-1.5 rounded-lg text-white font-bold ${getRatingColor(restaurant.overall_rating)}`}>
                                        {restaurant.overall_rating.toFixed(1)}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <a
                                        href={`/admin/restaurants/${restaurant.id}`}
                                        className="p-2 text-stone-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                        title="Modifica"
                                    >
                                        ✏️
                                    </a>
                                    <button
                                        onClick={() => setDeleteId(restaurant.id)}
                                        className="p-2 text-stone-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Elimina"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="px-6 py-16 text-center">
                        <span className="text-6xl mb-4 block">🍕</span>
                        <p className="text-stone-500 text-lg mb-2">
                            {search ? 'Nessun risultato' : 'Nessun ristorante ancora'}
                        </p>
                        {!search && (
                            <a
                                href="/admin/restaurants/new"
                                className="inline-block text-orange-500 hover:text-orange-600 font-medium mt-2"
                            >
                                Aggiungi il primo →
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteId && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteId(null)}
                            className="fixed inset-0 bg-black/50 z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-white rounded-2xl p-6 z-50 shadow-2xl"
                        >
                            <h3 className="text-lg font-bold text-stone-900 mb-2">Elimina ristorante?</h3>
                            <p className="text-stone-500 text-sm mb-6">
                                Questa azione non può essere annullata. Tutti i dati del ristorante verranno eliminati.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 py-2.5 px-4 border border-stone-300 text-stone-700 font-medium rounded-xl hover:bg-stone-50 transition-colors"
                                >
                                    Annulla
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {deleting ? 'Eliminazione...' : 'Elimina'}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
