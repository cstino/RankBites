'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useGeolocation, formatDistance, calculateDistance } from '@/hooks/useGeolocation'
import { useRouter, useSearchParams } from 'next/navigation'

interface RestaurantFiltersProps {
    categories: string[]
    currentCategory?: string
    currentMinRating?: string
    currentSearch?: string
    currentCity?: string
    currentNearMe?: string
}

export default function RestaurantFilters({
    categories,
    currentCategory,
    currentMinRating,
    currentSearch,
    currentCity,
    currentNearMe
}: RestaurantFiltersProps) {
    const { location, loading, requestLocation } = useGeolocation()
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleNearMeClick = () => {
        if (location) {
            // Already have location, toggle filter
            const params = new URLSearchParams(searchParams.toString())
            if (currentNearMe) {
                params.delete('nearMe')
                params.delete('lat')
                params.delete('lng')
            } else {
                params.set('nearMe', 'true')
                params.set('lat', location.latitude.toString())
                params.set('lng', location.longitude.toString())
            }
            router.push(`/?${params.toString()}`)
        } else {
            requestLocation()
        }
    }

    // When location is obtained, apply filter
    useEffect(() => {
        if (location && !currentNearMe) {
            // Don't auto-apply, let user click the button
        }
    }, [location])

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl border border-stone-200/50 p-4 mb-8 shadow-lg"
        >
            <form className="flex flex-wrap gap-3" method="GET">
                {/* Search */}
                <div className="flex-1 min-w-[150px]">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
                        <input
                            type="text"
                            name="search"
                            placeholder="Cerca..."
                            defaultValue={currentSearch}
                            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
                        />
                    </div>
                </div>

                {/* City Search */}
                <div className="w-28">
                    <input
                        type="text"
                        name="city"
                        placeholder="📍 Città"
                        defaultValue={currentCity}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    />
                </div>

                {/* Category Filter */}
                <div className="w-32">
                    <select
                        name="category"
                        defaultValue={currentCategory}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none cursor-pointer text-sm"
                    >
                        <option value="">Categoria</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Rating Filter */}
                <div className="w-24">
                    <select
                        name="minRating"
                        defaultValue={currentMinRating}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none cursor-pointer text-sm"
                    >
                        <option value="">Min ⭐</option>
                        <option value="7">7+</option>
                        <option value="8">8+</option>
                        <option value="9">9+</option>
                    </select>
                </div>

                {/* Submit */}
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all text-sm"
                >
                    Filtra
                </motion.button>
            </form>

            {/* Location buttons row */}
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-stone-100">
                {/* Near Me Button */}
                <motion.button
                    type="button"
                    onClick={handleNearMeClick}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all text-sm ${currentNearMe
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
                        }`}
                >
                    {loading ? (
                        <>
                            <span className="animate-spin">⏳</span>
                            <span>Localizzazione...</span>
                        </>
                    ) : (
                        <>
                            <span>📍</span>
                            <span>{currentNearMe ? 'Vicino a me ✓' : 'Vicino a me'}</span>
                        </>
                    )}
                </motion.button>

                {/* Map View Button */}
                <a
                    href="/mappa"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm bg-stone-100 text-stone-600 border border-stone-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                >
                    <span>🗺️</span>
                    <span>Mappa</span>
                </a>

                {/* Show distance info if location is active */}
                {location && currentNearMe && (
                    <span className="flex items-center text-xs text-stone-400 ml-auto">
                        📍 Ordinati per distanza
                    </span>
                )}
            </div>
        </motion.div>
    )
}
