let frenchWord = '';
let deckName = '';
let frenchWordSpan = document.getElementById('french-word');
let deckNameInput = document.getElementById('deck-name');

browser.storage.local.get(['frenchWord', 'deckName']).then((result) => {
    frenchWord = result.frenchWord;
    deckName = result.deckName;
    frenchWordSpan.textContent = frenchWord;
    deckNameInput.value = deckName;
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

function updateCardEditor() {
    browser.storage.local.get().then((data) => {
        if (data.frenchPlural) {
            const frenchPluralInput = document.getElementById('french-plural');
            frenchPluralInput.value = data.frenchPlural;
        }

        if (data.frenchGender) {
            const frenchGenderRadios = document.querySelectorAll(
                'input[name="french-gender"]'
            );
            frenchGenderRadios.forEach((radio) => {
                if (radio.value === data.frenchGender) {
                    radio.checked = true;
                }
            });
        }

        if (data.frenchSentence) {
            const frenchSentenceTextarea =
                document.getElementById('french-sentence');
            frenchSentenceTextarea.value = data.frenchSentence;
        }

        if (data.bulgarianWord) {
            const bulgarianWordInput =
                document.getElementById('bulgarian-word');
            bulgarianWordInput.value = data.bulgarianWord;
        }

        if (data.bulgarianSentence) {
            const bulgarianSentenceTextarea =
                document.getElementById('bulgarian-sentence');
            bulgarianSentenceTextarea.value = data.bulgarianSentence;
        }

        if (data.imageSrc) {
            document.getElementById('image-preview').src = data.imageSrc;

            const imageSrcTextarea = document.getElementById('image-src');
            imageSrcTextarea.value = data.imageSrc;
        }
    });
}

// Populate the card editor with data from storage when it loads
document.addEventListener('DOMContentLoaded', updateCardEditor);

// Listen for updates from content scripts
// The content scripts will scrape the page, update the local storage,
// and then send a message to the card editor to update its UI.
browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'data-updated') {
        updateCardEditor();
    }
});

// Extensions cannot send messages to content scripts using browser.runtime.sendMessage.
// To send messages to content scripts, tabs.sendMessage is used.
document.getElementById('select-image').addEventListener('click', () => {
    browser.tabs.query({}, (tabs) => {
        // Find the tab that is currently displaying Google Images search results
        const imageTab = tabs.find(
            (tab) =>
                tab.url.includes('https://www.google.com/search') &&
                tab.url.includes(`q=${frenchWord}`)
        );

        if (imageTab) {
            console.log(
                'Sending message to Google Images tab to start image selection'
            );
            browser.tabs.sendMessage(imageTab.id, {
                type: 'start-image-selection'
            });
        } else {
            console.error('No Google Images tab found');
        }
    });
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

async function saveCard() {
    // Disable to prevent multiple requests triggering
    const saveButton = document.getElementById('save-card-button');
    saveButton.disabled = true;

    // Clear any previous error message
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';

    // Get the values from the form. It is the source of truth.
    const frenchWord = document
        .getElementById('french-word')
        .textContent.trim();
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

    // Validate the inputs
    if (!frenchPlural) {
        errorDiv.textContent = 'French plural is required.';
        errorDiv.style.display = 'block';
        saveButton.disabled = false;
        return;
    } else if (!frenchGender) {
        errorDiv.textContent = 'French gender is required.';
        errorDiv.style.display = 'block';
        saveButton.disabled = false;
        return;
    } else if (!frenchSentence) {
        errorDiv.textContent = 'French sentence is required.';
        errorDiv.style.display = 'block';
        saveButton.disabled = false;
        return;
    } else if (!bulgarianWord) {
        errorDiv.textContent = 'Bulgarian word is required.';
        errorDiv.style.display = 'block';
        saveButton.disabled = false;
        return;
    } else if (!bulgarianSentence) {
        errorDiv.textContent = 'Bulgarian sentence is required.';
        errorDiv.style.display = 'block';
        saveButton.disabled = false;
        return;
    } else if (!imageSrc) {
        errorDiv.textContent = 'Image source is required.';
        errorDiv.style.display = 'block';
        saveButton.disabled = false;
        return;
    }

    // Default to just the word because we don't have only nouns.
    let frenchWordWithDefiniteArticle = frenchWord;
    if (frenchGender === 'féminin') {
        frenchWordWithDefiniteArticle = `la ${frenchWord}`;
    } else if (frenchGender === 'masculin') {
        frenchWordWithDefiniteArticle = `le ${frenchWord}`;
    }

    const requestParams = {
        actions: [
            {
                action: 'storeMediaFile',
                params: {
                    filename: `${frenchWordWithDefiniteArticle}.wav`,
                    url: `http://localhost:5002/api/tts?text=${encodeURIComponent(
                        frenchWordWithDefiniteArticle
                    )}`
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
                            'French Speech': `[sound:${frenchWordWithDefiniteArticle}.wav]`,
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

    browser.tabs
        .query({
            url: [
                'https://fr.wiktionary.org/*',
                'https://translate.google.com/*',
                'https://www.google.com/search*',
                'https://www.collinsdictionary.com/*',
                'https://www.deepl.com/*'
            ]
        })
        .then((tabs) => {
            tabs.forEach((tab) => {
                browser.tabs.remove(tab.id);
            });
        });

    // Clear local storage except for the deck name.
    await browser.storage.local.clear();
    await browser.storage.local.set({ deckName });

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

document.getElementById('save-card-button').addEventListener('click', saveCard);
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key == 'Enter') {
        saveCard();
    }
});
