'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

interface CategoryPillsProps {
    categories: string[]
    currentCategory?: string
}

// Map categories to custom icons
const categoryIcons: Record<string, string> = {
    'Tutti': '/icons/tutti.png',
    'Pizzeria': '/icons/pizzeria.png',
    'Fine Dining': '/icons/fine_dining.png',
}

// Fallback icon for categories without custom icons
const defaultIcon = '/icons/tutti.png'

const getIconPath = (category: string): string => {
    return categoryIcons[category] || defaultIcon
}

export default function CategoryPills({ categories, currentCategory }: CategoryPillsProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleCategoryClick = (category: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (currentCategory === category) {
            params.delete('category')
        } else {
            params.set('category', category)
        }

        router.push(`/?${params.toString()}`)
    }

    const handleClearAll = () => {
        router.push('/')
    }

    return (
        <div className="category-pills-container">
            <div className="category-pills">
                {/* All / Clear filter */}
                <button
                    onClick={handleClearAll}
                    className={`category-card ${!currentCategory ? 'category-card-active' : ''}`}
                >
                    <div className="category-card-box">
                        <Image
                            src="/icons/tutti.png"
                            alt="Tutti"
                            width={45}
                            height={45}
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                    <span className="category-card-label">Tutti</span>
                </button>

                {categories.map((category) => {
                    const iconPath = getIconPath(category)

                    return (
                        <button
                            key={category}
                            onClick={() => handleCategoryClick(category)}
                            className={`category-card ${currentCategory === category ? 'category-card-active' : ''}`}
                        >
                            <div className="category-card-box">
                                <Image
                                    src={iconPath}
                                    alt={category}
                                    width={45}
                                    height={45}
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                            <span className="category-card-label">{category}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
