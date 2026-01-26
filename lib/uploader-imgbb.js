const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')

async function upload(path) {
  try {
    const { data } = await axios.get('https://imgbb.com');
    const oke = data.match(/auth_token="([^"]+)"/);
    const token = oke[1];
    
    const form = new FormData()
    form.append('source', fs.createReadStream(path))
    form.append('type', 'file')
    form.append('action', 'upload')
    form.append('timestamp', Date.now())
    form.append('auth_token', token)

    const response = await axios.post('https://imgbb.com/json', form, {
      headers: form.getHeaders()
    })

    return response.data;
  } catch (error) {
    return error.message;
  }
}

// Usage
upload('./database/assets/allmenu.jpg')