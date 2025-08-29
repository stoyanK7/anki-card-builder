import { startCardBuildingWorkflow } from './start-workflow.js';

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
        id: 'clear-image',
        title: '❌🖼️ Clear Image',
        contexts: ['image']
    });
    browser.contextMenus.create({
        id: 'use-audio',
        title: '🔊 Use Audio',
        contexts: ['audio']
    });
    browser.contextMenus.create({
        id: 'clear-audio',
        title: '❌🔊 Clear Audio',
        contexts: ['audio']
    });
}

function addContextMenuListeners() {
    browser.contextMenus.onClicked.addListener(info => {
        if (info.menuItemId === 'prepare-card') {
            handlePrepareCardContextMenu(info);
        }
        if (info.menuItemId === 'use-image') {
            handleUseImageContextMenu(info);
        }
        if (info.menuItemId === 'clear-image') {
            handleClearImageContextMenu();
        }
        if (info.menuItemId === 'use-audio') {
            handleUseAudioContextMenu(info);
        }
        if (info.menuItemId === 'clear-audio') {
            handleClearAudioContextMenu();
        }
    });
}

function handlePrepareCardContextMenu(info) {
    const frenchWord = info.selectionText.trim();
    if (!frenchWord) {
        browser.notifications.create('french-word-is-empty', {
            type: 'basic',
            iconUrl: browser.runtime.getURL('icons/flashcards-64.png'),
            title: 'Empty French Word',
            message: 'Please select a valid French word.'
        });
        return;
    }

    startCardBuildingWorkflow(frenchWord);
}

function handleUseImageContextMenu(info) {
    if (!info.srcUrl) {
        browser.notifications.create('no-image-src-url', {
            type: 'basic',
            iconUrl: browser.runtime.getURL('icons/flashcards-64.png'),
            title: 'No Image Source URL',
            message: 'Please select a valid image.'
        });
        return;
    }

    browser.runtime.sendMessage({
        action: 'scrape-success',
        parameter: 'image',
        value: info.srcUrl
    });
}

function handleClearImageContextMenu() {
    browser.runtime.sendMessage({
        action: 'scrape-success',
        parameter: 'image',
        value: null
    });
}

function handleUseAudioContextMenu(info) {
    if (!info.srcUrl) {
        browser.notifications.create('no-audio-src-url', {
            type: 'basic',
            iconUrl: browser.runtime.getURL('icons/flashcards-64.png'),
            title: 'No Audio Source URL',
            message: 'Please select a valid audio.'
        });
        return;
    }
    browser.runtime.sendMessage({
        action: 'scrape-success',
        parameter: 'frenchWordAudio',
        value: info.srcUrl
    });
}

function handleClearAudioContextMenu() {
    browser.runtime.sendMessage({
        action: 'scrape-success',
        parameter: 'frenchWordAudio',
        value: null
    });
}
