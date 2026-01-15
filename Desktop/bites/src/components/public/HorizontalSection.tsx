'use client'

import { ReactNode } from 'react'

interface HorizontalSectionProps {
    title: string
    icon?: string
    children: ReactNode
    showIfEmpty?: boolean
}

export default function HorizontalSection({ title, icon, children, showIfEmpty = true }: HorizontalSectionProps) {
    return (
        <section className="mb-6">
            <h2 className="text-lg font-bold text-stone-800 mb-3 px-4 flex items-center gap-2">
                {icon && <span>{icon}</span>}
                {title}
            </h2>
            <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-3 px-4 pb-2" style={{ scrollSnapType: 'x mandatory' }}>
                    {children}
                </div>
            </div>
        </section>
    )
}
