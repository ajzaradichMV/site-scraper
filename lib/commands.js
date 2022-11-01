const yargs = require('yargs')

/**
 * Create the command and options for our application using YARGS.
 * 
 * @returns {Object} Returns a JSON Object processed by YARGS.
 */

function loadCommands() {
    yargs
    .command({
        command: 'scrape',
        describe: 'Scrape a site and return data.',
        builder: (yargs) => {
            yargs.option('u', {
                alias: 'url',
                type: 'string',
                describe: 'A single URL of a site to scrape.'
            }),
            yargs.option('m', {
                alias: 'sitemap',
                type: 'string',
                describe: 'The sitemap URL to pull all pages from.'
            }),
            yargs.option('f', {
                alias: 'file',
                type: 'string',
                describe: 'The location of the file to pull URLs from. If empty, will use /site-scraper/data/txt/urls.txt.'
            }),
            yargs.option('o', {
                alias: 'output',
                type: 'string',
                describe: 'Preferred output of the data. Can either be \'console\' or \'file\'.'
            }),
            yargs.option('a', {
                alias: 'userAgent',
                type: 'string',
                describe: 'The userAgent to use when fetching the site data.'
            }),
            yargs.option('s', {
                alias: 'search',
                type: 'array',
                describe: 'The search parameters to find in the site data.'
            }),
            yargs.option('r', {
                alias: 'status',
                type: 'boolean',
                describe: 'If status flag is present, the output will be the final status of the request.'
            })
        },
    })
    .demandCommand(1, 'Needs at least 1 command.')
    .strict()
    yargs.parse()
    
    return yargs.argv
}

module.exports = { loadCommands }