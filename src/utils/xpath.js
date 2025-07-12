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

// Expose the function globally so it can be used in other scripts
window.getStringFromXPath = getStringFromXPath;
