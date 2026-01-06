'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Group } from '@/types'

export default function NewUserForm({ groups }: { groups: Group[] }) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'admin' | 'super_admin'>('admin')
    const [selectedGroups, setSelectedGroups] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Create auth user via API
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role,
                    groupIds: selectedGroups,
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Errore durante la creazione')
            }

            router.push('/admin/users')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore sconosciuto')
        } finally {
            setLoading(false)
        }
    }

    const toggleGroup = (groupId: string) => {
        setSelectedGroups((prev) =>
            prev.includes(groupId)
                ? prev.filter((id) => id !== groupId)
                : [...prev, groupId]
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                    Nome
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Mario Rossi"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                    Email
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="mario@example.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                    Password
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="••••••••"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                    Ruolo
                </label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'admin' | 'super_admin')}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                </select>
            </div>

            {groups.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                        Gruppi
                    </label>
                    <div className="space-y-2">
                        {groups.map((group) => (
                            <label
                                key={group.id}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedGroups.includes(group.id)}
                                    onChange={() => toggleGroup(group.id)}
                                    className="w-4 h-4 text-orange-500 border-stone-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-stone-700">{group.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                    {loading ? 'Creazione...' : 'Crea Admin'}
                </button>
                <a
                    href="/admin/users"
                    className="py-2 px-4 border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-50 transition-colors"
                >
                    Annulla
                </a>
            </div>
        </form>
    )
}
