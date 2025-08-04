/**
 * Get the first element matching the given XPath expression.
 *
 * @param {string} xpath
 * @returns {Element|null} The matching element, or null if not found.
 */
function getElementFromXPath(xpath) {
    const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    );
    return result.singleNodeValue;
}

/**
 * Extract the text content of the first element matching the given
 * XPath expression.
 *
 * @param {string} xpath
 * @returns {string} The text content of the element, trimmed of whitespace.
 */
function getStringFromXPath(xpath) {
    const element = getElementFromXPath(xpath);
    if (!element) {
        return '';
    }
    return element.stringValue.trim();
}

/**
 * Get all elements matching the given XPath expression.
 *
 * @param {string} xpath
 * @returns {Element[]} An array of matching elements.
 */
function getAllElementsFromXPath(xpath) {
    const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );
    const elements = [];
    for (let i = 0; i < result.snapshotLength; i++) {
        elements.push(result.snapshotItem(i));
    }
    return elements;
}
