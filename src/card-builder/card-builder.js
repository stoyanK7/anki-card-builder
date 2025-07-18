import { invokeAnkiConnect } from '../shared/anki-connect.js';

browser.storage.local.get(['frenchWord', 'deckName']).then((result) => {
    document.getElementById('french-word').textContent = result.frenchWord;
    document.getElementById('deck-name').value = result.deckName;
});

(async () => {
    const deckNames = await fetchDeckNames();
    // Remove 'Default' deck if it exists.
    // Nobody uses that deck, so it is better to not show it.
    const defaultIndex = deckNames.indexOf('Default');
    if (defaultIndex !== -1) {
        deckNames.splice(defaultIndex, 1);
    }

    const deckNameSelect = document.getElementById('deck-name');

    // Populate dropdown with deck names
    deckNames.forEach((deckName) => {
        let option = document.createElement('option');
        option.value = deckName;
        option.textContent = deckName;
        deckNameSelect.appendChild(option);
    });

    deckNameSelect.addEventListener('change', async (event) => {
        const deckName = event.target.value;
        browser.storage.local.set({ deckName });
    });

    // Load previously selected deck name from storage (if any) and select it
    const storageResult = await browser.storage.local.get('deckName');
    if (storageResult.deckName && deckNames.includes(storageResult.deckName)) {
        deckNameSelect.value = storageResult.deckName;
    } else {
        // Else, don't choose anything. Let the user select a deck.
        deckNameSelect.value = '';
    }
})();

async function fetchDeckNames() {
    try {
        const deckNames = await invokeAnkiConnect('deckNames');
        if (!Array.isArray(deckNames)) {
            throw new Error(
                'Invalid response from AnkiConnect: expected an array of deck names.'
            );
        }
        return deckNames;
    } catch (error) {
        document.getElementById('error-message').textContent = error.message;
        document.getElementById('error-message').style.display = 'block';
    }
}

function updateCardEditorFromStorage(data) {
    if ('frenchWord' in data) {
        document.getElementById('french-word').textContent = data.frenchWord;
    }
    if ('audioSrc' in data) {
        document.getElementById('audio-src').value = data.audioSrc;
        document.getElementById('audio-player').src = data.audioSrc;
    }
    if ('frenchPlural' in data) {
        document.getElementById('french-plural').value = data.frenchPlural;
    }
    if ('frenchGender' in data) {
        const frenchGenderRadios = document.querySelectorAll(
            'input[name="french-gender"]'
        );
        frenchGenderRadios.forEach((radio) => {
            if (radio.value === data.frenchGender) {
                radio.checked = true;
            }
        });
    }
    if ('frenchSentence' in data) {
        document.getElementById('french-sentence').value = data.frenchSentence;
    }
    if ('bulgarianWord' in data) {
        document.getElementById('bulgarian-word').value = data.bulgarianWord;
    }
    if ('bulgarianSentence' in data) {
        document.getElementById('bulgarian-sentence').value =
            data.bulgarianSentence;
    }
    if ('imageSrc' in data) {
        document.getElementById('image-src').value = data.imageSrc;
        document.getElementById('image-preview').src = data.imageSrc;
    }
}

browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') {
        return;
    }
    // Build an object with only the changed new values
    const changedData = {};
    for (const key in changes) {
        if (changes[key].newValue !== changes[key].oldValue) {
            changedData[key] = changes[key].newValue;
        }
    }
    updateCardEditorFromStorage(changedData);
});

// Populate the card editor with data from storage when it loads
document.addEventListener('DOMContentLoaded', () => {
    browser.storage.local.get().then(updateCardEditorFromStorage);
});

document.getElementById('audio-src').addEventListener('input', (event) => {
    const audioSrc = event.target.value.trim();
    const audioPlayerElement = document.getElementById('audio-player');
    if (audioSrc) {
        audioPlayerElement.src = audioSrc;
        browser.storage.local.set({ audioSrc });
    } else {
        audioPlayerElement.src = '';
        browser.storage.local.remove('audioSrc');
    }
});

document.getElementById('image-src').addEventListener('input', (event) => {
    const imageSrc = event.target.value.trim();
    const imagePreview = document.getElementById('image-preview');
    if (imageSrc) {
        imagePreview.src = imageSrc;
        browser.storage.local.set({ imageSrc });
    } else {
        imagePreview.src = '';
        browser.storage.local.remove('imageSrc');
    }
});

async function saveCard(event) {
    event.preventDefault();

    // Disable to prevent multiple requests triggering
    const saveButton = document.getElementById('save-card-button');
    saveButton.disabled = true;

    // Clear any previous error message
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';

    // Get the values from the form. It is the source of truth.
    const deckName = document.getElementById('deck-name').value.trim();
    const frenchWord = document
        .getElementById('french-word')
        .textContent.trim();
    const audioSrc = document.getElementById('audio-src').value.trim();
    const frenchPlural = document.getElementById('french-plural').value.trim();
    const frenchGender = document
        .querySelector('input[name="french-gender"]:checked')
        .value.trim();
    const frenchSentence = document
        .getElementById('french-sentence')
        .value.trim();
    const bulgarianWord = document
        .getElementById('bulgarian-word')
        .value.trim();
    const bulgarianSentence = document
        .getElementById('bulgarian-sentence')
        .value.trim();
    const imageSrc = document.getElementById('image-src').value.trim();

    const requestParams = {
        actions: [
            {
                action: 'storeMediaFile',
                params: {
                    filename: frenchWord,
                    url: audioSrc
                }
            },
            {
                action: 'addNote',
                params: {
                    note: {
                        deckName: deckName,
                        modelName: 'Custom Vocabulary',
                        fields: {
                            French: frenchWord,
                            'French Sentence': frenchSentence,
                            Bulgarian: bulgarianWord,
                            'Bulgarian Sentence': bulgarianSentence,
                            Image: `<img src='${imageSrc}' />`,
                            'French Speech': `[sound:${frenchWord}]`,
                            'French Gender': frenchGender,
                            'French Plural': frenchPlural
                        },
                        options: {
                            allowDuplicate: false,
                            duplicateScope: 'deck'
                        },
                        tags: []
                    }
                }
            }
        ]
    };

    try {
        await invokeAnkiConnect('multi', requestParams);
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
        saveButton.disabled = false;
        return;
    }

    // Close the card builder popup.
    browser.windows.getCurrent().then((currentWindow) => {
        browser.windows.remove(currentWindow.id);
    });

    const storageResult = await browser.storage.local.get('resourcesWindowId');
    const resourcesWindowId = storageResult.resourcesWindowId;
    browser.windows
        .remove(resourcesWindowId)
        .then(() => {
            browser.storage.local.remove('resourcesWindowId');
        })
        .catch((error) => {
            console.error('Error closing resources window:', error);
        });

    browser.storage.local.remove([
        'frenchWord',
        'audioSrc',
        'frenchPlural',
        'frenchGender',
        'frenchSentence',
        'bulgarianWord',
        'bulgarianSentence',
        'imageSrc'
    ]);

    // Send a message to the background script to create a notification.
    // Only the background script can create notifications.
    browser.runtime.sendMessage({
        type: 'create-notification',
        id: `card-saved-${message.frenchWord}`,
        options: {
            type: 'basic',
            iconUrl: browser.runtime.getURL('icons/flashcards-64.png'),
            title: 'Card Saved',
            message: `Card "${message.frenchWord}" saved in deck "${message.deckName}".`
        }
    });
}

document.querySelector('form').addEventListener('submit', saveCard);
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'Enter') {
        document.querySelector('form').requestSubmit();
    }
});
