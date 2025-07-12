const xpathGender =
    '/html/body/div[2]/div/div[3]/main/div[3]/div[3]/div[1]/section[2]/section[2]/p/span/i';
const xpathPlural =
    '/html/body/div[2]/div/div[3]/main/div[3]/div[3]/div[1]/section[2]/section[2]/table/tbody/tr[2]/td[2]/bdi/a';

function getValue(xpath) {
    const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.STRING_TYPE,
        null
    );
    return result.stringValue.trim();
}

const frenchGender = getValue(xpathGender);
const frenchPlural = getValue(xpathPlural);

// TODO: Fix race condition
browser.storage.local.set({
    frenchGender,
    frenchPlural
});

browser.runtime.sendMessage({ type: 'data-updated' });
