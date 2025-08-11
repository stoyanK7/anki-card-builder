main();

function main() {
    orchestrateBulgarianSentenceScraping();
}

/**
 * Orchestrate scraping the Bulgarian sentence from DeepL
 * and send progress/results via browser messages.
 */
function orchestrateBulgarianSentenceScraping() {
    browser.runtime.sendMessage({
        action: 'scrape-start',
        parameter: 'bulgarianSentence'
    })
        .then(() => {
            return scrapeBulgarianSentence();
        })
        .then(bulgarianSentence => {
            browser.runtime.sendMessage({
                action: 'scrape-success',
                parameter: 'bulgarianSentence',
                value: bulgarianSentence
            });
        })
        .catch(error => {
            browser.runtime.sendMessage({
                action: 'scrape-error',
                parameter: 'bulgarianSentence',
                error: error
            });
        });
}

/**
 * Scrape the Bulgarian sentence (translation) from the DeepL page.
 *
 * @returns {Promise<string>} The Bulgarian sentence from DeepL.
 * @throws {Error} If the sentence is not found within 8 seconds.
 */
async function scrapeBulgarianSentence() {
    const bulgarianSentenceXPath =
        '/html/body/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]'
        + '/main/div[2]/nav/div/div[2]/div/div/div[1]/div/div/div/'
        + 'div/div/div/section/div/div[2]/div[3]/section/div[1]/d-textarea';

    return new Promise((resolve, reject) => {
        const observer = new MutationObserver((mutations, obs) => {
            try {
                const bulgarianSentence =
                    getStringFromXPath(bulgarianSentenceXPath);

                clearTimeout(timeoutId);
                observer.disconnect();
                resolve(bulgarianSentence);
            } catch (error) {
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
            reject(new Error('Timeout while waiting for Bulgarian sentence.'));
        }, 8000);
    });
}
