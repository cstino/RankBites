'use client'

import { useState, useMemo } from 'react'
import { Autocomplete, AutocompleteItem } from "@heroui/react"
import citiesData from '@/data/italian-cities.json'

interface CityAutocompleteProps {
    selectedCity: string
    onCityChange: (city: string) => void
}

export default function CityAutocomplete({ selectedCity, onCityChange }: CityAutocompleteProps) {
    // citiesData is an array of strings like "Abano Terme (PD)"
    const [inputValue, setInputValue] = useState(selectedCity)

    // Filter cities based on input
    // We limit to 50 results to prevent rendering issues with large lists
    const filteredCities = useMemo(() => {
        if (!inputValue && !selectedCity) return []

        const query = (inputValue || selectedCity).toLowerCase()
        return (citiesData as string[])
            .filter(city => city.toLowerCase().includes(query))
            .slice(0, 50)
    }, [inputValue, selectedCity])

    const onSelectionChange = (key: React.Key | null) => {
        if (key) {
            onCityChange(key.toString())
            setInputValue(key.toString())
        }
    }

    const onInputChange = (value: string) => {
        setInputValue(value)
        // If user clears input, clear selection ??
        // Maybe strict matching isn't required, but for autocomplete it usually is.
        // We'll let them type freely too?
        // Hero UI Autocomplete usually allows custom value if allowed? 
        // But for "Italian Cities" we want strict selection mostly.
        // Assuming strict selection from list for now, but valid input is synced.
    }

    return (
        <div className="w-full">
            <Autocomplete
                label="Città"
                placeholder="Cerca un comune (es. Roma, Milano)..."
                defaultItems={filteredCities.map(city => ({ label: city, value: city }))}
                items={filteredCities.map(city => ({ label: city, value: city }))}
                inputValue={inputValue}
                onInputChange={onInputChange}
                onSelectionChange={onSelectionChange}
                allowsCustomValue={true} // Allow typing if not in list? Or strictly Italian cities? 
                // Using allowsCustomValue=true so onInputChange controls the value for free typing
                // But we want to encourage selection.
                variant="bordered"
                classNames={{
                    base: "max-w-full",
                    listboxWrapper: "max-h-[320px]",
                    selectorButton: "text-default-500"
                }}
                inputProps={{
                    classNames: {
                        input: "ml-1",
                        inputWrapper: "bg-white border border-stone-200 shadow-sm rounded-xl data-[hover=true]:border-orange-300 group-data-[focus=true]:border-orange-500"
                    }
                }}
            >
                {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
            </Autocomplete>
        </div>
    )
}
