'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BottomNav() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const supabase = createClient()

        const checkAdmin = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser()
                console.log('BottomNav user:', user, 'error:', userError)
                if (user) {
                    const { data: profile, error: profileError } = await supabase
                        .from('users')
                        .select('role')
                        .eq('id', user.id)
                        .single()
                    console.log('BottomNav profile:', profile, 'error:', profileError)
                    const isAdminRole = profile?.role === 'admin' || profile?.role === 'super_admin'
                    console.log('BottomNav isAdmin:', isAdminRole)
                    setIsAdmin(isAdminRole)
                }
            } catch (err) {
                console.error('BottomNav checkAdmin error:', err)
            }
        }

        checkAdmin()
    }, [])

    const isActive = (path: string) => {
        const hasSearchFocus = searchParams.has('cerca')
        const hasPreferiti = searchParams.get('preferiti') === 'true'

        if (path === '/') {
            return pathname === '/' && !hasSearchFocus && !hasPreferiti
        }
        if (path === '/preferiti') {
            return hasPreferiti
        }
        if (path === '/cerca') {
            return hasSearchFocus
        }
        return pathname.startsWith(path)
    }

    const navItems = [
        {
            href: '/',
            label: 'Home',
            path: '/',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
            ),
            activeIcon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                </svg>
            )
        },
        {
            href: '/?cerca=true',
            label: 'Cerca',
            path: '/cerca',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
            ),
            activeIcon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                </svg>
            )
        },
        {
            href: '/?preferiti=true',
            label: 'Preferiti',
            path: '/preferiti',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            ),
            activeIcon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
            )
        }
    ]

    // Add admin if user is admin
    const adminItem = {
        href: '/admin',
        label: 'Admin',
        path: '/admin',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        ),
        activeIcon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
        )
    }

    const allItems = isAdmin ? [...navItems, adminItem] : navItems

    return (
        <nav className="thefork-nav">
            <div className="thefork-nav-container">
                {allItems.map((item) => {
                    const active = isActive(item.path)
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`thefork-nav-item ${active ? 'thefork-nav-item-active' : ''}`}
                        >
                            <div className={`thefork-nav-icon ${active ? 'thefork-nav-icon-active' : ''}`}>
                                {active ? item.activeIcon : item.icon}
                            </div>
                            <span className={`thefork-nav-label ${active ? 'thefork-nav-label-active' : ''}`}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

