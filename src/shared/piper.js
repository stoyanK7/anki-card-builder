/**
 * Fetches audio for a given French string and returns a base64 data URL.
 *
 * @param {string} text - The French word or phrase to fetch audio for.
 * @throws {Error} If the network response is not ok.
 * @returns {Promise<string>} base64 data URL of the audio.
 */
export function fetchFrenchAudio(text) {
    const piperUrl = 'http://localhost:5000';
    return fetch(piperUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    'Network response from Piper was not ok: '
                    + response.statusText
                );
            }
            return response.blob();
        })
        /**
         * Convert the blob to a base64 data URL.
         * For instance, data:audio/wav;base64, UklGRiQAAAB...
         */
        .then((data) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(data);
        }));
}
