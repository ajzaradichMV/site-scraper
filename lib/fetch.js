async function getUrl(url, userAgent) {
    let fetchError = null;

    // If no userAgent flag was set, then default to standard userAgent.
    if (userAgent === undefined) {
        userAgent = 'SupportBot/1.0';
    }

    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': userAgent
        }
    }

    let startTime = performance.now(); // Start a timer.

    const response = await fetch(
        url,
        options
    ).catch((err) => {
        fetchError = err;
    }); 

    let endTime = performance.now(); // Finish a timer.

    const request = {
        body: (fetchError != null) ? null : await response.text(),
        fullreq: response,
        status: (fetchError != null) ? null : response.status,
        time: Math.ceil(endTime - startTime),
        error: (fetchError != null) ? 'Fetch failed' : null 
    }

    return request;
}

module.exports = { getUrl }