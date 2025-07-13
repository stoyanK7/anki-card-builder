/**
 * Validate a French word to ensure it is not empty
 * and contains only valid characters from the French alphabet.
 *
 * @param {string} frenchWord
 * @returns {Object} An object with a boolean `valid`
 * property. If `valid` is false, the object also contains a
 * string `reason` property that explains why the word is invalid.
 */
export function validateFrenchWord(frenchWord) {
    if (!frenchWord || frenchWord.trim().length === 0) {
        return { valid: false, reason: 'The word is empty.' };
    }
    if (!isValidFrenchWord(frenchWord)) {
        return { valid: false, reason: 'Invalid characters.' };
    }
    return { valid: true };
}

/**
 * Check if the given word is a valid French word - i.e.,
 * it contains only characters from the French alphabet.
 * Taken from https://stackoverflow.com/a/1922147/9553927.
 *
 * @param {string} word
 * @returns {boolean} true if the word is valid, false otherwise
 */
function isValidFrenchWord(word) {
    const regex = /^[a-zàâçéèêëîïôûùüÿñæœ .-]*$/i;
    return regex.test(word.trim());
}
