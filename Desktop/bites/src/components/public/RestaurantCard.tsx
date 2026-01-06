'use client'

import { motion } from 'framer-motion'

interface Restaurant {
    id: string
    name: string
    category: string
    address: string
    overall_rating: number | null
    cover_photo_url: string | null
    ai_review: string | null
}

interface RestaurantCardProps {
    restaurant: Restaurant
    index?: number
}

export default function RestaurantCard({ restaurant, index = 0 }: RestaurantCardProps) {
    const getRatingColor = (rating: number) => {
        if (rating >= 8) return 'from-green-400 to-emerald-500'
        if (rating >= 6) return 'from-yellow-400 to-orange-500'
        return 'from-red-400 to-rose-500'
    }

    const getRatingBg = (rating: number) => {
        if (rating >= 8) return 'bg-gradient-to-r from-green-400 to-emerald-500'
        if (rating >= 6) return 'bg-gradient-to-r from-yellow-400 to-orange-500'
        return 'bg-gradient-to-r from-red-400 to-rose-500'
    }

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

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-stone-700 rounded-full shadow-sm">
                            {restaurant.category}
                        </span>
                    </div>

                    {/* Rating Badge */}
                    {restaurant.overall_rating && (
                        <motion.div
                            className="absolute top-3 right-3"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                        >
                            <div className={`w-12 h-12 rounded-xl ${getRatingBg(restaurant.overall_rating)} flex items-center justify-center shadow-lg`}>
                                <span className="text-white font-bold text-lg">
                                    {restaurant.overall_rating.toFixed(1)}
                                </span>
                            </div>
                        </motion.div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-bold text-lg text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {restaurant.name}
                    </h3>
                    <p className="text-sm text-stone-500 mt-1 flex items-center gap-1 line-clamp-1">
                        <span>📍</span>
                        {restaurant.address}
                    </p>

                    {/* AI Review Preview */}
                    {restaurant.ai_review && (
                        <p className="text-sm text-stone-600 mt-3 line-clamp-2 italic opacity-80">
                            "{restaurant.ai_review.slice(0, 80)}..."
                        </p>
                    )}

                    {/* View button */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`text-sm ${restaurant.overall_rating && star <= Math.round(restaurant.overall_rating / 2)
                                            ? 'text-orange-400'
                                            : 'text-stone-200'
                                        }`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <span className="text-xs text-orange-500 font-medium group-hover:translate-x-1 transition-transform">
                            Scopri →
                        </span>
                    </div>
                </div>
            </div>
        </motion.a>
    )
}
