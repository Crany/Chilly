const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const reportDB = require('../models/report.js')
const randomWords = require('random-words')
const mongoose = require('mongoose');
const keywords = require('../util/keywords.js');
const createID = require('../util/createID.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Reports a user.')
        .addUserOption((option) =>
            option.setName('reported')
            .setDescription('The member you want to report')
            .setRequired(true)
        )
        .addStringOption((option) =>
            option.setName('reason')
            .setDescription('Reason for the report')
            .setRequired(true)
        ),
    async execute(interaction, client) {
        let reportedUser = interaction.options.getMember('reported').user;
        let reason = interaction.options.getString('reason');
        let informant = interaction.user
        let identifier = `${createID()}`;

        let reportedEmbed = new EmbedBuilder()
        let reportChannelEmbed = new EmbedBuilder()

        if (reportedUser.bot) {
            reportedEmbed.setDescription("I can't report Bots.")
            .setColor(keywords.embedColors.ORANGE);

            await interaction.reply({ embeds: [reportedEmbed] })
        } else if (informant.id === reportedUser.id) { 
            reportedEmbed.setDescription("You can't report yourself, silly!")
            .setColor(keywords.embedColors.ORANGE);

            await interaction.reply({ embeds: [reportedEmbed], ephemeral: true });
        } else {

            reportedEmbed.setTitle("Report Sent.")
            .setColor(keywords.embedColors.GREEN)
            .setDescription(`Remember this ID: \`${identifier}\``)
            await interaction.reply({ embeds: [reportedEmbed] })

            reportChannelEmbed.setTitle(`${reportedUser.tag} was reported. [Discord]`)            
            .setColor(keywords.embedColors.ORANGE)
            .addFields(
                { name: 'Reported:', value: reportedUser.tag, inline: true},
                { name: 'Reported By:', value: informant.tag, inline: true},
                { name: 'Reason:', value: reason, inline: true},
            )
            .setFooter({text: `ID: ${identifier}`})
            .setTimestamp(new Date())
            client.channels.cache.get(keywords.userdashboardID).send({ embeds: [reportChannelEmbed] })

            const reportdb = new reportDB({
                _id: new mongoose.Types.ObjectId,
                reason: reason,
                reportedID: reportedUser.id,
                reporterID: interaction.user.id,
                identifier: identifier,
            })

            reportdb.save().catch();
        }
    }
}