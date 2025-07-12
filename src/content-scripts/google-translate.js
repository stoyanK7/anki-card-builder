const xpathTranslation =
    '/html/body/c-wiz/div/div[2]/c-wiz/div[2]/c-wiz/div[1]/div[2]/div[2]/c-wiz/div/div[6]/div/div[1]/span[1]/span/span';

function getValue(xpath) {
    const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.STRING_TYPE,
        null
    );
    return result.stringValue.trim();
}

function waitForTranslation() {
    const targetNode = document.body;

    const observer = new MutationObserver((mutations, obs) => {
        const bulgarianWord = getValue(xpathTranslation);
        if (bulgarianWord) {
            browser.storage.local.set({ bulgarianWord }).then(() => {
                browser.runtime.sendMessage({ type: 'data-updated' });
            });

            // Stop observing
            obs.disconnect();
        }
    });

    // Start observing for changes to the subtree and child elements
    observer.observe(targetNode, {
        childList: true,
        subtree: true
    });
}

// Run after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForTranslation);
} else {
    waitForTranslation();
}
