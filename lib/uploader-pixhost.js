const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function upload(path) {
    try {
        const form = new FormData();
        form.append('img', fs.createReadStream(path));
        form.append('content_type', 1);
        form.append('max_th_size', 320);

        const response = await axios.post('https://api.pixhost.to/images', form, {
            headers: {
                ...form.getHeaders(),
            }
        });


        return response.data;
    } catch (error) {
        return error.message;
    }
}

upload('./database/assets/allmenu.jpg')