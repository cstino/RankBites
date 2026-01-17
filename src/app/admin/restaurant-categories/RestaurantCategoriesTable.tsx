'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Category {
    id: string
    name: string
    icon: string
}

interface RestaurantCategoriesTableProps {
    categories: Category[]
}

export default function RestaurantCategoriesTable({ categories }: RestaurantCategoriesTableProps) {
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editIcon, setEditIcon] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleUpdate = async (categoryId: string) => {
        if (!editName.trim()) return

        setLoading(true)
        const supabase = createClient()

        const { error } = await supabase
            .from('restaurant_categories')
            .update({ name: editName.trim(), icon: editIcon })
            .eq('id', categoryId)

        if (error) {
            alert('Errore: ' + error.message)
        } else {
            router.refresh()
        }

        setLoading(false)
        setEditingCategoryId(null)
    }

    const handleDelete = async (categoryId: string, categoryName: string) => {
        const confirmed = confirm(
            `Sei sicuro di voler eliminare la categoria "${categoryName}"?`
        )
        if (!confirmed) return

        setLoading(true)
        const supabase = createClient()

        const { error } = await supabase
            .from('restaurant_categories')
            .delete()
            .eq('id', categoryId)

        if (error) {
            alert('Errore: ' + error.message)
        } else {
            router.refresh()
        }

        setLoading(false)
    }

    return (
        <div className="space-y-6">
            {/* Info note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                    <strong>Nota:</strong> Le categorie sono derivate automaticamente dai ristoranti esistenti.
                    Per aggiungere una nuova categoria, crea o modifica un ristorante con la nuova categoria.
                </p>
            </div>

            {/* Categories list */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-stone-100">
                    <h2 className="font-semibold text-stone-900">Categorie esistenti ({categories.length})</h2>
                </div>

                {categories.length > 0 ? (
                    <div className="divide-y divide-stone-100">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center justify-between px-4 py-3 hover:bg-stone-50"
                            >
                                {editingCategoryId === category.id ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <input
                                            type="text"
                                            value={editIcon}
                                            onChange={(e) => setEditIcon(e.target.value)}
                                            className="w-16 px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-center"
                                            placeholder="🍕"
                                        />
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => handleUpdate(category.id)}
                                            disabled={loading}
                                            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            onClick={() => setEditingCategoryId(null)}
                                            className="px-3 py-2 bg-stone-200 text-stone-600 rounded-lg hover:bg-stone-300"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <span className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-2xl">
                                                {category.icon || '🍽️'}
                                            </span>
                                            <span className="font-medium text-stone-900">{category.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingCategoryId(category.id)
                                                    setEditName(category.name)
                                                    setEditIcon(category.icon || '🍽️')
                                                }}
                                                className="px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                                            >
                                                Rinomina
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id, category.name)}
                                                disabled={loading}
                                                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                Elimina
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-4 py-8 text-center text-stone-500">
                        <span className="text-3xl mb-2 block">🍽️</span>
                        <p className="text-sm">Nessuna categoria trovata</p>
                        <p className="text-xs text-stone-400 mt-1">Crea un ristorante per aggiungere una categoria</p>
                    </div>
                )}
            </div>
        </div>
    )
}
