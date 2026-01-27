const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function upload(path) {
  try {
    const buffer = fs.readFileSync(path);
    const form = new FormData();
    const filename = path.split('/').pop()
    form.append("file", buffer, filename);
    
    const response = await axios.post("https://cdn.gimita.id/upload", form, {
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