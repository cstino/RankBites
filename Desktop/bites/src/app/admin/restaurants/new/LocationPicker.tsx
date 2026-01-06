'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

interface LocationPickerProps {
    latitude: number | null
    longitude: number | null
    onLocationChange: (lat: number, lng: number) => void
}

// Component to handle map clicks and updates
function MapEvents({ onLocationChange, center }: { onLocationChange: (lat: number, lng: number) => void, center: [number, number] }) {
    const map = useMap()

    useEffect(() => {
        map.setView(center, map.getZoom())
    }, [center, map])

    useEffect(() => {
        map.on('click', (e: any) => {
            onLocationChange(e.latlng.lat, e.latlng.lng)
        })
        // Cleanup listener
        return () => {
            map.off('click')
        }
    }, [map, onLocationChange])

    return null
}

export default function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
    const defaultCenter: [number, number] = [41.9028, 12.4964] // Rome

    // Fix Leaflet icons
    useEffect(() => {
        // Only run on client
        if (typeof window !== 'undefined') {
            delete (L.Icon.Default.prototype as any)._getIconUrl
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            })
        }
    }, [])

    const center: [number, number] = latitude && longitude
        ? [latitude, longitude]
        : defaultCenter

    return (
        <div className="h-64 rounded-xl overflow-hidden border border-stone-300 relative z-0">
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {latitude && longitude && (
                    <Marker position={[latitude, longitude]} />
                )}
                <MapEvents onLocationChange={onLocationChange} center={center} />
            </MapContainer>
            <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded shadow text-xs z-[1000]">
                Tocca per spostare
            </div>
        </div>
    )
}
