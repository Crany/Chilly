const warnDB = require('../models/warn')

module.exports = async (interaction, client) => {
    const user = interaction.options.getMember('user');

    warnDB.find({ warnedId: user.id }, (err, res) => {
        if      (res.length <= 6) user.timeout(1 * 60 * 60 * 1000);
        else if (res.length <= 3) user.timeout(3 * 60 * 60 * 1000);
    })
}