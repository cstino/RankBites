'use client'

import { Category } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CategoriesTable({ categories }: { categories: Category[] }) {
    const [updating, setUpdating] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const toggleActive = async (category: Category) => {
        setUpdating(category.id)
        await supabase
            .from('categories')
            .update({ active: !category.active })
            .eq('id', category.id)
        router.refresh()
        setUpdating(null)
    }

    const handleDelete = async (categoryId: string) => {
        if (!confirm('Sei sicuro di voler eliminare questa categoria?')) return

        setUpdating(categoryId)
        await supabase.from('categories').delete().eq('id', categoryId)
        router.refresh()
        setUpdating(null)
    }

    return (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            Ordine
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            Nome Categoria
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            Stato
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            Azioni
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                    {categories.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-stone-500">
                                <p className="text-4xl mb-2">📋</p>
                                <p>Nessuna categoria creata</p>
                            </td>
                        </tr>
                    ) : (
                        categories.map((category) => (
                            <tr key={category.id} className="hover:bg-stone-50">
                                <td className="px-6 py-4 text-stone-500">
                                    #{category.order}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-medium text-stone-900">{category.name}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleActive(category)}
                                        disabled={updating === category.id}
                                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full transition-colors ${category.active
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                                            }`}
                                    >
                                        {category.active ? 'Attiva' : 'Disattivata'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <a
                                        href={`/admin/categories/${category.id}`}
                                        className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                                    >
                                        Modifica
                                    </a>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        disabled={updating === category.id}
                                        className="text-red-500 hover:text-red-600 font-medium text-sm disabled:opacity-50"
                                    >
                                        Elimina
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
