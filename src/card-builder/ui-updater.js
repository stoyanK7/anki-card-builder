export function initUiUpdateListeners() {
    browser.runtime.onMessage.addListener((message) => {
        console.log('Received message in UI updater:', message);
        if (message.action === 'scrape-start') {
            handleScrapeStart(message);
        }
        if (message.action === 'scrape-success') {
            handleScrapeSuccess(message);
        }
        if (message.action === 'scrape-error') {
            handleScrapeError(message);
        }
    });
}

function handleScrapeStart(message) {
    switch (message.parameter) {
    case 'frenchWordPlural':
        document.querySelector('#french-word-plural')
            .closest('.input-with-loading')
            .setAttribute('data-state', 'loading');
        break;
    case 'frenchSentence':
        document.getElementById('french-sentence')
            .closest('.input-with-loading')
            .setAttribute('data-state', 'loading');
        break;
    case 'bulgarianWord':
        document.getElementById('bulgarian-word')
            .closest('.input-with-loading')
            .setAttribute('data-state', 'loading');
        break;
    case 'bulgarianSentence':
        document.getElementById('bulgarian-sentence')
            .closest('.input-with-loading')
            .setAttribute('data-state', 'loading');
        break;
    }
}

function handleScrapeSuccess(message) {
    switch (message.parameter) {
    case 'frenchWordPlural':
        updateFrenchWordPlural(message.value);
        break;
    case 'frenchWordAudio':
        updateFrenchWordAudio(message.value);
        break;
    case 'frenchWordGender':
        updateFrenchWordGender(message.value);
        break;
    case 'frenchSentence':
        updateFrenchSentence(message.value);
        break;
    case 'frenchSentenceAudio':
        updateFrenchSentenceAudio(message.value);
        break;
    case 'bulgarianWord':
        updateBulgarianWord(message.value);
        break;
    case 'bulgarianSentence':
        updateBulgarianSentence(message.value);
        break;
    case 'image':
        updateImage(message.value);
        break;
    }
}

export function updateFrenchWord(newValue) {
    document
        .getElementById('french-word')
        .value = newValue;
}

function updateFrenchWordPlural(newValue) {
    document
        .getElementById('french-word-plural')
        .value = newValue;
    document
        .querySelector('#french-word-plural')
        .closest('.input-with-loading')
        .setAttribute('data-state', 'loaded');
}

export function updateFrenchWordAudio(newValue) {
    document
        .getElementById('french-word-audio-player')
        .src = newValue;
}

function updateFrenchWordGender(newValue) {
    const frenchWordGenderRadioButtons = document.querySelectorAll(
        'input[name="french-word-gender"]'
    );
    frenchWordGenderRadioButtons.forEach((radio) => {
        if (radio.value === newValue) {
            radio.checked = true;
        }
    });
}

export function updateFrenchSentence(newValue) {
    document
        .getElementById('french-sentence')
        .value = newValue;
    document
        .getElementById('french-sentence')
        .closest('.input-with-loading')
        .setAttribute('data-state', 'loaded');
}

export function updateFrenchSentenceAudio(newValue) {
    document
        .getElementById('french-sentence-audio-player')
        .src = newValue;
}

function updateBulgarianWord(newValue) {
    document
        .getElementById('bulgarian-word')
        .value = newValue;
    document
        .getElementById('bulgarian-word')
        .closest('.input-with-loading')
        .setAttribute('data-state', 'loaded');
}

function updateBulgarianSentence(newValue) {
    document
        .getElementById('bulgarian-sentence')
        .value = newValue;
    document
        .getElementById('bulgarian-sentence')
        .closest('.input-with-loading')
        .setAttribute('data-state', 'loaded');
}

function updateImage(newValue) {
    document
        .getElementById('image-preview')
        .src = newValue;
}

function handleScrapeError(message) {
    switch (message.parameter) {
    case 'frenchWordPlural':
        document.querySelector('#french-word-plural')
            .closest('.input-with-loading')
            .setAttribute('data-state', 'loaded');
        break;
    case 'frenchSentence':
        document.getElementById('french-sentence')
            .closest('.input-with-loading')
            .setAttribute('data-state', 'loaded');
        break;
    case 'bulgarianWord':
        document.getElementById('bulgarian-word')
            .closest('.input-with-loading')
            .setAttribute('data-state', 'loaded');
        break;
    case 'bulgarianSentence':
        document.getElementById('bulgarian-sentence')
            .closest('.input-with-loading')
            .setAttribute('data-state', 'loaded');
        break;
    }
}
