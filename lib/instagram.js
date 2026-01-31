const nexray = require('api-nexray');
const { logCustom } = require("@lib/logger");
const { downloadToBuffer }  = require('@lib/utils');
const mess = require('@mess');

async function sendMessageWithQuote(sock, remoteJid, message, text) {
  await sock.sendMessage(remoteJid, { text }, { quoted: message });
}

function isIGUrl(url) {
  return /instagram\.com/i.test(url);
}

async function handle(sock, messageInfo) {
    const { remoteJid, message, prefix, command, content } = messageInfo;

    try {
        if (!content?.trim() || !isIGUrl(content)) {
      return sendMessageWithQuote(
        sock,
        remoteJid,
        message,
        `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ _*${
          prefix + command
        } https://www.instagram.com/xxx*_`
      );
    }
        
        await sock.sendMessage(remoteJid, { react: { text: "⏰", key: message.key } });
        
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        // Memanggil API dengan penanganan kesalahan dan pengecekan respons
        const response = await nexray.get('/downloader/instagram', {
  url: content
});
        const result = response.result;
        
        const seenUrls = new Set();
        const uniqueMedia = result.filter(item => {
            if (seenUrls.has(item.url)) return false;
            seenUrls.add(item.url);
            return true;
        });
        
        for (const item of uniqueMedia) {
            const { url } = item;
            
            const urlParams = new URLSearchParams(url.split('?')[1]);
            const token = urlParams.get('token');
            const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            const filename = decodedToken.filename;
            
            if (filename.match(/\.mp4$/i)) {
                const videoBuffer = await downloadToBuffer(url, 'mp4');
                await sock.sendMessage(
                    remoteJid,
                    { video: videoBuffer, caption: mess.general.success },
                    { quoted: message }
                );
            } else {
                await sock.sendMessage(
                    remoteJid,
                    { image: { url }, caption: mess.general.success },
                    { quoted: message }
                );
            }

            await delay(2000);
        }
        
        } catch (error) {
        logCustom('info', content, `ERROR-COMMAND-${command}.txt`);
        
        await sock.sendMessage(remoteJid, { text: `Maaf, terjadi kesalahan saat memproses permintaan Anda. Coba lagi nanti.\n\n${error}` }, { quoted: message });
    }
}

module.exports = {
    handle,
    Commands        : ['ig', 'instagram', 'igfoto', 'instagramfoto'],
    OnlyPremium     : false, 
    OnlyOwner       : false,
    limitDeduction: 1
};