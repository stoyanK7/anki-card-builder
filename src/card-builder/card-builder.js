import { invokeAnkiConnect } from '../shared/anki-connect.js';
import { fetchFrenchAudio } from '../shared/piper.js';

browser.storage.local.get('frenchWord')
    .then((result) => {
        const frenchWord = result.frenchWord;
        document
            .getElementById('french-word')
            .textContent = frenchWord;

        fetchFrenchAudio(frenchWord)
            .then((audioAsBase64) => {
                document
                    .getElementById('french-word-audio-player')
                    .src = audioAsBase64;
                browser.storage.local.set({ 
                    frenchWordAudioSrc: audioAsBase64 
                });
            })
            .catch((error) => {
                console.error('Error fetching audio:', error);
            });            
    });

invokeAnkiConnect('deckNames')
    .then((result) => {
        if (!Array.isArray(result)) {
            throw new Error(
                'Expected an array of deck names from AnkiConnect, but got: '
                + JSON.stringify(result)
            );
        }
        return result;
    })
    .then((deckNames) => {
        const deckNameDropdown = document.getElementById('deck-name-dropdown');
        populateDeckNameDropdown(deckNames, deckNameDropdown);
        restoreDeckSelectionFromStorage(deckNames, deckNameDropdown);
    })
    .catch((error) => {
        document.getElementById('error-message').textContent = error.message;
        document.getElementById('error-message').style.display = 'block';
    });

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

    // Populate dropdown with deck names
    deckNames.forEach((deckName) => {
        let option = document.createElement('option');
        option.value = deckName;
        option.textContent = deckName;
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

generateFrenchSentence();

function updateCardEditorFromStorage(data) {
    if ('frenchWord' in data) {
        document
            .getElementById('french-word')
            .textContent = data.frenchWord;
    }
    if ('frenchWordAudioSrc' in data) {
        document
            .getElementById('french-word-audio-player')
            .src = data.frenchWordAudioSrc;
    }
    if ('frenchPlural' in data) {
        document
            .getElementById('french-plural')
            .value = data.frenchPlural;
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
        document
            .getElementById('french-sentence')
            .value = data.frenchSentence;
    }
    if ('bulgarianWord' in data) {
        document
            .getElementById('bulgarian-word')
            .value = data.bulgarianWord;
    }
    if ('bulgarianSentence' in data) {
        document
            .getElementById('bulgarian-sentence')
            .value = data.bulgarianSentence;
    }
    if ('imageSrc' in data) {
        document
            .getElementById('image-src')
            .value = data.imageSrc;
        document
            .getElementById('image-preview')
            .src = data.imageSrc;
    }
}

browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;

    // Build an object with only the changed new values
    const changedData = {};
    for (const key in changes) {
        if (changes[key].newValue !== changes[key].oldValue) {
            changedData[key] = changes[key].newValue;
        }
    }

    updateCardEditorFromStorage(changedData);

    if ('frenchSentence' in changedData) {
        const frenchSentence = changedData.frenchSentence.trim();
        browser.storage.local.get('resourcesWindowId')
            .then((storageResult) => storageResult.resourcesWindowId)
            .then((resourcesWindowId) => {
                if (!resourcesWindowId) return;

                /**
                 * Update DeepL tab with new sentence if open;
                 * otherwise, create a new tab with it.
                 */
                browser.tabs.query({
                    windowId: resourcesWindowId,
                    url: 'https://www.deepl.com/*'
                })
                    .then((tabs) => {
                        if (tabs.length > 0) {
                            // If it is open, just update the tab.
                            browser.tabs.update(tabs[0].id, {
                                url: 'https://www.deepl.com/translator#fr/bg/'
                                    + encodeURIComponent(frenchSentence)
                            });
                        } else {
                            // If it is not open, create a new tab.
                            browser.tabs.create({
                                url: 'https://www.deepl.com/translator#fr/bg/'
                                    + encodeURIComponent(frenchSentence),
                                windowId: resourcesWindowId
                            });
                        }
                    });
            });
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
    const deckName = document
        .getElementById('deck-name-dropdown')
        .value.trim();
    const frenchWord = document
        .getElementById('french-word')
        .textContent.trim();
    const frenchWordAudioSrc = document
        .getElementById('french-word-audio-player')
        .src.trim();
    const frenchPlural = document
        .getElementById('french-plural')
        .value.trim();
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
    const imageSrc = document
        .getElementById('image-src')
        .value.trim();

    const requestParams = {
        actions: [
            {
                action: 'storeMediaFile',
                params: {
                    filename: `${frenchWord}.wav`,
                    // Anki Connect expects the base64 data without the prefix
                    data: frenchWordAudioSrc.split(',')[1]
                }
            },
            {
                action: 'addNote',
                params: {
                    note: {
                        deckName: deckName,
                        modelName: 'Custom Vocabulary',
                        fields: {
                            'French': frenchWord,
                            'French Sentence': frenchSentence,
                            'Bulgarian': bulgarianWord,
                            'Bulgarian Sentence': bulgarianSentence,
                            'Image': `<img src='${imageSrc}' />`,
                            'French Speech': `[sound:${frenchWord}.wav]`,
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
        'frenchWordAudioSrc',
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
        id: `card-saved-${frenchWord}`,
        options: {
            type: 'basic',
            iconUrl: browser.runtime.getURL('icons/flashcards-64.png'),
            title: 'Card Saved',
            message: `Card "${frenchWord}" saved in deck "${deckName}".`
        }
    });
}

document.querySelector('form').addEventListener('submit', saveCard);
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'Enter') {
        document.querySelector('form').requestSubmit();
    }
});

/**
 * Checks whether a gender (M/F) is selected.
 * @returns {boolean} true if a gender is selected, false otherwise.
 */
function isGenderSelected() {
    const checked = document.querySelector(
        'input[name="french-gender"]:checked'
    );
    return (
        checked && (checked.value === 'masculin' || checked.value === 'féminin')
    );
}

/**
 * Updates the 'required' attribute of the french plural input field
 * based on whether a gender (M/F) is selected.
 */
function updatePluralRequiredProperty() {
    const pluralInput = document.getElementById('french-plural');
    if (isGenderSelected()) {
        pluralInput.required = true;
    } else {
        pluralInput.removeAttribute('required');
    }
}

document.querySelectorAll('input[name="french-gender"]').forEach((radio) => {
    radio.addEventListener('change', updatePluralRequiredProperty);
});

document.addEventListener('DOMContentLoaded', updatePluralRequiredProperty);

document
    .getElementById('generate-french-sentence')
    .addEventListener('click', generateFrenchSentence);

function generateFrenchSentence() {
    const frenchWord = document
        .getElementById('french-word')
        .textContent.trim();
    if (!frenchWord) return;

    const generateButton = document.getElementById('generate-french-sentence');
    generateButton.disabled = true;
    generateButton.textContent = 'Loading...';

    fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'jobautomation/OpenEuroLLM-French',
            prompt: 'Donne uniquement une phrase en français, niveau A1-A2, '
            + `avec le mot suivant : ${frenchWord}. La phrase doit avoir 10 `
            + 'mots ou moins. Ne réponds qu\'avec la phrase, sans explication '
            + 'ni introduction. Exemple : Si le mot est "chat", réponds : "Le '
            + ' chat dort sur le canapé."',
            stream: false,
            options: {
                temperature: 0.5,
                top_k: 30, // eslint-disable-line camelcase
                top_p: 0.5 // eslint-disable-line camelcase
            }
        })
    })
        .then((response) => response.json())
        .then((data) => {
            const frenchSentence = data.response.trim();
            browser.storage.local.set({ frenchSentence });
        })
        .catch((error) => {
            // TODO: Display an error message to the user.
            console.error('Error fetching French sentence:', error);
        })
        .finally(() => {
            generateButton.disabled = false;
            generateButton.textContent = 'Generate';
        });
}
