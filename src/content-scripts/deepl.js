alert('ding');
console.log('deepl content script loaded');
const xpathTarget =
    '/html/body/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/main/div[2]/nav/div/div[2]/div/div/div[1]/div/div/div/div/div/div/section/div/div[2]/div[3]/section/div[1]/d-textarea';

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

function waitForText() {
    const observer = new MutationObserver((mutations, obs) => {
        const text = getValue(xpathTarget);
        if (text) {
            browser.storage.local.set({ bulgarianSentence: text }).then(() => {
                browser.runtime.sendMessage({ type: 'data-updated' });
            });

            obs.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForText);
} else {
    waitForText();
}
