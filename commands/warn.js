const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const hasModRoles = require('../util/hasModRoles');
const keywords = require('../util/keywords')
const warnDB = require('../models/warn')
const randwords = require('random-words')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warns a member.')
    .addUserOption(option =>
        option.setName('user')
        .setDescription('Warned User')
        .setRequired(true)
    ).addStringOption(option =>
        option.setName('reason')
        .setRequired(true)
        .setDescription('Reason for the warn')
    ),
    async execute(interaction, client) {
        let warned = interaction.options.getMember('user');
        let reason = interaction.options.getString('reason');
        let identifier = `${randwords()}.${randwords()}.${randwords()}`;

        let targetHasModRoles = hasModRoles.roles.some(roles => 
            warned.roles.cache.has(roles)
        )

        let replyEmbed = new MessageEmbed()

        if (warned.user.id == interaction.user.id) {
            replyEmbed.setDescription('You can\'t warn yourself.')
            .setColor(keywords.embedColors.ORANGE)

            await interaction.reply({ embeds: [replyEmbed] })
        } else if (!hasModRoles.has(interaction)) {
            replyEmbed.setDescription('You must be a Moderator to do this action.')
            .setColor(keywords.embedColors.ORANGE)

            await interaction.reply({ embeds: [replyEmbed] })
        } else if (targetHasModRoles) {
            replyEmbed.setDescription('I cannot warn Moderators.')
            .setColor(keywords.embedColors.ORANGE)

            await interaction.reply({ embeds: [replyEmbed] })
        } else if (warned.user.bot) {
            replyEmbed.setDescription('I can\'t warn bots.')
            .setColor(keywords.embedColors.ORANGE)

            await interaction.reply({ embeds: [replyEmbed] })
        } else {
            replyEmbed.setDescription(`${warned.user.tag} has been warned.`)
            .setColor(keywords.embedColors.GREEN)
            .setFooter(`Remember this ID: ${identifier}`)
            .setTimestamp();

            await interaction.reply({ embeds: [replyEmbed] })

            interaction.guild.channels.cache.get('990298827208683590').send({ embeds: [
                new MessageEmbed()
                .setDescription(`${warned.user.tag} has been warned.`)
                .addFields(
                    {name: 'Warned:', value: warned.user.tag, inline: true},
                    {name: 'Warned By:', value: interaction.user.tag, inline: true},
                    {name: 'Reason', value: reason, inline: true},
                )
                .setFooter(`ID: ${identifier}`)
                .setTimestamp()
                .setColor(keywords.embedColors.ORANGE)
            ] })

            const warnSave = new warnDB({
                _id: new mongoose.Types.ObjectId,
                reason: reason,
                warnedId: warned.id,
                warnerId: interaction.user.id,
                identifier: identifier,
            })

            warnSave.save().catch()
        }
    }
}