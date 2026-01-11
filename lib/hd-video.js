const nexray = require('api-nexray');
const { downloadQuotedMedia, downloadMedia, reply, uploadTmpFile, downloadToBuffer } = require('@lib/utils');
const fs = require('fs');
const path = require('path');
const mess = require('@mess');

async function handle(sock, messageInfo) {
    const { m, remoteJid, message, content, prefix, command, type, isQuoted } = messageInfo;

    try {
        const mediaType = isQuoted ? isQuoted.type : type;
        if (!['video', 'document', 'viewonce'].includes(mediaType)) {
            return await reply(m, `⚠️ _Kirim/Balas video dengan caption *${prefix + command}*_`);
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
                            
            const response = await nexray.get('/tools/hdvideo', {
            url: url
            });
            
            const buffer = await downloadToBuffer(response.result, 'MP4');

            await sock.sendMessage(
                remoteJid,
                {
                    video: buffer,
                    caption: mess.general.success,
                },
                { quoted: message }
            );
    
    } catch (error) {
        // Kirim pesan kesalahan yang lebih informatif
        const errorMessage = `_Terjadi kesalahan saat memproses gambar._ \n\nERROR : ${error}`;
        await reply(m, errorMessage);
    }
}

module.exports = {
    handle,
    Commands    : ['hdvid', 'hdvideo', 'reminivid', 'reminivideo'],
    OnlyPremium : false,
    OnlyOwner   : false,
    limitDeduction  : 2,
};