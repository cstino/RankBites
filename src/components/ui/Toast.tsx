'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ToastType = 'success' | 'warning' | 'error'

interface Toast {
    id: string
    type: ToastType
    title: string
    message: string
}

interface ToastContextType {
    showToast: (type: ToastType, title: string, message: string) => void
    hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

const toastConfig = {
    success: {
        fillColor: '#66cdaa',
        textColor: 'text-[#66cdaa]',
        strokeColor: 'mediumseagreen',
        icon: (
            <svg
                className="w-7 h-7"
                fill="none"
                stroke="mediumseagreen"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                />
            </svg>
        ),
    },
    warning: {
        fillColor: 'tan',
        textColor: 'text-[peru]',
        strokeColor: 'peru',
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="peru"
                fill="none"
                className="w-7 h-7"
            >
                <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </svg>
        ),
    },
    error: {
        fillColor: 'indianred',
        textColor: 'text-[indianred]',
        strokeColor: 'indianred',
        icon: (
            <svg
                className="w-7 h-7"
                fill="none"
                stroke="indianred"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                />
            </svg>
        ),
    },
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const config = toastConfig[toast.type]

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="flex w-[90%] max-w-96 h-24 bg-white rounded-xl overflow-hidden shadow-lg"
        >
            <svg width="16" height="96" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M 8 0 
                       Q 4 4.8, 8 9.6 
                       T 8 19.2 
                       Q 4 24, 8 28.8 
                       T 8 38.4 
                       Q 4 43.2, 8 48 
                       T 8 57.6 
                       Q 4 62.4, 8 67.2 
                       T 8 76.8 
                       Q 4 81.6, 8 86.4 
                       T 8 96 
                       L 0 96 
                       L 0 0 
                       Z"
                    fill={config.fillColor}
                    stroke={config.fillColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
            <div className="mx-2.5 overflow-hidden w-full">
                <p className={`mt-1.5 text-xl font-bold ${config.textColor} leading-8 mr-3 overflow-hidden text-ellipsis whitespace-nowrap`}>
                    {toast.title}
                </p>
                <p className="overflow-hidden leading-5 break-all text-zinc-400 max-h-10 text-sm">
                    {toast.message}
                </p>
            </div>
            <button
                onClick={onClose}
                className="w-16 cursor-pointer focus:outline-none flex items-center justify-center"
            >
                {config.icon}
            </button>
        </motion.div>
    )
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((type: ToastType, title: string, message: string) => {
        const id = Math.random().toString(36).substring(7)
        setToasts((prev) => [...prev, { id, type, title, message }])

        // Auto-hide after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 4000)
    }, [])

    const hideToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <div key={toast.id} className="pointer-events-auto">
                            <ToastItem
                                toast={toast}
                                onClose={() => hideToast(toast.id)}
                            />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}
