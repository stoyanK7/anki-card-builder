const frenchGenderXPath =
    '/html/body/div[2]/div/div[3]/main/div[3]/div[3]/div[1]/section[2]/section[2]/p/span/i';
const frenchPluralXPath =
    '/html/body/div[2]/div/div[3]/main/div[3]/div[3]/div[1]/section[2]/section[2]/table/tbody/tr[2]/td[2]/bdi/a';

async function main() {
    const frenchGender = getStringFromXPath(frenchGenderXPath);
    const frenchPlural = getStringFromXPath(frenchPluralXPath);

    await browser.storage.local.set({
        frenchGender,
        frenchPlural
    });
    await browser.runtime.sendMessage({ type: 'data-updated' });

    // Wait 2 seconds before doing all the audio stuff.
    setTimeout(() => {}, 2000);

    const h3Prononciation = document.querySelector('h3#Prononciation');
    if (!h3Prononciation) {
        console.warn('No Prononciation section found');
        return;
    }

    const parent = h3Prononciation.parentElement;
    const ul = parent.nextElementSibling;
    if (!ul) {
        console.warn('No Prononciation list found');
        return;
    }

    const lisWithAudio = [];
    for (const li of ul.querySelectorAll('li')) {
        const audio = li.querySelector('audio');
        if (!audio) {
            continue;
        }
        lisWithAudio.push(li);
    }

    const lisWithAudioFrance = lisWithAudio.filter((li) => {
        const span = li.querySelector('span.audio-region');
        return span && span.textContent.includes('France');
    });

    const storageResult = await browser.storage.local.get('frenchWord');
    const frenchWord = storageResult.frenchWord;

    const lisWithAudioMatchingWord = lisWithAudio.filter((li) => {
        const span = li.querySelector('span.audio-word');
        return span && span.textContent.trim() === frenchWord;
    });

    const lisWithAudioMatchingWordFrance = lisWithAudioFrance.filter((li) => {
        const audioWordSpan = li.querySelector('span.audio-word');
        const audioRegionSpan = li.querySelector('span.audio-region');
        return (
            audioWordSpan &&
            audioRegionSpan &&
            audioWordSpan.textContent.trim() === frenchWord &&
            audioRegionSpan.textContent.includes('France')
        );
    });

    if (lisWithAudioMatchingWordFrance.length > 0) {
        for (const li of lisWithAudioMatchingWordFrance) {
            li.style.backgroundColor = 'yellow';
            li.style.border = '2px solid red';
        }

        const firstLi = lisWithAudioMatchingWordFrance[0];
        const audio = firstLi.querySelector('audio');
        const anchor = audio.nextElementSibling;
        if (anchor && anchor.classList.contains('mw-tmh-play')) {
            anchor.click();
            firstLi.style.backgroundColor = 'green';
            firstLi.style.border = '2px solid blue';
        }
    } else if (lisWithAudioMatchingWord.length > 0) {
        for (const li of lisWithAudioMatchingWord) {
            li.style.backgroundColor = 'yellow';
            li.style.border = '2px solid red';
        }

        const firstLi = lisWithAudioMatchingWord[0];
        const audio = firstLi.querySelector('audio');
        const anchor = audio.nextElementSibling;
        if (anchor && anchor.classList.contains('mw-tmh-play')) {
            anchor.click();
            firstLi.style.backgroundColor = 'green';
            firstLi.style.border = '2px solid blue';
        }
    } else if (lisWithAudioFrance.length > 0) {
        for (const li of lisWithAudioFrance) {
            li.style.backgroundColor = 'yellow';
            li.style.border = '2px solid red';
        }

        const firstLi = lisWithAudioFrance[0];
        const audio = firstLi.querySelector('audio');
        const anchor = audio.nextElementSibling;
        if (anchor && anchor.classList.contains('mw-tmh-play')) {
            anchor.click();
            firstLi.style.backgroundColor = 'green';
            firstLi.style.border = '2px solid blue';
        }
    } else {
        console.warn('No matching audio found');
    }
}

main();
