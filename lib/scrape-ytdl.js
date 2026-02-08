const axios = require('axios');

function extractId(url) {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    return match ? match[1] : url;
}

async function getDownloadLink(url, type = 'mp3', quality = '320') {
    const videoId = extractId(url);
    try {
        const { data } = await axios.post(`https://embed.dlsrv.online/api/download/${type}`, 
            { videoId, format: type, quality },
            {
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'referer': `https://embed.dlsrv.online/v1/full?videoId=${videoId}`,
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
                }
            }
        );
        return data;
    } catch (error) {
        return error.message
    }
}

// Contoh mp3: 64, 96, 128, 256, 320, mp4: 144, 240, 360, 480, 720, 1080
getDownloadLink('https://youtu.be/6hGuwKQPsHw', 'mp3', '320')