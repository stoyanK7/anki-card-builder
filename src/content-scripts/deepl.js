// XPath for the translation text area containing the Bulgarian sentence.
const translationTextXPath =
    '/html/body/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/main/div[2]/nav/div/div[2]/div/div/div[1]/div/div/div/div/div/div/section/div/div[2]/div[3]/section/div[1]/d-textarea';

function waitForText() {
    const observer = new MutationObserver(async (mutations, obs) => {
        const bulgarianSentence =
            window.getStringFromXPath(translationTextXPath);
        if (bulgarianSentence) {
            await browser.storage.local.set({ bulgarianSentence });
            await browser.runtime.sendMessage({ type: 'data-updated' });

            obs.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

waitForText();
