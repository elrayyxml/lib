const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function upload(path) {
  try {
    const buffer = fs.createReadStream(path);
    const form = new FormData();
    form.append('file', buffer);
    form.append('expiry', '1w');
    
    const response = await axios.post('https://s.neoxr.eu/api/upload', form, {
      headers: {
        ...form.getHeaders()
      }
    });
    
    return response.data;
  } catch (error) {
    return error.message;
  }
}

// Usage
upload('./database/assets/allmenu.jpg')