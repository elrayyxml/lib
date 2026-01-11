const os = require("os");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Fungsi format uptime
function getUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(secs).padStart(2, '0')}`;
}

// Fungsi platform yang lebih fleksibel
function getPlatform() {
  const platform = os.platform();
  if (platform === "win32") return "Windows";
  if (platform === "linux") return "Linux";
  return platform;
}

// Fungsi disk info tergantung OS
function getDiskInfo() {
  try {
    if (os.platform() === "win32") {
      const stdout = execSync('wmic logicaldisk get size,freespace,caption').toString();
      const lines = stdout.trim().split('\n').filter(line => line.trim());
      const diskData = lines.slice(1).map(line => {
        const [drive, free, total] = line.trim().split(/\s+/);
        return {
          drive,
          total: (parseInt(total) / (1024 ** 3)).toFixed(2) + " GB",
          free: (parseInt(free) / (1024 ** 3)).toFixed(2) + " GB",
          used: ((parseInt(total) - parseInt(free)) / (1024 ** 3)).toFixed(2) + " GB"
        };
      });
      // Ambil drive C sebagai default
      return diskData.find(d => d.drive === "C:") || diskData[0];
    } else {
      const total = execSync("df -h --output=size / | tail -1").toString().trim();
      const free = execSync("df -h --output=avail / | tail -1").toString().trim();
      const used = execSync("df -h --output=used / | tail -1").toString().trim();
      return { total, free, used };
    }
  } catch (err) {
    return { total: "N/A", free: "N/A", used: "N/A" };
  }
}

async function handle(sock, messageInfo) {
  const { remoteJid, message } = messageInfo;
  const start = process.hrtime();
  const end = process.hrtime(start);
  const responseSpeed = (end[0] + end[1] / 1e6).toFixed(4) + "s";

  const platformName = getPlatform();
  const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB";
  const freeRam = (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + " GB";
  const usedRam = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2) + " GB";
  const { total: totalDisk, free: freeDisk, used: usedDisk } = getDiskInfo();
  const cpuCores = os.cpus().length;
  const cpuModel = os.cpus();
  const hostName = os.hostname();
  const uptimeVPS = getUptime(os.uptime());

  await sock.sendMessage(
    remoteJid,
    {
      text: `✧  *S E R V E R - I N F O*\n\n` +
        `    ◦  *Platform* : \`\`\`${platformName}\`\`\`\n` +
        `    ◦  *Ram* : \`\`\`${usedRam} / ${totalRam}\`\`\`\n` +
        `    ◦  *Memory* : \`\`\`${usedDisk} / ${totalDisk}\`\`\`\n` +
        `    ◦  *Cpu* : \`\`\`${cpuCores} Core\`\`\`\n` +
        `    ◦  *Cpu Model* : \`\`\`${cpuModel}\`\`\`\n` +
        `    ◦  *Uptime* : \`\`\`${uptimeVPS}\`\`\`\n` +
        `    ◦  *Hostname* : \`\`\`${hostName}\`\`\``,
    },
    { quoted: message }
  );
}

module.exports = {
  handle,
  Commands: ["os"],
  OnlyPremium: false,
  OnlyOwner: false,
};
