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
        if (rating >= 8) return 'bg-gradient-to-r from-green-400 to-emerald-500'
        if (rating >= 6) return 'bg-gradient-to-r from-yellow-400 to-orange-500'
        return 'bg-gradient-to-r from-red-400 to-rose-500'
    }

    const getCategoryRatingColor = (rating: number) => {
        if (rating >= 8) return 'text-emerald-600 bg-emerald-50'
        if (rating >= 6) return 'text-orange-600 bg-orange-50'
        return 'text-red-600 bg-red-50'
    }

    // Handle both string and array for backwards compatibility
    const categories = Array.isArray(restaurant.category)
        ? restaurant.category
        : [restaurant.category]

    return (
        <motion.a
            href={`/ristoranti/${restaurant.id}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group block"
        >
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-xl hover:border-orange-200 transition-all duration-300">
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden">
                    {restaurant.cover_photo_url ? (
                        <motion.img
                            src={restaurant.cover_photo_url}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.4 }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl opacity-30">🍽️</span>
                        </div>
                    )}

                    {/* Category Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                        {categories.slice(0, 2).map((cat, i) => (
                            <span
                                key={i}
                                className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-stone-700 rounded-full shadow-sm"
                            >
                                {cat}
                            </span>
                        ))}
                        {categories.length > 2 && (
                            <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-stone-500 rounded-full shadow-sm">
                                +{categories.length - 2}
                            </span>
                        )}
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                                {restaurant.name}
                            </h3>
                            <p className="text-sm text-stone-500 mt-1 flex items-center gap-1 line-clamp-1">
                                <span>📍</span>
                                {restaurant.city || 'Posizione non disponibile'}
                            </p>
                        </div>
                        {/* Rating Badge - aligned with name */}
                        {restaurant.overall_rating && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                                className="flex-shrink-0"
                            >
                                <div className={`w-12 h-12 rounded-xl ${getRatingBg(restaurant.overall_rating)} flex items-center justify-center shadow-lg`}>
                                    <span className="text-white font-bold text-lg">
                                        {restaurant.overall_rating.toFixed(1)}
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* AI Review Preview - TEMPORARILY HIDDEN
                    {restaurant.ai_review && (
                        <p className="text-sm text-stone-600 mt-3 line-clamp-2 italic opacity-80">
                            "{restaurant.ai_review.slice(0, 80)}..."
                        </p>
                    )}
                    */}

                    {/* Category Ratings & View button */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {restaurant.category_ratings && ['Location', 'Menu', 'Servizio', 'Conto']
                                .filter(cat => restaurant.category_ratings![cat] !== undefined)
                                .map(cat => {
                                    const rating = restaurant.category_ratings![cat]
                                    return (
                                        <span
                                            key={cat}
                                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryRatingColor(rating)}`}
                                            title={cat}
                                        >
                                            {cat.slice(0, 3)}: {rating.toFixed(1)}
                                        </span>
                                    )
                                })}
                        </div>
                        <span className="text-xs text-orange-500 font-medium group-hover:translate-x-1 transition-transform flex-shrink-0">
                            Scopri →
                        </span>
                    </div>
                </div>
            </div>
        </motion.a>
    )
}
