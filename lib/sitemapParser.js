/**
 * Filename: sitemapParser.js
 * 
 * Description: To find all the posts in a sitemap. If the URL contains links out to other sitemaps, then it will scrape those sitemaps and add them
 * to the list of posts and returns the array.
 * 
 */
const htmlparser2 = require('htmlparser2');

module.exports = { sitemapParser } 

async function sitemapParser(url, urlStore = []) {
    let gotPostUrl = false;
    let gotSitemapUrl = false;
    let atUrlLoc = false;
    let sitemapStore = [];

    // XML Parser

    const parser = new htmlparser2.Parser(
        {
            onopentag(name, attributes) {
                if (name ==='url') {
                    gotPostUrl = true;
                }
                if (name === 'sitemap') {
                    gotSitemapUrl = true;
                }
                if (name === 'loc') {
                    atUrlLoc = true;
                }
            },
            ontext(text) {
                if (gotPostUrl === true && atUrlLoc === true) {
                    urlStore.push(text);
                }
                if (gotSitemapUrl === true && atUrlLoc === true) {
                    sitemapStore.push(text);
                }
            },
            onclosetag(tagname) { 
                if (tagname === 'url') {
                    gotPostUrl = false;
                }
                if (tagname === 'sitemap') {
                    gotSitemapUrl = false;
                }
                if (tagname === 'loc') {
                    atUrlLoc = false;
                }
            }
        },
        { decodeEntities: true },
        
    );

    // Fetch the URLs for the site.
    return await fetch(url)
    .then(data => data.text())
    .then(async(text) => {
        parser.write(text);
        parser.end();
        if (sitemapStore.length != 0) {
            for (x=0; x < sitemapStore.length; x++) {
                await sitemapParser(sitemapStore[x], urlStore)
            }
        }
        return urlStore
    });

}