async function main() {
    // Sometimes Collins Dictionary does not have curated examples (.dictExas)
    // so we fall back to the automatically generated examples (.corpusExas).
    let examplesContainer =
        document.querySelector('.dictExas') ||
        document.querySelector('.corpusExas');

    if (!examplesContainer) {
        browser.runtime.sendMessage({
            type: 'create-notification',
            id: `collins-dictionary-container-not-found`,
            options: {
                type: 'basic',
                iconUrl: browser.runtime.getURL('icons/flashcards-64.png'),
                title: 'Collins Dictionary Error',
                message: `Could not find the container for examples in Collins Dictionary. Please check if the page structure has changed.`
            }
        });
        return;
    }

    let examples = examplesContainer.querySelectorAll('.example');

    if (examples.length === 0) {
        browser.runtime.sendMessage({
            type: 'create-notification',
            id: `collins-dictionary-no-examples-found`,
            options: {
                type: 'basic',
                iconUrl: browser.runtime.getURL('icons/flashcards-64.png'),
                title: 'Collins Dictionary Error',
                message: `No examples found in Collins Dictionary for the word. Please check if the page structure has changed or if the word exists in the dictionary.`
            }
        });
        return;
    }

    const exampleDivs = document.querySelectorAll('.example');

    // Corpus examples have an inner div with the class 'credits popup-button'.
    // Remove this inner div to clean up the example text.
    if (examplesContainer.classList.contains('corpusExas')) {
        exampleDivs.forEach((exampleDiv) => {
            const innerDiv = exampleDiv.querySelector('.credits.popup-button');
            if (innerDiv) innerDiv.remove();
        });
    }

    // Iterate over the example divs and get the first with textContent
    // less than 85 chars. Else default to the first example.
    let exampleDiv =
        Array.from(exampleDivs).find((div) => {
            return div.textContent.trim().length <= 85;
        }) || exampleDivs[0];

    exampleDiv.style.backgroundColor = 'green';
    exampleDiv.style.border = '2px solid blue';

    const frenchSentence = exampleDiv.textContent.replace(/\n/g, ' ').trim();
    browser.storage.local.set({ frenchSentence });

    browser.runtime.sendMessage({
        type: 'create-tab',
        url: `https://www.deepl.com/en/translator#fr/bg/${encodeURIComponent(
            frenchSentence
        )}`
    });
}

main();
