const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function upload(filePath) {
  
  const buffer = fs.createReadStream(filePath);

  const form = new FormData();
  form.append("file", buffer);
  form.append("expire_value", "7");
  form.append("expire_unit", "days"); // minutes, hours, days

  const response = await axios.post("https://lunara.softbotz.my.id/upload", form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });

  return response.data;
}

upload('./database/assets/allmenu.jpg')