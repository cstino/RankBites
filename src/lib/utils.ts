import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date))
}

export function formatRating(rating: number): string {
    return rating.toFixed(1)
}

export function getRatingColor(rating: number): string {
    if (rating >= 8) return 'text-green-500'
    if (rating >= 6) return 'text-yellow-500'
    return 'text-red-500'
}

export function getRatingBgColor(rating: number): string {
    if (rating >= 8) return 'bg-green-500'
    if (rating >= 6) return 'bg-yellow-500'
    return 'bg-red-500'
}

export function calculateOverallRating(categoryRatings: Record<string, number>): number {
    const values = Object.values(categoryRatings)
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
}
