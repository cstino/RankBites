'use client'

interface RatingSelectorProps {
    value: number
    onChange: (value: number) => void
    categoryName?: string
}

export default function RatingSelector({ value, onChange, categoryName }: RatingSelectorProps) {
    const getButtonColors = (score: number, isSelected: boolean) => {
        if (!isSelected) {
            return 'bg-stone-100 text-stone-400 hover:bg-stone-200'
        }

        if (score <= 2) {
            return 'bg-stone-900 text-white'
        } else if (score <= 4) {
            return 'bg-red-500 text-white'
        } else if (score <= 6) {
            return 'bg-yellow-500 text-white'
        } else if (score <= 8) {
            return 'bg-green-500 text-white'
        } else {
            return 'bg-sky-500 text-white'
        }
    }

    const getSliderBackground = () => {
        if (value <= 2) {
            return 'bg-stone-900'
        } else if (value <= 4) {
            return 'bg-red-500'
        } else if (value <= 6) {
            return 'bg-yellow-500'
        } else if (value <= 8) {
            return 'bg-green-500'
        } else {
            return 'bg-sky-500'
        }
    }

    return (
        <div className="rating-selector">
            <div className="flex items-center gap-1 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                    const isSelected = score === value
                    return (
                        <button
                            key={score}
                            type="button"
                            onClick={() => onChange(score)}
                            className={`
                                flex-1 aspect-square max-w-[36px] rounded-lg font-bold text-sm
                                transition-all duration-150 ease-out
                                ${getButtonColors(score, isSelected)}
                                ${isSelected ? 'scale-110 shadow-lg ring-2 ring-offset-1 ring-stone-300' : 'scale-100'}
                            `}
                        >
                            {score}
                        </button>
                    )
                })}
            </div>

            {/* Selected value indicator */}
            <div className="mt-2 flex items-center justify-center">
                <span className={`
                    inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium
                    ${getSliderBackground()} text-white
                `}>
                    {value <= 2 && 'Pessimo'}
                    {value > 2 && value <= 4 && 'Insufficiente'}
                    {value > 4 && value <= 6 && 'Sufficiente'}
                    {value > 6 && value <= 8 && 'Buono'}
                    {value > 8 && 'Eccellente'}
                </span>
            </div>
        </div>
    )
}
