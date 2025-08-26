export function initializeUiUpdateListeners() {
    browser.runtime.onMessage.addListener(message => {
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

    createUserInteractionListeners();
}

function handleScrapeStart(message) {
    switch (message.parameter) {
    case 'frenchWordPlural':
        document
            .querySelector('#french-word-plural')
            .closest('.input-with-loading')
            .setAttribute('data-state', 'loading');
        break;
    case 'frenchWordAudio':
        document
            .getElementById('french-word-audio-player')
            .closest('.audio-slot')
            .setAttribute('data-state', 'loading');
        break;
    case 'frenchWordGender':
        document
            .querySelector('.segmented-with-loading')
            .setAttribute('data-state', 'loading');
        break;
    case 'frenchSentence':
        document
            .getElementById('french-sentence')
            .closest('.input-with-loading')
            .setAttribute('data-state', 'loading');
        break;
    case 'frenchSentenceAudio':
        document
            .getElementById('french-sentence-audio-player')
            .closest('.audio-slot')
            .setAttribute('data-state', 'loading');
        break;
    case 'bulgarianWord':
        document
            .getElementById('bulgarian-word')
            .closest('.input-with-loading')
            .setAttribute('data-state', 'loading');
        break;
    case 'bulgarianSentence':
        document
            .getElementById('bulgarian-sentence')
            .closest('.input-with-loading')
            .setAttribute('data-state', 'loading');
        break;
    case 'image':
        document
            .getElementById('image-preview-container')
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
    document
        .getElementById('french-word-audio-player')
        .closest('.audio-slot')
        .setAttribute('data-state', 'loaded');
}

function updateFrenchWordGender(newValue) {
    const frenchWordGenderRadioButtons = document.querySelectorAll(
        'input[name="french-word-gender"]'
    );
    frenchWordGenderRadioButtons.forEach(radio => {
        if (radio.value === newValue) {
            radio.checked = true;
        }
    });
    document
        .querySelector('.segmented-with-loading')
        .setAttribute('data-state', 'loaded');
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
    document
        .getElementById('french-sentence-audio-player')
        .closest('.audio-slot')
        .setAttribute('data-state', 'loaded');
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
    document
        .getElementById('image-preview-container')
        .setAttribute('data-state', 'loaded');
}

function handleScrapeError(message) {
    switch (message.parameter) {
    case 'frenchWordPlural':
        document
            .querySelector('#french-word-plural')
            .closest('.input-with-loading')
            .setAttribute('data-state', 'error');
        break;
    case 'frenchWordAudio':
        document
            .getElementById('french-word-audio-player')
            .closest('.audio-slot')
            .setAttribute('data-state', 'error');
        break;
    case 'frenchWordGender':
        document
            .querySelector('.segmented-with-loading')
            .setAttribute('data-state', 'error');
        break;
    case 'frenchSentence':
        document
            .getElementById('french-sentence')
            .closest('.input-with-loading')
            .setAttribute('data-state', 'error');
        break;
    case 'frenchSentenceAudio':
        document
            .getElementById('french-sentence-audio-player')
            .closest('.audio-slot')
            .setAttribute('data-state', 'error');
        break;
    case 'bulgarianWord':
        document
            .getElementById('bulgarian-word')
            .closest('.input-with-loading')
            .setAttribute('data-state', 'error');
        break;
    case 'bulgarianSentence':
        document
            .getElementById('bulgarian-sentence')
            .closest('.input-with-loading')
            .setAttribute('data-state', 'error');
        break;
    case 'image':
        document
            .getElementById('image-preview-container')
            .setAttribute('data-state', 'error');
        break;
    }
}

function createUserInteractionListeners() {
    document
        .querySelectorAll(
            '.input-with-loading input, .input-with-loading textarea'
        )
        .forEach(el => {
            const markLoaded = () => {
                const container = el.closest('.input-with-loading');
                if (container && container.getAttribute('data-state') === 'error') {
                    container.setAttribute('data-state', 'loaded');
                }
            };
            el.addEventListener('focus', markLoaded);
            el.addEventListener('click', markLoaded);
        });

    document
        .querySelectorAll('input[name="french-word-gender"]')
        .forEach(radio => {
            radio.addEventListener('change', () => {
                const seg = radio.closest('.segmented-with-loading');
                if (seg && seg.getAttribute('data-state') === 'error') {
                    seg.setAttribute('data-state', 'loaded');
                }
            });
            radio.addEventListener('click', () => {
                const seg = radio.closest('.segmented-with-loading');
                if (seg && seg.getAttribute('data-state') === 'error') {
                    seg.setAttribute('data-state', 'loaded');
                }
            });
        });
}
