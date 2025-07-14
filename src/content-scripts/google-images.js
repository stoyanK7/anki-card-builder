const imageTilesXPath =
    '/html/body/div[3]/div/div[14]/div/div[2]/div[2]/div/div/div/div/div[1]/div/div/div';

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

        if (firstImg && firstImg.src) {
            browser.storage.local.set({ imageSrc: firstImg.src });
            observer.disconnect();
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
