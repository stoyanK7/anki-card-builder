const imageTilesXPath =
    '/html/body/div[3]/div/div[14]/div/div[2]'
    + '/div[2]/div/div/div/div/div[1]/div/div/div';
const highQualityImageXPath =
    '/html/body/div[15]/div[2]/div[3]/div/div/c-wiz'
    + '/div/div[2]/div[2]/div/div[2]/c-wiz/div/div[2]/div[1]/a/img[1]';
let firstImgClicked = false;

const observer = new MutationObserver(() => {
    const result = document.evaluate(
        imageTilesXPath,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );

    if (result.snapshotLength > 0) {
        const firstTile = result.snapshotItem(0);
        const firstImg = firstTile.querySelector('img');

        if (!firstImg) {
            return;
        }

        /**
         * We click the image because we want the high quality version
         * of the image.
         * All images in the grid view are low quality.
         * By clicking that image, it will open the high quality version
         * of the image.
         * On the right side of the screen and we can then scrape it.
         */
        firstImg.click();
        firstImgClicked = true;
    }

    if (!firstImgClicked) {
        return;
    }

    const highQualityImageResult = document.evaluate(
        highQualityImageXPath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    );
    const highQualityImage = highQualityImageResult.singleNodeValue;

    if (
        highQualityImage &&
        highQualityImage.src &&
        /**
         * Google places 2 images in a div, one above the other. They have
         * a gstatic.com as a backup image.
         * We want the non-gstatic image which is the high quality one.
         */
        !highQualityImage.src.includes('gstatic.com')
    ) {
        browser.storage.local.set({ imageSrc: highQualityImage.src });
        observer.disconnect();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
