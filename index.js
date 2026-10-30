require('dotenv').config(); // optional, wenn du eine .env nutzt
const {
  Client,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js');

const TOKEN = process.env.TOKEN;
const LOG_CHANNEL_ID = '1564279226901987498';

// Zeitzonen + die zugehörigen Rollen-IDs (Rollen vorher auf dem Server anlegen)
const ZONES = [
  { id: 'CET', label: 'Central European Time (CET)',   roleId: 'ROLLEN_ID_CET' },
  { id: 'EET', label: 'Eastern European Time (EET)',   roleId: 'ROLLEN_ID_EET' },
  { id: 'PST', label: 'Pacific Standard Time (PST)',   roleId: 'ROLLEN_ID_PST' },
  { id: 'UTC', label: 'Coordinated Universal Time (UTC)', roleId: 'ROLLEN_ID_UTC' },
];

const QUESTION = 'What is your Current Time Zone?';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (c) => {
  console.log(`Eingeloggt als ${c.user.tag}`);

  const command = new SlashCommandBuilder()
    .setName('timezone-panel')
    .setDescription('Postet das Zeitzonen-Auswahlmenü in diesem Channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

  for (const guild of c.guilds.cache.values()) {
    await guild.commands.create(command);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  // 1) Panel posten
  if (interaction.isChatInputCommand() && interaction.commandName === 'timezone-panel') {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('timezone_select')
      .setPlaceholder('Wähle deine Zeitzone')
      .addOptions(ZONES.map((z) => ({ label: z.label, value: z.id })));

    const embed = new EmbedBuilder()
      .setTitle('Time Zones')
      .setDescription(QUESTION)
      .setColor(0x5865f2);

    await interaction.channel.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)],
    });
    return interaction.reply({ content: 'Panel gepostet ✅', ephemeral: true });
  }

  // 2) Auswahl verarbeiten
  if (interaction.isStringSelectMenu() && interaction.customId === 'timezone_select') {
    const selected = interaction.values[0];
    const member = interaction.member;

    try {
      // alte Zeitzonen-Rollen entfernen, neue hinzufügen
      const allRoleIds = ZONES.map((z) => z.roleId);
      await member.roles.remove(allRoleIds.filter((id) => member.roles.cache.has(id)));
      await member.roles.add(ZONES.find((z) => z.id === selected).roleId);
    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: 'Rolle konnte nicht gesetzt werden (Bot-Rechte/Rollenposition prüfen).',
        ephemeral: true,
      });
    }

    // Log-Nachricht
    const logEmbed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .addFields(
        { name: 'Question', value: QUESTION },
        ...ZONES.map((z) => ({
          name: z.label,
          value: z.id === selected ? 'Yes' : 'No',
        }))
      );

    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
    await logChannel.send({
      content: `<@${interaction.user.id}>`,
      embeds: [logEmbed],
    });

    return interaction.reply({
      content: `Deine Zeitzone wurde auf **${selected}** gesetzt ✅`,
      ephemeral: true,
    });
  }
});

client.login(TOKEN);
