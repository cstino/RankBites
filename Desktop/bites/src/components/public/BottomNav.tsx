'use client'

import { usePathname } from 'next/navigation'

export default function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        { href: '/', icon: '🏠', label: 'Home' },
        { href: '/?search=focus', icon: '🔍', label: 'Cerca' },
        { href: '/mappa', icon: '🗺️', label: 'Mappa' },
        { href: '/?minRating=8', icon: '⭐', label: 'Top' },
    ]

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => {
                const isActive = pathname === item.href ||
                    (item.href === '/' && pathname === '/' && !item.href.includes('?'))

                return (
                    <a
                        key={item.label}
                        href={item.href}
                        className={`bottom-nav-item ${isActive ? 'bottom-nav-item-active' : ''}`}
                    >
                        <span className="bottom-nav-icon">{item.icon}</span>
                        <span className="bottom-nav-label">{item.label}</span>
                    </a>
                )
            })}
        </nav>
    )
}
