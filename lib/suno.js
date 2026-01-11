const nexray = require('api-nexray');
const { downloadToBuffer, getBuffer } = require('@lib/utils');
const config        = require('@config');
const { logCustom } = require("@lib/logger");

async function handle(sock, messageInfo) {
    const { remoteJid, message, content, prefix, command } = messageInfo;

    try {
        if (!content.trim()) {
            return await sock.sendMessage(remoteJid, { text: `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ _*${prefix + command} song remix*_` }, { quoted: message });
        }
    
        // Loading
        await sock.sendMessage(remoteJid, { react: { text: "⏰", key: message.key } });

                // Inisialisasi API dan unduh file
        const response = await nexray.get("/ai/suno", {
           prompt: content  
            });
        const { title, tags, duration, thumbnail, url, lyrics } = response.result;
        
        if (!url) {
            return sendMessageWithQuote(sock, remoteJid, message, '_Tidak ada respon dari server_');
        }

        

        // Kirim informasi video
        const caption = `✧  *Y T - P L A Y*\n\n` + 
`    ◦  *Title* : ${title}\n` + 
`    ◦  *Duration* : ${duration} (${seconds})\n` + 
`    ◦  *Tags* : ${tags}\n\n` + 
`${lyrics}\n\n`+
`${config.footer}`;
              
              const buffer = await getBuffer(thumbnail);
        
        
            // Kirim image 
            await sock.sendMessage(
    remoteJid,
    {
        text: caption,
        contextInfo: {
             externalAdReply: {
                 title: '© ' + config.bot_name + ' v' + global.version,
                 thumbnail: buffer,
                 mediaUrl: new Date().toString(),
                 mediaType: 1,
                 renderLargerThumbnail: true 
             }
           }
    }, { quoted: message }
            );
           
           const audioBuffer = await downloadToBuffer(url, 'mp3');

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
    Commands    : ['suno'],
    OnlyPremium : false,
    OnlyOwner   : false,
    limitDeduction: 2, // Jumlah limit yang akan dikurangi
};