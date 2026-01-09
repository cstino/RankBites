'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

interface CategoryPillsProps {
    categories: string[]
    currentCategory?: string
}

// Map categories to custom icons
const categoryIcons: Record<string, string> = {
    'Pizzeria': '/icons/pizza.svg',
    'Fine Dining': '/icons/raffinata.svg',
    'Sushi': '/icons/sushi.svg',
    'Giapponese': '/icons/sushi.svg',
    'Asiatico': '/icons/asiatica.svg',
    'Asiatica': '/icons/asiatica.svg',
    'Cinese': '/icons/asiatica.svg',
    'Hamburger': '/icons/hamburger.svg',
    'Fast Food': '/icons/hamburger.svg',
    'Pesce': '/icons/pesce.svg',
    'Carne': '/icons/carne.svg',
    'Trattoria': '/icons/trattoria.svg',
    'Italiano': '/icons/trattoria.svg',
    'Altro': '/icons/altro.svg',
}

// Fallback icon for categories without custom icons
const defaultIcon = '/icons/altro.svg'

const getIconPath = (category: string): string => {
    return categoryIcons[category] || defaultIcon
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
