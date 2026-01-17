const nexray = require('api-nexray');
const { downloadQuotedMedia, downloadMedia, uploadTmpFile } = require("@lib/utils");
const { sendImageAsSticker } = require("@lib/exif");
const fs = require("fs");
const path = require("path");
const config = require("@config");

async function handle(sock, messageInfo) {
    const { remoteJid, message, type, isQuoted, content, prefix, command } = messageInfo;

    try {
        // Cek jika tidak ada teks/konten
        if (!content) {
            return sock.sendMessage(
                remoteJid,
                {
                    text: `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ _*${prefix + command} halo*_`,
                },
                { quoted: message }
            );
        }

        await sock.sendMessage(remoteJid, { react: { text: "⏰", key: message.key } });

        const mediaType = isQuoted ? isQuoted.type : type;

        // Hanya proses image dan sticker
        if (mediaType !== "image" && mediaType !== "sticker" && mediaType !== "document" && mediaType !== "viewonce") {
            return sock.sendMessage(
                remoteJid,
                { text: `⚠️ _Kirim/Balas gambar dengan caption *${prefix + command}*_` },
                { quoted: message }
            );
        }

        // Pisahkan teks smeme
        const [smemeText1 = '', smemeText2 = ''] = (content || '').split('|');

        // Unduh media
        const media = isQuoted
            ? await downloadQuotedMedia(message)
            : await downloadMedia(message);

        const mediaPath = path.join("tmp", media);
        if (!fs.existsSync(mediaPath)) {
            throw new Error("File media tidak ditemukan setelah diunduh.");
        }
        
        const upload = await uploadTmpFile(mediaPath);
            const url = upload;

        const buffer = await nexray.getBuffer('/maker/smeme', {
            text_atas: smemeText1,
            text_bawah: smemeText2,
            background: url
            });

            const options = {
                packname: config.sticker_packname,
                author: config.sticker_author,
            };

            await sendImageAsSticker(sock, remoteJid, buffer, options, message);

    } catch (error) {
        console.error(error);
        await sock.sendMessage(
            remoteJid,
            { text: "Maaf, terjadi kesalahan. Coba lagi nanti!" },
            { quoted: message }
        );
    }
}

module.exports = {
    handle,
    Commands: ["smeme"],
    OnlyPremium: false,
    OnlyOwner: false,
    limitDeduction: 2
};
