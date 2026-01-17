const nexray = require('api-nexray');
const { logCustom }     = require("@lib/logger");
const mess = require("@mess");

async function handle(sock, messageInfo) {
    const { remoteJid, message, content, isQuoted, prefix, command } = messageInfo;

    try {
        const text = content && content.trim() !== '' ? content : isQuoted?.text ?? null;
        
        // Validasi input konten
        if (!text) {
            await sock.sendMessage(remoteJid, {
                text: `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ _*${prefix + command} BlueArchive*_`
            }, { quoted: message });
            return; // Hentikan eksekusi jika tidak ada konten
        }

        // Kirimkan pesan loading dengan reaksi emoji
        await sock.sendMessage(remoteJid, {
            react: { text: "⏰", key: message.key }
        });

        // Buat instance API dan ambil data dari endpoint
            const buffer = await nexray.getBuffer('/maker/balogo', {
            text: text
            });
        

            // Kirim stiker
            await sock.sendMessage(remoteJid, {
              image: buffer,
               caption: mess.general.success
                }, { quoted: message });

    } catch (error) {
        logCustom('info', content, `ERROR-COMMAND-${command}.txt`);
        // Tangani kesalahan dan kirimkan pesan error ke pengguna
        const errorMessage = `Maaf, terjadi kesalahan saat memproses permintaan Anda. Coba lagi nanti.\n\nError: ${error.message}`;
        await sock.sendMessage(remoteJid, {
            text: errorMessage
        }, { quoted: message });
    }
}

module.exports = {
    handle,
    Commands    : ['balogo'],
    OnlyPremium : false,
    OnlyOwner   : false,
    limitDeduction  : 2
};