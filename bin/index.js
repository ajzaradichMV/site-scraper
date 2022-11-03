#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const colors = require('ansi-colors');
const getUrl = require('../lib/fetch');
const loadCommands = require('../lib/commands');
const validation = require('../lib/functions');
const parser = require('../lib/sitemapParser');
const commands = loadCommands.loadCommands();
const progressBar = require('cli-progress');

// Establish progress bars.
const singlebar = new progressBar.MultiBar({
    format: 'Fetch and Write Progress |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Chunks || ETA: {eta}s',
    clearOnComplete: false,
    hideCursor: true,
    forceRedraw: true
}, progressBar.Presets.shades_classic);

process.removeAllListeners('warning'); // As of Node v18.0.0 fetch is included by default but is experimental. This suppresses that warning for now.

// Figure out the platform being used. If true we'll set to Windows, if false we'll just assume Mac/Linux.
let isWin = process.platform === 'win32' ? true : false;

main();

async function main() {
    // Validate our user input to see if the commands being used make sense.
    validation.validateUserInput(commands)

    // Set the output filePath. This will place the output file in the current directory that the user is in.
    const outputFilepath = './spr_scrape_output.txt';

    // Set the default input filePath.
    let paths = [__dirname, '../resources/txt/urls.txt'];
    let inputFilePath = path.join.apply(null, paths);

    // Set the input filePath if it's something other than empty. This is a path RELATIVE to the current directory the user is in.
    if (commands.file != '') {
        inputFilePath = commands.file
    }

    // Create a new file or overwrite an older file.
    fs.writeFile(outputFilepath, 'start of file', function() {
        // Do nothing.
    })

    // If the URL was filled out, begin pulling the data and parsing it out.
    if ( commands.url != undefined ) {

        // Validate the url.
        validation.validateUrl( commands.url );

        // Make the request.
        let response = await getUrl.getUrl(commands.url, commands.userAgent);

        // Check the output. If not in the command, the default for a single URL will be to output
        // to the console. 
        if ( commands.output === 'console' || commands.output === undefined ) {
            consoleOutput(commands.url, response);
        } else if ( commands.output === 'file' ) {
            fs.writeFile(outputFilepath, 'start of file', function() {

                console.log(colors.green('Created file successfully.'));
                fileOutput(commands.url, response, outputFilepath);
                console.log(colors.green('Completed writing to file.'));

            })
        }

    } 
    
    // Sitemap was chosen, begin pulling the data from the sitemap and parsing it out.
    if ( commands.sitemap != undefined ) {
        validation.validateUrl( commands.sitemap );
        console.log(colors.cyan('Gathering posts from sitemap...'));
        const urls = await parser.sitemapParser( commands.sitemap );
        console.log(colors.cyan('Sitemap data pull completed. Total number of URLs: '), colors.yellow(urls.length));
        
        if (commands.output === 'file') {
            var barOne = singlebar.create( urls.length, 1 );
        }

        // Using a traditional FOR loop here as we don't want to spam a site with hundreds of requests
        // to pull posts at once. This method allows us to space things out and request pages one by
        // one. 
        for ( x = 0; x < urls.length; x++ ) {
            let firstPass = false;
            
            if ( x === 0 ) {
                firstPass = true;
            }

            // Make the request.
            let response = await getUrl.getUrl( urls[x], commands.userAgent );
            // Check the output. If not in the command, the default for a single URL will be to output
            // to the console.
            if ( commands.output === 'console' || commands.output === undefined) {
                consoleOutput( urls[x], response );
            } else if ( commands.output === 'file' ) {
                fileOutput( urls[x], response, outputFilepath, firstPass );
                barOne.increment();
            }
        }

        if (commands.output === 'file') {
            barOne.stop();
            console.log(colors.green('\nOutput to file completed!'));
        }

    }
    
    // File was chosen, begin processing the data and parsing that out.
    if (commands.file != undefined) {

        // Read from our list of URLs
        let sites = []

        if (isWin) {
            sites = fs.readFileSync( inputFilePath, 'utf-8' ).split( '\r' ); // Need to split by \r on Windows.
        } else {
            sites = fs.readFileSync( inputFilePath, 'utf-8' ).split( '\n' ); // Need to split by \n on Mac.
        }

        // Remove newline from site in array.
        sites.forEach((site, index) => {
            sites[index] = site.replace('\n', '');
        });

        if (commands.output === 'file') {
            var barOne = singlebar.create( sites.length, 1 );
        }

        // If the output is console, or if there is no output decided upon, default to outputting the data
        // in the console.
        if (commands.output === 'console' || commands.output === undefined) {
            var totalTime = 0;

            for ( x = 0; x < sites.length; x++ ) {
                let response = await getUrl.getUrl(sites[x], commands.userAgent);
                consoleOutput(sites[x], response);
                totalTime += response.time;
                if ( x == sites.length - 1 ) {
                    console.log('Total time for requests to complete:', Math.round(totalTime / 1000), 'seconds.');
                }
            }
        }

        // If the output is file, then output the data to a file.
        if ( commands.output === 'file') {
            for ( x = 0; x < sites.length; x++ ) {
                let firstPass = false;
                if ( x === 0 ) {
                    firstPass = true;
                }
                const response = await getUrl.getUrl(sites[x], commands.userAgent);
                fileOutput(sites[x].toString(), response, outputFilepath, firstPass);
                barOne.increment();
            }

            barOne.stop();
            console.log(colors.green('\nOutput to file completed!'))
        }
    }

    process.exit();
}

/**
 * consoleOutput is a function that takes a single URL and the response for that URL from a fetch so 
 * the data can be parsed and output to the console in a readable format.
 * 
 * @param {*} singleUrl A single URL sent to this function that will be output to the console.
 * @param {*} response The response associated with that URL to output data.
 */
function consoleOutput(singleUrl, response) {
    console.log('i ran');
    console.log(colors.green(`Original URL: ${singleUrl}`));

    // If output is status, go ahead and do that.
    if ( commands.status || commands.search === undefined && response.error === null ) {
        console.log(colors.green(`Final URL: ${response.fullreq.url}`));
        console.log(colors.green(`Final status: ${response.status}`)); 
    } 

    // If output is search, go ahead and do that.
    if ( commands.search && response.error === null ) {
        let searches = {};
        commands.search.forEach((term) => {
            searches[term] = response.body.includes(term);
        });
        console.log(colors.green(`===Search results===`));
        Object.keys(searches).forEach((term) => {
            console.log(term, ':', searches[term])
        });
    } 

    // If the fetch failed (not just 404'd), then go ahead and put that the fetch failed.
    if ( response.error != null ) {
        console.log(colors.red(`Final status: ${response.error}`)); 
    }

    console.log('Request completed in', response.time, 'milliseconds.');
}

/**
 * fileOutput is a function that takes a single URL and the response for that URL from a fetch so
 * that the data can be parsed and output to a file in a CSV format.
 * 
 * @param {*} singleUrl A single URL sent to this function that will be output to the console.
 * @param {*} response The response associated with that URL to output data. 
 * @param {*} filePath The path of the file to save the data.
 * @param {*} firstPass In order to determine if the header row should be placed, the firstPass boolean is sent. Default is false.
 */
async function fileOutput(singleUrl, response, outputFilepath, firstPass = false) {

    // If output is status, go ahead and do that.
    if (commands.status && response.error === null || commands.search === undefined && response.error === null) {
        if (firstPass === true) {
            await fs.promises.appendFile(outputFilepath, '\nOriginal URL, Final URL, Status\n', function() {
                // Do nothing.
            })
        }
        fs.appendFileSync(outputFilepath, singleUrl + ',' + response.fullreq.url + ',' + response.status + '\n',function() {
            console.log('I appended to file')
        })
    }

    // If output is search, go ahead and do that.
    if (commands.search && response.error === null) {
        if ( firstPass === true ) {
            fs.appendFileSync(outputFilepath, '\nOriginal URL,', function() {
                // Do Nothing
            });
            commands.search.forEach(async (term) => {
                await fs.appendFileSync(outputFilepath, term + ',');
            });

        }
        let searches = {};
        fs.appendFileSync(outputFilepath, '\n' + singleUrl + ',', function() {
            // Do nothing.
        });
        commands.search.forEach((term) => {
            searches[term] = response.body.includes(term);
        })
        Object.keys(searches).forEach((term) => {
            fs.appendFileSync(outputFilepath, searches[term] + ',', function() {
                // Do nothing.
            });
        })
    }

    if ( response.error != null ) {
        fs.appendFileSync(outputFilepath, '\n' + singleUrl + ',Fetch failed', function() {
            // Do nothing.
        });
    }

}