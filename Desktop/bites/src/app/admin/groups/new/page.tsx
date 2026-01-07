'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

export default function NewGroupPage() {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const { showToast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from('groups').insert({ name })

        if (error) {
            showToast('error', 'Errore!', error.message)
            setLoading(false)
            return
        }

        showToast('success', 'Gruppo creato!', `Il gruppo "${name}" è stato aggiunto.`)
        router.push('/admin/groups')
        router.refresh()
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-6">
                <a
                    href="/admin/groups"
                    className="text-stone-500 hover:text-stone-700 text-sm flex items-center gap-1"
                >
                    ← Torna ai gruppi
                </a>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-6">
                <h1 className="text-xl font-bold text-stone-900 mb-6">Nuovo Gruppo</h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Nome Gruppo
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="fancy-input"
                            placeholder="Es. Team Milano"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creazione...' : 'Crea Gruppo'}
                        </button>
                        <a
                            href="/admin/groups"
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
