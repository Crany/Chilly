const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const hasModRoles = require("../util/hasModRoles");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('User Timeout')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user you want to timeout.')
            .setRequired(true)
        ).addStringOption(option =>
            option.setName('length')
            .setDescription('The length of the timeout.')
            .setAutocomplete(true)
            .setRequired(true)
        ).addStringOption(option =>
            option.setName('reason')
            .setDescription('Reason for the timeout.')
            .setRequired(true)
        ),
    async execute(interaction, client) {
        if (interaction.isAutocomplete()) {
            let focusedValue = interaction.options.getFocused().replace(/\D/g,'');
            if (focusedValue == "") focusedValue = 1
            else parseInt(focusedValue)

            let choices;
            if (focusedValue == 1) {
                choices = [
                    `${focusedValue} second`,
                    `${focusedValue} minute`,
                    `${focusedValue} hour`,
                    `${focusedValue} day`,
                    `${focusedValue} week`,
                ];
            } else {
                choices = [
                    `${focusedValue} seconds`,
                    `${focusedValue} minutes`,
                    `${focusedValue} hours`,
                    `${focusedValue} days`,
                    `${focusedValue} weeks`,
                ];
            }
            const filtered = choices.filter(choice => choice.startsWith(focusedValue));
            const response = await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })))
        } else if (interaction.isCommand()) {
            let user = interaction.options.getMember('user');
            let length = interaction.options.getString('length').replace(/\D\s/g,'').split(' ');
            let reason = interaction.options.getString('reason');
            
            try {
                parseInt(length[0])
            } catch (err) {}

            let targetHasModRoles = hasModRoles.roles.some(roles => 
                user.roles.cache.has(roles)
            )

            let validChoices = [
                'second', 'seconds',
                'minute', 'minutes',
                'hour'  , 'hours'  ,
                'day'   , 'days'   ,
                'week'  , 'week'   ,
            ]

            if (hasModRoles.has(interaction) != true) {
                await interaction.reply({ embeds: [
                    new MessageEmbed()
                    .setDescription('You have to be a Moderator to do this action.')
                    .setColor('#FFBF00')
                ]})
            } else if (length.length == 2 && validChoices.includes(length[1]) && typeof(length[0]) != 'number') {

                if (targetHasModRoles == true) {
                    await interaction.reply({ embeds: [
                        new MessageEmbed()
                        .setDescription('I cannot timeout Mod Members.')
                        .setColor('#FFBF00')
                    ] })
                } else {
                    let timoutLengthMilli;
                    if      (length[1] == 'second' || length[1] == 'seconds') timoutLengthMilli = length[0] * 1000;
                    else if (length[1] == 'minute' || length[1] == 'minutes') timoutLengthMilli = length[0] * 60 * 1000;
                    else if (length[1] == 'hour'   || length[1] == 'hours')   timoutLengthMilli = length[0] * 60 * 60 * 1000;
                    else if (length[1] == 'day'    || length[1] == 'days')    timoutLengthMilli = length[0] * 24 * 60 * 60 * 1000;
                    else if (length[1] == 'week'   || length[1] == 'weeks')   timoutLengthMilli = length[0] * 7  * 24 * 60 * 60 * 1000;

                    user.timeout(timoutLengthMilli, reason)
                    
                    let timeoutEmbed = new MessageEmbed()
                    .setDescription(`${user.user} is now on a timeout for ${length.join(' ')}.`)
                    .setColor('GREEN')

                    await interaction.reply({ embeds: [timeoutEmbed] })
                }
            } else {
                await interaction.reply({ embeds: [
                    new MessageEmbed()
                    .setDescription('Please format the / command properly.')
                    .setColor('FFBF00')
                ]})
            }
        }
    }
}