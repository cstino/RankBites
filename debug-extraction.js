
const testUrl = 'https://maps.app.goo.gl/wr7jo5qLam6PWSe68?g_st=ic';

async function debugExtraction() {
    console.log('🔍 Debugging URL:', testUrl);

    let currentUrl = testUrl;
    let hops = 0;
    const maxHops = 10;

    while (hops < maxHops) {
        console.log(`\n--- Hop ${hops + 1} ---`);
        console.log('Fetching:', currentUrl);

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(currentUrl, {
                method: 'GET',
                redirect: 'manual',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5'
                }
            });

            clearTimeout(timeout);

            console.log('Status:', response.status);
            const locationHeader = response.headers.get('location');
            console.log('Location Header:', locationHeader);

            // Check for coords in the current URL (in case we landed on a page with coords)
            checkCoords(currentUrl, 'Current URL');

            if (locationHeader) {
                checkCoords(locationHeader, 'Location Header');
                currentUrl = locationHeader;
                hops++;
            } else {
                console.log('No redirect location found.');

                if (response.status === 200) {
                    const text = await response.text();
                    console.log('Body length:', text.length);

                    // Look for meta refresh
                    const metaRefresh = text.match(/<meta\s+http-equiv="refresh"\s+content="[^"]*url=([^"]*)"/i);
                    if (metaRefresh) {
                        console.log('Found Meta Refresh:', metaRefresh[1]);
                        checkCoords(metaRefresh[1], 'Meta Refresh');
                        currentUrl = metaRefresh[1];
                        hops++;
                        continue;
                    }

                    // Look for JS redirect
                    const jsRedirect = text.match(/window\.location\.href\s*=\s*"([^"]*)"/);
                    if (jsRedirect) {
                        console.log('Found JS Redirect:', jsRedirect[1]);
                        checkCoords(jsRedirect[1], 'JS Redirect');
                        currentUrl = jsRedirect[1];
                        hops++;
                        continue;
                    }

                    // Look for specific Google Maps patterns in body
                    // Pattern: https://www.google.com/maps/place/...
                    const urlMatch = text.match(/https:\/\/www\.google\.com\/maps\/place\/[^"'\s\\]+/);
                    if (urlMatch) {
                        console.log('Found Maps URL in body:', urlMatch[0]);
                        checkCoords(urlMatch[0], 'Body URL');
                    }

                    // Look for lat/long in JSON-like structures in body
                    // often in window.APP_INITIALIZATION_STATE or similar
                    // Pattern: [42.5775,13.9798]
                    const jsonCoords = text.match(/\[(-?\d+\.\d+),(-?\d+\.\d+)\]/);
                    if (jsonCoords) {
                        // Filter out unlikely coords (like 0,0 or 1,1)
                        if (Math.abs(parseFloat(jsonCoords[1])) > 1 && Math.abs(parseFloat(jsonCoords[2])) > 1) {
                            console.log('Found potential JSON coords:', jsonCoords[1], jsonCoords[2]);
                        }
                    }
                }
                break;
            }

        } catch (e) {
            console.error('Error:', e);
            break;
        }
    }
}

function checkCoords(url, source) {
    const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordsMatch) {
        console.log(`✅ COORDS FOUND in ${source}: ${coordsMatch[1]}, ${coordsMatch[2]}`);
    }

    const dataMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (dataMatch) {
        console.log(`✅ COORDS FOUND in ${source} (data param): ${dataMatch[1]}, ${dataMatch[2]}`);
    }
}

debugExtraction();
