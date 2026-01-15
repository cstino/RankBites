'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface Restaurant {
    id: string
    name: string
    category: string | string[]
    city: string | null
    overall_rating: number | null
    cover_photo_url: string | null
}

interface RestaurantCardSmallProps {
    restaurant: Restaurant
    index?: number
}

export default function RestaurantCardSmall({ restaurant, index = 0 }: RestaurantCardSmallProps) {
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
        >
            <Link href={`/ristoranti/${restaurant.id}`} className="block">
                <div className="w-40 bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                    {/* Image */}
                    <div className="relative h-24 bg-stone-100">
                        {restaurant.cover_photo_url ? (
                            <img
                                src={restaurant.cover_photo_url}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-3xl opacity-30">🍽️</span>
                            </div>
                        )}
                        {/* Rating Badge */}
                        {restaurant.overall_rating && (
                            <div className={`absolute top-2 right-2 ${getRatingBg(restaurant.overall_rating)} px-1.5 py-0.5 rounded text-xs font-bold text-white`}>
                                {restaurant.overall_rating.toFixed(1)}
                            </div>
                        )}
                    </div>
                    {/* Content */}
                    <div className="p-2">
                        <h3 className="font-semibold text-sm text-stone-900 line-clamp-1">
                            {restaurant.name}
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-1">
                            {categories[0]}
                        </p>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
