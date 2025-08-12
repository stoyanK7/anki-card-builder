updateAnkiConnectConnectionStatus();
updateOllamaConnectionStatus();
updatePiperConnectionStatus();

document
    .getElementById('prepare-card-button')
    .addEventListener('click', startCardPreparation);

document
    .getElementById('french-word-input')
    .addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            startCardPreparation();
        }
    });

function updateOllamaConnectionStatus() {
    fetch('http://localhost:11434')
        .then(response => {
            if (response.ok) {
                document
                    .getElementById('ollama-status-word')
                    .textContent = 'Connected';
                document
                    .getElementById('ollama-status-word')
                    .style.color = 'green';
                document
                    .getElementById('ollama-status-error-message')
                    .style.visibility = 'hidden';
            } else {
                throw new Error(
                    'Ollama server is not reachable. Status: ' + response.status
                );
            }
        })
        .catch(error => {
            document
                .getElementById('ollama-status-word')
                .textContent = 'Error';
            document
                .getElementById('ollama-status-word')
                .style.color = 'red';
            document
                .getElementById('ollama-status-error-message')
                .style.visibility = 'visible';
            document
                .getElementById('ollama-status-error-message')
                .textContent = error.message;
        });
}

function updateAnkiConnectConnectionStatus() {
    fetch('http://127.0.0.1:8765')
        .then(response => {
            if (response.ok) {
                document
                    .getElementById('anki-status-word')
                    .textContent ='Connected';
                document
                    .getElementById('anki-status-word')
                    .style.color ='green';
                document
                    .getElementById('anki-status-error-message')
                    .style.visibility = 'hidden';
            } else {
                throw new Error(
                    'AnkiConnect server is not reachable. Status: '
                    + response.status
                );
            }
        })
        .catch(error => {
            document.
                getElementById('anki-status-word')
                .textContent = 'Error';
            document
                .getElementById('anki-status-word')
                .style.color = 'red';
            document
                .getElementById('anki-status-error-message')
                .style.visibility ='visible';
            document
                .getElementById('anki-status-error-message')
                .textContent = 'AnkiConnect is not available. '
                + 'Please ensure it is installed, enabled and that '
                + 'Anki is running. Error: ' + error.message;
        });
}

function updatePiperConnectionStatus() {
    fetch('http://localhost:5000/voices')
        .then(response => {
            if (response.ok) {
                document
                    .getElementById('piper-status-word')
                    .textContent = 'Connected';
                document
                    .getElementById('piper-status-word')
                    .style.color = 'green';
                document
                    .getElementById('piper-status-error-message')
                    .style.visibility = 'hidden';
            } else {
                throw new Error(
                    'Piper server is not reachable. Status: ' + response.status
                );
            }
        })
        .catch(error => {
            document
                .getElementById('piper-status-word')
                .textContent = 'Error';
            document
                .getElementById('piper-status-word')
                .style.color = 'red';
            document
                .getElementById('piper-status-error-message')
                .style.visibility = 'visible';
            document
                .getElementById('piper-status-error-message')
                .textContent = error.message;
        });
}

function startCardPreparation() {
    const frenchWord = document
        .getElementById('french-word-input')
        .value.trim();

    // TODO: Validate the French word before proceeding
    browser.runtime.sendMessage({
        action: 'start-card-building-workflow',
        frenchWord
    });
}
