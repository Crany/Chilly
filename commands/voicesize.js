const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const keywords = require('../util/keywords');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('voicesize')
    .setDescription('Sets the size of a Private voice channel.')
    .addIntegerOption(option =>
        option.setName('size')
        .setDescription('Size of the private voice channel.')
        .setRequired(true)
    ),
    async execute(interaction, client) {
        let size = interaction.options.getInteger('size')

        let privateVoiceChannels = [
            '989238982183370853',  // Private 1
            '992150933922381995',  // Private 2
            '996842452281466910',  // Private 3
            '1000761275892117625', // Admin Private
        ]

        let response = new EmbedBuilder();
        let user = await interaction.member;
        let voice = await user.voice.channel;

        if (size < 1) {
            response.setColor(keywords.embedColors.ORANGE)
            .setDescription("The size of the channel has to be greater than 1.")

            await interaction.reply({ embeds: [response] })
        } else if (size >= 99) {
            response.setColor(keywords.embedColors.ORANGE)
            .setDescription("The size of the channel has to be smaller than 100.")

            await interaction.reply({ embeds: [response] })
        } else if (!voice || !privateVoiceChannels.includes(voice.id)) {
            response.setColor(keywords.embedColors.ORANGE)
            .setDescription('You must be in a private voice channel.')

            await interaction.reply({ embeds: [response] })
        } else {
            voice.setUserLimit(size)

            response.setDescription(`Sucessfully set user limit of channel \`${voice.name}\` to \`${size}\`.`)
            .setColor(keywords.embedColors.GREEN)

            await interaction.reply({ embeds: [response] })
        }
    }
}