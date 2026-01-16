interface SectionPromoCardProps {
    title: string
    gradient: string
}

export default function SectionPromoCard({ title, gradient }: SectionPromoCardProps) {
    return (
        <div
            className="flex-shrink-0 w-[300px] rounded-2xl overflow-hidden shadow-md border border-stone-100 relative"
            style={{
                background: gradient,
                height: '270px' // Match restaurant card height
            }}
        >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 bg-white -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10 bg-white translate-y-8 -translate-x-8"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full opacity-15 bg-white"></div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center px-6">
                <h3 className="text-3xl font-bold text-white leading-tight mb-2">
                    {title}
                </h3>
                <p className="text-sm text-white opacity-90 font-medium">
                    Su RankBites
                </p>
            </div>
        </div>
    )
}
