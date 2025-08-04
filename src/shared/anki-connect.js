/**
 * Invoke an Anki Connect action with the given parameters.
 *
 * This function assumes that Anki Connect is running and listening on
 * http://127.0.1:8765.
 *
 * This function is inspired by
 * https://github.com/amikey/anki-connect?tab=readme-ov-file#sample-invocation
 * and was modified to use the fetch API instead of XMLHttpRequest.
 *
 * @param {string} action Anki Connect action to invoke.
 *                        For example, "addNote", "findNotes", etc.
 * @param {object} params Parameters for the Anki Connect action.
 * @returns {Promise<any>} The result field of the Anki Connect response.
 *                         The type of the result depends on the action.
 * @throws {Error} If the response is not valid or if Anki Connect returns
 *                 an error.
 */
export function invokeAnkiConnect(action, params = {}) {
    const ankiConnectVersion = 6;

    return fetch('http://127.0.0.1:8765', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, version: ankiConnectVersion, params })
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    'Network response was not ok. Status: ' + response.status
                );
            }

            return response.json();
        })
        .then((responseObject) => {
            if (Object.keys(responseObject).length !== 2) {
                throw new Error(
                    'Response has an unexpected number of fields. Expected '
                    + `2 fields but got ${Object.keys(responseObject).length}.`
                );
            }
            if (!('error' in responseObject)) {
                throw new Error('Response is missing required "error" field.');
            }
            if (!('result' in responseObject)) {
                throw new Error('Response is missing required "result" field.');
            }
            if (responseObject.error) {
                throw new Error(responseObject.error);
            }

            // Anki Connect returns an object but we only need the result field.
            return responseObject.result;
        })
        .catch((error) => {
            throw new Error('AnkiConnect request failed: ' + error.message);
        });
}
