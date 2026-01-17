
const testUrl = 'https://maps.app.goo.gl/wr7jo5qLam6PWSe68?g_st=ic';

async function testExpand() {
    console.log('Testing URL:', testUrl);
    let currentUrl = testUrl;
    let hops = 0;

    while (hops < 5) {
        try {
            console.log(`\n--- Hop ${hops + 1} ---`);
            console.log('Fetching:', currentUrl);

            const response = await fetch(currentUrl, {
                method: 'HEAD',
                redirect: 'manual',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            console.log('Status:', response.status);
            const location = response.headers.get('location');
            console.log('Location:', location);

            if (location) {
                // Check for coords in location
                const coordsMatch = location.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (coordsMatch) {
                    console.log('!!! COORDS FOUND IN LOCATION !!!');
                    console.log(coordsMatch[1], coordsMatch[2]);
                    break;
                }

                // Check for data param
                const dataMatch = location.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
                if (dataMatch) {
                    console.log('!!! COORDS FOUND IN DATA !!!');
                    console.log(dataMatch[1], dataMatch[2]);
                    break;
                }

                currentUrl = location;
                hops++;
            } else {
                console.log('No redirect location found.');
                break;
            }

        } catch (e) {
            console.error('Error:', e);
            break;
        }
    }
}

testExpand();
