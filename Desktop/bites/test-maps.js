
const testUrl = 'https://maps.app.goo.gl/wr7jo5qLam6PWSe68?g_st=ic';

async function testExpand() {
    console.log('Testing URL:', testUrl);
    try {
        const response = await fetch(testUrl, {
            method: 'HEAD',
            redirect: 'manual'
        });
        console.log('HEAD Status:', response.status);
        console.log('HEAD Location:', response.headers.get('location'));

        const responseGet = await fetch(testUrl, {
            method: 'GET',
            redirect: 'manual'
        });
        console.log('GET Status:', responseGet.status);
        console.log('GET Location:', responseGet.headers.get('location'));

        if (responseGet.headers.get('location')) {
            const loc = responseGet.headers.get('location');
            console.log('Redirects to:', loc);

            // Try to fetch the redirect target to see if it redirects again
            const response2 = await fetch(loc, { method: 'HEAD', redirect: 'manual' });
            console.log('2nd Hop Status:', response2.status);
            console.log('2nd Hop Location:', response2.headers.get('location'));
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

testExpand();
