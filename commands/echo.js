const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js');
const keywords = require('../util/keywords');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Echos what was typed.')
    .addStringOption(option =>
        option.setName('query')
        .setRequired(true)
        .setDescription('query to echo back.')
    ),
    async execute(interaction, client) {
        let query = interaction.options.getString('query')

        await interaction.reply({ embeds: [new EmbedBuilder().setColor(keywords.embedColors.GREEN).setDescription(query)] })
    } 
}