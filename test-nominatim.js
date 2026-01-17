
async function testNominatim() {
    const query = 'Atri, Teramo';
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

    console.log('Querying:', url);

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'RankBites-App/1.0' // Nominatim requires a User-Agent
            }
        });

        const data = await response.json();
        console.log('Result:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}

testNominatim();
