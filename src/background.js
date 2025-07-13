browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'create-tab') {
        browser.tabs.create({ url: message.url });
    }

    if (message.type === 'create-notification') {
        browser.notifications.create(message.id, message.options);
        setTimeout(() => {
            browser.notifications.clear(message.id);
        }, 5000);
    }
});

browser.webRequest.onCompleted.addListener(
    async (details) => {
        if (details.type !== 'media' || details.method !== 'GET') {
            return;
        }

        // check response headers
        const contentType = details.responseHeaders.find(
            (header) => header.name.toLowerCase() === 'content-type'
        );
        if (!contentType || !contentType.value.startsWith('audio/')) {
            return;
        }

        await browser.storage.local.set({ audioSrc: details.url });
        await browser.runtime.sendMessage({ type: 'data-updated' });
    },
    { urls: ['https://fr.wiktionary.org/*', 'https://upload.wikimedia.org/*'] },
    ['responseHeaders']
);
