'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'

interface OnboardingProps {
    onComplete: () => void
}

const slides = [
    {
        type: 'intro' as const,
        image: '/images/onboarding-1.png',
        title: 'Recensioni autentiche',
        description: 'Un gruppo selezionato di food lover valuta i ristoranti in modo onesto e imparziale'
    },
    {
        type: 'intro' as const,
        image: '/images/onboarding-2-transparent.png',
        title: 'Valutazioni dettagliate',
        description: 'Scopri le recensioni per Location, Menu, Servizio e Conto. Tutto quello che conta davvero.'
    },
    {
        type: 'intro' as const,
        image: '/images/onboarding-3.png',
        title: 'Partecipa anche tu',
        description: 'Unisciti alla community e vota i ristoranti che visiti. La tua opinione conta!'
    },
    {
        type: 'auth' as const,
        title: 'Inizia ora',
        description: 'Accedi o registrati per salvare i tuoi preferiti e votare i ristoranti'
    }
]

export default function Onboarding({ onComplete }: OnboardingProps) {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [touchStart, setTouchStart] = useState(0)
    const [touchEnd, setTouchEnd] = useState(0)
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const { showToast } = useToast()
    const supabase = createClient()

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return

        const distance = touchStart - touchEnd
        const isLeft = distance > 50
        const isRight = distance < -50

        if (isLeft && currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1)
        }
        if (isRight && currentSlide > 0) {
            setCurrentSlide(prev => prev - 1)
        }

        setTouchStart(0)
        setTouchEnd(0)
    }

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1)
        } else {
            // Last slide, skip auth
            onComplete()
        }
    }

    const handleSkip = () => {
        onComplete()
    }

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()

        if (authMode === 'signup') {
            if (!name.trim()) {
                showToast('warning', 'Nome mancante', 'Inserisci il tuo nome')
                return
            }
            if (password !== confirmPassword) {
                showToast('error', 'Password diverse', 'Le password non corrispondono')
                return
            }
        }

        if (!email || !password) {
            showToast('warning', 'Campi mancanti', 'Inserisci email e password')
            return
        }

        setLoading(true)

        try {
            if (authMode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                })

                if (error) {
                    showToast('error', 'Errore login', error.message)
                } else {
                    showToast('success', 'Benvenuto!', 'Login effettuato')
                    setTimeout(() => onComplete(), 500)
                }
            } else {
                // Check for admin invite before signup
                const { data: invite } = await supabase
                    .from('admin_invites')
                    .select('*')
                    .eq('email', email.toLowerCase())
                    .is('used_at', null)
                    .single()

                const { data: authData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: name.trim()
                        }
                    }
                })

                if (signUpError) {
                    showToast('error', 'Errore registrazione', signUpError.message)
                } else if (authData.user) {

                    // Mark invite as used if exists
                    if (invite) {
                        await supabase
                            .from('admin_invites')
                            .update({ used_at: new Date().toISOString() })
                            .eq('id', invite.id)

                        showToast('success', 'Benvenuto Admin!', `Account creato come ${invite.role}`)
                    } else {
                        showToast('success', 'Benvenuto!', 'Account creato con successo')
                    }

                    setTimeout(() => onComplete(), 500)
                }
            }
        } catch (err) {
            showToast('error', 'Errore', 'Qualcosa è andato storto')
        } finally {
            setLoading(false)
        }
    }

    const currentSlideData = slides[currentSlide]
    const isAuthSlide = currentSlideData.type === 'auth'

    return (
        <div
            className="onboarding-container"
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Skip button */}
            <button className="onboarding-skip" onClick={handleSkip}>
                Salta
            </button>

            {/* Logo */}
            <div className="onboarding-logo">
                <Image
                    src="/logo.svg"
                    alt="RankBites"
                    width={180}
                    height={40}
                    style={{ filter: 'brightness(0) invert(1)' }}
                    priority
                />
            </div>

            {/* Slides */}
            {!isAuthSlide && (
                <div className="onboarding-slides">
                    <div
                        className="onboarding-slides-track"
                        style={{ transform: `translateX(-${currentSlide * 100 / 4}%)` }}
                    >
                        {slides.filter(s => s.type === 'intro').map((slide, index) => (
                            <div
                                key={index}
                                className="onboarding-slide"
                                style={{
                                    backgroundImage: `url(${slide.image})`,
                                    backgroundSize: '85%',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Auth Form */}
            {isAuthSlide && (
                <div className="flex flex-col items-center justify-center flex-1 px-6 max-w-md mx-auto">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 w-full">
                        <button
                            onClick={() => setAuthMode('login')}
                            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${authMode === 'login'
                                ? 'bg-white text-orange-500'
                                : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                        >
                            Accedi
                        </button>
                        <button
                            onClick={() => setAuthMode('signup')}
                            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${authMode === 'signup'
                                ? 'bg-white text-orange-500'
                                : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                        >
                            Registrati
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAuth} className="w-full space-y-4">
                        {authMode === 'signup' && (
                            <input
                                type="text"
                                placeholder="Nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/95 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-white"
                                required
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/95 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-white"
                            required
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/95 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-white"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {authMode === 'signup' && (
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Conferma Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/95 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-white"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-white text-orange-500 font-bold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? '...' : (authMode === 'login' ? 'Accedi' : 'Registrati')}
                        </button>
                    </form>
                </div>
            )}

            {/* Content */}
            <div className="onboarding-content">
                <h1 className="onboarding-title">{currentSlideData.title}</h1>
                <p className="onboarding-description">{currentSlideData.description}</p>

                {/* Dots indicator */}
                <div className="onboarding-dots">
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className={`onboarding-dot ${index === currentSlide ? 'onboarding-dot-active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>

                {/* Button - only show if not auth slide */}
                {!isAuthSlide && (
                    <button className="onboarding-button" onClick={handleNext}>
                        {currentSlide === slides.length - 1 ? 'Inizia' : 'Avanti'}
                    </button>
                )}
            </div>
        </div>
    )
}
