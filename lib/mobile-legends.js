const nexray = require('api-nexray');
const config = require("@config");
const { logCustom } = require("@lib/logger");

async function handle(sock, messageInfo) {
  const { remoteJid, message, prefix, command, content } = messageInfo;

  try {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return await sock.sendMessage(
        remoteJid,
        { text: `_Masukkan ID GAME_\n\n${prefix + command} 427679814 9954` },
        { quoted: message }
      );
    }

    const [user_id, server] = trimmedContent.split(" ");

    if (!user_id || !server) {
      return await sock.sendMessage(
        remoteJid,
        {
          text: `⚠️ _Format salah. Gunakan:_\n\n${
            prefix + command
          } <user_id> <server>`,
        },
        { quoted: message }
      );
    }

    // Mengirimkan reaksi loading
    await sock.sendMessage(remoteJid, {
      react: { text: "⏰", key: message.key },
    });
      
    // Memanggil API
    const response = await nexray.get('/stalker/v1/mlbb', {
        id: user_id,
        zone: server
        });

    
      const { username, region, id, zone, first_recharge } = response.result;
      
      const rechargeList = first_recharge.map(item => {
      const symbol = item.available ? "✓" : "×";
        return `    ◦  *Diamond* : ${item.title} ${symbol}`;
      }).join("\n");

      const gameDataId = `✧  *M L B B*\n\n` +
`    ◦  *User ID* : ${id}\n` +
`    ◦  *Server* : ${zone}\n` +
`    ◦  *Username* : ${username || "Tidak diketahui"}\n` +
`    ◦  *Region* : ${region}\n\n` +
`✧  *F I R S T - R E C H A R G E*\n\n` +
`${rechargeList}\n\n` +
`${config.footer}`;

      // Mengirimkan data yang diperoleh
      await sock.sendMessage(
        remoteJid,
        { text: gameDataId },
        { quoted: message }
      );
    
  } catch (error) {
    console.error("Error:", error);
    logCustom("info", content, `ERROR-COMMAND-${command}.txt`);

    // Penanganan kesalahan dengan pesan ke pengguna
    await sock.sendMessage(
      remoteJid,
      {
        text: `Maaf, terjadi kesalahan saat memproses permintaan Anda. Coba lagi nanti.\n\nDetail: ${
          error.message || error
        }`,
      },
      { quoted: message }
    );
  }
}

module.exports = {
  handle,
  Commands: ["ml", "mlcek", "mlbb"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1,
};
