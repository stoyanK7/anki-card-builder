const wordTranslationXPath =
    '/html/body/c-wiz/div/div[2]/c-wiz/div[2]/c-wiz/div[1]/div[2]/div[2]/c-wiz/div/div[6]/div/div[1]/span[1]/span/span';

function main() {
    const observer = new MutationObserver(async (mutations, obs) => {
        const bulgarianWord = window.getStringFromXPath(wordTranslationXPath);
        if (bulgarianWord) {
            await browser.storage.local.set({ bulgarianWord });
            await browser.runtime.sendMessage({ type: 'data-updated' });

            obs.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

main();
