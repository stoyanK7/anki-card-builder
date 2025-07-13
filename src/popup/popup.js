import { invokeAnkiConnect } from '../utils/anki-connect.js';
import { validateFrenchWord } from '../shared/input-validation.js';
import { startCardBuildingProcess } from '../shared/card-workflow.js';

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

async function startCardPreparation() {
    const frenchWord = document.getElementById('french-word').value.trim();

    const validationResult = validateFrenchWord(frenchWord);
    if (!validationResult.valid) {
        placeRedBorder(document.getElementById('french-word'));
        document.getElementById(
            'error-message'
        ).textContent = `Invalid word: ${validationResult.reason}`;
        disableButton(document.getElementById('prepare-card-button'));
        return;
    }

    browser.storage.local.set({ frenchWord });
    startCardBuildingProcess(frenchWord);
}

document
    .getElementById('prepare-card-button')
    .addEventListener('click', startCardPreparation);

document.getElementById('french-word').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        startCardPreparation();
    }
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
