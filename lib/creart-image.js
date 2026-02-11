case "creart":
case "creartimage": {
  try {
    const axios = require("axios");
    const FormData = require("form-data");
    const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";
    let param = text ? text.trim() : "";

    if (!mime || !mime.startsWith("image")) {
      return reply(`⚠️ _Kirim/Balas gambar dengan caption *${prefix + command} teks*_`);
    }

    if (!param) {
      return reply("⚠️ Masukkan teks pada caption.");
    }

    await X.sendMessage(m.chat, { react: { text: "🕐", key: m.key } });

    const stream = await downloadContentFromMessage(q.msg || q, "image");

    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    if (!buffer.length) {
      return reply("❌ Gagal membaca gambar.");
    }

    const form = new FormData();
    form.append("image", buffer, {
      filename: "image.jpg",
      contentType: mime
    });
    form.append("param", param);

    const res = await axios.post(
      "https://api.nexray.web.id/ai/creartimage",
      form,
      {
        headers: form.getHeaders(),
        responseType: "arraybuffer",
        maxBodyLength: Infinity
      }
    );

    await X.sendMessage(
      m.chat,
      {
        image: Buffer.from(res.data),
        caption: "✅ Sistem Notice Success"
      },
      { quoted: m }
    );

  } catch (err) {
    console.error("CREART ERROR:", err.response?.data || err.message);
    reply("❌ Gagal memproses image.");
  }
}
break