
    const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Eingeloggt als ${client.user.tag}!`);
});

// Test-Nachricht im Chat, um zu sehen, ob er mitliest
client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        message.reply('Pong! Bot läuft.');
    }
});

client.login('MTU2NDMzMTk2NDQ3Mzk0MjA3Nw.GWo07L.7fOthmAf2hOX5mc0-7c3o8tIrTE2sCGAbZRKoU');
