const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');


async function uploadFile(file) {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(file));
        
        const response = await axios.post('https://cdn.crypty.workers.dev/', form, {
            headers: {
                ...form.getHeaders()
            }
        });
        
        return response.data;
            
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
}

uploadFile('./database/assets/allmenu.jpg');