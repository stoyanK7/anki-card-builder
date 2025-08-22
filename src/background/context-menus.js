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

    // TODO: Add validation

    startCardBuildingWorkflow(frenchWord);
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
    if (info && info.mediaType !== 'audio') {
        // TODO: Add better notification for this
        console.warn('Context menu clicked on non-audio element:', info);
        return;
    }
    if (!info.srcUrl) {
        console.warn('No audio source URL found in context menu info:', info);
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
