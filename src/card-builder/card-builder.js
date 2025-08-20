import { initializeDeckDropdown } from './deck-dropdown.js';
import { initKeybinds } from './keybinds.js';
import { listenForSaveCard } from './save-card.js';
import { initUiUpdateListeners,
    updateFrenchWord } from './ui-updater.js';

const frenchWord = getFrenchWordFromUrl();
updateFrenchWord(frenchWord);
initializeDeckDropdown();
initUiUpdateListeners();
initKeybinds();
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

