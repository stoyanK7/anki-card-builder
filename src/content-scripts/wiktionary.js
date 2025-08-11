main();

function main() {
    orchestrateFrenchWordGenderScraping();
    orchestrateFrenchWordPluralScraping();
}

/**
 * Orchestrate scraping the gender of a French word
 * and send progress/results via browser messages.
 */
function orchestrateFrenchWordGenderScraping() {
    browser.runtime.sendMessage({
        action: 'scrape-start',
        parameter: 'frenchWordGender'
    })
        .then(() => {
            return scrapeFrenchWordGender();
        })
        .then(frenchWordGender => {
            browser.runtime.sendMessage({
                action: 'scrape-success',
                parameter: 'frenchWordGender',
                value: frenchWordGender
            });
        })
        .catch(error => {
            browser.runtime.sendMessage({
                action: 'scrape-error',
                parameter: 'frenchWordGender',
                error: error
            });
        });
}

/**
 * Orchestrate scraping the plural form of a French word
 * and send progress/results via browser messages.
 */
function orchestrateFrenchWordPluralScraping() {
    browser.runtime.sendMessage({
        action: 'scrape-start',
        parameter: 'frenchWordPlural'
    })
        .then(() => {
            return scrapeFrenchWordPlural();
        })
        .then(frenchWordPlural => {
            browser.runtime.sendMessage({
                action: 'scrape-success',
                parameter: 'frenchWordPlural',
                value: frenchWordPlural
            });
        })
        .catch(error => {
            browser.runtime.sendMessage({
                action: 'scrape-error',
                parameter: 'frenchWordPlural',
                error: error
            });
        });
}

/**
 * Scrape the gender of a French noun from its Wiktionary page.
 *
 * This function examines the first paragraph of the "Nom commun"
 * subsection for the words "masculin" or "féminin".
 * If neither is found, it returns "none".
 *
 * @returns {string} The gender of the French word
 *                   ('masculin', 'féminin', or 'none').
 * @throws {Error} If the expected DOM elements are not found.
 */
async function scrapeFrenchWordGender() {
    const nomCommunSectionElement = getNomCommunSectionElement();
    const pElement = nomCommunSectionElement.querySelector('p');
    if (!pElement) {
        throw new Error('<p> element in Nom commun section not found.');
    }

    const pText = pElement.textContent.trim();
    if (!pText) {
        throw new Error('Text content in <p> element is empty.');
    }

    let frenchWordGender;
    if (pText.includes('masculin')) {
        frenchWordGender = 'masculin';
    } else if (pText.includes('féminin')) {
        frenchWordGender = 'féminin';
    } else {
        frenchWordGender = 'none';
    }

    return frenchWordGender;
}

/**
 * Scrape the plural form of a French noun from its Wiktionary page.
 *
 * This function searches for the first <table> in the "Nom commun" section.
 * - If the first row contains "invariable" or "singulier et pluriel",
 *   it returns the singular form as the plural.
 * - Otherwise, it looks for the plural form in the second row,
 *   second column of the table.
 *
 * @returns {Promise<string>} The plural form of the French word.
 * @throws {Error} If the expected DOM elements are not found.
 */
// eslint-disable-next-line complexity
async function scrapeFrenchWordPlural() {
    const nomCommunSectionElement = getNomCommunSectionElement();
    const tableElement = nomCommunSectionElement.querySelector('table');
    if (!tableElement) {
        throw new Error('<table> element in Nom commun section not found.');
    }

    const firstRowElement = tableElement.querySelector('tr');
    if (!firstRowElement) {
        throw new Error('First <tr> element in <table> not found.');
    }

    const firstRowElementText = firstRowElement.textContent.trim();
    if (!firstRowElementText) {
        throw new Error('Text content in first <tr> element is empty.');
    }

    if (firstRowElementText.toLowerCase().includes('invariable')
        || firstRowElementText.toLowerCase().includes('singulier et pluriel')) {
        const secondRowElement = tableElement.querySelector('tr:nth-child(2)');
        if (!secondRowElement) {
            throw new Error('Second <tr> element in <table> not found.');
        }

        const selfLinkAnchorElement =
            secondRowElement.querySelector('a.selflink');
        if (!selfLinkAnchorElement) {
            throw new Error(
                'Anchor with class "selflink" in second <tr> not found.'
            );
        }

        return selfLinkAnchorElement.textContent.trim();
    }

    const thElements = firstRowElement.querySelectorAll('th');
    if (thElements.length !== 2) {
        throw new Error('First <tr> does not have exactly 2 <th> elements.');
    }

    const singularThElement = thElements[0];
    const pluralThElement = thElements[1];
    if (singularThElement.textContent.trim().toLowerCase() !== 'singulier'
        || pluralThElement.textContent.trim().toLowerCase() !== 'pluriel') {
        throw new Error(
            'First <tr> does not have "Singulier" and "Pluriel" <th> elements.'
        );
    }

    const secondRowElement = tableElement.querySelector('tr:nth-child(2)');
    if (!secondRowElement) {
        throw new Error('Second <tr> element in <table> not found.');
    }

    const tdElements = secondRowElement.querySelectorAll('td');
    if (tdElements.length !== 2) {
        throw new Error('Second <tr> does not have exactly 2 <td> elements.');
    }

    const pluralTdElement = tdElements[1];
    const frElement = pluralTdElement.querySelector('[lang="fr"]');
    if (!frElement) {
        throw new Error(
            'Element with lang="fr" in second <td> element not found.'
        );
    }

    const frenchWordPlural = frElement.textContent.trim();
    if (!frenchWordPlural) {
        throw new Error('Text content in element with lang="fr" is empty.');
    }

    return frenchWordPlural;
}

/**
 * Retrieves the <section> element for "Nom commun"
 * in the French section of the page.
 *
 * This function first locates the "Français" <h2> heading,
 * then finds its parent <section>. Within that section, it
 * searches for the "Nom commun" <h3> heading and its parent <section>.
 * The returned section contains gender and plural
 * information for the French noun.
 *
 * @returns {HTMLElement} The <section> element for "Nom commun".
 * @raises {Error} If the expected DOM elements are not found.
 */
function getNomCommunSectionElement() {
    const frenchH2Element = document.querySelector('h2#Français');
    if (!frenchH2Element) {
        throw new Error('Français heading not found.');
    }

    const frenchSectionElement = frenchH2Element.closest('section');
    if (!frenchSectionElement) {
        throw new Error('<section> parent for Français heading not found.');
    }

    const nomCommunH3Element =
        frenchSectionElement.querySelector('h3#Nom_commun');
    if (!nomCommunH3Element) {
        throw new Error('Nom commun heading not found.');
    }

    const nomCommunSectionElement = nomCommunH3Element.closest('section');
    if (!nomCommunSectionElement) {
        throw new Error('<section> parent for Nom commun heading not found.');
    }

    return nomCommunSectionElement;
}
