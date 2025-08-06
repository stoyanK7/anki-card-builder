const frenchWordGenderXPath =
    '/html/body/div[2]/div/div[3]/main/div[3]'
    + '/div[3]/div[1]/section[2]/section[2]/p/span/i';
const frenchWordPluralXPath =
    '/html/body/div[2]/div/div[3]/main/div[3]/div[3]/div[1]'
    + '/section[2]/section[2]/table/tbody/tr[2]/td[2]/bdi/a';

const frenchWordGender = getStringFromXPath(frenchWordGenderXPath);
const frenchWordPlural = getStringFromXPath(frenchWordPluralXPath);

browser.storage.local.set({
    frenchWordGender,
    frenchWordPlural
});
