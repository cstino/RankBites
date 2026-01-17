'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Category } from '@/types'
import RatingSelector from '@/components/ui/RatingSelector'
import { useToast } from '@/components/ui/Toast'

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
    const { showToast } = useToast()

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

        // Get current user first
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            showToast('error', 'Errore!', 'Devi essere autenticato per votare')
            setLoading(false)
            return
        }

        // Delete existing votes for current user only (for updates)
        await supabase
            .from('votes')
            .delete()
            .eq('session_id', sessionId)
            .eq('user_id', user.id)

        // Insert new votes with user_id
        const voteData = Object.entries(votes).map(([categoryId, score]) => ({
            session_id: sessionId,
            user_id: user.id,
            category_id: categoryId,
            score,
        }))

        const { error: voteError } = await supabase.from('votes').insert(voteData)

        if (voteError) {
            showToast('error', 'Errore!', voteError.message)
            setLoading(false)
            return
        }

        // Update voter status for current user
        await supabase
            .from('session_voters')
            .update({ has_voted: true, voted_at: new Date().toISOString() })
            .eq('session_id', sessionId)
            .eq('user_id', user.id)

        setLoading(false)
        showToast('success', 'Voto registrato!', 'Il tuo voto è stato salvato con successo.')

        setTimeout(() => {
            router.push('/admin/sessions')
            router.refresh()
        }, 1500)
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

            {/* Vote Selectors */}
            <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
                {categories.map((category) => (
                    <div key={category.id} className="p-5">
                        <label className="block font-medium text-stone-900 mb-3">{category.name}</label>
                        <RatingSelector
                            value={votes[category.id]}
                            onChange={(score) => handleVoteChange(category.id, score)}
                            categoryName={category.name}
                        />
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
