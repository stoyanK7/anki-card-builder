/**
 * Get the first element matching the given XPath expression.
 *
 * @param {string} xpath
 * @returns {Element|null} The matching element, or null if not found.
 * @throws {Error} If no element is found for the given XPath.
 */
function getElementFromXPath(xpath) {
    const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    );
    if (!result.singleNodeValue) {
        throw new Error(`Element not found for XPath: ${xpath}`);
    }
    return result.singleNodeValue;
}

/**
 * Extract the text content of the first element matching the given
 * XPath expression.
 *
 * @param {string} xpath
 * @returns {string} The text content of the element, trimmed of whitespace.
 * @throws {Error} If the element is found but has no textContent attribute.
 *                 If the element is not found, an error is thrown
 *                 by getElementFromXPath.
 */
function getStringFromXPath(xpath) {
    const element = getElementFromXPath(xpath);
    if (!element.hasAttribute('textContent')) {
        throw new Error(
            `Element for XPath ${xpath} has no textContent attribute.`
        );
    }
    return element.textContent.trim();
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
