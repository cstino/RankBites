import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile and verify admin role
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    // SECURITY: Only allow admin and super_admin roles
    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
        redirect('/')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-50">
            {/* Top Navigation */}
            <nav className="bg-white/80 backdrop-blur-lg border-b border-stone-200/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <a href="/admin" className="flex items-center gap-2">
                                <img src="/logo.svg" alt="RankBites" className="h-8" />
                            </a>
                            <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-1 rounded-full font-semibold">
                                Admin
                            </span>
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-stone-900">{profile?.name || user.email}</p>
                                <p className="text-xs text-stone-500 capitalize">{profile?.role || 'admin'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-4 md:p-8 max-w-4xl mx-auto">
                {children}
            </main>
        </div>
    )
}


