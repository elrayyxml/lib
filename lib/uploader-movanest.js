const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function uploadMovanest(path) {
  try {
    const buffer = fs.createReadStream(path);
    const form = new FormData();
    form.append('file', buffer); 
    
    const response = await axios.post('https://www.movanest.xyz/upload', form, {
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
uploadMovanest('./database/assets/allmenu.jpg')