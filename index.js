require('dotenv').config();
const { Client, Intents, Collection, } = require('discord.js'); // Import discord stuff //
const path = require('node:path')
const fs = require('node:fs')

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const client = new Client({ // Create Discord Client //
    intents: [
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILDS,
    ], partials: [
        'CHANNEL',
        'GUILD_MEMBER',
        'GUILD_SCHEDULED_EVENT',
        'MESSAGE',
        'REACTION',
        'USER',
    ]
});

const clientID = process.env.CLIENTID;
const guildID  = process.env.GUILDID;

const token = process.env.TOKEN;

// Register and read commands slash commands //

client.commands = new Collection();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const doingCaptcha = [];

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
	try {
		console.log('├── Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(clientID, guildID),
			{ body: commands },
		);

		console.log('├── Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();

// Main things

client.once('ready', () => {
    console.log('└── Connected to Discord.')
})

client.on('interactionCreate', async (interaction) => { // On the creation of an interaction
    const command = client.commands.get(interaction.commandName);
    if (!interaction.isCommand && !interaction.isAutocomplete()) return;
    else if (!command) return;
    else {
        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            try  {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            } catch {}
        }

        if (interaction.isAutocomplete()) return;
        else console.log(`${interaction.user.tag} use the /${interaction.commandName} command`); 
    }
})

client.login(process.env.TOKEN)