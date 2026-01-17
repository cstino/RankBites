'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface FavoriteButtonProps {
    restaurantId: string
    userId: string | null
    initialIsFavorite?: boolean
}

export default function FavoriteButton({ restaurantId, userId, initialIsFavorite = false }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
    const [isLoading, setIsLoading] = useState(false)

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation if card is clickable
        e.stopPropagation()

        if (!userId) {
            // Redirect to login or show toast
            window.location.href = '/login'
            return
        }

        setIsLoading(true)
        const supabase = createClient()

        try {
            if (isFavorite) {
                // Remove from favorites
                const { error } = await supabase
                    .from('user_favorites')
                    .delete()
                    .eq('user_id', userId)
                    .eq('restaurant_id', restaurantId)

                if (!error) {
                    setIsFavorite(false)
                }
            } else {
                // Add to favorites
                const { error } = await supabase
                    .from('user_favorites')
                    .insert({
                        user_id: userId,
                        restaurant_id: restaurantId
                    })

                if (!error) {
                    setIsFavorite(true)
                }
            }
        } catch (error) {
            console.error('Error toggling favorite:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="ui-bookmark absolute top-3 right-3 z-10">
            <input
                type="checkbox"
                id={`fav-${restaurantId}`}
                checked={isFavorite}
                readOnly
            />
            <label
                htmlFor={`fav-${restaurantId}`}
                className="bookmark"
                onClick={toggleFavorite}
                style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    cursor: isLoading ? 'wait' : 'pointer'
                }}
            >
                <svg viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            </label>
        </div>
    )
}
