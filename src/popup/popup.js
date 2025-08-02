import { invokeAnkiConnect } from '../shared/anki-connect.js';
import { validateFrenchWord } from '../shared/input-validation.js';
import { startCardBuildingProcess } from '../shared/card-workflow.js';

updateAnkiConnectConnectionStatus();
updateOllamaConnectionStatus();
updatePiperConnectionStatus();

document
    .getElementById('prepare-card-button')
    .addEventListener('click', startCardPreparation);

document
    .getElementById('french-word-input')
    .addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            startCardPreparation();
        }
    });

function updateOllamaConnectionStatus() {
    fetch('http://localhost:11434')
        .then((response) => {
            if (response.ok) {
                document.getElementById('ollama-status-word').textContent =
                    'Connected';
                document.getElementById('ollama-status-word').style.color =
                    'green';
                document.getElementById(
                    'ollama-status-error-message'
                ).style.display = 'none';
            } else {
                throw new Error('Ollama server is not reachable');
            }
        })
        .catch((error) => {
            document.getElementById('ollama-status-word').textContent = 'Error';
            document.getElementById('ollama-status-word').style.color = 'red';
            document.getElementById(
                'ollama-status-error-message'
            ).style.display = 'block';
            document.getElementById('ollama-status-error-message').textContent =
                error.message;
        });
}

function updateAnkiConnectConnectionStatus() {
    invokeAnkiConnect('version')
        .then((version) => {
            if (version && typeof version === 'number') {
                document.getElementById('anki-status-word').textContent =
                    'Connected';
                document.getElementById('anki-status-word').style.color =
                    'green';
                document.getElementById(
                    'anki-status-error-message'
                ).style.display = 'none';
            } else {
                throw new Error('Invalid AnkiConnect version response');
            }
        })
        .catch((error) => {
            document.getElementById('anki-status-word').textContent = 'Error';
            document.getElementById('anki-status-word').style.color = 'red';
            document.getElementById('anki-status-error-message').style.display =
                'block';
            document.getElementById('anki-status-error-message').textContent =
                'AnkiConnect is not available. Please ensure it is installed, enabled and that Anki is running. Error: ' +
                error.message;
        });
}

function updatePiperConnectionStatus() {
    fetch('http://localhost:5000/voices')
        .then((response) => {
            if (response.ok) {
                document.getElementById('piper-status-word').textContent =
                    'Connected';
                document.getElementById('piper-status-word').style.color =
                    'green';
                document.getElementById(
                    'piper-status-error-message'
                ).style.display = 'none';
            } else {
                throw new Error('Piper server is not reachable');
            }
        })
        .catch((error) => {
            document.getElementById('piper-status-word').textContent = 'Error';
            document.getElementById('piper-status-word').style.color = 'red';
            document.getElementById(
                'piper-status-error-message'
            ).style.display = 'block';
            document.getElementById('piper-status-error-message').textContent =
                error.message;
        });
}

function startCardPreparation() {
    const frenchWord = document
        .getElementById('french-word-input')
        .value.trim();

    const validationResult = validateFrenchWord(frenchWord);
    if (!validationResult.valid) {
        placeRedBorder(document.getElementById('french-word-input'));
        document.getElementById(
            'error-message'
        ).textContent = `Invalid word: ${validationResult.reason}`;
        disableButton(document.getElementById('prepare-card-button'));
        return;
    }

    browser.storage.local.set({ frenchWord });
    startCardBuildingProcess(frenchWord);
}

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
