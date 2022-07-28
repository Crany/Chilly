require('dotenv').config();
const { Client, GatewayIntentBits, Collection, InteractionType} = require('discord.js'); // Import discord stuff //
const path = require('node:path')
const fs = require('node:fs')

const mongoose = require('mongoose')

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const client = new Client({ // Create Discord Client //
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
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

client.on('voiceStateUpdate', (oldState, newState) => {
    let privateVoiceChannels = require('./data/privateVoiceChannels')

    if (newState.channelId === null) {
        if (oldState.channel.members.size == 0 && privateVoiceChannels.includes(oldState.channelId)) {
            oldState.channel.setUserLimit(1);
        }
    }
})

client.on('interactionCreate', async (interaction) => { // On the creation of an interaction
    const command = client.commands.get(interaction.commandName);
    if (!interaction.isChatInputCommand() && interaction.type != InteractionType.ApplicationCommandAutocomplete) return;
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

        if (interaction.type != InteractionType.ApplicationCommandAutocomplete) return;
        else console.log(`${interaction.user.tag} use the /${interaction.commandName} command`); 
    }
})

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("├── Connected to the MongoDB Database.");
    client.login(process.env.TOKEN).catch((err) => {
        console.log("└── Failed to connect to Discord.");
        console.error(err);
    });
}).catch((err) => {
    console.log("└── Failed to connect to the MongoDB Database.");
    console.error(err);
    process.exit(1);
});