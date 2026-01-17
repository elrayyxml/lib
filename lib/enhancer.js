const nexray = require('api-nexray');
const { downloadQuotedMedia, downloadMedia, reply, uploadTmpFile } = require('@lib/utils');
const fs = require('fs');
const path = require('path');
const mess = require('@mess');

async function handle(sock, messageInfo) {
    const { m, remoteJid, message, content, prefix, command, type, isQuoted } = messageInfo;

    try {
        // Cek dulu apakah ada media (quoted atau langsung)
        const hasMedia = isQuoted 
            ? ['image', 'document', 'viewonce'].includes(isQuoted.type)
            : ['image', 'document', 'viewonce'].includes(type);

        if (!hasMedia) {
            return await reply(m, `⚠️ _Kirim/Balas gambar dengan caption *${prefix + command} 1/4/8/16*_`);
        }

        // Cek content untuk resolusi
        if (!content.trim()) {
            return await reply(m, `⚠️ _Format:_ _*${prefix + command} 1/4/8/16*_\n_Contoh:_ *${prefix + command} 8*`);
        }

        const RESOLUSI = parseInt(content.trim());
        const validResolutions = new Set([1, 4, 8, 16]);

        if (isNaN(RESOLUSI) || !validResolutions.has(RESOLUSI)) {
            return await reply(m, `⚠️ _Resolusi harus angka 1/4/8/16_`);
        }

        // Tampilkan reaksi "Loading"
        await sock.sendMessage(remoteJid, { react: { text: "⏰", key: message.key } });

        // Download & Upload media
        const media = isQuoted
            ? await downloadQuotedMedia(message)
            : await downloadMedia(message);
        const mediaPath = path.join('tmp', media);

        if (!fs.existsSync(mediaPath)) {
            throw new Error('File media tidak ditemukan setelah diunduh.');
        }

        const upload = await uploadTmpFile(mediaPath);
        const url = upload;
        
        const buffer = await nexray.getBuffer('/tools/enhancer', {
            url: url,
            resolusi: RESOLUSI
            });

        await sock.sendMessage(
            remoteJid,
            {
                image: buffer,
                caption: mess.general.success,
            },
            { quoted: message }
        );
    
    } catch (error) {
        const errorMessage = `_Terjaki kesalahan saat memproses gambar._ \n\nERROR : ${error}`;
        await reply(m, errorMessage);
    }
}

module.exports = {
    handle,
    Commands    : ['ehc', 'enhancer'],
    OnlyPremium : false,
    OnlyOwner   : false,
    limitDeduction  : 2,
};