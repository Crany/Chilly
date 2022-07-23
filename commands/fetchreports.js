const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('discord.js')

const mongoose = require('mongoose')

const hasModRoles = require('../util/hasModRoles')
const keywords    = require('../util/keywords')
const reportDB    = require('../models/report') 

module.exports = {
    data: new SlashCommandBuilder()
    .setName('fetchreports')
    .setDescription('Fetches reports from online database.')
    .addSubcommand(sub =>
        sub.setName('id')
        .setDescription('Fetches reports from online database via report ID.')
        .addStringOption(option =>
            option.setRequired(true)
            .setName('id')
            .setDescription('The report ID.')
        )
    ).addSubcommand(sub =>
        sub.setDescription('Fetches reports from online database via User.')
        .setName('user')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The User.')
            .setRequired(true)
        )
    ),
    async execute(interaction, client) {
        const subCommand = interaction.options.getSubcommand()
        let query;
        let querySearch;

        let reportFetch = []; // Clear results //
        let reportFetchResult = []; // MongoDB Results //

        if (subCommand == 'user') {
            query = interaction.options.getMember('user').user.id;
            querySearch = 'reportedID'
        } else if (subCommand == 'id') {
            query = interaction.options.getString('id');
            querySearch = 'identifier'
        }

        if (!hasModRoles.has(interaction)) {
            await interaction.reply({ embeds: [
                new EmbedBuilder()
                .setDescription('You have to be a moderator to complete this action.')
                .setColor(keywords.embedColors.ORANGE)
            ] })
        } else {
            reportDB.find({}, (err, result) => {
                reportFetchResult = result;
            }).clone().then(() => {
                setTimeout(() => {   
                    for (let i = 0; i != reportFetchResult.length; i++) {
                        if (reportFetchResult[i][querySearch] == query) {
                            reportFetch.push(reportFetchResult[i])
                        }
                    }
                }, 1000)
            });

            setTimeout(async () => {
                const resultEmbed = new EmbedBuilder()
                if (reportFetch.length == 0) {
                    resultEmbed.setColor(keywords.embedColors.ORANGE)
                    .setDescription('Nothing was returned [Error: `404`]')

                    await interaction.reply({ embeds: [resultEmbed] })
                } else {
                    if (subCommand == 'user') query = interaction.options.getMember('user').user.tag

                    resultEmbed.setTitle(`This is what was returned for the query \`${query}\`.`)
                    .setDescription(`${reportFetch.length} report(s) were found with this query.`)
                    .setColor(keywords.embedColors.GREEN)
                    for (let i = 0; i != reportFetch.length; i++) {
                        resultEmbed.addFields(
                            {name: "Reported By:", value: interaction.guild.members.cache.get(reportFetch[i].reporterID).user.tag, inline: true},
                            {name: "Reported:", value: interaction.guild.members.cache.get(reportFetch[i].reportedID).user.tag, inline: true},
                            {name: "Report ID:", value: reportFetch[i].identifier, inline: true},
                            {name: "Reason:", value: `\`${reportFetch[i].reason}\``, inline: false}
                        )
                    }

                    await interaction.reply({ embeds: [resultEmbed]})
                }
            }, 1500)
        }
    }
}
