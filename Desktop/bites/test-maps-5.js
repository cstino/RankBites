
const testUrl = 'https://maps.app.goo.gl/wr7jo5qLam6PWSe68?g_st=ic';

async function testExpand() {
    console.log('Testing URL:', testUrl);
    try {
        const response = await fetch(testUrl, {
            method: 'GET',
            redirect: 'manual',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        console.log('Status:', response.status);
        const location = response.headers.get('location');
        console.log('Location:', location);

        if (response.status === 200) {
            const text = await response.text();
            console.log('Body length:', text.length);
            // Look for URL in body
            const urlMatch = text.match(/https:\/\/maps\.google\.com\/maps\/place\/[^"]+/);
            if (urlMatch) {
                console.log('Found URL in body:', urlMatch[0]);
            } else {
                console.log('No URL found in body');
                // Print first 500 chars
                console.log(text.substring(0, 500));
            }
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

testExpand();
