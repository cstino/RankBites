'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface CategoryPillsProps {
    categories: string[]
    currentCategory?: string
}

// Map categories to emojis
const categoryEmojis: Record<string, string> = {
    'Pizzeria': '🍕',
    'Ristorante Italiano': '🍝',
    'Sushi': '🍣',
    'Giapponese': '🍣',
    'Asiatico': '🥡',
    'Asiatica': '🥡',
    'Cinese': '🥡',
    'Steakhouse': '🥩',
    'Hamburger': '🍔',
    'Fast Food': '🍔',
    'Pesce': '🐟',
    'Carne': '🍖',
    'Trattoria': '🍲',
    'Italiano': '🍝',
    'Pub': '🍺',
    'Fine Dining': '🍷',
    'Paninoteca': '🥪',
    'Vegetariano': '🥗',
    'Messicano': '🌮',
    'Indiano': '🍛',
    'Altro': '🍽️',
}

const getEmoji = (category: string): string => {
    return categoryEmojis[category] || '🍽️'
}

export default function CategoryPills({ categories, currentCategory }: CategoryPillsProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleCategoryClick = (category: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (currentCategory === category) {
            // Deselect - torna a mostrare tutti
            params.delete('category')
        } else {
            params.set('category', category)
        }

        router.push(`/?${params.toString()}`)
    }

    return (
        <div className="category-pills-container">
            <div className="category-pills">
                {categories.map((category) => {
                    const emoji = getEmoji(category)

                    return (
                        <button
                            key={category}
                            onClick={() => handleCategoryClick(category)}
                            className={`category-card ${currentCategory === category ? 'category-card-active' : ''}`}
                        >
                            <div className="category-card-box">
                                <span className="text-3xl">{emoji}</span>
                            </div>
                            <span className="category-card-label">{category}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

