const modRoles = require('../data/modRoles.json').modRoles;

/**
 * 
 * @param {String} input Either an "Message" input or "Interaction" input.
 * @param {Object} type "i" = Interacton | "m" = Message
 * @returns 
 */

// It's async so don't forget to use await

module.exports = {
    has(input) {
        return modRoles.some(roles => {
            return input.member.roles.cache.has(roles);
        })
    },
    roles: modRoles
}