
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

const registeredUsers = new Set();

client.once('ready', () => {
    console.log(`Eingeloggt als ${client.user.tag}!`);
});

// 1. Befehl, um das Registrierungs-Embed in den Kanal zu senden
client.on('messageCreate', async message => {
    if (message.author.bot) return;

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
        if (interaction.customId === 'open_register_modal') {
            if (registeredUsers.has(interaction.user.id)) {
                return interaction.reply({ 
                    content: 'Du hast dich bereits registriert, du kannst dich nicht erneut registrieren!', 
                    ephemeral: true 
                });
            }

            const modal = new ModalBuilder()
                .setCustomId('register_modal')
                .setTitle('Registriere dich');

            const nameInput = new TextInputBuilder()
                .setCustomId('meta_name_input')
                .setLabel('Please Type your Meta Quest / PCVR Name')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('User')
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
            await interaction.showModal(modal);
        }

        if (interaction.customId === 'accept_user' || interaction.customId === 'reject_user') {
            const accepted = interaction.customId === 'accept_user';
            
            const originalEmbed = interaction.message.embeds[0];
            const updatedEmbed = EmbedBuilder.from(originalEmbed)
                .setColor(accepted ? 0x00FF00 : 0xFF0000)
                .addFields({ name: 'Status', value: accepted ? '✅ Angenommen' : '❌ Abgelehnt' });

            await interaction.update({ 
                embeds: [updatedEmbed], 
                components: [] 
            });
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'register_modal') {
            const enteredName = interaction.fields.getTextInputValue('meta_name_input');
            
            registeredUsers.add(interaction.user.id);

            await interaction.reply({ 
                content: 'Deine Club-Registrierung wurde an das Team weitergereicht. Du musst warten, bis sie bearbeitet wurde.', 
                ephemeral: true 
            });

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

client.login('MTU2NDMzMTk2NDQ3Mzk0MjA3Nw.GWo07L.7fOthmAf2hOX5mc0-7c3o8tIrTE2sCGAbZRKoU');
