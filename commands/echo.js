const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js');

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

        interaction.reply({ embeds: [new MessageEmbed().setColor('GREEN').setDescription(query)] })
    } 
}