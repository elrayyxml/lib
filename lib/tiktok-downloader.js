```
const nexray = require('api-nexray');
const { logCustom } = require("@lib/logger");
const { extractLink, forceConvertToM4a, downloadToBuffer, style, sendAlbum }  = require('@lib/utils');
const mess = require('@mess');

async function sendMessageWithQuote(sock, remoteJid, message, text) {
  await sock.sendMessage(remoteJid, { text }, { quoted: message });
}

function isTikTokUrl(url) {
  return /tiktok\.com/i.test(url);
}

async function handle(sock, messageInfo) {
    const { remoteJid, message, prefix, command, content } = messageInfo;
    
    const validLink = extractLink(content);

    try {
        if (!content.trim()) {
            return await sock.sendMessage(remoteJid, { text: `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ _*${prefix + command} https://vt.tiktok.com/xxx/*_` }, { quoted: message });
        }
        
        // Validasi URL TikTok
    if (!isTikTokUrl(validLink)) {
      return sendMessageWithQuote(
        sock,
        remoteJid,
        message,
        "_URL yang Anda masukkan tidak valid. Pastikan URL berasal dari TikTok._"
      );
    }
    
        // Loading
        await sock.sendMessage(remoteJid, { react: { text: "⏰", key: message.key } });

        // Memanggil API dengan penanganan kesalahan dan pengecekan respons
        const response = await nexray.get('/downloader/tiktok', {
  url: validLink
});
        
        const { title, taken_at, region, id: videoId, duration: videoDuration, data, music_info: { id: musicId, title: musicTitle, author: musicAuthor, album, duration: musicDuration, original, copyright, url: musicUrl }, stats: { views, likes, comment, share, save, download }, author: { id: authorId, fullname, nickname } } = response.result; 
        
  const elrayyxml = `✧  *T I K T O K*\n\n` +
`    ◦  *ID* : ${authorId}\n` +
`    ◦  *Author* : ${fullname} (@${nickname})\n` +
`    ◦  *Duration* : ${videoDuration}\n` +
`    ◦  *Region* : ${region}\n` +
`    ◦  *Views* : ${views}\n` +
`    ◦  *Likes* : ${likes}\n` +
`    ◦  *Comment* : ${comment}\n` +
`    ◦  *Share* : ${share}\n` +
`    ◦  *Save* : ${save}\n` +
`    ◦  *Download* : ${download}\n` +
`    ◦  *Posted At* : ${taken_at}\n\n` +
`✧  *M U S I C*\n\n` +
`    ◦  *Title* : ${musicTitle}\n` +
`    ◦  *Author* : ${musicAuthor}\n` +
`    ◦  *Duration* : ${musicDuration}\n` +
`    ◦  *Album* : ${album}\n` +
`    ◦  *ID* : ${musicId}\n` +
`    ◦  *Original* : ${original}\n` +
`    ◦  *Copyright* : ${copyright}\n\n` +
`✧  *C A P T I O N*\n\n` +
`${title}`;
        
        let outputUrl = musicUrl;

        try {
          
            outputUrl = await forceConvertToM4a({ url: musicUrl });
        } catch (error) {
            console.warn();
        }
            
        if (typeof data === 'string') {
            
        const videoBuffer = await downloadToBuffer(data, 'mp4');
            
        await sock.sendMessage(remoteJid, { 
        video: videoBuffer,
        caption: elrayyxml,
        }, { quoted: message });
              
            await sock.sendMessage(remoteJid, {
                audio: { url: outputUrl },
                fileName: 'tiktok.mp3',
                mimetype: 'audio/mp4'
            }, { quoted: message });
            
         } else if (Array.isArray(data)) {
            const urls = data;
            
           
            const media = urls.map((url, index) => ({
                image: { url: url }
            }));
             
             /*await sock.sendMessage(remoteJid, {
                album: albumMessages
            }, { quoted: message });*/
           await sendAlbum(sock, remoteJid, media, message);

    await sock.sendMessage(remoteJid, {
        audio: { url: outputUrl },
        fileName: 'tiktok.mp3',
        mimetype: 'audio/mp4'
    }, { quoted: message });
             }

    } catch (error) {
        logCustom('info', content, `ERROR-COMMAND-${command}.txt`);
        
        await sock.sendMessage(remoteJid, { text: `Maaf, terjadi kesalahan saat memproses permintaan Anda. Coba lagi nanti.\n\n${error}` }, { quoted: message });
    }
}

module.exports = {
    handle,
    Commands        : ['tt', 'tiktok', 'ttslide', 'ttfoto', 'tiktokslide', 'tiktokfoto'],
    OnlyPremium     : false, 
    OnlyOwner       : false,
    limitDeduction: 1
};
```