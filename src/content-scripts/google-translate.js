const wordTranslationXPath =
    '/html/body/c-wiz/div/div[2]/c-wiz/div[2]/c-wiz/div[1]'
    + '/div[2]/div[2]/c-wiz/div/div[6]/div/div[1]/span[1]/span/span';

const observer = new MutationObserver(async (mutations, obs) => {
    const bulgarianWord = getStringFromXPath(wordTranslationXPath);
    if (bulgarianWord) {
        browser.storage.local.set({ bulgarianWord });
        obs.disconnect();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
