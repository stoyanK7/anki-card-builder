(async () => {
    if (!(await ensureAnkiConnectIsAvailable())) {
        return;
    }
})();

document
    .getElementById('reload')
    .addEventListener('click', ensureAnkiConnectIsAvailable);

async function ensureAnkiConnectIsAvailable() {
    try {
        const version = await invokeAnkiConnect('version');
        if (version && typeof version === 'number') {
            document.getElementById('status-word').textContent = 'Connected';
            document.getElementById('status-word').style.color = 'green';
            document.getElementById('error-message').style.display = 'none';
            return true;
        }
        return false;
    } catch (error) {
        document.getElementById('status-word').textContent = 'Error';
        document.getElementById('status-word').style.color = 'red';
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('error-message').textContent =
            'AnkiConnect is not available. Please ensure it is installed, enabled and that Anki is running. Error: ' +
            error.message;
        return false;
    }
}

document
    .getElementById('prepare-card-button')
    .addEventListener('click', async () => {
        const frenchWord = document.getElementById('french-word').value.trim();

        // Ensure the word is not empty
        if (frenchWord.length === 0) {
            disableButton(document.getElementById('prepare-card-button'));
            placeRedBorder(document.getElementById('french-word'));
            return;
        }

        if (!isValidFrenchWord(frenchWord)) {
            disableButton(document.getElementById('prepare-card-button'));
            placeRedBorder(document.getElementById('french-word'));
            return;
        }

        // Ensure that a deck name is selected
        const result = await browser.storage.local.get('deckName');
        if (!result || !result.deckName) {
            disableButton(document.getElementById('prepare-card-button'));
            placeRedBorder(document.getElementById('deck-select'));
            return;
        }

        // Wait for the frenchWord to be saved before creating the card builder
        // else a race condition may occur and the card builder may not display
        // the correct word.
        await browser.storage.local.set({ frenchWord });

        // Open the card editor in a separate popup window.
        await browser.windows.create({
            url: browser.runtime.getURL('src/card-builder/card-builder.html'),
            type: 'popup',
            width: 350,
            height: 560,
            focused: true
        });

        // Open all tabs with relevant links. The content scripts will scrape the data.
        const urls = [
            // Wiktionary for gender and plural form.
            `https://fr.wiktionary.org/wiki/${encodeURIComponent(frenchWord)}`,
            // Google Translate for bulgarian translation.
            `https://translate.google.com/?sl=fr&tl=bg&text=${encodeURIComponent(
                frenchWord
            )}&op=translate`,
            // Google Images for visual reference.
            `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
                frenchWord
            )}`,
            // Collins Dictionary for an example sentence.
            `https://www.collinsdictionary.com/sentences/french/${encodeURIComponent(
                frenchWord
            )}`
        ];
        // urls.forEach((url) => {
        //     browser.tabs.create({ url });
        // });
    });

function disableButton(button) {
    button.disabled = true;
    setTimeout(() => {
        button.disabled = false;
    }, 750);
}

function placeRedBorder(element) {
    element.style.border = '2px solid red';
    setTimeout(() => {
        element.style.border = '';
    }, 750);
}

function isValidFrenchWord(word) {
    const regex = /^[a-zàâçéèêëîïôûùüÿñæœ .-]*$/i;
    return regex.test(word.trim());
}
