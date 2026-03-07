import axios from 'axios';

async function jeeves(q) {
    try {
        const response = await axios.post('https://api.jeeves.ai/generate/v4/chat', 
        {
            prompt: q
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer undefined',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
                'Referer': 'https://jeeves.ai/chat/'
            }
        });
        
        const lines = response.data.split('\n');
        let finalText = '';
        
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6);
                if (jsonStr === '[DONE]') continue;
                
                try {
                    const data = JSON.parse(jsonStr);
                    if (data.finalText) {
                        finalText = data.finalText;
                        break;
                    }
                } catch (e) {
              
                }
            }
        }
        
        return finalText || response.data;
    } catch (error) {
        throw new Error(error.message);
    }
}

jeeves('halo').then(console.log)