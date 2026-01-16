'use client'

import { useState, useMemo } from 'react'
import { Autocomplete, AutocompleteItem } from "@heroui/react"
import citiesData from '@/data/italian-cities.json'

interface CityAutocompleteProps {
    selectedCity: string
    onCityChange: (city: string) => void
}

export default function CityAutocomplete({ selectedCity, onCityChange }: CityAutocompleteProps) {
    const [inputValue, setInputValue] = useState(selectedCity)

    // Filter cities based on input (limit to 50 for performance)
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
    }

    return (
        <div className="w-full">
            <Autocomplete
                placeholder="Seleziona Comune"
                defaultItems={filteredCities.map(city => ({ label: city, value: city }))}
                items={filteredCities.map(city => ({ label: city, value: city }))}
                inputValue={inputValue}
                onInputChange={onInputChange}
                onSelectionChange={onSelectionChange}
                allowsCustomValue={true}
                variant="bordered"
                classNames={{
                    base: "max-w-full",
                    listboxWrapper: "max-h-[320px] bg-white shadow-xl rounded-lg",
                    selectorButton: "text-default-500"
                }}
                inputProps={{
                    classNames: {
                        input: "ml-1",
                        inputWrapper: "bg-white border border-stone-200 shadow-sm rounded-xl data-[hover=true]:border-orange-300 group-data-[focus=true]:border-orange-500"
                    }
                }}
                listboxProps={{
                    itemClasses: {
                        base: "bg-white hover:bg-stone-50 data-[hover=true]:bg-stone-50"
                    }
                }}
            >
                {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
            </Autocomplete>
        </div>
    )
}
