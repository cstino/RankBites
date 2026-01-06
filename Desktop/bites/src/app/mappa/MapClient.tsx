'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'

interface Restaurant {
    id: string
    name: string
    category: string
    address: string
    overall_rating: number
    cover_photo_url: string | null
    latitude: number
    longitude: number
}

interface MapClientProps {
    restaurants: Restaurant[]
}

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
)
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
)
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
)
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
)

export default function MapClient({ restaurants }: MapClientProps) {
    const [mounted, setMounted] = useState(false)
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

    useEffect(() => {
        setMounted(true)

        // Fix Leaflet default icon issue
        if (typeof window !== 'undefined') {
            const L = require('leaflet')
            delete (L.Icon.Default.prototype as any)._getIconUrl
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            })
        }

        // Try to get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
                () => { }
            )
        }
    }, [])

    // Default center (Italy)
    const defaultCenter: [number, number] = [41.9028, 12.4964]

    // Calculate center from restaurants or use user location
    const center = userLocation ||
        (restaurants.length > 0
            ? [restaurants[0].latitude, restaurants[0].longitude] as [number, number]
            : defaultCenter)

    const getRatingColor = (rating: number) => {
        if (rating >= 8) return '#22c55e'
        if (rating >= 6) return '#eab308'
        return '#ef4444'
    }

    if (!mounted) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-4xl mb-4">🗺️</div>
                    <p className="text-stone-500">Caricamento mappa...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between z-50">
                <a href="/" className="flex items-center gap-2">
                    <img src="/logo.svg" alt="RankBites" className="h-7" />
                </a>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-stone-500">
                        {restaurants.length} ristoranti
                    </span>
                    <a
                        href="/"
                        className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                    >
                        ← Lista
                    </a>
                </div>
            </header>

            {/* Map */}
            <div className="flex-1 relative bg-white">
                {restaurants.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
                        <div className="text-center p-6">
                            <span className="text-6xl mb-4 block">📍</span>
                            <h2 className="text-xl font-bold text-stone-800 mb-2">Nessun ristorante con coordinate</h2>
                            <p className="text-stone-500 mb-4">
                                Aggiungi latitudine e longitudine ai ristoranti per vederli sulla mappa.
                            </p>
                            <a
                                href="/"
                                className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                            >
                                Torna alla lista
                            </a>
                        </div>
                    </div>
                ) : (
                    <MapContainer
                        center={center}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                        className="w-full h-full absolute inset-0 z-0"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {restaurants.map((restaurant) => (
                            <Marker
                                key={restaurant.id}
                                position={[restaurant.latitude, restaurant.longitude]}
                            >
                                <Popup>
                                    <div className="min-w-[200px]">
                                        {restaurant.cover_photo_url && (
                                            <img
                                                src={restaurant.cover_photo_url}
                                                alt={restaurant.name}
                                                className="w-full h-24 object-cover rounded-lg mb-2"
                                            />
                                        )}
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-bold text-stone-900">{restaurant.name}</h3>
                                                <p className="text-xs text-stone-500">{restaurant.category}</p>
                                            </div>
                                            <div
                                                className="px-2 py-1 rounded-lg text-white text-sm font-bold"
                                                style={{ backgroundColor: getRatingColor(restaurant.overall_rating) }}
                                            >
                                                {restaurant.overall_rating.toFixed(1)}
                                            </div>
                                        </div>
                                        <p className="text-xs text-stone-400 mt-1">{restaurant.address}</p>
                                        <a
                                            href={`/ristoranti/${restaurant.id}`}
                                            className="block mt-2 text-center text-sm text-orange-500 hover:text-orange-600 font-medium"
                                        >
                                            Vedi dettagli →
                                        </a>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>
        </div>
    )
}
