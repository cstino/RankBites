'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface OnboardingProps {
    onComplete: () => void
}

const slides = [
    {
        image: '/images/onboarding-1.png',
        title: 'Recensioni autentiche',
        description: 'Un gruppo selezionato di food lover valuta i ristoranti in modo onesto e imparziale'
    },
    {
        image: '/images/onboarding-2-transparent.png',
        title: 'Valutazioni dettagliate',
        description: 'Scopri le recensioni per Location, Menu, Servizio e Conto. Tutto quello che conta davvero.'
    },
    {
        image: '/images/onboarding-3.png',
        title: 'Partecipa anche tu',
        description: 'Unisciti alla community e vota i ristoranti che visiti. La tua opinione conta!'
    }
]

export default function Onboarding({ onComplete }: OnboardingProps) {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [touchStart, setTouchStart] = useState(0)
    const [touchEnd, setTouchEnd] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

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
            onComplete()
        }
    }

    const handleSkip = () => {
        onComplete()
    }

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
            <div className="onboarding-slides">
                <div
                    className="onboarding-slides-track"
                    style={{ transform: `translateX(-${currentSlide * 100 / 3}%)` }}
                >
                    {slides.map((slide, index) => (
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

            {/* Content */}
            <div className="onboarding-content">
                <h1 className="onboarding-title">{slides[currentSlide].title}</h1>
                <p className="onboarding-description">{slides[currentSlide].description}</p>

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

                {/* Button */}
                <button className="onboarding-button" onClick={handleNext}>
                    {currentSlide === slides.length - 1 ? 'Inizia' : 'Avanti'}
                </button>
            </div>
        </div>
    )
}
