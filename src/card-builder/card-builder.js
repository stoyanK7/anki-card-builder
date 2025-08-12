import { invokeAnkiConnect } from '../shared/anki-connect.js';
import { fetchFrenchAudio } from '../shared/piper.js';
import { initializeDeckDropdown } from './deck-dropdown.js';
import { initUiUpdateListeners,
    updateFrenchWord, updateFrenchWordAudio } from './ui-updater.js';

const frenchWord = getFrenchWordFromUrl();
updateFrenchWord(frenchWord);
generateFrenchSentenceWithWord(frenchWord);
fetchFrenchAudio(frenchWord)
    .then((audioAsBase64) => {
        updateFrenchWordAudio(audioAsBase64);
        browser.storage.local.set({
            frenchWordAudio: audioAsBase64
        });
    })
    .catch((error) => {
        console.error('Error fetching audio:', error);
    });
initializeDeckDropdown();
initUiUpdateListeners();

function getFrenchWordFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const frenchWord = params.get('frenchWord');
    // TODO: Add some error handling
    return frenchWord;
}

document.querySelector('form').addEventListener('submit', saveCard);

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
