const nexray = require('api-nexray');
const { logCustom }     = require("@lib/logger");
const { forceConvertToM4a } = require('@lib/utils');

async function sendMessageWithQuote(sock, remoteJid, message, text) {
    await sock.sendMessage(remoteJid, { text }, { quoted: message });
}

async function handle(sock, messageInfo) {
    const { remoteJid, message, content, prefix, command } = messageInfo;

    try {
        // Validasi input: pastikan konten ada
        if (!content.trim() || content.trim() == '') {
            return sendMessageWithQuote(
                sock,
                remoteJid,
                message,
                `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ _*${prefix + command} kucing lucu*_`
            );
        }

        // Tampilkan reaksi "Loading"
        await sock.sendMessage(remoteJid, { react: { text: "⏰", key: message.key } });

        // Memanggil API untuk mendapatkan data video TikTok
        const response = await nexray.get('/search/tiktok', {
            q: content
            });
        
        const results = response.result;
        const random = results[Math.floor(Math.random() * results.length)];
        
        const { title, taken_at, region, id, duration, data, music_info: { id: idMusic, title: titleMusic, author: authorMusic, album, duration: durationMusic, original, copyright, url }, stats: { views, likes, comment, share, download }, author: { id: idAuthor, nickname, fullname } } = random;
        
const elrayyxml = `✧  *T T - S E A R C H*\n\n` +
`    ◦  *ID* : ${id}\n` +
`    ◦  *Author* : ${fullname} (@${nickname})\n` +
`    ◦  *Duration* : ${duration}\n` +
`    ◦  *Region* : ${region}\n` +
`    ◦  *Views* : ${views}\n` +
`    ◦  *Likes* : ${likes}\n` +
`    ◦  *Comment* : ${comment}\n` +
`    ◦  *Share* : ${share}\n` +
`    ◦  *Download* : ${download}\n` +
`    ◦  *Posted At* : ${taken_at}\n\n` +
`✧  *M U S I C*\n\n` +
`    ◦  *Title* : ${titleMusic}\n` +
`    ◦  *Author* : ${authorMusic}\n` +
`    ◦  *Duration* : ${durationMusic}\n` +
`    ◦  *Album* : ${album}\n` +
`    ◦  *Original* : ${original}\n` +
`    ◦  *Copyright* : ${copyright}\n\n` +
`✧  *C A P T I O N*\n\n` +
`${title}`;
        
        // Mengirim video tanpa watermark dan caption
        await sock.sendMessage(remoteJid, {
        video: { url: data },
        caption: elrayyxml
        }, { quoted: message });
        
        let outputUrl = url;

        try {
            // Coba konversi ke format M4A
            outputUrl = await forceConvertToM4a({ url: url });
        } catch (error) {
            console.warn();
        }

        // Mengirim audio
        await sock.sendMessage(remoteJid, {
            audio: { url: outputUrl },
            fileName: 'tiktok.mp3',
            mimetype: 'audio/mp4'
        }, { quoted: message });


    } catch (error) {
        console.error("Kesalahan saat memproses perintah TikTok:", error);
        logCustom('info', content, `ERROR-COMMAND-${command}.txt`);
        // Kirim pesan kesalahan yang lebih informatif
        const errorMessage = `Maaf, terjadi kesalahan saat memproses permintaan Anda. Mohon coba lagi nanti.\n\n*Detail Kesalahan:* ${error.message || error}`;
        await sendMessageWithQuote(sock, remoteJid, message, errorMessage);
    }
}

module.exports = {
    handle,
    Commands    : ['tiktoksearch','ttsearch','tts'],
    OnlyPremium : false, 
    OnlyOwner   : false,
    limitDeduction  : 2,
};
