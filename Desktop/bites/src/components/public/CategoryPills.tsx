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

    // Parse current categories from comma-separated string
    const selectedCategories = currentCategory ? currentCategory.split(',') : []

    const handleCategoryClick = (category: string) => {
        const params = new URLSearchParams(searchParams.toString())

        let newSelected: string[]

        if (selectedCategories.includes(category)) {
            // Remove from selection
            newSelected = selectedCategories.filter(c => c !== category)
        } else {
            // Add to selection
            newSelected = [...selectedCategories, category]
        }

        if (newSelected.length === 0) {
            params.delete('category')
        } else {
            params.set('category', newSelected.join(','))
        }

        router.push(`/?${params.toString()}`)
    }

    return (
        <div className="category-pills-container">
            <div className="category-pills">
                {categories.map((category) => {
                    const emoji = getEmoji(category)
                    const isActive = selectedCategories.includes(category)

                    return (
                        <button
                            key={category}
                            onClick={() => handleCategoryClick(category)}
                            className={`category-card ${isActive ? 'category-card-active' : ''}`}
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

