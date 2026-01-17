'use client'

import { motion } from 'framer-motion'
import { useGeolocation } from '@/hooks/useGeolocation'

interface LocationButtonProps {
    onLocationFound: (lat: number, lng: number) => void
}

export default function LocationButton({ onLocationFound }: LocationButtonProps) {
    const { location, loading, error, requestLocation } = useGeolocation()

    const handleClick = () => {
        if (location) {
            onLocationFound(location.latitude, location.longitude)
        } else {
            requestLocation()
        }
    }

    // Trigger callback when location is found
    if (location) {
        // Only call once when location becomes available
    }

    return (
        <motion.button
            onClick={handleClick}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${location
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : error
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200'
                }`}
        >
            {loading ? (
                <>
                    <span className="animate-spin">⏳</span>
                    <span className="text-sm">Localizzazione...</span>
                </>
            ) : location ? (
                <>
                    <span>📍</span>
                    <span className="text-sm">Vicino a me</span>
                </>
            ) : error ? (
                <>
                    <span>⚠️</span>
                    <span className="text-sm">{error}</span>
                </>
            ) : (
                <>
                    <span>📍</span>
                    <span className="text-sm">Usa posizione</span>
                </>
            )}
        </motion.button>
    )
}
