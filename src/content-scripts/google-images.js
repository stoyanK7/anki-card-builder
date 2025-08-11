main();

function main() {
    orchestrateImageScraping();
}

/**
 * Orchestrate scraping the first image from Google Images search results
 * and send progress/results via browser messages.
 */
function orchestrateImageScraping() {
    browser.runtime.sendMessage({
        action: 'scrape-start',
        parameter: 'image'
    })
        .then(() => {
            return scrapeImage();
        })
        .then(image => {
            browser.runtime.sendMessage({
                action: 'scrape-success',
                parameter: 'image',
                value: image
            });
        })
        .catch(error => {
            browser.runtime.sendMessage({
                action: 'scrape-error',
                parameter: 'image',
                error: error
            });
        });
}

/**
 * Scrape the first image from the Google Images search results.
 *
 * @returns {Promise<string>} The URL/base64 of the scraped image.
 * @throws {Error} If the image is not found within 8 seconds.
 */
async function scrapeImage() {
    const firstImageTileXPath =
        '/html/body/div[3]/div/div[13]/div/div[2]'
        + '/div[2]/div/div/div/div/div[1]/div/div/div[1]';
    const highQualityImagesXPath =
        '/html/body/div[15]/div[2]/div[3]/div/div/c-wiz'
        + '/div/div[2]/div[2]/div/div[2]/c-wiz/div/div[2]/div[1]/a/img';
    let firstImgClicked = false;
    let image;

    return new Promise((resolve, reject) => {

        const observer = new MutationObserver(() => {
            let firstTile;
            try {
                firstTile = getElementFromXPath(firstImageTileXPath);
            } catch (error) {
                /**
                 * Do nothing if the first tile is not found. The page is most
                 * likely still loading, and the observer will
                 * be triggered again when the first tile appears.
                 */
            }
            const firstImg = firstTile.querySelector('img');

            if (!firstImg) {
                return;
            }

            /**
             * Click the image to load its high-quality version.
             * Grid images are low quality. Clicking opens a
             * high-quality version on the right, which we can
             * (hopefully) scrape.
             */
            if (!firstImgClicked) {
                firstImg.click();
                firstImgClicked = true;

                /**
                 * Store the initial image src. It's low quality,
                 * but better than nothing if scraping fails.
                 */
                image = firstImg.src;
            }

            const highQualityImages =
                getAllElementsFromXPath(highQualityImagesXPath);
            if (highQualityImages.length === 0) {
                return;
            }

            for (const img of highQualityImages) {
                if (img.src && !img.src.includes('gstatic.com')) {
                    clearTimeout(timeoutId);
                    observer.disconnect();
                    resolve(img.src);
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        const timeoutId = setTimeout(() => {
            observer.disconnect();
            if (image) {
                resolve(image);
            } else {
                reject(new Error('Image not found within 8 seconds.'));
            }
        }, 8000);
    });
}
