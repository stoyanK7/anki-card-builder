import { invokeAnkiConnect } from '../shared/anki-connect.js';
import { fetchFrenchAudio } from '../shared/piper.js';

browser.storage.local.get('frenchWord')
    .then((result) => {
        const frenchWord = result.frenchWord;
        document
            .getElementById('french-word')
            .textContent = frenchWord;

        generateFrenchSentenceWithWord(frenchWord);

        fetchFrenchAudio(frenchWord)
            .then((audioAsBase64) => {
                document
                    .getElementById('french-word-audio-player')
                    .src = audioAsBase64;
                browser.storage.local.set({
                    frenchWordAudio: audioAsBase64
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

function updateCardEditorFromStorage(data) {
    if ('frenchWord' in data) {
        document
            .getElementById('french-word')
            .textContent = data.frenchWord;
    }
    if ('frenchWordAudio' in data) {
        document
            .getElementById('french-word-audio-player')
            .src = data.frenchWordAudio;
    }
    if ('frenchWordGender' in data) {
        const frenchWordGenderRadioButtons = document.querySelectorAll(
            'input[name="french-word-gender"]'
        );
        frenchWordGenderRadioButtons.forEach((radio) => {
            if (radio.value === data.frenchWordGender) {
                radio.checked = true;
            }
        });
    }
    if ('frenchWordPlural' in data) {
        document
            .getElementById('french-word-plural')
            .value = data.frenchWordPlural;
    }
    if ('frenchSentence' in data) {
        document
            .getElementById('french-sentence')
            .value = data.frenchSentence;
    }
    if ('frenchSentenceAudio' in data) {
        document
            .getElementById('french-sentence-audio-player')
            .src = data.frenchSentenceAudio;
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
    if ('image' in data) {
        document
            .getElementById('image-preview')
            .src = data.image;
    }
}

document
    .getElementById('french-sentence')
    .addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            browser.storage.local.set({
                frenchSentence: event.target.value.trim()
            });
        }
    });

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

        fetchFrenchAudio(frenchSentence)
            .then((frenchSentenceBase64Audio) => {
                browser.storage.local.set({
                    frenchSentenceAudio: frenchSentenceBase64Audio
                });
            });


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
    const frenchWordAudio = document
        .getElementById('french-word-audio-player')
        .src.trim();
    const frenchWordPlural = document
        .getElementById('french-word-plural')
        .value.trim();
    const frenchWordGender = document
        .querySelector('input[name="french-word-gender"]:checked')
        .value.trim();
    const frenchSentence = document
        .getElementById('french-sentence')
        .value.trim();
    const frenchSentenceAudio = document
        .getElementById('french-sentence-audio-player')
        .src.trim();
    const bulgarianWord = document
        .getElementById('bulgarian-word')
        .value.trim();
    const bulgarianSentence = document
        .getElementById('bulgarian-sentence')
        .value.trim();
    const image = document
        .getElementById('image-preview')
        .src.trim();

    const requestParams = {
        actions: [
            {
                action: 'storeMediaFile',
                params: {
                    filename: `${frenchWord}.wav`,
                    // Anki Connect expects the base64 data without the prefix
                    data: frenchWordAudio.split(',')[1]
                }
            },
            {
                action: 'storeMediaFile',
                params: {
                    filename: `${frenchSentence}.wav`,
                    // Anki Connect expects the base64 data without the prefix
                    data: frenchSentenceAudio.split(',')[1]
                }
            },
            {
                action: 'addNote',
                params: {
                    note: {
                        deckName: deckName,
                        modelName: 'Custom Vocabulary',
                        fields: {
                            'French Word': frenchWord,
                            'French Word Audio': `[sound:${frenchWord}.wav]`,
                            'French Sentence': frenchSentence,
                            'French Sentence Audio':
                                    `[sound:${frenchSentence}.wav]`,
                            'French Word Gender': frenchWordGender,
                            'French Word Plural': frenchWordPlural,
                            'Bulgarian Word': bulgarianWord,
                            'Bulgarian Sentence': bulgarianSentence,
                            'Image': `<img src='${image}' />`
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
    browser.storage.local.get('cardBuilderWindowId')
        .then((storageResult) => storageResult.cardBuilderWindowId)
        .then((cardBuilderWindowId) => {
            browser.windows.remove(cardBuilderWindowId);
        })
        .catch((error) => {
            console.error('Error closing card builder window:', error);
        })
        .finally(() => {
            browser.storage.local.remove('cardBuilderWindowId');
        });

    // Close the window with resources (Google Images, DeepL, etc.)
    browser.storage.local.get('resourcesWindowId')
        .then((storageResult) => storageResult.resourcesWindowId)
        .then((resourcesWindowId) => browser.windows.remove(resourcesWindowId))
        .catch((error) => {
            console.error('Error closing resources window:', error);
        })
        .finally(() => {
            browser.storage.local.remove('resourcesWindowId');
        });

    browser.storage.local.remove([
        'frenchWord',
        'frenchWordAudio',
        'frenchWordPlural',
        'frenchWordGender',
        'frenchSentence',
        'frenchSentenceAudio',
        'bulgarianWord',
        'bulgarianSentence',
        'image'
    ]);


    /**
     * Send a message to the background script to create a notification.
     * Only the background script can create notifications.
     */
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
        'input[name="french-word-gender"]:checked'
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
    const pluralInput = document.getElementById('french-word-plural');
    if (isGenderSelected()) {
        pluralInput.required = true;
    } else {
        pluralInput.removeAttribute('required');
    }
}

document
    .querySelectorAll('input[name="french-word-gender"]')
    .forEach((radio) => {
        radio.addEventListener('change', updatePluralRequiredProperty);
    });

document.addEventListener('DOMContentLoaded', updatePluralRequiredProperty);

document
    .getElementById('generate-french-sentence')
    .addEventListener('click', () => {
        const frenchWord = document
            .getElementById('french-word')
            .textContent.trim();
        generateFrenchSentenceWithWord(frenchWord);
    });

function generateFrenchSentenceWithWord(frenchWord) {
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
