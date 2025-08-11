import { startCardBuildingProcess } from './card-workflow.js';

export function setupContextMenus() {
    createContextMenus();
    addContextMenuListeners();
}

function createContextMenus() {
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
}

function addContextMenuListeners() {
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
}

function handlePrepareCardContextMenu(info) {
    const frenchWord = info.selectionText.trim();

    // TODO: Add better way to validate that
    if (!frenchWord) {
        console.warn('No selection text found in context menu info:', info);
        browser.runtime.sendMessage({
            type: 'create-notification',
            id: 'french-word-validation-failed',
            options: {
                type: 'basic',
                iconUrl: browser.runtime.getURL('icons/icon-48.png'),
                title: 'Invalid French Word',
                message: 'The selected text is empty.'
            }
        });
        return;
    }

    startCardBuildingProcess(frenchWord);
}

function handleUseImageContextMenu(info) {
    if (info && info.mediaType !== 'image') {
        // TODO: Add better notification for this
        console.warn('Context menu clicked on non-image element:', info);
        return;
    }
    if (!info.srcUrl) {
        console.warn('No image source URL found in context menu info:', info);
        return;
    }
    browser.storage.local.set({ image: info.srcUrl });
}

function handleUseAudioContextMenu(info) {
    if (info && info.mediaType !== 'audio') {
        // TODO: Add better notification for this
        console.warn('Context menu clicked on non-audio element:', info);
        return;
    }
    if (!info.srcUrl) {
        console.warn('No audio source URL found in context menu info:', info);
        return;
    }
    browser.storage.local.set({ frenchWordAudio: info.srcUrl });
}
