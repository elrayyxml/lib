/*
Base : https://aifaceswap.io/
By : ZennzXD
Created : Jumat 27 Februari 2026
*/

const crypto = require('crypto')
const axios = require('axios')

const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCwlO+boC6cwRo3UfXVBadaYwcX
0zKS2fuVNY2qZ0dgwb1NJ+/Q9FeAosL4ONiosD71on3PVYqRUlL5045mvH2K9i8b
AFVMEip7E6RMK6tKAAif7xzZrXnP1GZ5Rijtqdgwh+YmzTo39cuBCsZqK9oEoeQ3
r/myG9S+9cR5huTuFQIDAQAB
-----END PUBLIC KEY-----`

const fp = crypto.randomUUID()
let cachethemeversi = null

const headers = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'origin': 'https://aifaceswap.io',
  'referer': 'https://aifaceswap.io/nano-banana-ai/'
}

async function ambilthemeversi() {
  if (cachethemeversi) return cachethemeversi
  try {
    const gethtml = await fetch('https://aifaceswap.io/nano-banana-ai/')
    const html = await gethtml.text()
    const jsMatch = html.match(/src="([^"]*aifaceswap_nano_banana[^"]*\.js)"/)
    if (!jsMatch) throw new Error()
    let jsUrl = jsMatch[1].startsWith('http') ? jsMatch[1] : `https://aifaceswap.io${jsMatch[1]}`
    const jsRes = await fetch(jsUrl)
    const jsText = await jsRes.text()
    const themeMatch = jsText.match(/headers\["theme-version"\]="([^"]+)"/)
    cachethemeversi = themeMatch ? themeMatch[1] : 'EC25Co3HGfI91bGmpWR6JF0JKD+nZ/mD0OYvKNm5WUXcLfKnEE/80DQg60MXcYpM'
    return cachethemeversi
  } catch {
    return 'EC25Co3HGfI91bGmpWR6JF0JKD+nZ/mD0OYvKNm5WUXcLfKnEE/80DQg60MXcYpM'
  }
}

async function gensigs() {
  const themeVersion = await ambilthemeversi()
  const aesSecret = crypto.randomBytes(8).toString('hex')
  const xGuide = crypto.publicEncrypt({
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_PADDING
  }, Buffer.from(aesSecret, 'utf8')).toString('base64')
  const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(aesSecret), Buffer.from(aesSecret))
  let fp1 = cipher.update('aifaceswap:' + fp, 'utf8', 'base64')
  fp1 += cipher.final('base64')
  return { 'fp': fp, 'fp1': fp1, 'x-guide': xGuide, 'x-code': Date.now().toString(), 'theme-version': themeVersion }
}

async function upimage(imgBuffer, ext = 'jpg') {
  const filename = crypto.randomUUID().replace(/-/g, '') + '.' + ext
  const sigs = await gensigs()
  const res = await fetch('https://aifaceswap.io/api/upload_file', {
    method: 'POST',
    headers: { ...headers, ...sigs, 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_name: filename, type: 'image', request_from: 1, origin_from: '4b06e7fa483b761a' })
  })
  const data = await res.json()
  const putUrl = data.data.url
  await fetch(putUrl, {
    method: 'PUT',
    headers: { 'Content-Type': `image/${ext}`, 'x-oss-storage-class': 'Standard' },
    body: imgBuffer
  })
  return putUrl.split('?')[0].split('.aliyuncs.com/')[1]
}

async function createJob(imgurl, prompt) {
  const sigs = await gensigs()
  const res = await fetch('https://aifaceswap.io/api/aikit/create', {
    method: 'POST',
    headers: { ...headers, ...sigs, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fn_name: 'demo-nano-banana',
      call_type: 1,
      input: { prompt, scene: 'standard', resolution: '1K', aspect_ratio: 'auto', source_images: [imgurl] },
      consume_type: 0,
      request_from: 1,
      origin_from: '4b06e7fa483b761a'
    })
  })
  const data = await res.json()
  console.log('Create job:', JSON.stringify(data).substring(0, 200))
  return data.data.task_id
}

async function cekjob(jobId) {
  const sigs = await gensigs()
  const res = await fetch('https://aifaceswap.io/api/aikit/check_status', {
    method: 'POST',
    headers: { ...headers, ...sigs, 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: jobId, fn_name: 'demo-nano-banana', call_type: 1, request_from: 1, origin_from: '4b06e7fa483b761a' })
  })
  const data = await res.json()
  return data.data
}

async function nanobanana(imgBuffer, ext, prompt) {
  const uploadUrl = await upimage(imgBuffer, ext)
  console.log('Uploaded:', uploadUrl)
  const jobId = await createJob(uploadUrl, prompt)
  console.log('Job ID:', jobId)
  let result, attempts = 0
  do {
    await new Promise(r => setTimeout(r, 3000))
    result = await cekjob(jobId)
    console.log(`Check #${++attempts}: status=${result?.status}`)
  } while (result && (result.status === 0 || result.status === 1) && attempts < 20)
  return { job_id: jobId, image: result?.result_image }
}

const imgRes = await axios.get('https://cdn.nekohime.site/file/fItsHiWy.png', {
  responseType: 'arraybuffer',
  headers: { 'User-Agent': 'Mozilla/5.0' }
})
const imgBuffer = Buffer.from(imgRes.data)
console.log('Image downloaded:', imgBuffer.length, 'bytes')

const result = await nanobanana(imgBuffer, 'png', 'change background to a rice field')
console.log('Result:', JSON.stringify(result, null, 2))