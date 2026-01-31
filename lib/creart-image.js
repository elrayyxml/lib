const nexray = require('api-nexray');
const { downloadQuotedMedia, downloadMedia } = require('@lib/utils');
const fs = require('fs');
const path = require('path');
const mess = require('@mess');
const { logCustom } = require("@lib/logger");

async function handle(sock, messageInfo) {
    const { remoteJid, message, prefix, command, content, type, isQuoted } = messageInfo;

    try {
        
        const mediaType = isQuoted ? isQuoted.type : type;
        if (!['image', 'document', 'viewonce'].includes(mediaType)) {

        if (!content.trim()) {
            return await sock.sendMessage(remoteJid, { text: `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ _Kirim/Balas gambar dengan caption *${prefix + command} Change to style anime*_` }, { quoted: message });
        }
     }
    
        // Loading
        await sock.sendMessage(remoteJid, { react: { text: "⏰", key: message.key } });
        
        const media = isQuoted ? await downloadQuotedMedia(message) : await downloadMedia(message);
        const mediaPath = path.join('tmp', media);

        if (!fs.existsSync(mediaPath)) {
            throw new Error('File media tidak ditemukan setelah diunduh.');
            }

        // Memanggil API dengan penanganan kesalahan dan pengecekan respons
        const buffer = await nexray.post('/ai/creartimage', {
        image: mediaPath,
        param: content
        })
            // Mengirim pesan jika data dari respons tersedia
            await sock.sendMessage(remoteJid, {             image: buffer,
            caption: mess.general.success
             }, { quoted: message });
        
    } catch (error) {
        logCustom('info', content, `ERROR-COMMAND-${command}.txt`);
        // Memberi tahu pengguna jika ada kesalahan
        await sock.sendMessage(remoteJid, { text: `Maaf, terjadi kesalahan saat memproses permintaan Anda. Coba lagi nanti.\n\n${error}` }, { quoted: message });
    }
}

module.exports = {
    handle,
    Commands        : ['creartimg'],
    OnlyPremium     : false, 
    OnlyOwner       : false,
    limitDeduction  : 2
};