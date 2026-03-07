import axios from 'axios';

async function rednote(videoUrl) {
    try {
        const { data } = await axios.post('https://downloadrednote.com/id', 
            JSON.stringify([videoUrl]), 
            {
                headers: {
                    'next-action': '406f06d369c05239360151b4bbf89b3d2810198486',
                    'content-type': 'text/plain;charset=UTF-8',
                    'accept': 'text/x-component',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'referer': 'https://downloadrednote.com/id',
                    'origin': 'https://downloadrednote.com'
                }
            }
        );

        const dataLine = data.split('\n').find(line => line.startsWith('1:'));
        if (!dataLine) throw new Error("Format response tidak dikenal");

        const result = JSON.parse(dataLine.substring(2)).data;
        return {
            title: result.title,
            author: result.author,
            thumbnail: result.thumbnail,
            duration: result.duration,
            url: result.medias.find(m => m.quality.includes('WM'))?.url || result.medias[0]?.url
        };
    } catch (error) {
        throw new Error(error.message);
    }
}

rednote('https://xhslink.com/o/3yzZEnYphuo').then(console.log)