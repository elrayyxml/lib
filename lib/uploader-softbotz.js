const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');


async function uploadFile(file) {
    try {
        const form = new FormData();
        const fileName = path.basename(file);
        const stats = fs.statSync(file);
        const fileSize = stats.size;
        const mimeType = require("mime-types").lookup(file) || "application/octet-stream";
        form.append("file", fs.createReadStream(file), fileName);
        form.append("filename", fileName);
        form.append("expire_value", "7");
        form.append("expire_unit", "days");
        
        const response = await axios.post('https://lunara.softbotz.my.id/upload', form, {
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

// Usage
uploadFile('./database/assets/allmenu.jpg');