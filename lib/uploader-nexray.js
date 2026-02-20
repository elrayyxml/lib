const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

async function upload(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const CHUNK_SIZE = 3 * 1024 * 1024;
    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
    const fileId = Math.random().toString(36).substring(2, 15);
    const fileName = path.basename(filePath);

    let finalUrl = null;
    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(fileSize, start + CHUNK_SIZE);
        
        const buffer = fs.readFileSync(filePath).slice(start, end);

        const form = new FormData();
     
        form.append('file', buffer, { filename: fileName });
        form.append('chunkIndex', i.toString());
        form.append('totalChunks', totalChunks.toString());
        form.append('fileId', fileId);
        form.append('fileName', fileName);

        const response = await axios.post('https://cdn.nexray.web.id/upload', form, {
            headers: { ...form.getHeaders() },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        if (response.data && response.data.url) {
            finalUrl = response.data.url;
        }
    }
    return finalUrl
    } catch (error) {
       return error.message;
    }
}

upload('./database/assets/allmenu.jpg')