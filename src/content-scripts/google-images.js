let selectingImage = false;

browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'start-image-selection') {
        enableImageSelection();
    }
});

observeAndAutoSelectFirstImage();

function observeAndAutoSelectFirstImage() {
    const xpath =
        '/html/body/div[3]/div/div[14]/div/div[2]/div[2]/div/div/div/div/div[1]/div/div/div';

    const observer = new MutationObserver(() => {
        const result = document.evaluate(
            xpath,
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

    // Start observing DOM changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function enableImageSelection() {
    if (selectingImage) return;

    selectingImage = true;

    // Change the cursor to a crosshair
    const style = document.createElement('style');
    style.id = 'custom-cursor-style';
    style.textContent = '* { cursor: crosshair !important; }';
    document.head.appendChild(style);

    // Get all images on the page (specifically their wrappers)
    const xpath =
        '/html/body/div[3]/div/div[14]/div/div[2]/div[2]/div/div/div/div/div[1]/div/div/div';
    const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );

    // Add event listeners to each image wrapper
    for (let i = 0; i < result.snapshotLength; i++) {
        const tile = result.snapshotItem(i);
        tile.style.outline = '3px solid transparent';

        tile.addEventListener('mouseenter', highlight);
        tile.addEventListener('mouseleave', removeHighlight);
        tile.addEventListener('click', selectImage);
    }

    function highlight(e) {
        e.target.style.outline = '3px solid red';
    }

    function removeHighlight(e) {
        e.target.style.outline = '3px solid transparent';
    }

    function selectImage(e) {
        e.preventDefault();
        e.stopPropagation();

        // Get the tile that was clicked
        const tile = e.currentTarget;

        // Find the first <img> inside that tile
        const img = tile.querySelector('img');

        if (img && img.src) {
            browser.storage.local.set({ imageSrc: img.src });
            cleanup();
        } else {
            console.warn('No image found in tile:', tile);
        }
    }

    function cleanup() {
        selectingImage = false;
        const style = document.getElementById('custom-cursor-style');
        if (style) style.remove();
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && selectingImage) {
        selectingImage = false;
        const style = document.getElementById('custom-cursor-style');
        if (style) style.remove();
    }
});
