import { NextResponse } from 'next/server'
import OpenLocationCode from 'open-location-code'

export async function POST(request: Request) {
    try {
        const { url, type, query, lat, lng } = await request.json()

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

        // Handle Reverse Geocoding request (lat/lng to city)
        if (type === 'reverse' && lat && lng) {
            console.log('📍 Reverse geocoding:', lat, lng)
            try {
                const reverseUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=10`
                const response = await fetch(reverseUrl, {
                    headers: {
                        'User-Agent': 'RankBites-App/1.0'
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    console.log('📍 Reverse geocoding raw result:', JSON.stringify(data.address, null, 2))

                    // Priority: city > town > municipality > village > county
                    // In Italy, the "comune" is typically in town, city, or municipality
                    const address = data.address || {}
                    const city = address.city ||
                        address.town ||
                        address.municipality ||
                        address.village ||
                        address.county

                    const result = {
                        city: city || null,
                        address: data.display_name,
                        raw: address
                    }
                    console.log('📍 Reverse geocoding city:', city)
                    return NextResponse.json(result)
                }
                return NextResponse.json({ error: 'Reverse geocoding failed' }, { status: 500 })
            } catch (error) {
                console.error('Reverse geocoding error:', error)
                return NextResponse.json({ error: 'Errore reverse geocoding' }, { status: 500 })
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
            console.log('📍 Reference location:', location)

            // Parse location for fallback
            const locationParts = location.split(',').map((p: string) => p.trim())
            const fallbackCity = locationParts[0]
            if (locationParts.length > 1) {
                result.address = location
            }

            try {
                // First, geocode the reference location to get approximate coordinates
                console.log('📍 Geocoding reference location...')
                const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`
                const geoResponse = await fetch(geoUrl, {
                    headers: { 'User-Agent': 'RankBites-App/1.0' }
                })

                if (geoResponse.ok) {
                    const geoData = await geoResponse.json()

                    if (geoData && geoData.length > 0) {
                        const refLat = parseFloat(geoData[0].lat)
                        const refLng = parseFloat(geoData[0].lon)
                        console.log('📍 Reference coordinates:', refLat, refLng)

                        // Check if the Plus Code is full or short
                        const beforePlus = plusCode.split('+')[0]
                        let lat: number, lng: number

                        if (beforePlus.length >= 8) {
                            // Full Plus Code - decode directly
                            console.log('📍 Full Plus Code, decoding...')
                            const decoded = OpenLocationCode.decode(plusCode)
                            lat = decoded.latitudeCenter
                            lng = decoded.longitudeCenter
                        } else {
                            // Short Plus Code - use reference location coordinates
                            // These are accurate enough for city-level reverse geocoding
                            console.log('📍 Short Plus Code, using reference coordinates...')
                            lat = refLat
                            lng = refLng
                        }

                        result.latitude = lat.toFixed(6)
                        result.longitude = lng.toFixed(6)
                        console.log('📍 Final coordinates:', result.latitude, result.longitude)

                        // Use reverse geocoding to get the correct municipality
                        console.log('📍 Reverse geocoding for correct city...')
                        const reverseUrl = `https://nominatim.openstreetmap.org/reverse?lat=${result.latitude}&lon=${result.longitude}&format=json&addressdetails=1&zoom=10`
                        const reverseResponse = await fetch(reverseUrl, {
                            headers: { 'User-Agent': 'RankBites-App/1.0' }
                        })

                        if (reverseResponse.ok) {
                            const reverseData = await reverseResponse.json()
                            console.log('📍 Reverse geocoding address:', JSON.stringify(reverseData.address, null, 2))

                            // Priority: city > town > municipality > village > county
                            const address = reverseData.address || {}
                            const correctCity = address.city ||
                                address.town ||
                                address.municipality ||
                                address.village ||
                                address.county

                            if (correctCity) {
                                result.city = correctCity
                                console.log('📍 Correct municipality:', correctCity)
                            } else {
                                result.city = fallbackCity
                                console.log('📍 Using fallback city:', fallbackCity)
                            }
                        } else {
                            result.city = fallbackCity
                        }
                    } else {
                        console.log('📍 Could not geocode reference location, using fallback')
                        result.city = fallbackCity
                    }
                } else {
                    result.city = fallbackCity
                }
            } catch (e) {
                console.error('📍 Plus Code processing error:', e)
                result.city = fallbackCity
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
