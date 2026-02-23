case 'ig':
case 'igdl':
case 'instagram':
case 'igmp4': {

  if (!text) return m.reply(`_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ *${prefix + command} https://www.instagram.com/xxx*`);
  if (!text.includes("instagram.com")) return m.reply("⚠️ Link Instagram tidak valid!");

  try {
    await sock.sendMessage(m.chat, { react: { text: '🕖', key: m.key } });

    let api = `https://api.nexray.web.id/downloader/v2/instagram?url=${encodeURIComponent(text)}`;
    let res = await fetch(api);
    let data = await res.json();

    if (!data.status) {
      return m.reply("❌ Gagal mengambil media Instagram!");
    }

    let result = data.result;

    if (!result || !result.media || !result.media.length) {
      return m.reply("❌ Media tidak ditemukan!");
    }

    let caption = `✅ _*ꜱɪꜱᴛᴇᴍ ɴᴏᴛɪᴄᴇ ꜱᴜᴄᴄᴇꜱ...*_`.trim();
    if (result.media.length === 1) {
      let media = result.media[0];

      if (media.type === "mp4") {
        await sock.sendMessage(m.chat, {
          video: { url: media.url },
          mimetype: 'video/mp4',
          caption: caption
        }, { quoted: m });
      } else {
        await sock.sendMessage(m.chat, {
          image: { url: media.url },
          caption: caption
        }, { quoted: m });
      }

    } else {
      for (let media of result.media) {
        if (media.type === "mp4") {
          await sock.sendMessage(m.chat, {
            video: { url: media.url },
            mimetype: 'video/mp4'
          }, { quoted: m });
        } else {
          await sock.sendMessage(m.chat, {
            image: { url: media.url }
          }, { quoted: m });
        }
      }

      await m.reply(caption);
    }

  } catch (e) {
    console.error('[IGDL ERROR]', e);
    m.reply("⚠️ Terjadi kesalahan saat mengambil video.");
  }

  await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
}
break