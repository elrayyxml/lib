const axios = require('axios');
const config = require('@config');
const { logCustom }     = require("@lib/logger");


async function handle(sock, messageInfo) {
    const { remoteJid, message, prefix, command, content } = messageInfo;

    try {
        const trimmedContent = content.trim();

        // Validasi input pengguna
        if (!trimmedContent) {
            return await sock.sendMessage(remoteJid, { 
             text: `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ _*${prefix + command} elrayyxml*_`,
               }, { quoted: message });
        }

        const user_id = trimmedContent;

        // Mengirim reaksi loading
        await sock.sendMessage(remoteJid, { react: { text: '⏰', key: message.key } });

        // Inisialisasi API dan memanggil endpoint
        const api = `${config.API}/stalker/tiktok?username=${user_id}`;
        const response = await axios.get(api);
        
        const { id, username, name, title, description, avatar, bio, create_time, link, verified, region, private, seller, recent_view, organization, new_followers, stats: { followers, following, likes, videos, friend }} = response.data.result;

            const resultTiktok = `✧  *T T - S T A L K E R*\n\n` +
`    ◦  *Username* : ${username}\n` +
`    ◦  *Nickname* : ${name}\n` +
`    ◦  *ID* : ${id}\n` +
`    ◦  *Title* : ${title}\n` +
`    ◦  *Description* : ${description}\n` +
`    ◦  *Url* : ${link}\n` +
`    ◦  *Verified* : ${verified}\n` +
`    ◦  *Region* : ${region}\n` +
`    ◦  *Private* : ${private}\n` +
`    ◦  *Seller* : ${seller}\n` +
`    ◦  *Recent View* : ${recent_view}\n` +
`    ◦  *Organization* : ${organization}\n` +
`    ◦  *New Followers* : ${new_followers}\n` +
`    ◦  *Followers* : ${followers}\n` +
`    ◦  *Following* : ${following}\n` +
`    ◦  *Likes* : ${likes}\n` +
`    ◦  *Video* : ${videos}\n` +
`    ◦  *Friend* : ${friend}\n\n` +
`${config.footer}`;
        
                // Kirim gambar jika avatar ada dan valid
    await sock.sendMessage( remoteJid, {
          image: { url: avatar },
          caption: resultTiktok 
          }, { quoted: message });
 
    } catch (error) {
        console.error('Error:', error);
        logCustom('info', content, `ERROR-COMMAND-${command}.txt`);

        // Penanganan kesalahan dengan pesan ke pengguna
        await sock.sendMessage(remoteJid, { 
            text: `Maaf, terjadi kesalahan saat memproses permintaan Anda. Coba lagi nanti.\n\n*Detail*: ${error.message || error}`, 
           }, { quoted: message });
    }
}

module.exports = {
    handle,
    Commands: ['stalktiktok', 'tiktokstalk', 'ttstalk', 'stalktt'],
    OnlyPremium: false,
    OnlyOwner: false,
    limitDeduction: 1,
};
