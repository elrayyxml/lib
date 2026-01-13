async function handle(sock, messageInfo) {
  const { remoteJid, message } = messageInfo;

function getBotUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

   const botStartTime = Date.now();

     const bottime = getBotUptime((Date.now() - botStartTime) / 1000);

        await sock.sendMessage(remoteJid, {
           text: `*Running For* : [ \`\`\`${bottime}\`\`\` ]`
        }, { quoted: message });
        
}

module.exports = {
  handle,
  Commands: ["runtime"],
  OnlyPremium: false,
  OnlyOwner: false,
};