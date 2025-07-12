// Taken from https://github.com/amikey/anki-connect?tab=readme-ov-file#sample-invocation
// and modified to use fetch API instead of XMLHttpRequest
function invokeAnkiConnect(action, params = {}) {
    const ankiConnectVersion = 6;

    return fetch('http://127.0.0.1:8765', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, version: ankiConnectVersion, params })
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error(
                    'Network response was not ok. Status: ' + res.status
                );
            }
            return res.json();
        })
        .then((response) => {
            if (Object.keys(response).length !== 2) {
                throw new Error('Response has an unexpected number of fields');
            }
            if (!('error' in response)) {
                throw new Error('Response is missing required "error" field');
            }
            if (!('result' in response)) {
                throw new Error('Response is missing required "result" field');
            }
            if (response.error) {
                throw new Error(response.error);
            }
            return response.result;
        });
}
