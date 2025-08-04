export function startCardBuildingProcess(frenchWord) {
    openCardBuilderInPopupWindow();
    openResourceTabsForFrenchWordInNewWindow(frenchWord);
}

/**
 * Open the card builder panel in a popup window. The window will
 * always be on top of the other windows.
 */
function openCardBuilderInPopupWindow() {
    browser.windows.create({
        url: browser.runtime.getURL('src/card-builder/card-builder.html'),
        type: 'popup',
        width: 350,
        height: 560,
        focused: true
    });
}

/**
 * Open multiple tabs with resources related to the given French word.
 * The tabs are opened in a new separate window.
 * One website contains an audio file with the pronunciation of the word,
 * another website contains an example sentence with the word, and so on.
 * The manifest.json file maps the URLs to content scripts that will
 * scrape the data.
 *
 * @param {string} frenchWord
 */
function openResourceTabsForFrenchWordInNewWindow(frenchWord) {
    const encodedURIfrenchWord = encodeURIComponent(frenchWord);
    const urls = [
        `https://fr.wiktionary.org/wiki/${encodedURIfrenchWord}`,
        `https://translate.google.com'
                    + '/?sl=fr&tl=bg&text=${encodedURIfrenchWord}&op=translate`,
        `https://www.google.com/search?tbm=isch&q=${encodedURIfrenchWord}`
    ];

    browser.windows
        .create({
            url: urls,
            type: 'normal',
            focused: true
        })
        .then((window) => {
            browser.storage.local.set({ resourcesWindowId: window.id });
        });
}
