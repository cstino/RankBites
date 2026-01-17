'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import FavoriteButton from './FavoriteButton'

interface Restaurant {
    id: string
    name: string
    category: string | string[]
    city: string | null
    overall_rating: number | null
    cover_photo_url: string | null
}

interface RestaurantCardProps {
    restaurant: Restaurant
    index?: number
    userId?: string | null
    isFavorite?: boolean
}

export default function RestaurantCard({ restaurant, index = 0, userId, isFavorite = false }: RestaurantCardProps) {
    const getRatingBg = (rating: number) => {
        if (rating >= 9) return 'bg-sky-400'
        if (rating >= 7) return 'bg-green-500'
        if (rating >= 5) return 'bg-amber-500'
        if (rating >= 3) return 'bg-red-500'
        return 'bg-stone-600'
    }

    const categories = Array.isArray(restaurant.category)
        ? restaurant.category
        : [restaurant.category]

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            style={{ scrollSnapAlign: 'start' }}
            className="flex-shrink-0"
        >
            <Link href={`/ristoranti/${restaurant.id}`} className="block">
                <div className="w-[300px] bg-white rounded-2xl overflow-hidden shadow-md border border-stone-100 hover:shadow-xl transition-all">
                    {/* Image */}
                    <div className="relative h-[180px] bg-stone-100">
                        {restaurant.cover_photo_url ? (
                            <img
                                src={restaurant.cover_photo_url}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                                <span className="text-6xl opacity-30">🍽️</span>
                            </div>
                        )}

                        {/* Favorite Button */}
                        <FavoriteButton
                            restaurantId={restaurant.id}
                            userId={userId || null}
                            initialIsFavorite={isFavorite}
                        />

                        {/* Rating Badge */}
                        {restaurant.overall_rating && (
                            <div className={`absolute bottom-3 left-3 ${getRatingBg(restaurant.overall_rating)} px-3 py-1.5 rounded-lg text-base font-bold text-white shadow-lg`}>
                                {restaurant.overall_rating.toFixed(1)}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <h3 className="font-bold text-base text-stone-900 line-clamp-1 mb-1">
                            {restaurant.name}
                        </h3>
                        <div className="flex items-center justify-between text-sm">
                            <p className="text-stone-600 line-clamp-1">
                                {categories[0]}
                            </p>
                            {restaurant.city && (
                                <p className="text-stone-400 text-xs">
                                    {restaurant.city}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
