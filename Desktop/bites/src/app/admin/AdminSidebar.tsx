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
            {/* Mobile Bottom Navigation - Neumorphic Style */}
            <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
                <div className="flex bg-white px-3 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl">
                    <div className="flex items-center gap-2">
                        {/* Dashboard */}
                        <a
                            href="/admin"
                            className={`
                                inline-flex items-center justify-center px-5 py-3.5 rounded-xl font-medium transition-all duration-200
                                ${isActive('/admin') && pathname === '/admin'
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                                    : 'text-stone-400 hover:text-stone-600 bg-stone-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                                }
                            `}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                            </svg>
                        </a>

                        {/* Sessions */}
                        <a
                            href="/admin/sessions"
                            className={`
                                inline-flex items-center justify-center px-5 py-3.5 rounded-xl font-medium transition-all duration-200
                                ${pathname.startsWith('/admin/sessions')
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                                    : 'text-stone-400 hover:text-stone-600 bg-stone-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                                }
                            `}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 13h-.68l-2 2h1.91L19 17H5l1.78-2h2.05l-2-2H6l-3 3v4c0 1.1.89 2 1.99 2H19c1.1 0 2-.89 2-2v-4l-3-3zm-1-5.05l-4.95 4.95-3.54-3.54 4.95-4.95 3.54 3.54zM13.95 3l-1.41 1.41 3.54 3.54 1.41-1.41c.78-.78.78-2.05 0-2.83l-.71-.71c-.78-.78-2.05-.78-2.83 0z" />
                            </svg>
                        </a>

                        {/* Restaurants */}
                        <a
                            href="/admin/restaurants"
                            className={`
                                inline-flex items-center justify-center px-5 py-3.5 rounded-xl font-medium transition-all duration-200
                                ${pathname.startsWith('/admin/restaurants')
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                                    : 'text-stone-400 hover:text-stone-600 bg-stone-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                                }
                            `}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
                            </svg>
                        </a>

                        {/* Exit Admin - Go to Public Site */}
                        <a
                            href="/"
                            className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl text-stone-400 hover:text-red-500 bg-stone-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                            </svg>
                        </a>

                        {/* Settings (Super Admin) */}
                        {role === 'super_admin' && (
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl text-stone-400 hover:text-stone-600 bg-stone-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                                </svg>
                            </button>
                        )}
                    </div>
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
