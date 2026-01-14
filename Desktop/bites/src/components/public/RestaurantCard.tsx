'use client'

import { motion } from 'framer-motion'

interface Restaurant {
    id: string
    name: string
    category: string | string[]
    address: string
    city: string | null
    overall_rating: number | null
    category_ratings: Record<string, number> | null
    cover_photo_url: string | null
    ai_review: string | null
}

interface RestaurantCardProps {
    restaurant: Restaurant
    index?: number
}

export default function RestaurantCard({ restaurant, index = 0 }: RestaurantCardProps) {
    const getRatingBg = (rating: number) => {
        if (rating >= 9) return 'bg-gradient-to-r from-sky-400 to-blue-500'        // 9-10: azzurro
        if (rating >= 7) return 'bg-gradient-to-r from-green-400 to-green-600'     // 7-8: verde
        if (rating >= 5) return 'bg-gradient-to-r from-yellow-400 to-amber-500'    // 5-6: giallo
        if (rating >= 3) return 'bg-gradient-to-r from-red-400 to-red-600'         // 3-4: rosso
        return 'bg-gradient-to-r from-stone-700 to-stone-900'                      // 1-2: nero
    }

    const getCategoryRatingColor = (rating: number) => {
        if (rating >= 9) return 'text-violet-600 bg-violet-50'
        if (rating >= 7) return 'text-green-700 bg-green-50'
        if (rating >= 6) return 'text-green-500 bg-green-50'
        if (rating >= 5) return 'text-orange-500 bg-orange-50'
        if (rating >= 3) return 'text-red-500 bg-red-50'
        return 'text-rose-700 bg-rose-50'
    }

    // Handle both string and array for backwards compatibility
    const categories = Array.isArray(restaurant.category)
        ? restaurant.category
        : [restaurant.category]

    return (
        <motion.a
            href={`/ristoranti/${restaurant.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group block"
        >
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-lg hover:border-orange-200 transition-all duration-300">
                {/* Image - more compact */}
                <div className="relative aspect-[16/10] bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden">
                    {restaurant.cover_photo_url ? (
                        <motion.img
                            src={restaurant.cover_photo_url}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-5xl opacity-30">🍽️</span>
                        </div>
                    )}

                    {/* Category Badges */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {categories.slice(0, 2).map((cat, i) => (
                            <span
                                key={i}
                                className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-xs font-medium text-stone-700 rounded-full shadow-sm"
                            >
                                {cat}
                            </span>
                        ))}
                        {categories.length > 2 && (
                            <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-xs font-medium text-stone-500 rounded-full shadow-sm">
                                +{categories.length - 2}
                            </span>
                        )}
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Content - more compact */}
                <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                                {restaurant.name}
                            </h3>
                            <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1 line-clamp-1">
                                <span>📍</span>
                                {restaurant.city || 'Posizione non disponibile'}
                            </p>
                        </div>
                        {/* Rating Badge - smaller */}
                        {restaurant.overall_rating && (
                            <div className={`w-10 h-10 rounded-lg ${getRatingBg(restaurant.overall_rating)} flex items-center justify-center shadow-md`}>
                                <span className="text-white font-bold text-sm">
                                    {restaurant.overall_rating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.a>
    )
}
