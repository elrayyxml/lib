const nexray = require('@nexray/api');
const { downloadQuotedMedia, downloadMedia, reply, uploadTmpFile } = require('@lib/utils');
const fs = require('fs');
const path = require('path');
const { logCustom } = require("@lib/logger");

async function handle(sock, messageInfo) {
    const { remoteJid, message, prefix, command, content, isQuoted } = messageInfo;

    try {
        const mediaType = isQuoted ? isQuoted.type : type;
        if (!['audio', 'viewonce'].includes(mediaType)) {
            return await reply(m, `⚠️ _Kirim/Balas audio dengan caption *${prefix + command}*_`);
        }
        
    
        // Loading
        await sock.sendMessage(remoteJid, { react: { text: "⏰", key: message.key } });

        const media = isQuoted
            ? await downloadQuotedMedia(message)
            : await downloadMedia(message);
        const mediaPath = path.join('tmp', media);

        if (!fs.existsSync(mediaPath)) {
            throw new Error('File media tidak ditemukan setelah diunduh.');
        }
        
        const upload = await uploadTmpFile(mediaPath);
            const url = upload;
            
        // Memanggil API dengan penanganan kesalahan dan pengecekan respons
        const response = await nexray.get("/tools/whatsmusic", {
           url: url  
            });
        
        if (response && response.result) {
        const { title, artist, score, release, duration, url } = response.result[0];
        
        const oke = `✧  *W H A T S - M U S I C*\n\n` + 
        `    ◦  *Title* : ${title}\n` +
        `    ◦  *Artist* : ${artist}\n` +
        `    ◦  *Score* : ${score}\n` +
        `    ◦  *Release* : ${release}\n` +
        `    ◦  *Duration* : ${duration}\n\n` +
        `${url}`;
            // Mengirim pesan jika data dari respons tersedia
            await sock.sendMessage(remoteJid, { text: oke }, { quoted: message });
        } else {
            // Mengirim pesan default jika respons data kosong atau tidak ada
            await sock.sendMessage(remoteJid, { text: "Maaf, tidak ada respons dari server." }, { quoted: message });
        }
    } catch (error) {
        logCustom('info', content, `ERROR-COMMAND-${command}.txt`);
        // Memberi tahu pengguna jika ada kesalahan
        await sock.sendMessage(remoteJid, { text: `Maaf, terjadi kesalahan saat memproses permintaan Anda. Coba lagi nanti.\n\n${error}` }, { quoted: message });
    }
}

module.exports = {
    handle,
    Commands        : ['whatsmusic', 'whatmusic'],
    OnlyPremium     : false, 
    OnlyOwner       : false,
    limitDeduction  : 1, // Jumlah limit yang akan dikurangi
};
