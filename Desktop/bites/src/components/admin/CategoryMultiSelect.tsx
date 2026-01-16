'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'

interface Category {
    id: string
    name: string
    icon: string
}

interface CategoryMultiSelectProps {
    selectedCategories: string[]
    onChange: (categories: string[]) => void
}

export default function CategoryMultiSelect({ selectedCategories, onChange }: CategoryMultiSelectProps) {
    const [categories, setCategories] = useState<Category[]>([])
    const [newCategory, setNewCategory] = useState('')
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const { showToast } = useToast()

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('restaurant_categories')
            .select('*')
            .order('name')

        if (!error && data) {
            setCategories(data)
        }
        setLoading(false)
    }

    const toggleCategory = (categoryName: string) => {
        if (selectedCategories.includes(categoryName)) {
            onChange(selectedCategories.filter(c => c !== categoryName))
        } else {
            onChange([...selectedCategories, categoryName])
        }
    }

    const handleAddNewCategory = async () => {
        if (!newCategory.trim()) return

        const categoryName = newCategory.trim()

        // Check if already exists
        if (categories.some(c => c.name.toLowerCase() === categoryName.toLowerCase())) {
            // Just select it
            if (!selectedCategories.includes(categoryName)) {
                onChange([...selectedCategories, categoryName])
            }
            setNewCategory('')
            return
        }

        setAdding(true)
        const supabase = createClient()

        // Generate a simple emoji based on the category name
        const icon = getDefaultEmoji(categoryName)

        try {
            const { data, error } = await supabase
                .from('restaurant_categories')
                .insert({ name: categoryName, icon })
                .select()
                .single()

            if (error) {
                console.error('Error adding category:', error)
                showToast('error', 'Errore', error.message)
            } else if (data) {
                setCategories([...categories, data].sort((a, b) => a.name.localeCompare(b.name)))
                onChange([...selectedCategories, categoryName])
                showToast('success', 'Categoria aggiunta', `"${categoryName}" con emoji ${icon}`)
            }
        } catch (err) {
            console.error('Unexpected error:', err)
            showToast('error', 'Errore', 'Errore imprevisto nell\'aggiunta della categoria')
        }

        setNewCategory('')
        setAdding(false)
    }

    // Simple emoji picker based on keywords
    const getDefaultEmoji = (name: string): string => {
        const lower = name.toLowerCase()
        if (lower.includes('pizza')) return '🍕'
        if (lower.includes('pasta') || lower.includes('italian')) return '🍝'
        if (lower.includes('sushi') || lower.includes('giappone')) return '🍣'
        if (lower.includes('carne') || lower.includes('steak') || lower.includes('grill')) return '🥩'
        if (lower.includes('pesce') || lower.includes('fish') || lower.includes('mare')) return '🐟'
        if (lower.includes('pub') || lower.includes('birra') || lower.includes('beer')) return '🍺'
        if (lower.includes('wine') || lower.includes('vino') || lower.includes('fine')) return '🍷'
        if (lower.includes('burger') || lower.includes('fast')) return '🍔'
        if (lower.includes('panino') || lower.includes('sandwich')) return '🥪'
        if (lower.includes('vegan') || lower.includes('vegetarian') || lower.includes('salad')) return '🥗'
        if (lower.includes('cinese') || lower.includes('chinese') || lower.includes('asian')) return '🥡'
        if (lower.includes('messic') || lower.includes('taco') || lower.includes('mexican')) return '🌮'
        if (lower.includes('indian') || lower.includes('curry')) return '🍛'
        if (lower.includes('dolce') || lower.includes('dessert') || lower.includes('pasticceria')) return '🍰'
        if (lower.includes('gelato') || lower.includes('ice')) return '🍦'
        if (lower.includes('caffè') || lower.includes('coffee') || lower.includes('bar')) return '☕'
        return '🍽️'
    }

    if (loading) {
        return (
            <div className="animate-pulse bg-stone-100 rounded-xl h-32"></div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Selected Categories */}
            {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedCategories.map(cat => {
                        const category = categories.find(c => c.name === cat)
                        return (
                            <span
                                key={cat}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                            >
                                <span>{category?.icon || '🍽️'}</span>
                                {cat}
                                <button
                                    type="button"
                                    onClick={() => toggleCategory(cat)}
                                    className="ml-1 hover:text-orange-900"
                                >
                                    ×
                                </button>
                            </span>
                        )
                    })}
                </div>
            )}

            {/* Available Categories */}
            <div className="flex flex-wrap gap-2">
                {categories
                    .filter(c => !selectedCategories.includes(c.name))
                    .map(category => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => toggleCategory(category.name)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full text-sm font-medium transition-colors"
                        >
                            <span>{category.icon}</span>
                            {category.name}
                        </button>
                    ))}
            </div>

            {/* Add New Category */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddNewCategory()
                        }
                    }}
                    placeholder="Nuova categoria..."
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                    type="button"
                    onClick={handleAddNewCategory}
                    disabled={!newCategory.trim() || adding}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {adding ? '...' : '+ Aggiungi'}
                </button>
            </div>

            {selectedCategories.length === 0 && (
                <p className="text-xs text-stone-400">Seleziona almeno una categoria</p>
            )}
        </div>
    )
}
