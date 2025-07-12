let frenchWord = '';
let deckName = '';
let frenchWordSpan = document.getElementById('french-word');

browser.storage.local.get(['frenchWord', 'deckName']).then((result) => {
    frenchWord = result.frenchWord;
    deckName = result.deckName;
    frenchWordSpan.textContent = frenchWord;
});

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

async function saveCard() {
    // Clear any previous error message
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';

    const saveButton = document.getElementById('save-card-button');
    saveButton.disabled = true;

    const frenchWord = document.getElementById('french-word').textContent;
    const frenchPlural = document.getElementById('french-plural').value;
    const frenchGender = document.querySelector(
        'input[name="french-gender"]:checked'
    ).value;
    const frenchSentence = document.getElementById('french-sentence').value;
    const bulgarianWord = document.getElementById('bulgarian-word').value;
    const bulgarianSentence =
        document.getElementById('bulgarian-sentence').value;
    const imageSrc = document.getElementById('image-src').value;

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
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        saveButton.disabled = false;
        return;
    }

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

    browser.runtime.sendMessage({
        type: 'card-saved',
        deckName: deckName,
        frenchWord: frenchWord
    });
}

document.getElementById('save-card-button').addEventListener('click', saveCard);
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key == 'Enter') {
        saveCard();
    }
});
