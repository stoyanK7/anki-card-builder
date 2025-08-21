import { initializeDeckDropdown } from './deck-dropdown.js';
import { initializeKeybinds } from './keybinds.js';
import { listenForSaveCard } from './save-card.js';
import { initializeUiUpdateListeners,
    updateFrenchWord } from './ui-updater.js';

const frenchWord = getFrenchWordFromUrl();
updateFrenchWord(frenchWord);
initializeDeckDropdown();
initializeUiUpdateListeners();
initializeKeybinds();
listenForSaveCard();
browser.runtime.sendMessage({
    action: 'card-builder-ready',
    frenchWord
});

function getFrenchWordFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const frenchWord = params.get('frenchWord');
    // TODO: Add some error handling
    return frenchWord;
}

