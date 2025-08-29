export function endCardBuildingWorkflow(frenchWord, deckName) {
    notifyCardSaved(frenchWord, deckName);
    closeAndCleanupWindows();
}

function notifyCardSaved(frenchWord, deckName) {
    const notificationId = `card-saved-${frenchWord}`;
    browser.notifications.create(notificationId, {
        type: 'basic',
        iconUrl: browser.runtime.getURL('icons/flashcards-64.png'),
        title: 'Card Saved',
        message: `Card "${frenchWord}" saved in deck "${deckName}".`
    });
}

/**
 * Closes the card builder and resources windows if they are open,
 * and removes their window IDs from browser storage.
 *
 * The order of closing is important. The card builder window
 * must be closed last, because it is the one that is running
 * this code. Else, the anything after closing the card builder
 * window will not execute.
 */
async function closeAndCleanupWindows() {
    const storageResult = await browser.storage.local.get([
        'cardBuilderWindowId',
        'resourcesWindowId'
    ]);
    const { cardBuilderWindowId, resourcesWindowId } = storageResult;

    if (resourcesWindowId) {
        await browser.windows.remove(resourcesWindowId);
        await browser.storage.local.remove('resourcesWindowId');
    }

    if (cardBuilderWindowId) {
        await browser.storage.local.remove('cardBuilderWindowId');
        // IMPORTANT: This must be the last line in this function.
        await browser.windows.remove(cardBuilderWindowId);
    }
}
