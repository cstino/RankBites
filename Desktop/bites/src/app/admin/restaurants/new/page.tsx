'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const LocationPicker = dynamic(() => import('./LocationPicker'), { ssr: false })

const RESTAURANT_CATEGORIES = [
    'Pizzeria',
    'Ristorante Italiano',
    'Sushi',
    'Steakhouse',
    'Pub',
    'Fine Dining',
    'Fast Food',
    'Trattoria',
    'Paninoteca',
    'Altro',
]

export default function NewRestaurantPage() {
    const [name, setName] = useState('')
    const [category, setCategory] = useState(RESTAURANT_CATEGORIES[0])
    const [city, setCity] = useState('')
    const [plusCode, setPlusCode] = useState('')
    const [mapsLink, setMapsLink] = useState('')
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [coverPhoto, setCoverPhoto] = useState<File | null>(null)
    const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [extractingInfo, setExtractingInfo] = useState(false)
    const [dataExtracted, setDataExtracted] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setCoverPhoto(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setCoverPhotoPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Improved geocoding: Try Name + City first, then just City
    const geocodeLocation = async (cityName: string, restaurantName?: string) => {
        setExtractingInfo(true)
        try {
            // Strategy 1: Search "Restaurant Name, City"
            if (restaurantName) {
                const query = `${restaurantName}, ${cityName}`
                const response = await fetch('/api/maps/expand', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'geocode', query })
                })

                if (response.ok) {
                    const data = await response.json()
                    if (data.latitude && data.longitude) {
                        setLatitude(data.latitude)
                        setLongitude(data.longitude)
                        setDataExtracted(true)
                        setExtractingInfo(false)
                        return // Found exact match!
                    }
                }
            }

            // Strategy 2: Search just "City" (Fallback)
            const response = await fetch('/api/maps/expand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'geocode', query: cityName })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.latitude && data.longitude) {
                    setLatitude(data.latitude)
                    setLongitude(data.longitude)
                    setDataExtracted(true)
                }
            }
        } catch (error) {
            console.error('Geocoding error:', error)
        }
        setExtractingInfo(false)
    }

    // Extract city from Plus Code
    const handlePlusCodeChange = async (value: string) => {
        setPlusCode(value)

        // Try to extract city from Plus Code format: "XXXX+XX City, Province"
        const match = value.match(/^[A-Z0-9]{4,8}\+[A-Z0-9]{2,3}\s+(.+)$/i)
        if (match) {
            const location = match[1]
            const parts = location.split(',').map(p => p.trim())
            if (parts.length >= 1) {
                const newCity = parts[0]
                setCity(newCity)

                // Trigger geocoding for the full location string
                await geocodeLocation(newCity, name)
            }
        }
    }

    // Extract coordinates from Maps URL
    const handleMapsLinkChange = (url: string) => {
        setMapsLink(url)

        if (!url) return

        // Extract coordinates from @lat,lng pattern
        const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
        if (coordsMatch) {
            setLatitude(coordsMatch[1])
            setLongitude(coordsMatch[2])
            return
        }

        // Try !3d...!4d... pattern
        const dataMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
        if (dataMatch) {
            setLatitude(dataMatch[1])
            setLongitude(dataMatch[2])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!name.trim()) {
            setError('Inserisci il nome del ristorante')
            setLoading(false)
            return
        }

        let coverPhotoUrl = null

        if (coverPhoto) {
            setUploading(true)
            const fileExt = coverPhoto.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('photos')
                .upload(fileName, coverPhoto)

            if (uploadError) {
                setError('Errore caricamento foto: ' + uploadError.message)
                setLoading(false)
                setUploading(false)
                return
            }

            const { data: urlData } = supabase.storage
                .from('photos')
                .getPublicUrl(fileName)

            coverPhotoUrl = urlData.publicUrl
            setUploading(false)
        }

        const { error } = await supabase.from('restaurants').insert({
            name: name.trim(),
            category,
            address: plusCode || null,
            city: city || null,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            maps_link: mapsLink || null,
            cover_photo_url: coverPhotoUrl,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        router.push('/admin/restaurants')
        router.refresh()
    }

    return (
        <div className="max-w-lg mx-auto pb-32 md:pb-6">
            <div className="mb-6">
                <a
                    href="/admin/restaurants"
                    className="text-stone-500 hover:text-stone-700 text-sm flex items-center gap-1"
                >
                    ← Torna ai ristoranti
                </a>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                    <h1 className="text-xl font-bold text-white">Nuovo Ristorante</h1>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Cover Photo */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                📷 Foto (opzionale)
                            </label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-32 rounded-xl border-2 border-dashed border-stone-300 hover:border-orange-400 transition-colors cursor-pointer overflow-hidden"
                            >
                                {coverPhotoPreview ? (
                                    <img
                                        src={coverPhotoPreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                                        <span className="text-3xl mb-1">📷</span>
                                        <span className="text-xs">Tocca per aggiungere</span>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                🏠 Nome Ristorante *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Es. Pizzeria Da Mario"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                📋 Categoria
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                {RESTAURANT_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Plus Code */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <label className="block text-sm font-semibold text-blue-800 mb-2">
                                📍 Plus Code (per città)
                            </label>
                            <input
                                type="text"
                                value={plusCode}
                                onChange={(e) => handlePlusCodeChange(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Es: JXJQ+36 Atri, Teramo"
                            />
                            {city && (
                                <p className="text-xs text-green-600 mt-2">
                                    ✓ Città rilevata: {city}
                                </p>
                            )}
                            {extractingInfo && (
                                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                    <span className="animate-spin">⏳</span> Ricerca coordinate...
                                </p>
                            )}
                        </div>

                        {/* Location Picker */}
                        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                            <label className="block text-sm font-semibold text-stone-800 mb-2">
                                📍 Posizione Esatta
                            </label>
                            <p className="text-xs text-stone-500 mb-3">
                                Trascina la mappa o tocca per posizionare il segnaposto esattamente sul ristorante.
                            </p>
                            <LocationPicker
                                latitude={latitude ? parseFloat(latitude) : null}
                                longitude={longitude ? parseFloat(longitude) : null}
                                onLocationChange={(lat, lng) => {
                                    setLatitude(lat.toString())
                                    setLongitude(lng.toString())
                                }}
                            />
                            {latitude && longitude && (
                                <p className="text-xs text-green-600 mt-2 text-right">
                                    Lat: {parseFloat(latitude).toFixed(5)}, Lng: {parseFloat(longitude).toFixed(5)}
                                </p>
                            )}
                        </div>

                        {/* Google Maps Link */}
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                            <label className="block text-sm font-semibold text-orange-800 mb-2">
                                🗺️ Link Google Maps (per aprire posizione)
                            </label>
                            <input
                                type="url"
                                value={mapsLink}
                                onChange={(e) => handleMapsLinkChange(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="https://maps.app.goo.gl/..."
                            />
                            {latitude && longitude && (
                                <p className="text-xs text-green-600 mt-2">
                                    ✓ Coordinate rilevate: {latitude}, {longitude}
                                </p>
                            )}
                            <p className="text-xs text-orange-600 mt-1">
                                💡 Usa il link lungo di Maps per estrarre le coordinate
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || uploading || !name.trim()}
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 text-lg"
                        >
                            {uploading ? '📷 Caricamento foto...' : loading ? '⏳ Creazione...' : '+ Crea Ristorante'}
                        </button>

                        <a
                            href="/admin/restaurants"
                            className="block text-center py-2 text-stone-500 hover:text-stone-700 text-sm"
                        >
                            Annulla
                        </a>
                    </form>
                </div>
            </div>
        </div>
    )
}
