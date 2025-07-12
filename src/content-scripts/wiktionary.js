const frenchGenderXPath =
    '/html/body/div[2]/div/div[3]/main/div[3]/div[3]/div[1]/section[2]/section[2]/p/span/i';
const frenchPluralXPath =
    '/html/body/div[2]/div/div[3]/main/div[3]/div[3]/div[1]/section[2]/section[2]/table/tbody/tr[2]/td[2]/bdi/a';

async function main() {
    const frenchGender = window.getStringFromXPath(frenchGenderXPath);
    const frenchPlural = window.getStringFromXPath(frenchPluralXPath);

    await browser.storage.local.set({
        frenchGender,
        frenchPlural
    });
    await browser.runtime.sendMessage({ type: 'data-updated' });
}

main();
