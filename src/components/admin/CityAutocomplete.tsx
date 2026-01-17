'use client'

import { useState, useMemo, useId } from 'react'
import citiesData from '@/data/italian-cities.json'

interface CityAutocompleteProps {
    selectedCity: string
    onCityChange: (city: string) => void
}

export default function CityAutocomplete({ selectedCity, onCityChange }: CityAutocompleteProps) {
    const [inputValue, setInputValue] = useState(selectedCity)
    const listId = useId()

    // Filter cities based on input (limit to 50 for performance)
    const filteredCities = useMemo(() => {
        if (!inputValue) return (citiesData as string[]).slice(0, 50)

        const query = inputValue.toLowerCase()
        return (citiesData as string[])
            .filter(city => city.toLowerCase().includes(query))
            .slice(0, 50)
    }, [inputValue])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setInputValue(value)
        onCityChange(value)
    }

    return (
        <div className="w-full">
            <input
                type="text"
                list={listId}
                value={inputValue}
                onChange={handleChange}
                placeholder="Seleziona Comune"
                className="w-full px-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <datalist id={listId}>
                {filteredCities.map(city => (
                    <option key={city} value={city} />
                ))}
            </datalist>
        </div>
    )
}

