'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useGeolocation } from '@/hooks/useGeolocation'

interface SearchBarProps {
    currentSearch?: string
    currentCity?: string
    currentNearMe?: string
}

export default function SearchBar({ currentSearch, currentCity, currentNearMe }: SearchBarProps) {
    const [search, setSearch] = useState(currentSearch || '')
    const router = useRouter()
    const searchParams = useSearchParams()
    const { location, loading, requestLocation } = useGeolocation()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams(searchParams.toString())

        if (search) {
            params.set('search', search)
        } else {
            params.delete('search')
        }

        router.push(`/?${params.toString()}`)
    }

    const handleNearMe = () => {
        if (location) {
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

    return (
        <div className="search-bar-container">
            <form onSubmit={handleSubmit} className="search-bar">
                <span className="search-bar-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Cerca ristorante, cucina..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button
                    type="button"
                    onClick={handleNearMe}
                    disabled={loading}
                    className={`p-2 rounded-lg transition-colors ${currentNearMe
                            ? 'bg-green-100 text-green-600'
                            : 'bg-stone-100 text-stone-500 hover:bg-orange-100 hover:text-orange-500'
                        }`}
                    title="Vicino a me"
                >
                    {loading ? '⏳' : '📍'}
                </button>
            </form>
        </div>
    )
}
