const mess  = require('@mess');
const config = require('@config');

async function handle(sock, messageInfo) {
    const { remoteJid, message, prefix, command, content, isQuoted, isGroup } = messageInfo;

    try {
        const text = content && content.trim() !== '' ? content : isQuoted?.text ?? null;
        
        if (!text) {
            return await sock.sendMessage(remoteJid, { 
                text: `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ _*${prefix + command} woke*_` 
            }, { quoted: message });
        }
        
        if (!isGroup) { // Khusus Grub
            await sock.sendMessage(remoteJid, { 
                text: mess.general.isGroup 
            }, { quoted: message }); 
            return;
        }
    
        // Loading
        await sock.sendMessage(remoteJid, { 
            react: { text: "⏰", key: message.key } 
        });
       
        // Fungsi untuk mendapatkan timestamp dalam detik
        function getSecondNow() {
            return Math.floor(Date.now() / 1000);
        }
        
        // Fungsi untuk mengatur label bot (versi yang diminta)
        async function setBotLabel(jid, label) {
            const payload = {
                "protocolMessage": {
                    "type": 30,
                    "memberLabel": {
                        "label": label.slice(0, 30), // Tetap dibatasi 30 karakter
                        "labelTimestamp": getSecondNow()
                    }
                }
            }
            return await sock.relayMessage(jid, payload, {});
        }
        
        // Panggil fungsi setBotLabel dengan remoteJid
        await setBotLabel(remoteJid, text);

        // Kirim pesan sukses
        return await sock.sendMessage(
            remoteJid,
            { text: `_Sukses mengganti label *${text}*_` },
            { quoted: message }
        );
        
    } catch (error) {
        console.error("Error processing message:", error);
        // Kirim pesan error
        return await sock.sendMessage(
            remoteJid,
            { text: "Terjadi kesalahan saat memproses pesan." },
            { quoted: message }
        );
    }
}

module.exports = {
    handle,
    Commands        : ['setlabel'],
    OnlyPremium     : false, 
    OnlyOwner       : true,
    limitDeduction  : 1, // Jumlah limit yang akan dikurangi
};