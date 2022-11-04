/**
 * File: functions.js
 * Description: Contains all the various functions for the site-scraper CLI application.
 */
const colors = require('ansi-colors');

module.exports = { validateUrl, validateUserInput }

/**
 * Tests a URL provided by the user to see if it is a valid URL. Force closes node if the
 * URL is invalid.
 * 
 * @param {string} urlToTest String gathered from user input.
 * @return {url} Returns validated URL object.
 * 
 */
function validateUrl(urlToTest) {
    var validUrl;
    try {
        validUrl = new URL(urlToTest);
    } catch(e) {
        console.log('Invalid URL output for: ', urlToTest);
        process.exit(); // If invalid URL, forcibly end the node.js process.
    }
    return validUrl;
}

function validateUserInput(commands) {
    if (commands.file === '' && !commands.sitemap && !commands.url) {
        return true;
    }

    if (commands.url && !commands.sitemap && !commands.file ||
        !commands.url && commands.sitemap && !commands.file ||
        !commands.url && !commands.sitemap && commands.file) {
        return true;
    } else {
        console.log(colors.red, 'Only one type of option \'--url\', \'--sitemap\', or \'--file\' is allowed.');
        process.exit();
    }
}