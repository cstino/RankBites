
const testUrl = 'https://maps.app.goo.gl/wr7jo5qLam6PWSe68?g_st=ic';

async function testExpand() {
    console.log('Testing URL:', testUrl);
    try {
        const response = await fetch(testUrl, {
            redirect: 'follow'
        });
        console.log('Final URL:', response.url);

        // Check if coords are in the URL
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
