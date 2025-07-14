import { startCardBuildingProcess } from './shared/card-workflow.js';
import { validateFrenchWord } from './shared/input-validation.js';

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

        browser.storage.local.set({ audioSrc: details.url });
    },
    { urls: ['https://fr.wiktionary.org/*', 'https://upload.wikimedia.org/*'] },
    ['responseHeaders']
);

// TODO: Update id not to use anki-
browser.contextMenus.create({
    id: 'anki-prepare-card',
    title: 'Anki Card Builder: Prepare Card',
    contexts: ['selection']
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'anki-prepare-card' && info.selectionText) {
        const frenchWord = info.selectionText.trim();
        const validationResult = validateFrenchWord(frenchWord);

        if (!validationResult.valid) {
            browser.runtime.sendMessage({
                type: 'create-notification',
                id: 'french-word-validation-failed',
                options: {
                    type: 'basic',
                    iconUrl: browser.runtime.getURL('icons/icon-48.png'),
                    title: 'Invalid French Word',
                    message: `The selected text is not a valid French word: ${validationResult.reason}`
                }
            });
            return;
        }

        browser.storage.local.set({ frenchWord });
        startCardBuildingProcess(info.selectionText.trim());
    }
});
