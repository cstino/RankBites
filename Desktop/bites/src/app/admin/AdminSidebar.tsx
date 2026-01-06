'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface AdminSidebarProps {
    role?: string
}

const navItems = [
    { href: '/admin', icon: '📊', label: 'Dashboard' },
    { href: '/admin/sessions', icon: '🗳️', label: 'Sessioni' },
    { href: '/admin/restaurants', icon: '🍕', label: 'Ristoranti' },
]

const superAdminItems = [
    { href: '/admin/users', icon: '👥', label: 'Gestione Admin' },
    { href: '/admin/groups', icon: '📁', label: 'Gruppi' },
    { href: '/admin/categories', icon: '📋', label: 'Categorie Voto' },
]

export default function AdminSidebar({ role }: AdminSidebarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin'
        }
        return pathname.startsWith(href)
    }

    const NavLink = ({ href, icon, label }: { href: string; icon: string; label: string }) => (
        <a
            href={href}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(href)
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
        >
            <span className="text-xl">{icon}</span>
            <span className="font-medium">{label}</span>
        </a>
    )

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-40 safe-area-pb">
                <div className="flex justify-around py-2">
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${isActive(item.href)
                                    ? 'text-orange-500'
                                    : 'text-stone-500'
                                }`}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-xs font-medium">{item.label}</span>
                        </a>
                    ))}
                    {role === 'super_admin' && (
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="flex flex-col items-center gap-1 px-4 py-2 text-stone-500"
                        >
                            <span className="text-2xl">⚙️</span>
                            <span className="text-xs font-medium">Altro</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/50 z-50"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6"
                        >
                            <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-6" />
                            <h3 className="text-lg font-bold text-stone-900 mb-4">Super Admin</h3>
                            <div className="space-y-2">
                                {superAdminItems.map((item) => (
                                    <NavLink key={item.href} {...item} />
                                ))}
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full mt-4 py-3 text-stone-500 font-medium"
                            >
                                Chiudi
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white/80 backdrop-blur-lg border-r border-stone-200/50 overflow-y-auto">
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink key={item.href} {...item} />
                    ))}

                    {role === 'super_admin' && (
                        <>
                            <div className="pt-6 pb-2">
                                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-4">
                                    Super Admin
                                </p>
                            </div>
                            {superAdminItems.map((item) => (
                                <NavLink key={item.href} {...item} />
                            ))}
                        </>
                    )}
                </nav>

                {/* Quick Actions */}
                <div className="p-4 border-t border-stone-200 mt-4">
                    <a
                        href="/admin/sessions/new"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all"
                    >
                        <span>+</span>
                        <span>Nuova Sessione</span>
                    </a>
                </div>
            </aside>
        </>
    )
}
