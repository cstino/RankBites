'use client'

import { User } from '@/types'

interface UserWithGroups extends User {
    user_groups: { group: { id: string; name: string } }[]
}

export default function UsersTable({ users }: { users: UserWithGroups[] }) {
    return (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            Nome
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            Ruolo
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            Gruppi
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            Azioni
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                                <p className="text-4xl mb-2">👥</p>
                                <p>Nessun admin trovato</p>
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id} className="hover:bg-stone-50">
                                <td className="px-6 py-4">
                                    <span className="font-medium text-stone-900">{user.name}</span>
                                </td>
                                <td className="px-6 py-4 text-stone-600">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.role === 'super_admin'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-blue-100 text-blue-700'
                                            }`}
                                    >
                                        {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {user.user_groups?.map((ug) => (
                                            <span
                                                key={ug.group.id}
                                                className="inline-flex px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded"
                                            >
                                                {ug.group.name}
                                            </span>
                                        ))}
                                        {(!user.user_groups || user.user_groups.length === 0) && (
                                            <span className="text-stone-400 text-sm">-</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <a
                                        href={`/admin/users/${user.id}`}
                                        className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                                    >
                                        Modifica
                                    </a>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
