'use client'

import { useState, useEffect } from 'react'
import Onboarding from '@/components/public/Onboarding'

const ONBOARDING_KEY = 'rankbites_onboarding_completed'

interface OnboardingWrapperProps {
    children: React.ReactNode
}

export default function OnboardingWrapper({ children }: OnboardingWrapperProps) {
    const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null)

    useEffect(() => {
        // Check if onboarding was already completed
        const completed = localStorage.getItem(ONBOARDING_KEY)
        setShowOnboarding(!completed)
    }, [])

    const handleOnboardingComplete = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true')
        setShowOnboarding(false)
    }

    // Still loading localStorage
    if (showOnboarding === null) {
        return null
    }

    return (
        <>
            {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
            {children}
        </>
    )
}
