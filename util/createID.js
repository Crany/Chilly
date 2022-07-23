const randomWords = require('random-words');

module.exports = (letterCount) => {
    if (letterCount == null) letterCount = 5
    return randomWords({exactly: 3, maxLength: letterCount, join: "."})
}