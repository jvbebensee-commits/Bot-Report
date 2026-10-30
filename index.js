require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');

const TOKEN = process.env.TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, async (c) => {
  console.log(`Eingeloggt als ${c.user.tag}`);

  // Entfernt den alten Slash-Command /timezone-panel von deinen Servern
  for (const guild of c.guilds.cache.values()) {
    await guild.commands.set([]);
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  console.log(`Nachricht von ${message.author.tag}: "${message.content}"`);

  // erkennt "whats the time", "what's the time", "what is the time" (auch mit iPad-Apostroph)
  if (/what(['’]?s| is) the time/i.test(message.content)) {
    const now = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Berlin',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    }).format(new Date());

    await message.reply(`🕒 Current time: **${now}**`);
  }
});

client.login(TOKEN);