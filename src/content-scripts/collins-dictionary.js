const example = document.getElementsByClassName('dictExas')[0];
const frenchSentence = example
    .getElementsByClassName('example')[0]
    .textContent.trim();

browser.storage.local.set({ frenchSentence }).then(() => {
    browser.runtime.sendMessage({ type: 'data-updated' });
});

browser.runtime.sendMessage({
    type: 'create-tab',
    url: `https://www.deepl.com/en/translator#fr/bg/${encodeURIComponent(
        frenchSentence
    )}`
});
