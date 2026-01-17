
const testUrl = 'https://maps.app.goo.gl/wr7jo5qLam6PWSe68?g_st=ic';

async function testExpand() {
    console.log('Testing URL:', testUrl);
    try {
        const response = await fetch(testUrl, {
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        console.log('Final URL:', response.url);

        const coordsMatch = response.url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordsMatch) {
            console.log('Coords found:', coordsMatch[1], coordsMatch[2]);
        } else {
            console.log('No coords in URL');
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

testExpand();
