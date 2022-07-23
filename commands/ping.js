const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const keywords = require('../util/keywords');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction, client) {
        var ping = client.ws.ping; // Gets the ping of the bot //

        let pingEmbed = new EmbedBuilder()
        .setTitle(`Pong! \`${ping}ms\``)
        
        if (ping >= "500") { // Terrible Connection //
            pingEmbed.setColor(keywords.embedColors.RED);
            pingEmbed.setDescription(`Pong! \`${ping}ms\`\nSeems like we're experiencing some networking issues.`)
        } else if (ping >= "250") { // Degraded Connection //
            pingEmbed.setColor(keywords.embedColors.ORANGE);
        } else if (ping < "250") { // Good Connection //
            pingEmbed.setColor(keywords.embedColors.GREEN);
        }

        return await interaction.reply({ embeds: [pingEmbed] });
    }
}