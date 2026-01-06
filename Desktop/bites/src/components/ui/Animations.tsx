'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedCardProps {
    children: ReactNode
    delay?: number
    className?: string
}

export function AnimatedCard({ children, delay = 0, className = '' }: AnimatedCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function FadeIn({ children, delay = 0, className = '' }: AnimatedCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function SlideIn({ children, delay = 0, direction = 'left' }: AnimatedCardProps & { direction?: 'left' | 'right' }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: direction === 'left' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            {children}
        </motion.div>
    )
}

export function ScaleOnHover({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function StaggerContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: 0.1
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.5 }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function PulseOnMount({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
            {children}
        </motion.div>
    )
}

export function GlowButton({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
    return (
        <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(249, 115, 22, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={className}
            onClick={onClick}
        >
            {children}
        </motion.button>
    )
}
