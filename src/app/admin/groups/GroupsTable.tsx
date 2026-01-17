'use client'

import { Group } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface GroupWithCount extends Group {
    user_groups: { count: number }[]
}

export default function GroupsTable({ groups }: { groups: GroupWithCount[] }) {
    const [deleting, setDeleting] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleDelete = async (groupId: string) => {
        if (!confirm('Sei sicuro di voler eliminare questo gruppo?')) return

        setDeleting(groupId)
        await supabase.from('groups').delete().eq('id', groupId)
        router.refresh()
        setDeleting(null)
    }

    return (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            Nome Gruppo
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            Membri
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            Azioni
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                    {groups.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-stone-500">
                                <p className="text-4xl mb-2">📁</p>
                                <p>Nessun gruppo creato</p>
                            </td>
                        </tr>
                    ) : (
                        groups.map((group) => (
                            <tr key={group.id} className="hover:bg-stone-50">
                                <td className="px-6 py-4">
                                    <span className="font-medium text-stone-900">{group.name}</span>
                                </td>
                                <td className="px-6 py-4 text-stone-600">
                                    {group.user_groups?.[0]?.count || 0} admin
                                </td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <a
                                        href={`/admin/groups/${group.id}`}
                                        className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                                    >
                                        Modifica
                                    </a>
                                    <button
                                        onClick={() => handleDelete(group.id)}
                                        disabled={deleting === group.id}
                                        className="text-red-500 hover:text-red-600 font-medium text-sm disabled:opacity-50"
                                    >
                                        {deleting === group.id ? 'Eliminazione...' : 'Elimina'}
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
