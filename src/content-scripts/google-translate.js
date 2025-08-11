main();

function main() {
    orchestrateBulgarianWordScraping();
}

/**
 * Orchestrate scraping the Bulgarian word
 * and send progress/results via browser messages.
 */
function orchestrateBulgarianWordScraping() {
    browser.runtime.sendMessage({
        action: 'scrape-start',
        parameter: 'bulgarianWord'
    })
        .then(() => {
            return scrapeBulgarianWord();
        })
        .then(bulgarianWord => {
            browser.runtime.sendMessage({
                action: 'scrape-success',
                parameter: 'bulgarianWord',
                value: bulgarianWord
            });
        })
        .catch(error => {
            browser.runtime.sendMessage({
                action: 'scrape-error',
                parameter: 'bulgarianWord',
                error: error
            });
        });
}

/**
 * Scrape the Bulgarian (translation) word from the Google Translate page.
 *
 * @returns {Promise<string>} The Bulgarian word extracted from the page.
 * @throws {Error} If the Bulgarian word is not found within 8 seconds.
 */
async function scrapeBulgarianWord() {
    const bulgarianWordXPath =
        '/html/body/c-wiz/div/div[2]/c-wiz/div[2]/c-wiz/div[1]'
        + '/div[2]/div[2]/c-wiz/div/div[6]/div/div[1]/span[1]/span/span';

    return new Promise((resolve, reject) => {
        const observer = new MutationObserver(async (mutations, obs) => {
            try {
                const bulgarianWord = getStringFromXPath(bulgarianWordXPath);

                clearTimeout(timeoutId);
                observer.disconnect();
                resolve(bulgarianWord);
            } catch(error) {
                /**
                 * Do nothing, continue observing.
                 * getStringFromXPath() will throw an error if the element
                 * is not found but that is expected until the page loads.
                 */
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        const timeoutId = setTimeout(() => {
            observer.disconnect();
            reject(new Error('Bulgarian word not found within 8 seconds.'));
        }, 8000);
    });
}
