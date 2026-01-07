const nexray = require('api-nexray');
const mess = require('@mess');
const { logCustom } = require("@lib/logger");

async function handle(sock, messageInfo) {
    const { remoteJid, message, prefix, command, content } = messageInfo;

    try {

        if (!content.trim()) {
            return await sock.sendMessage(remoteJid, { text: `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ _*${prefix + command} tech company*_` }, { quoted: message });
        }
    
        // Loading
        await sock.sendMessage(remoteJid, { react: { text: "⏰", key: message.key } });

        // Memanggil API dengan penanganan kesalahan dan pengecekan respons
        const buffer = await nexray.getBuffer('/ai/ailogo', {
        prompt: content
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
    Commands        : ['logo'],
    OnlyPremium     : false, 
    OnlyOwner       : false,
    limitDeduction  : 2
};
