'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Category } from '@/types'

interface VoteFormProps {
    sessionId: string
    restaurantId: string
    categories: Category[]
    existingVotes: { category_id: string; score: number }[]
    existingPhotos: any[]
    hasVoted: boolean
}

export default function VoteForm({
    sessionId,
    restaurantId,
    categories,
    existingVotes,
    existingPhotos,
    hasVoted,
}: VoteFormProps) {
    const initialVotes: Record<string, number> = {}
    existingVotes.forEach((v) => {
        initialVotes[v.category_id] = v.score
    })
    categories.forEach((cat) => {
        if (!initialVotes[cat.id]) {
            initialVotes[cat.id] = 5 // Default to middle value
        }
    })

    const [votes, setVotes] = useState<Record<string, number>>(initialVotes)
    const [photos, setPhotos] = useState<any[]>(existingPhotos)
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleVoteChange = (categoryId: string, score: number) => {
        setVotes((prev) => ({ ...prev, [categoryId]: score }))
    }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        setError(null)

        try {
            for (const file of Array.from(files)) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${restaurantId}/${Date.now()}.${fileExt}`

                // Upload to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from('photos')
                    .upload(fileName, file)

                if (uploadError) {
                    console.error('Upload error:', uploadError)
                    setError(`Errore upload: ${uploadError.message}`)
                    continue
                }

                // Get public URL
                const { data: urlData } = supabase.storage
                    .from('photos')
                    .getPublicUrl(fileName)

                // Save to database
                const { data: photoData, error: dbError } = await supabase
                    .from('restaurant_photos')
                    .insert({
                        restaurant_id: restaurantId,
                        photo_url: urlData.publicUrl,
                    })
                    .select()
                    .single()

                if (dbError) {
                    console.error('DB error:', dbError)
                    setError(`Errore database: ${dbError.message}`)
                    continue
                }

                setPhotos((prev) => [photoData, ...prev])
            }
        } catch (err) {
            console.error('Upload error:', err)
            setError('Errore durante il caricamento')
        }

        setUploading(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Delete existing votes first (for updates)
        await supabase
            .from('votes')
            .delete()
            .eq('session_id', sessionId)

        // Insert new votes
        const voteData = Object.entries(votes).map(([categoryId, score]) => ({
            session_id: sessionId,
            category_id: categoryId,
            score,
        }))

        const { error: voteError } = await supabase.from('votes').insert(voteData)

        if (voteError) {
            setError(voteError.message)
            setLoading(false)
            return
        }

        // Update voter status
        await supabase
            .from('session_voters')
            .update({ has_voted: true, voted_at: new Date().toISOString() })
            .eq('session_id', sessionId)

        setSuccess(true)
        setLoading(false)

        setTimeout(() => {
            router.push('/admin/sessions')
            router.refresh()
        }, 1500)
    }

    if (success) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <p className="text-4xl mb-4">✅</p>
                <p className="text-green-700 font-medium">Voto registrato con successo!</p>
                <p className="text-green-600 text-sm mt-2">Reindirizzamento...</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-32 md:pb-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {hasVoted && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                    Hai già votato. Puoi modificare il tuo voto finché la sessione è aperta.
                </div>
            )}

            {/* Vote Sliders */}
            <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
                {categories.map((category) => (
                    <div key={category.id} className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <label className="font-medium text-stone-900">{category.name}</label>
                            <span className="text-2xl font-bold text-orange-500 w-12 text-right">
                                {votes[category.id]}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={votes[category.id]}
                            onChange={(e) => handleVoteChange(category.id, parseInt(e.target.value))}
                            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <div className="flex justify-between text-xs text-stone-400 mt-1">
                            <span>1</span>
                            <span>5</span>
                            <span>10</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Photo Upload */}
            <div className="bg-white rounded-xl border border-stone-200 p-6">
                <h3 className="font-medium text-stone-900 mb-4">📸 Foto del ristorante</h3>

                <div className="mb-4">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                    />
                    <label
                        htmlFor="photo-upload"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${uploading
                            ? 'bg-stone-100 text-stone-400'
                            : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            }`}
                    >
                        {uploading ? 'Caricamento...' : '+ Aggiungi foto'}
                    </label>
                </div>

                {/* Photo Grid */}
                {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                        {photos.map((photo) => (
                            <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-stone-100">
                                <img
                                    src={photo.photo_url}
                                    alt="Foto ristorante"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {photos.length === 0 && (
                    <p className="text-sm text-stone-400">Nessuna foto ancora. Aggiungi le foto dei piatti!</p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50"
            >
                {loading ? 'Invio in corso...' : hasVoted ? 'Aggiorna Voto' : 'Invia Voto'}
            </button>
        </form>
    )
}
