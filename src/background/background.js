import { startCardBuildingWorkflow } from './start-workflow.js';
import { endCardBuildingWorkflow } from './end-workflow.js';
import { setupContextMenus } from './context-menus.js';
import { fetchFrenchAudio } from '../shared/piper.js';
import { fetchFrenchSentence } from '../shared/ollama.js';

setupContextMenus();

browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'start-card-building-workflow') {
        startCardBuildingWorkflow(message.frenchWord);
    }
    // TODO: rename
    if (message.action === 'end-card-building-process') {
        endCardBuildingWorkflow(message.frenchWord, message.deckName);
    }
    /**
     * Unfortunately, the card builder must be ready before we can fetch.
     * Else, we get an error that there are no listeners for the messages
     * that will be sent.
     */
    if (message.action === 'card-builder-ready') {
        orchestrateFrenchAudioGeneration(message.frenchWord);
        orchestrateFrenchSentenceGeneration(message.frenchWord);
    }
});

function orchestrateFrenchAudioGeneration(text) {
    browser.runtime.sendMessage({
        action: 'scrape-start',
        parameter: 'frenchWordAudio'
    })
        .then(() => {
            return fetchFrenchAudio(text);
        })
        .then((audioAsBase64) => {
            browser.runtime.sendMessage({
                action: 'scrape-success',
                parameter: 'frenchWordAudio',
                value: audioAsBase64
            });
        })
        .catch(error => {
            browser.runtime.sendMessage({
                action: 'scrape-error',
                parameter: 'frenchWordAudio',
                error: error
            });
        });
}

function orchestrateFrenchSentenceGeneration(frenchWord) {
    browser.runtime.sendMessage({
        action: 'scrape-start',
        parameter: 'frenchSentence'
    })
        .then(() => {
            return fetchFrenchSentence(frenchWord);
        })
        .then((frenchSentence) => {
            orchestrateFrenchAudioGeneration(frenchSentence);

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

            return frenchSentence;
        })
        .then((frenchSentence) => {
            browser.runtime.sendMessage({
                action: 'scrape-success',
                parameter: 'frenchSentence',
                value: frenchSentence
            });
        })
        .catch(error => {
            browser.runtime.sendMessage({
                action: 'scrape-error',
                parameter: 'frenchSentence',
                error: error
            });
        });
}
