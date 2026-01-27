const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function upload(path) {
  try {
    const buffer = fs.readFileSync(path);
    const form = new FormData();
    
    form.append("files[]", buffer, {
      filename: "nexray-" + Date.now() + ".jpg"
    });
    
    const response = await axios.post("https://pomf.lain.la/upload.php", form, {
      headers: {
        ...form.getHeaders(),
        "origin": "https://pomf.lain.la",
        "user-agent": "Postify/1.0.0"
      }
    });
    
    return response.data;
  } catch (error) {
    return error.message;
  }
}

// Usage
upload('./database/assets/allmenu.jpg')