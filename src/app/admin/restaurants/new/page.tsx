'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useToast } from '@/components/ui/Toast'
import CategoryMultiSelect from '@/components/admin/CategoryMultiSelect'
import CityAutocomplete from '@/components/admin/CityAutocomplete'

const LocationPicker = dynamic(() => import('./LocationPicker'), { ssr: false })

export default function NewRestaurantPage() {
    const [name, setName] = useState('')
    const [categories, setCategories] = useState<string[]>([])
    const [city, setCity] = useState('')
    const [mapsLink, setMapsLink] = useState('')
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [coverPhoto, setCoverPhoto] = useState<File | null>(null)
    const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(false)
    const [extractingInfo, setExtractingInfo] = useState(false)
    const [dataExtracted, setDataExtracted] = useState(false)
    const [extractionStatus, setExtractionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [extractionError, setExtractionError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()
    const { showToast } = useToast()

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

    // Reverse geocoding: get city from coordinates
    const reverseGeocode = async (lat: string, lng: string) => {
        setExtractingInfo(true)
        try {
            const response = await fetch('/api/maps/expand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'reverse', lat, lng })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.city) {
                    setCity(data.city)
                    console.log('📍 City from reverse geocoding:', data.city)
                }
                setDataExtracted(true)
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error)
        }
        setExtractingInfo(false)
    }



    // Extract coordinates from Maps URL, then reverse geocode for city
    const handleMapsLinkChange = async (url: string) => {
        setMapsLink(url)
        setExtractionError('')

        if (!url) {
            setExtractionStatus('idle')
            setLatitude('')
            setLongitude('')
            return
        }

        let lat: string | null = null
        let lng: string | null = null

        // Extract coordinates from @lat,lng pattern
        const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
        if (coordsMatch) {
            lat = coordsMatch[1]
            lng = coordsMatch[2]
        }

        // Try !3d...!4d... pattern
        if (!lat) {
            const dataMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
            if (dataMatch) {
                lat = dataMatch[1]
                lng = dataMatch[2]
            }
        }

        // If coordinates found from URL pattern
        if (lat && lng) {
            setLatitude(lat)
            setLongitude(lng)
            setExtractionStatus('success')
            if (!city) {
                await reverseGeocode(lat, lng)
            }
            return
        }

        // If no coordinates found locally and it's a short URL, call API to expand
        if (url.includes('goo.gl') || url.includes('maps.app.goo.gl') || url.includes('share.google')) {
            setExtractingInfo(true)
            setExtractionStatus('loading')
            try {
                console.log('📍 Calling API to expand URL:', url)
                const response = await fetch('/api/maps/expand', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url })
                })

                if (response.ok) {
                    const data = await response.json()
                    console.log('📍 API response:', data)
                    if (data.latitude && data.longitude) {
                        lat = data.latitude
                        lng = data.longitude
                        setLatitude(lat as string)
                        setLongitude(lng as string)
                        setExtractionStatus('success')
                        console.log('📍 Coordinates saved:', lat, lng)
                    } else {
                        setExtractionStatus('error')
                        setExtractionError('Impossibile estrarre le coordinate dal link')
                    }
                    if (data.city && !city) {
                        setCity(data.city)
                    }
                } else {
                    setExtractionStatus('error')
                    setExtractionError('Errore nella richiesta al server')
                }
            } catch (error) {
                console.error('Error expanding URL:', error)
                setExtractionStatus('error')
                setExtractionError('Errore di connessione')
            }
            setExtractingInfo(false)

            // Reverse geocode if we found coordinates
            if (lat && lng && !city) {
                await reverseGeocode(lat, lng)
            }
        } else {
            // URL doesn't match known patterns
            setExtractionStatus('error')
            setExtractionError('Formato link non riconosciuto. Usa un link di Google Maps.')
        }
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (!name.trim()) {
            showToast('warning', 'Attenzione!', 'Inserisci il nome del ristorante')
            setLoading(false)
            return
        }

        // Validate coordinates if Maps link was provided
        if (mapsLink && (!latitude || !longitude)) {
            showToast('error', 'Coordinate mancanti!', 'Attendi che le coordinate vengano estratte dal link di Google Maps')
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
                showToast('error', 'Errore!', 'Errore caricamento foto: ' + uploadError.message)
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
            category: categories.length > 0 ? categories : ['Altro'],
            address: null,
            city: city || null,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            maps_link: mapsLink || null,
            cover_photo_url: coverPhotoUrl,
        })

        if (error) {
            showToast('error', 'Errore!', error.message)
            setLoading(false)
            return
        }

        showToast('success', 'Ristorante creato!', 'Il ristorante è stato aggiunto con successo.')
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
                                className="fancy-input"
                                placeholder="Es. Pizzeria Da Mario"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-3">
                                📋 Categorie
                            </label>
                            <CategoryMultiSelect
                                selectedCategories={categories}
                                onChange={setCategories}
                            />
                        </div>

                        {/* City Selection */}
                        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                            <label className="block text-sm font-semibold text-stone-800 mb-2">
                                🏙️ Città e Provincia
                            </label>
                            <CityAutocomplete
                                selectedCity={city}
                                onCityChange={setCity}
                            />
                            {city && (
                                <p className="text-xs text-green-600 mt-2">
                                    ✓ Selezionato: {city}
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
                                🗺️ Link Google Maps *
                            </label>
                            <input
                                type="url"
                                value={mapsLink}
                                onChange={(e) => handleMapsLinkChange(e.target.value)}
                                className="fancy-input !bg-white !border-orange-200"
                                placeholder="https://maps.app.goo.gl/..."
                            />

                            {/* Extraction Status */}
                            <div className="mt-2 min-h-[24px]">
                                {extractionStatus === 'loading' && (
                                    <p className="text-xs text-blue-600 flex items-center gap-2">
                                        <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                                        Estrazione coordinate in corso...
                                    </p>
                                )}
                                {extractionStatus === 'success' && latitude && longitude && (
                                    <p className="text-xs text-green-600 font-medium">
                                        ✓ Coordinate estratte: {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
                                    </p>
                                )}
                                {extractionStatus === 'error' && (
                                    <p className="text-xs text-red-600">
                                        ✗ {extractionError}
                                    </p>
                                )}
                                {extractionStatus === 'idle' && mapsLink && (
                                    <p className="text-xs text-orange-600">
                                        💡 Incolla un link di Google Maps
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || uploading || !name.trim() || extractionStatus === 'loading' || (!!mapsLink && !latitude)}
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
