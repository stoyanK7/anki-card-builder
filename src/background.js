browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'create-tab') {
        browser.tabs.create({ url: message.url });
    }

    if (message.type === 'card-saved') {
        const notificationId = `card-saved-${message.frenchWord}`;
        browser.notifications.create(notificationId, {
            type: 'basic',
            iconUrl: browser.runtime.getURL('icons/flashcards-64.png'),
            title: 'Card Saved',
            message: `Card "${message.frenchWord}" saved in deck "${message.deckName}".`
        });

        setTimeout(() => {
            browser.notifications.clear(notificationId);
        }, 5000);
    }
});
