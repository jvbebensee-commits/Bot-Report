require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes,
    EmbedBuilder
} = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// Slash Command
const commands = [
    new SlashCommandBuilder()
        .setName('register-new-game')
        .setDescription('Register a new game')

        .addStringOption(option =>
            option.setName('enemy')
                .setDescription('Enter the enemy team name')
                .setRequired(true)
        )

        .addStringOption(option =>
            option.setName('date')
                .setDescription('Enter the match date (DD.MM.YYYY)')
                .setRequired(true)
        )

        .addStringOption(option =>
            option.setName('time')
                .setDescription('Enter the match time (HH:MM)')
                .setRequired(true)
        )

        .addStringOption(option =>
            option.setName('map1')
                .setDescription('First map')
                .setRequired(true)
        )

        .addStringOption(option =>
            option.setName('map2')
                .setDescription('Second map')
                .setRequired(true)
        )

        .addStringOption(option =>
            option.setName('map3')
                .setDescription('Third map')
                .setRequired(true)
        )
        .toJSON()
];

// Register Slash Commands
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

async function registerCommands() {
    try {
        console.log('Registering Slash Commands...');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log('Slash Commands successfully registered!');
    } catch (error) {
        console.error(error);
    }
}

// Bot Ready
client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
});

// Handle Commands
client.on('interactionCreate', async interaction => {

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'register-new-game') {

        const enemy = interaction.options.getString('enemy');
        const date = interaction.options.getString('date');
        const time = interaction.options.getString('time');

        const map1 = interaction.options.getString('map1');
        const map2 = interaction.options.getString('map2');
        const map3 = interaction.options.getString('map3');

        const embed = new EmbedBuilder()
            .setColor('#2B2D31')
            .setTitle('🎮 NEW GAME REGISTERED')
            .setDescription('A new match has been registered!')

            .addFields(
                {
                    name: '👥 Enemy',
                    value: enemy,
                    inline: true
                },
                {
                    name: '📅 Date',
                    value: date,
                    inline: true
                },
                {
                    name: '🕒 Time',
                    value: time,
                    inline: true
                },
                {
                    name: '🗺️ Maps',
                    value:
                        `**Map 1:** ${map1}\n` +
                        `**Map 2:** ${map2}\n` +
                        `**Map 3:** ${map3}`,
                    inline: false
                },
                {
                    name: '👤 Registered by',
                    value: interaction.user.toString(),
                    inline: false
                }
            )

            .setFooter({
                text: 'Game Registration System'
            })

            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
});

// Start Bot
(async () => {
    await registerCommands();
    await client.login(process.env.TOKEN);
})();