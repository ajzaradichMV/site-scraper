### Description

A simple site scraping CLI application that allows you to scrape a a single site, a set of sites, or (if available) search all posts/pages contained in a sitemap.xml URL. Results returned can be as simple as the status of the page(s) or you can search the returned responses for any possible strings. Output can be returned in the console or written directly to a file in a CSV format for easy parsing.

Built using Node.js.

### Installation

1. This scraper requires NodeJS version 18.0.0 or later. You can download a copy of NodeJS [here](https://nodejs.org/en/).
2. Download the latest version of the scraper [here](https://github.com/ajzaradichMV/site-scraper/archive/refs/heads/main.zip).
3. Unzip the file into your desired directory and open your favorite Command Line tool.
4. Navigate to the directory where you unzipped the scraper and type the following into your console: `npm -g install` (Mac/Linux user may need to do a `sudo npm -g install`).
5. That's it! You now have the scraper installed globally so you should be able to run any of the commands from anywhere. :)

### Usage

spr scrape <_url_|_file_|_sitemap_> _options_

### Commands

| Options | Description | Type |
|---------|-------------|------|
| --help | Shows help | [boolean] |
| --version | Show version number. | [boolean] |
| -u, --url | A single URL to pull all pages from. | [string] |
| -m, --sitemap | The sitemap URL to pull all pages from. | [string] |
| -f, --file | The location of the file to pull URLs from. If empty, uses /site-scraper/resources/txt/urls.txt. | [string] |
| -o, --output | Preferred output of the data. Can either be 'console' or 'file', | [string] |
| -a, --userAgent | The userAgent to use when fetching the site data. | [string] |
| -s, --search | The search parameters to find in the site data. | [array] |
| -r, status | If status flag is present, the output will be the final status of the request. | [boolean] |
|---------|-------------|------|

### Examples

##### Command
`spr scrape --url https://example.com --search "foo" bar" --output=console`

##### Output
Original URL: https://example.com
===Search results===
foo : false
bar : false

Assuming the site above was a reachable URL, this command is telling the tool to scrape a specific URL and search for the terms "foo" and "bar". Once done, return the data to the console. 

### Notes

- An option of URL, Sitemap, or File is required to be used for the input. 
- For sitemaps, it's best to use the sitemap.xml file uploaded to a site's server. Not all sites may have a sitemap.
- When using the `--file` flag, the default file to use is the urls.txt file located in `/site-scraper/resources/txt/`. You do have the option of including a filepath with the option. The path would be the relative path to that file from where you're at in the Terminal. 
  - For example, if you're running the commands from `/Users/ajzar/site-scraper` and want to use a file named `another-urls-file.txt` in the same folder then you could do `spr scrape --file ./another-set-of-urls.txt --output=file`. 
- If no output is selected, defaults straight to console for URL selection. When sitemap or a file is used then the defaul output is to a file.
- The output file will be created and placed inside the same folder you're running the command from.

