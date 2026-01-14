'use client'

import { motion } from 'framer-motion'

interface RestaurantDetailClientProps {
    restaurant: any
    photos: any[]
}

export default function RestaurantDetailClient({ restaurant, photos }: RestaurantDetailClientProps) {
    const getRatingColor = (rating: number) => {
        if (rating >= 9) return 'text-violet-500'
        if (rating >= 7) return 'text-green-600'
        if (rating >= 6) return 'text-green-500'
        if (rating >= 5) return 'text-orange-500'
        if (rating >= 3) return 'text-red-500'
        return 'text-rose-700'
    }

    const getRatingBg = (rating: number) => {
        if (rating >= 9) return 'from-sky-400 to-violet-500'      // 9-10: azzurro-viola
        if (rating >= 7) return 'from-green-500 to-green-700'     // 7-8: verde-verde scuro
        if (rating >= 6) return 'from-lime-400 to-green-500'      // 6: verde chiaro-verde
        if (rating >= 5) return 'from-orange-400 to-yellow-400'   // 5: arancione-giallo
        if (rating >= 3) return 'from-red-500 to-red-600'         // 3-4: rosso-rosso fuoco
        return 'from-rose-800 to-red-600'                         // 1-2: bordeaux-rosso
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-stone-200/50 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <a href="/" className="flex items-center gap-2 group">
                        <img src="/logo.svg" alt="RankBites" className="h-8 group-hover:scale-105 transition-transform" />
                    </a>
                    <a
                        href="/"
                        className="text-sm text-stone-600 hover:text-orange-500 transition-colors font-medium"
                    >
                        ← Torna alla lista
                    </a>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Hero Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="aspect-video md:aspect-[21/9] bg-gradient-to-br from-stone-200 to-stone-300 rounded-3xl overflow-hidden mb-8 shadow-xl"
                >
                    {restaurant.cover_photo_url ? (
                        <img
                            src={restaurant.cover_photo_url}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-8xl text-stone-300">
                            🍽️
                        </div>
                    )}
                </motion.div>

                {/* Main Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 mb-6 shadow-lg"
                >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                        <div>
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-block px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-600 text-sm font-medium rounded-full"
                            >
                                {restaurant.category}
                            </motion.span>
                            <h1 className="text-3xl md:text-4xl font-black text-stone-900 mt-2">
                                {restaurant.name}
                            </h1>
                            <p className="text-stone-500 mt-2 flex items-center gap-2 flex-wrap">
                                <span className="flex items-center gap-1">
                                    <span>📍</span>
                                    {restaurant.city || 'Posizione non specificata'}
                                </span>
                                {restaurant.maps_link && (
                                    <>
                                        <span className="text-stone-300">•</span>
                                        <a
                                            href={restaurant.maps_link.startsWith('http')
                                                ? restaurant.maps_link
                                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.maps_link)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-orange-500 hover:text-orange-600 font-medium"
                                        >
                                            Apri su Maps →
                                        </a>
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Overall Rating */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                            className={`text-center bg-gradient-to-br ${getRatingBg(restaurant.overall_rating)} rounded-2xl p-5 min-w-[120px] shadow-lg`}
                        >
                            <p className="text-5xl font-black text-white">
                                {restaurant.overall_rating.toFixed(1)}
                            </p>
                            <p className="text-sm text-white/80 mt-1 font-medium">Voto Complessivo</p>
                        </motion.div>
                    </div>

                    {/* AI Review - TEMPORARILY HIDDEN
                    {restaurant.ai_review && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 mb-6 border border-orange-100"
                        >
                            <p className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-2">
                                <span className="text-xl">✨</span> Mini-review IA
                            </p>
                            <p className="text-stone-700 leading-relaxed italic">"{restaurant.ai_review}"</p>
                        </motion.div>
                    )}
                    */}

                    {/* Category Ratings */}
                    {restaurant.category_ratings && Object.keys(restaurant.category_ratings).length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h2 className="font-bold text-stone-900 mb-4 text-lg">Valutazioni per categoria</h2>
                            <div className="space-y-4">
                                {['Location', 'Menu', 'Servizio', 'Conto']
                                    .filter(name => restaurant.category_ratings[name] !== undefined)
                                    .map((name, index) => {
                                        const score = restaurant.category_ratings[name] as number
                                        return (
                                            <motion.div
                                                key={name}
                                                className="flex items-center gap-4"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 + index * 0.1 }}
                                            >
                                                <span className="w-24 text-stone-600 font-medium">{name}</span>
                                                <div className="flex-1 bg-stone-100 rounded-full h-3 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${score * 10}%` }}
                                                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                                                        className={`h-full rounded-full bg-gradient-to-r ${getRatingBg(score)}`}
                                                    />
                                                </div>
                                                <span className={`w-10 text-right font-bold ${getRatingColor(score)}`}>
                                                    {score.toFixed(1)}
                                                </span>
                                            </motion.div>
                                        )
                                    })}
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Photo Gallery */}
                {photos && photos.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-lg"
                    >
                        <h2 className="font-bold text-stone-900 mb-4 text-lg">📸 Galleria</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {photos.map((photo: any, index: number) => (
                                <motion.div
                                    key={photo.id}
                                    className="aspect-square rounded-xl overflow-hidden bg-stone-100"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 + index * 0.05 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <img
                                        src={photo.photo_url}
                                        alt={photo.caption || restaurant.name}
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-stone-900 text-stone-400 py-12 mt-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <a href="/" className="flex items-center justify-center gap-2 text-lg">
                        <img src="/logo.svg" alt="RankBites" className="h-6 brightness-0 invert" />
                    </a>
                    <p className="text-sm mt-3 text-stone-500">
                        Recensioni basate su dati reali di gruppo
                    </p>
                </div>
            </footer>
        </div>
    )
}
