const nexray = require('api-nexray');
const { style, downloadToBuffer } = require('@lib/utils');
const config        = require('@config');
const { logCustom } = require("@lib/logger");

// Fungsi untuk mengirim pesan dengan kutipan (quote)
async function sendMessageWithQuote(sock, remoteJid, message, text) {
    return sock.sendMessage(remoteJid, { text }, { quoted: message });
}

// Fungsi untuk mengirim reaksi
async function sendReaction(sock, message, reaction) {
    return sock.sendMessage(message.key.remoteJid, { react: { text: reaction, key: message.key } });
}

// Fungsi utama untuk menangani perintah
async function handle(sock, messageInfo) {
    const { remoteJid, message, content, prefix, command } = messageInfo;

    try {
        const query = content.trim();
        if (!query) {
            return sendMessageWithQuote(
                sock,
                remoteJid,
                message,
                `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ _*${prefix + command} matahariku*_`
            );
        }

        // Tampilkan reaksi "Loading"
        await sendReaction(sock, message, "⏰");

                // Inisialisasi API dan unduh file
        const response = await nexray.get("/downloader/ytplay", {
           q: content  
            });
        const { title, description, channel, channel_url, duration, seconds, views, upload_at, thumbnail, url, download_url } = response.result;
        
        if (!download_url) {
            return sendMessageWithQuote(sock, remoteJid, message, '⛔ _Tidak dapat menemukan video yang sesuai_');
        }

        if (seconds > 3600) {
            return sendMessageWithQuote(
                sock,
                remoteJid,
                message,
                '_Maaf, video terlalu besar untuk dikirim melalui WhatsApp._'
            );
        }

        // Kirim informasi video
        const caption = `✧  *Y T - P L A Y*\n\n` + 
`    ◦  *Channel* : ${channel}\n` + 
`    ◦  *Title* : ${title}\n` + 
`    ◦  *Description* : ${description}\n` +
`    ◦  *Duration* : ${duration} (${seconds})\n` + 
`    ◦  *Uploaded* : ${upload_at}\n` + 
`    ◦  *Views* : ${views}\n` + 
`    ◦  *Channel Url* : ${channel_url}\n` +
`    ◦  *Source* : ${url}\n\n` + 
`${config.footer}`;
        
        const buffer = await nexray.getBuffer("/canvas/youtube", {
           title: title,
           artist: channel,
           coverurl: thumbnail
            });
        
            // Kirim image 
            await sock.sendMessage(
    remoteJid,
    {
        text: caption,
        contextInfo: {
             externalAdReply: {
                 title: '© ' + config.bot_name + ' v' + global.version,
                 thumbnail: buffer,
                 mediaType: 1,
                 renderLargerThumbnail: true 
             }
           }
    }, { quoted: message }
            );
           
           const audioBuffer = await downloadToBuffer(download_url, 'mp3');

            // Kirim audio file
            await sock.sendMessage(
                remoteJid,
                {
                    audio: audioBuffer,
                    fileName: `elrayyxml.mp3`,
                    mimetype: 'audio/mp4',
                },
                { quoted: message }
            );
   
    } catch (error) {
        console.error("Error while handling command:", error);
        logCustom('info', content, `ERROR-COMMAND-${command}.txt`);

        const errorMessage = `⚠️ Maaf, terjadi kesalahan saat memproses permintaan Anda. Mohon coba lagi nanti.\n\n💡 Detail: ${error.message || error}`;
        await sendMessageWithQuote(sock, remoteJid, message, errorMessage);
    }
}

module.exports = {
    handle,
    Commands    : ['play', 'playaudio'],
    OnlyPremium : false,
    OnlyOwner   : false,
    limitDeduction: 2, // Jumlah limit yang akan dikurangi
};
