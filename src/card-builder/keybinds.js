import { fetchFrenchAudio } from '../shared/piper.js';
import {
    updateFrenchWordAudio,
    updateFrenchSentenceAudio
} from './ui-updater.js';

// TODO: move the orchestrate functions to a separate file and use them insstead
document
    .getElementById('french-word')
    .addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();

            const frenchWord = event.target.value.trim();

            fetchFrenchAudio(frenchWord)
                .then(frenchWordBase64Audio => {
                    updateFrenchWordAudio(frenchWordBase64Audio);
                });
        }
    });

document
    .getElementById('french-sentence')
    .addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();

            const frenchSentence = event.target.value.trim();

            fetchFrenchAudio(frenchSentence)
                .then(frenchSentenceBase64Audio => {
                    updateFrenchSentenceAudio(frenchSentenceBase64Audio);
                });


            browser.storage.local.get('resourcesWindowId')
                .then(storageResult => storageResult.resourcesWindowId)
                .then(resourcesWindowId => {
                    if (!resourcesWindowId) return;

                    /**
                     * Update DeepL tab with new sentence if open;
                     * otherwise, create a new tab with it.
                     */
                    browser.tabs.query({
                        windowId: resourcesWindowId,
                        url: 'https://www.deepl.com/*'
                    })
                        .then(tabs => {
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


document.addEventListener('keydown', event => {
    if (event.ctrlKey && event.key === 'Enter') {
        document.querySelector('form').requestSubmit();
    }
});
