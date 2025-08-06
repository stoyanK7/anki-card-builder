import { startCardBuildingProcess } from './shared/card-workflow.js';
import { validateFrenchWord } from './shared/input-validation.js';

browser.runtime.onMessage.addListener((message) => {
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

browser.contextMenus.create({
    id: 'prepare-card',
    title: '🛠️ Prepare Card',
    contexts: ['selection']
});

browser.contextMenus.create({
    id: 'use-image',
    title: '🖼️ Use Image',
    contexts: ['image']
});

browser.contextMenus.create({
    id: 'use-audio',
    title: '🔊 Use Audio',
    contexts: ['audio']
});

browser.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === 'prepare-card') {
        handlePrepareCardContextMenu(info);
    }
    if (info.menuItemId === 'use-image') {
        handleUseImageContextMenu(info);
    }
    if (info.menuItemId === 'use-audio') {
        handleUseAudioContextMenu(info);
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
                message: 'The selected text is not a valid French word: '
                            +  `${validationResult.reason}`
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

function handleUseAudioContextMenu(info) {
    if (info && info.mediaType !== 'audio') {
        console.warn('Context menu clicked on non-audio element:', info);
        return;
    }
    if (!info.srcUrl) {
        console.warn('No audio source URL found in context menu info:', info);
        return;
    }
    browser.storage.local.set({ frenchWordAudio: info.srcUrl });
}
