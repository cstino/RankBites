'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPWABanner() {
    const [showBanner, setShowBanner] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

    useEffect(() => {
        // Check if already installed as PWA
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        if (isStandalone) return

        // Check if already dismissed
        const dismissed = localStorage.getItem('pwa-banner-dismissed')
        if (dismissed) return

        // Detect iOS
        const isIOSDevice = /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        setIsIOS(isIOSDevice)

        // For Android/Chrome - listen for install prompt
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setShowBanner(true)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstall)

        // For iOS - show banner after 2 seconds
        if (isIOSDevice) {
            const timer = setTimeout(() => setShowBanner(true), 2000)
            return () => clearTimeout(timer)
        }

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }, [])

    const handleInstall = async () => {
        if (deferredPrompt) {
            // Android - trigger native install
            await deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') {
                setShowBanner(false)
            }
            setDeferredPrompt(null)
        }
    }

    const handleDismiss = () => {
        setShowBanner(false)
        localStorage.setItem('pwa-banner-dismissed', 'true')
    }

    if (!showBanner) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
            >
                <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <img src="/icon.svg" alt="RankBites" className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-white">
                            <p className="font-semibold text-sm">Installa RankBites</p>
                            <p className="text-xs text-white/80">Accesso rapido dalla Home</p>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-white/60 hover:text-white text-xl leading-none"
                        >
                            ×
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {isIOS ? (
                            // iOS Instructions
                            <div className="space-y-3">
                                <p className="text-sm text-stone-600">
                                    Per installare l'app:
                                </p>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                    <span className="text-stone-700">Tocca <span className="inline-flex items-center px-1.5 py-0.5 bg-stone-100 rounded text-xs">⬆️ Condividi</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                    <span className="text-stone-700">Tocca <span className="font-medium">"Aggiungi a Home"</span></span>
                                </div>
                            </div>
                        ) : (
                            // Android - Install button
                            <div className="space-y-3">
                                <p className="text-sm text-stone-600">
                                    Installa l'app per un accesso più veloce dalla schermata Home.
                                </p>
                                <button
                                    onClick={handleInstall}
                                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all"
                                >
                                    Installa App
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleDismiss}
                            className="w-full mt-3 text-xs text-stone-400 hover:text-stone-600"
                        >
                            Non ora
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
