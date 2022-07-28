const randomWords = require('random-words');

module.exports = (max) => {
    if (max == null) max = 5
    return randomWords({exactly: 3, maxLength: max, join: "."})
}