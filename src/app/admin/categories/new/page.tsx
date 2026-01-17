'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

export default function NewCategoryPage() {
    const [name, setName] = useState('')
    const [order, setOrder] = useState(1)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const { showToast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from('categories').insert({
            name,
            order,
            active: true
        })

        if (error) {
            showToast('error', 'Errore!', error.message)
            setLoading(false)
            return
        }

        showToast('success', 'Categoria creata!', `La categoria "${name}" è stata aggiunta.`)
        router.push('/admin/categories')
        router.refresh()
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-6">
                <a
                    href="/admin/categories"
                    className="text-stone-500 hover:text-stone-700 text-sm flex items-center gap-1"
                >
                    ← Torna alle categorie
                </a>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-6">
                <h1 className="text-xl font-bold text-stone-900 mb-6">Nuova Categoria</h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Nome Categoria
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="fancy-input"
                            placeholder="Es. Qualità del cibo"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Ordine di visualizzazione
                        </label>
                        <input
                            type="number"
                            value={order}
                            onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                            min={1}
                            className="fancy-input"
                        />
                        <p className="text-xs text-stone-500 mt-1">
                            Le categorie vengono mostrate in ordine crescente
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creazione...' : 'Crea Categoria'}
                        </button>
                        <a
                            href="/admin/categories"
                            className="py-2 px-4 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-50 transition-colors"
                        >
                            Annulla
                        </a>
                    </div>
                </form>
            </div>
        </div>
    )
}
