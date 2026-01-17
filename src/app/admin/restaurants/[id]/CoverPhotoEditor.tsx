'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

interface CoverPhotoEditorProps {
    restaurantId: string
    currentPhotoUrl: string | null
}

export default function CoverPhotoEditor({ restaurantId, currentPhotoUrl }: CoverPhotoEditorProps) {
    const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()
    const { showToast } = useToast()

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `covers/${restaurantId}_${Date.now()}.${fileExt}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('photos')
                .upload(fileName, file)

            if (uploadError) {
                showToast('error', 'Errore!', `Errore upload: ${uploadError.message}`)
                setUploading(false)
                return
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('photos')
                .getPublicUrl(fileName)

            // Update restaurant
            const { error: updateError } = await supabase
                .from('restaurants')
                .update({ cover_photo_url: urlData.publicUrl })
                .eq('id', restaurantId)

            if (updateError) {
                showToast('error', 'Errore!', `Errore aggiornamento: ${updateError.message}`)
                setUploading(false)
                return
            }

            setPhotoUrl(urlData.publicUrl)
            showToast('success', 'Foto aggiornata!', 'La foto di copertina è stata cambiata.')
            router.refresh()
        } catch (err) {
            showToast('error', 'Errore!', 'Errore durante il caricamento')
        }

        setUploading(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="relative group">
            <div className="w-24 h-24 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                        🍽️
                    </div>
                )}
            </div>

            {/* Edit overlay */}
            <div
                className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                {uploading ? (
                    <span className="text-white text-xs">...</span>
                ) : (
                    <span className="text-white text-xl">📷</span>
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
    )
}
