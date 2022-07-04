const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

const mongoose = require('mongoose')

const hasModRoles = require('../util/hasModRoles')
const keywords = require('../util/keywords')
const warnDB = require('../models/warn')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('fetchwarnings')
    .setDescription('Fetches warnings from online database.')
    .addSubcommand(sub =>
        sub.setName('id')
        .setDescription('Fetches warnings from online database via warn ID.')
        .addStringOption(option =>
            option.setRequired(true)
            .setName('id')
            .setDescription('The warn ID.')
        )
    ).addSubcommand(sub =>
        sub.setDescription('Fetches warnings from online database via User.')
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

        let warningFetch = []; // Clear results //
        let warningFetchResult = []; // MongoDB Results //

        if (subCommand == 'user') {
            query = interaction.options.getMember('user').user.id;
            querySearch = 'warnedId'
        } else if (subCommand == 'id') {
            query = interaction.options.getString('id');
            querySearch = 'identifier'
        }

        if (!hasModRoles.has(interaction)) {
            await interaction.reply({ embeds: [
                new MessageEmbed()
                .setDescription('You have to be a moderator to complete this action.')
                .setColor(keywords.embedColors.ORANGE)
            ] })
        } else {
            warnDB.find({}, (err, result) => {
                warningFetchResult = result;
            }).clone().then(() => {
                setTimeout(() => {   
                    for (let i = 0; i != warningFetchResult.length; i++) {
                        if (warningFetchResult[i][querySearch] == query) {
                            warningFetch.push(warningFetchResult[i])
                        }
                    }
                }, 1000)
            });

            setTimeout(async () => {
                const resultEmbed = new MessageEmbed()
                if (warningFetch.length == 0) {
                    resultEmbed.setColor(keywords.embedColors.ORANGE)
                    .setDescription('Nothing was returned [Error: `404`]')

                    await interaction.reply({ embeds: [resultEmbed] })
                } else {
                    if (subCommand == 'user') query = interaction.options.getMember('user').user.tag

                    resultEmbed.setTitle(`This is what was returned for the query \`${query}\`.`)
                    .setDescription(`${warningFetch.length} warning(s) were found with this query.`)
                    .setColor(keywords.embedColors.GREEN)
                    for (let i = 0; i != warningFetch.length; i++) {
                        resultEmbed.addFields(
                            {name: "Warned By:", value: interaction.guild.members.cache.get(warningFetch[i].warnerId).user.tag, inline: true},
                            {name: "Warned User:", value: interaction.guild.members.cache.get(warningFetch[i].warnedId).user.tag, inline: true},
                            {name: "Warn ID:", value: warningFetch[i].identifier, inline: true},
                            {name: "Reason:", value: `\`${warningFetch[i].reason}\``, inline: false}
                        )
                    }

                    await interaction.reply({ embeds: [resultEmbed]})
                }
            }, 1500)
        }
    }
}