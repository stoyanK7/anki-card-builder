import { invokeAnkiConnect } from '../shared/anki-connect.js';

export function initializeSaveCardListener() {
    document
        .getElementById('save-card-button')
        .addEventListener('click', saveCard);
}

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
        action: 'end-card-building-workflow',
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
