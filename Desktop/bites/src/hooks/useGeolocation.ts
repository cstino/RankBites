'use client'

import { useState, useEffect } from 'react'

interface UserLocation {
    latitude: number
    longitude: number
}

interface UseGeolocationReturn {
    location: UserLocation | null
    loading: boolean
    error: string | null
    requestLocation: () => void
}

export function useGeolocation(): UseGeolocationReturn {
    const [location, setLocation] = useState<UserLocation | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocalizzazione non supportata')
            return
        }

        setLoading(true)
        setError(null)

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                })
                setLoading(false)
            },
            (err) => {
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setError('Permesso negato')
                        break
                    case err.POSITION_UNAVAILABLE:
                        setError('Posizione non disponibile')
                        break
                    case err.TIMEOUT:
                        setError('Timeout richiesta')
                        break
                    default:
                        setError('Errore sconosciuto')
                }
                setLoading(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes cache
            }
        )
    }

    // Try to load cached location on mount
    useEffect(() => {
        const cached = localStorage.getItem('user-location')
        if (cached) {
            try {
                setLocation(JSON.parse(cached))
            } catch { }
        }
    }, [])

    // Cache location when it changes
    useEffect(() => {
        if (location) {
            localStorage.setItem('user-location', JSON.stringify(location))
        }
    }, [location])

    return { location, loading, error, requestLocation }
}

// Calculate distance between two points (Haversine formula)
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371 // Earth's radius in km
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180)
}

// Format distance for display
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`
    }
    return `${km.toFixed(1)} km`
}
