'use client'

import { ReactNode } from 'react'
import SectionPromoCard from './SectionPromoCard'

interface HorizontalSectionProps {
    title: string
    icon?: string
    children: ReactNode
    showIfEmpty?: boolean
    promoGradient?: string
}

export default function HorizontalSection({
    title,
    icon,
    children,
    showIfEmpty = true,
    promoGradient
}: HorizontalSectionProps) {
    return (
        <section className="mb-8">
            <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-3 px-4 pb-2" style={{ scrollSnapType: 'x mandatory' }}>
                    {/* Promo Card (optional) */}
                    {promoGradient && (
                        <SectionPromoCard
                            title={title}
                            gradient={promoGradient}
                        />
                    )}

                    {/* Restaurant Cards */}
                    {children}
                </div>
            </div>
        </section>
    )
}
