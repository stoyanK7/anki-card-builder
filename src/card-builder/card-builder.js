import { invokeAnkiConnect } from '../shared/anki-connect.js';
import { fetchFrenchAudio } from '../shared/piper.js';
import { initializeDeckDropdown } from './deck-dropdown.js';

function x() {
    const params = new URLSearchParams(window.location.search);
    const frenchWord = params.get('frenchWord');

    document
        .getElementById('french-word')
        .value = frenchWord;

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
}
x();

initializeDeckDropdown();


function updateCardEditorFromStorage(data) {
    if ('frenchWord' in data) {
        document
            .getElementById('french-word')
            .value = data.frenchWord;
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

    if ('frenchSentence' in changedData && changedData.frenchSentence) {
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

    // Get the values from the form. It is the source of truth.
    const deckName = document
        .getElementById('deck-name-dropdown')
        .value.trim();
    const frenchWord = document
        .getElementById('french-word')
        .value.trim();
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
                    ...getAudioParam(frenchWordAudio)
                }
            },
            {
                action: 'storeMediaFile',
                params: {
                    filename: `${frenchSentence}.wav`,
                    ...getAudioParam(frenchSentenceAudio)
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
        // TODO: Display an error message to the user.
        saveButton.disabled = false;
        return;
    }

    browser.runtime.sendMessage({
        action: 'end-card-building-process',
        frenchWord: frenchWord,
        deckName: deckName
    });
}

/**
 * Returns the appropriate parameter object for AnkiConnect's storeMediaFile
 * action, depending on the format of the audio input.
 *
 * @param {string} audio - The audio source, either a URL, a data URL,
 *                         or a base64 string.
 * @returns {{url?: string, data?: string}} An object with either a
 *                                          'url' or 'data' property
 *                                          for AnkiConnect.
 */
function getAudioParam(audio) {
    if (audio.startsWith('http://')
        || audio.startsWith('https://')) {
        return { url: audio };
    } else if (audio.includes('base64,')) {
        return { data: audio.split(',')[1] };
    } else {
        return { data: audio };
    }
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
            .value.trim();
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
