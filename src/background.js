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

browser.contextMenus.create({
    id: 'prepare-card',
    title: '🛠️ Prepare Card',
    contexts: ['selection']
});

browser.contextMenus.create({
    id: 'use-image',
    title: '👆 Use Image',
    contexts: ['image']
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'prepare-card') {
        handlePrepareCardContextMenu(info);
    }
    if (info.menuItemId === 'use-image') {
        handleUseImageContextMenu(info);
    }
});

function handlePrepareCardContextMenu(info) {
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

function handleUseImageContextMenu(info) {
    if (info && info.mediaType !== 'image') {
        console.warn('Context menu clicked on non-image element:', info);
        return;
    }
    if (!info.srcUrl) {
        console.warn('No image source URL found in context menu info:', info);
        return;
    }
    browser.storage.local.set({ imageSrc: info.srcUrl });
}
