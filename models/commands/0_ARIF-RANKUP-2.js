module.exports.config = {
  name: "ARIF-RANKUP-CARD",
  version: "10.1.0-HD-WHITE",
  hasPermssion: 1,
  credits: "DEEPU BOSS",
  description: "HD VIP Rankup Card (White Text)",
  commandCategory: "LEVEL UP",
  dependencies: {
    "canvas": "",
    "axios": "",
    "fs-extra": ""
  },
  cooldowns: 2
};
module.exports.handleEvent = async function ({ api, event, Currencies, Users }) {
  const { threadID, senderID } = event;
  const fs = global.nodemodule["fs-extra"];
  const axios = global.nodemodule["axios"];
  const { createCanvas, loadImage } = require("canvas");
  // ===== EXP =====
  let exp = (await Currencies.getData(senderID)).exp || 0;
  exp += 1;
  const curLevel = Math.floor((Math.sqrt(1 + (4 * exp / 3)) + 1) / 2);
  const nextLevel = Math.floor((Math.sqrt(1 + (4 * (exp + 1) / 3)) + 1) / 2);
  if (nextLevel <= curLevel || nextLevel === 1) {
    await Currencies.setData(senderID, { exp });
    return;
  }
  const name = await Users.getNameUser(senderID);
  const randomshayari =
    VIP_SHAYARI[Math.floor(Math.random() * VIP_SHAYARI.length)];
  // ===== AVATAR =====
  const info = await api.getUserInfo(senderID);
  const avatarURL = info[senderID].profileUrl;
  const avatarData = await axios.get(avatarURL, { responseType: "arraybuffer" });
  const avatar = await loadImage(Buffer.from(avatarData.data));

// ===== CANVAS (BIG SIZE) =====
  const width = 1200;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // ===== BACKGROUND =====
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#020b0a");
  gradient.addColorStop(1, "#062e22");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // ===== DECOR =====
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.arc(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 90,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ===== GLASS =====
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(50, 50, width - 100, height - 100);

  // ===== AVATAR =====
  const avatarSize = 260;
  const avatarX = 110;
  const avatarY = 120;

  // Glow
  ctx.shadowColor = "#22ff88";
  ctx.shadowBlur = 50;
  ctx.beginPath();
  ctx.arc(
    avatarX + avatarSize / 2,
    avatarY + avatarSize / 2,
    avatarSize / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Image
  ctx.save();
  ctx.beginPath();
  ctx.arc(
    avatarX + avatarSize / 2,
    avatarY + avatarSize / 2,
    avatarSize / 2,
    0,
    Math.PI * 2
  );
  ctx.clip();
  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  // Border
  ctx.beginPath();
  ctx.arc(
    avatarX + avatarSize / 2,
    avatarY + avatarSize / 2,
    avatarSize / 2,
    0,
    Math.PI * 2
  );
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#22ff88";
  ctx.stroke();

  // ===== TEXT (WHITE FIX) =====
  ctx.font = "bold 72px Sans";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(255,255,255,0.6)";
  ctx.shadowBlur = 18;
  ctx.fillText("LEVEL UP!", 430, 150);
  ctx.shadowBlur = 0;

  ctx.font = "bold 48px Sans";
  ctx.fillStyle = "#22ff88";
  ctx.fillText(name, 430, 225);

  ctx.font = "38px Sans";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`You reached Level ${nextLevel}!`, 430, 290);

  // ===== SAVE =====
  const imgPath = __dirname + "/cache/arif_rankup_hd_white.png";
  fs.writeFileSync(imgPath, canvas.toBuffer());

  // ===== MESSAGE =====
  const msgBody =
`🎉 𝗟𝗘𝗩𝗘𝗟 𝗨𝗣! 🎉

😉 ${name} ❤️\n
आपने Level ${nextLevel} हासिल कर लिया है 🔥`;

  api.sendMessage(
    {
      body: msgBody,
      attachment: fs.createReadStream(imgPath)
    },
    threadID,
    () => fs.unlinkSync(imgPath)
  );

  await Currencies.setData(senderID, { exp });
};

// ===== ON / OFF =====
module.exports.run = async function ({ api, event, Threads }) {
  const { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data || {};

  data.rankup = !data.rankup;
  await Threads.setData(threadID, { data });
  global.data.threadData.set(threadID, data);

  return api.sendMessage(
    data.rankup ? "👑 VIP Rankup Card ON" : "❌ VIP Rankup Card OFF",
    threadID,
    messageID
  );
};