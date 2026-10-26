const { 
    Client, 
    GatewayIntentBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    EmbedBuilder 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

// Hier speicherungshalber (für den Anfang im Speicher) wer sich registriert hat
const registeredUsers = new Set();

client.once('ready', () => {
    console.log(`Eingeloggt als ${client.user.tag}!`);
});

// 1. Befehl, um das Registrierungs-Embed in den Kanal zu senden (z.B. /registrieren oder im Chat !setup)
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // Admin-Befehl zum Erstellen der Registrierungs-Nachricht
    if (message.content === '!setup-register') {
        const embed = new EmbedBuilder()
            .setTitle('Join NOF')
            .setDescription('If you\'d like to join the Team NOF, the First step is to register here.')
            .setColor(0x0099ff);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_register_modal')
                .setLabel('Register')
                .setStyle(ButtonStyle.Success)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }
});

// 2. Interaktionen verarbeiten (Buttons & Modals)
client.on('interactionCreate', async interaction => {
    if (interaction.isButton()) {
        // Wenn der User auf den "Register"-Button klickt
        if (interaction.customId === 'open_register_modal') {
            // Prüfen, ob schon registriert
            if (registeredUsers.has(interaction.user.id)) {
                return interaction.reply({ 
                    content: 'Du hast dich bereits registriert, du kannst dich nicht erneut registrieren!', 
                    ephemeral: true 
                });
            }

            // Modal (Popup-Formular) öffnen
            const modal = new ModalBuilder()
                .setCustomId('register_modal')
                .setTitle('Registriere dich');

            const nameInput = new TextInputBuilder()
                .setCustomId('meta_name_input')
                .setLabel('Please Type your Meta Quest / PCVR Name')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('User')
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addcomponents(nameInput));
            await interaction.showModal(modal);
        }

        // Admin-Buttons im Log-Channel (Accept / Reject)
        if (interaction.customId === 'accept_user' || interaction.customId === 'reject_user') {
            const accepted = interaction.customId === 'accept_user';
            
            const originalEmbed = interaction.message.embeds[0];
            const updatedEmbed = EmbedBuilder.from(originalEmbed)
                .setColor(accepted ? 0x00FF00 : 0xFF0000)
                .addFields({ name: 'Status', value: accepted ? '✅ Angenommen' : '❌ Abgelehnt' });

            await interaction.update({ 
                embeds: [updatedEmbed], 
                components: [] // Buttons entfernen nach Klick
            });
        }
    }

    // 3. Auswertung des Popup-Formulars (Modal Submit)
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'register_modal') {
            const enteredName = interaction.fields.getTextInputValue('meta_name_input');
            
            registeredUsers.add(interaction.user.id);

            // Dem User die Bestätigung zeigen
            await interaction.reply({ 
                content: 'Deine Club-Registrierung wurde an das Team weitergereicht. Du musst warten, bis sie bearbeitet wurde.', 
                ephemeral: true 
            });

            // Log-Nachricht in einen bestimmten Log-Kanal senden 
            // (Ersetze 'DEIN_LOG_KANAL_ID' mit der echten ID deines #register-logs Kanals)
            const logChannelId = '1563990744480489582'; 
            const logChannel = interaction.guild.channels.cache.get(logChannelId);

            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('A person wants to register')
                    .setDescription('A new club registration is pending for verification. Use the buttons to perform actions.')
                    .addFields(
                        { name: 'Member', value: `<@${interaction.user.id}>` },
                        { name: 'Name', value: enteredName }
                    )
                    .setColor(0xFFA500);

                const adminRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('accept_user')
                        .setLabel('Accept')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('reject_user')
                        .setLabel('Reject')
                        .setStyle(ButtonStyle.Danger)
                );

                await logChannel.send({ embeds: [logEmbed], components: [adminRow] });
            }
        }
    }
});

client.login('DEIN_ECHTER_DISCORD_TOKEN_HIER');
