import { NextResponse } from 'next/server'
import OpenLocationCode from 'open-location-code'

export async function POST(request: Request) {
    try {
        const { url, type, query } = await request.json()

        // Handle Geocoding request (using Nominatim)
        if (type === 'geocode' && query) {
            console.log('📍 Geocoding query:', query)
            try {
                const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
                const response = await fetch(nominatimUrl, {
                    headers: {
                        'User-Agent': 'RankBites-App/1.0'
                    }
                })

                const data = await response.json()
                if (data && data.length > 0) {
                    const result = {
                        latitude: data[0].lat,
                        longitude: data[0].lon,
                        displayName: data[0].display_name
                    }
                    console.log('📍 Geocoding result:', result)
                    return NextResponse.json(result)
                }
                return NextResponse.json({ error: 'Nessun risultato trovato' }, { status: 404 })
            } catch (error) {
                console.error('Geocoding error:', error)
                return NextResponse.json({ error: 'Errore geocoding' }, { status: 500 })
            }
        }

        if (!url) {
            return NextResponse.json({ error: 'Input mancante' }, { status: 400 })
        }

        console.log('📍 Input received:', url)

        const result: {
            name?: string
            address?: string
            city?: string
            latitude?: string
            longitude?: string
            expandedUrl?: string
        } = {}

        // Check if it's a Plus Code (format: XXXX+XX City, Region)
        const plusCodeMatch = url.match(/^([A-Z0-9]{4,8}\+[A-Z0-9]{2,3})\s+(.+)$/i)
        if (plusCodeMatch) {
            const plusCode = plusCodeMatch[1].toUpperCase()
            const location = plusCodeMatch[2]

            console.log('📍 Plus Code detected:', plusCode)
            console.log('📍 Location:', location)

            // Parse city from location (format: "City, Province" or just "City")
            const locationParts = location.split(',').map((p: string) => p.trim())
            result.city = locationParts[0]
            if (locationParts.length > 1) {
                result.address = location
            }

            // Try to decode Plus Code to coordinates
            // Plus Codes need a reference location to be fully decoded
            // We'll try to decode it assuming it's a full code
            try {
                // For short Plus Codes, we need to get coordinates from Google Maps Geocoding API
                // For now, we'll just store the location info and skip coordinate extraction
                // In production, you'd use Google Geocoding API here

                // Check if it's a full Plus Code (8+ characters before +)
                if (plusCode.length >= 8) {
                    const decoded = OpenLocationCode.decode(plusCode)
                    if (decoded) {
                        result.latitude = decoded.latitudeCenter.toFixed(6)
                        result.longitude = decoded.longitudeCenter.toFixed(6)
                        console.log('📍 Decoded coordinates:', result.latitude, result.longitude)
                    }
                }
            } catch (e) {
                console.log('📍 Could not decode Plus Code, using location only')
            }

            return NextResponse.json(result)
        }

        // It's a URL - try to expand and parse
        let expandedUrl = url

        if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
            try {
                let currentUrl = url
                let hops = 0
                const maxHops = 5

                while (hops < maxHops) {
                    const controller = new AbortController()
                    const timeout = setTimeout(() => controller.abort(), 5000)

                    const response = await fetch(currentUrl, {
                        method: 'GET',
                        redirect: 'manual',
                        signal: controller.signal,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    })

                    clearTimeout(timeout)

                    const locationHeader = response.headers.get('location')

                    if (locationHeader) {
                        console.log(`📍 Hop ${hops + 1}: Redirects to ${locationHeader}`)

                        // Check if the redirect URL contains coordinates
                        const coordsMatch = locationHeader.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
                        if (coordsMatch) {
                            result.latitude = coordsMatch[1]
                            result.longitude = coordsMatch[2]
                            console.log('📍 Coordinates found in redirect:', result.latitude, result.longitude)
                        }

                        const dataMatch = locationHeader.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
                        if (dataMatch) {
                            result.latitude = dataMatch[1]
                            result.longitude = dataMatch[2]
                            console.log('📍 Coordinates found in data param:', result.latitude, result.longitude)
                        }

                        currentUrl = locationHeader
                        expandedUrl = locationHeader
                        hops++
                    } else {
                        // No more redirects
                        if (response.status === 200) {
                            // If we reached a 200 page, maybe the URL is in the body (client-side redirect)
                            const text = await response.text()
                            const urlMatch = text.match(/https:\/\/maps\.google\.com\/maps\/place\/[^"]+/)
                            if (urlMatch) {
                                expandedUrl = urlMatch[0]
                                console.log('📍 Found URL in body:', expandedUrl)
                            }
                        }
                        break
                    }
                }
            } catch (error) {
                console.error('Error expanding URL:', error)
            }
        }

        result.expandedUrl = expandedUrl

        // Extract coordinates from @lat,lng pattern
        const coordsMatch = expandedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
        if (coordsMatch) {
            result.latitude = coordsMatch[1]
            result.longitude = coordsMatch[2]
            console.log('📍 Coordinates found:', result.latitude, result.longitude)
        }

        // Alternative: !3d...!4d... pattern
        if (!result.latitude) {
            const dataMatch = expandedUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
            if (dataMatch) {
                result.latitude = dataMatch[1]
                result.longitude = dataMatch[2]
            }
        }

        // Extract place info
        const placeMatch = expandedUrl.match(/\/place\/([^/@]+)/)
        if (placeMatch) {
            const fullPlace = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
            console.log('📍 Place string:', fullPlace)

            const parts = fullPlace.split(',').map(p => p.trim())

            if (parts.length >= 2) {
                result.address = parts.slice(0, -1).join(', ')
                result.city = parts[parts.length - 1]
            } else if (parts.length === 1) {
                result.address = parts[0]
            }
        }

        console.log('📍 Final result:', result)
        return NextResponse.json(result)
    } catch (error) {
        console.error('Error in Maps API:', error)
        return NextResponse.json(
            { error: 'Errore', details: String(error) },
            { status: 500 }
        )
    }
}
