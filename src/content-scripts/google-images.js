const firstImageTileXPath =
    '/html/body/div[3]/div/div[13]/div/div[2]'
    + '/div[2]/div/div/div/div/div[1]/div/div/div[1]';
const highQualityImagesXPath =
    '/html/body/div[15]/div[2]/div[3]/div/div/c-wiz'
    + '/div/div[2]/div[2]/div/div[2]/c-wiz/div/div[2]/div[1]/a/img';
let firstImgClicked = false;

const observer = new MutationObserver(() => {
    const firstTile = getElementFromXPath(firstImageTileXPath);

    if (!firstTile) {
        return;
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
        browser.storage.local.set({ imageSrc: firstImg.src });
    }

    const highQualityImage = getElementFromXPath(highQualityImagesXPath);

    if (!highQualityImage || !highQualityImage.src) {
        return;
    }

    const highQualityImages = getAllElementsFromXPath(highQualityImagesXPath);

    for (const img of highQualityImages) {
        if (img.src && !img.src.includes('gstatic.com')) {
            browser.storage.local.set({ imageSrc: img.src });
            observer.disconnect();
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
