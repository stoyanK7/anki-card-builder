/**
 * Extract the text content of the first element matching the given
 * XPath expression.
 *
 * @param {string} xpath
 * @returns {string} The text content of the element, trimmed of whitespace.
 */
function getStringFromXPath(xpath) {
    const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.STRING_TYPE,
        null
    );
    return result.stringValue.trim();
}
