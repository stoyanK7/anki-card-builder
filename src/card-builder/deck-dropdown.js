import { invokeAnkiConnect } from '../shared/anki-connect.js';

/**
 * Fetches deck names from AnkiConnect, populates the dropdown,
 * and restores the previous selection from storage (if any).
 */
export function initializeDeckDropdown() {
    invokeAnkiConnect('deckNames')
        .then((result) => {
            if (!Array.isArray(result)) {
                throw new Error(
                    'Expected an array of deck names from AnkiConnect, '
                    + `but got: ${JSON.stringify(result)}`
                );
            }
            return result;
        })
        .then((deckNames) => {
            const deckNameDropdown =
                document.getElementById('deck-name-dropdown');
            populateDeckNameDropdown(deckNames, deckNameDropdown);
            restoreDeckSelectionFromStorage(deckNames, deckNameDropdown);
        })
        .catch((error) => {
            // TODO: Display error.message
        });
}

/**
 * Populate the deck name dropdown with the given deck names.
 *
 * @param {string[]} deckNames - The list of deck names.
 * @param {HTMLSelectElement} deckNameSelect - The select element to populate.
 */
function populateDeckNameDropdown(deckNames, deckNameSelect) {
    /**
     * Remove 'Default' deck if it exists.
     * Nobody uses that deck, so it is better to not show it.
     */
    const defaultIndex = deckNames.indexOf('Default');
    if (defaultIndex !== -1) {
        deckNames.splice(defaultIndex, 1);
    }

    /**
     * Populates the <select> element with deck names, formatting them to
     * reflect a hierarchical parent/child structure based on "::"
     * separators in their names.
     *
     * - Deck names are split on "::" to determine nesting depth.
     * - Each child level is indented using non-breaking spaces.
     * - A "↳" arrow is prepended to child items to visually indicate hierarchy.
     * - The displayed text shows only the last segment of the deck name,
     *   while the <option> value retains the full original deck path.
     *
     * Example:
     *   "🇫🇷 French"                         → "French"
     *   "🇫🇷 French::Lawless French"         → "    ↳ Lawless French"
     *   "🇫🇷 French::Lawless French::Numbers 0-19" → "        ↳ Numbers 0-19"
     */
    deckNames.forEach((deckName) => {
        let option = document.createElement('option');
        option.value = deckName;

        let parts = deckName.split('::');
        let level = parts.length - 1;
        let displayText = parts[parts.length - 1].trim();

        // Return arrow for indented items
        let arrow = level > 0 ? '↳ ' : '';

        let indent = '\u00A0'.repeat(level * 8);

        option.textContent = indent + arrow + displayText;
        deckNameSelect.appendChild(option);
    });

    deckNameSelect.addEventListener('change', (event) => {
        const deckName = event.target.value;
        browser.storage.local.set({ deckName });
    });
}

/**
 * Restore the deck selection from storage. Usually, when the user
 * selects a deck, it is saved in storage. If the user has previously
 * selected a deck, it will be restored here.
 *
 * @param {string[]} deckNames - The list of deck names.
 * @param {HTMLSelectElement} deckNameSelect - The select element to
 *                                             restore the selection in.
 */
function restoreDeckSelectionFromStorage(deckNames, deckNameSelect) {
    browser.storage.local.get('deckName')
        .then((result) => {
            const deckName = result.deckName;
            if (deckName
                && deckNames.includes(deckName)) {
                deckNameSelect.value = deckName;
            } else {
                deckNameSelect.value = '';
            }
        });
}
