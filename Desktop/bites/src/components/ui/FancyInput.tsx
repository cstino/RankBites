'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface FancyInputProps extends InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode
}

const FancyInput = forwardRef<HTMLInputElement, FancyInputProps>(
    ({ className = '', icon, ...props }, ref) => {
        return (
            <div className="fancy-input-wrapper relative w-full">
                <input
                    ref={ref}
                    className={`
                        w-full px-5 py-4 text-base
                        bg-stone-50 border-2 border-stone-200 rounded-2xl
                        text-stone-700 placeholder-stone-400
                        shadow-[0_0.3rem_#e7e5e4]
                        transition-all duration-300 ease-out
                        hover:bg-stone-100
                        focus:outline-none focus:border-orange-400 
                        focus:shadow-[0_0.4rem_#e7e5e4,inset_0_0_10px_rgba(251,146,60,0.15)]
                        focus:-translate-y-0.5
                        invalid:border-red-400 invalid:animate-shake
                        ${className}
                    `}
                    {...props}
                />
                {icon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                        {icon}
                    </div>
                )}
            </div>
        )
    }
)

FancyInput.displayName = 'FancyInput'

export default FancyInput
