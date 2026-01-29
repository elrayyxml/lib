const nexray = require('api-nexray');
const mess          = require("@mess");
const { extractLink, downloadToBuffer }   = require('@lib/utils');
const { logCustom }     = require("@lib/logger");

async function sendMessageWithQuote(sock, remoteJid, message, text) {
    await sock.sendMessage(remoteJid, { text }, { quoted: message });
}

async function handle(sock, messageInfo) {
    const { remoteJid, message, content, prefix, command } = messageInfo;

    try {

        /*const validLink = extractLink(content);*/
       
        const parts = content.trim().split(/\s+/);
        let validLink = '';
        let resolution = '1080';

        for (const part of parts) {
            if (extractLink(part)) {
                validLink = extractLink(part);
            } else if (/^\d{3,4}$/.test(part)) {
                const resNum = parseInt(part);
                if ([144, 240, 360, 480, 720, 1080].includes(resNum)) {
                    resolution = part;
                }
            }
        }

        // Validasi input: pastikan konten ada
        if (!content.trim() || content.trim() == '') {
            return sendMessageWithQuote(sock, remoteJid, message, `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ _*${prefix + command} https://www.youtube.com/watch?v=xxxxx 480*_`);
        }

        await sock.sendMessage(remoteJid, { react: { text: "⏰", key: message.key } });
        const response = await nexray.get('/downloader/ytmp4', {
  url: validLink,
  resolusi: resolution
});
    
        // Validasi respons API
        if (response?.result.url) {
       
       const url_media = response.result.url;
       const videoBuffer = await downloadToBuffer(url_media, "mp4");
        
                await sock.sendMessage(remoteJid, {
                    video: videoBuffer,
                    caption: mess.general.success,
                }, { quoted: message });
            } else {
            logCustom('info', content, `ERROR-COMMAND-${command}.txt`);
            // Jika tidak ada URL untuk audio, beri tahu pengguna
            await sendMessageWithQuote(sock, remoteJid, message, 'Maaf, tidak dapat menemukan video dari URL yang Anda berikan.');
        }

    } catch (error) {
        // Tangani kesalahan dan log error
        console.error("Kesalahan saat memanggil API Autoresbot:", error);
        logCustom('info', content, `ERROR-COMMAND-${command}.txt`);

        // Kirim pesan kesalahan yang lebih informatif
        const errorMessage = `Maaf, terjadi kesalahan saat memproses permintaan Anda. Mohon coba lagi nanti.\n\nDetail Error: ${error.message || error}`;
        await sendMessageWithQuote(sock, remoteJid, message, errorMessage);
    }
}

module.exports = {
    handle,
    Commands    : ['ytmp4'],  // Menentukan perintah yang diproses oleh handler ini
    OnlyPremium : false, 
    OnlyOwner   : false,
    limitDeduction  : 2, // Jumlah limit yang akan dikurangi
};
