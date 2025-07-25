const frenchGenderXPath =
    '/html/body/div[2]/div/div[3]/main/div[3]/div[3]/div[1]/section[2]/section[2]/p/span/i';
const frenchPluralXPath =
    '/html/body/div[2]/div/div[3]/main/div[3]/div[3]/div[1]/section[2]/section[2]/table/tbody/tr[2]/td[2]/bdi/a';

async function main() {
    const frenchGender = getStringFromXPath(frenchGenderXPath);
    const frenchPlural = getStringFromXPath(frenchPluralXPath);

    browser.storage.local.set({
        frenchGender,
        frenchPlural
    });

    // Wiktionary is doing some shenanigans with their audio elements.
    // They have a custom audio player and the audio tags are not visible.
    // We need to make them visible so we can right click on them.
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const addedNodes = Array.from(mutation.addedNodes);
                addedNodes.forEach((node) => {
                    if (
                        node.nodeType === Node.ELEMENT_NODE &&
                        node.tagName.toLowerCase() === 'audio'
                    ) {
                        node.controls = true;
                        node.style.zIndex = '1';
                        node.style.backgroundColor = 'black';
                        node.style.position = 'relative';
                    }
                });
            }
        });
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

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
        let anchor = firstLi.querySelector('a.mw-tmh-play');
        if (!anchor) {
            const observer = new MutationObserver((mutations) => {
                const newAnchor = firstLi.querySelector('a.mw-tmh-play');
                if (newAnchor) {
                    anchor = newAnchor;
                    const event = new CustomEvent('anchorSet', {
                        detail: { anchor, firstLi }
                    });
                    document.dispatchEvent(event);
                }
            });
            observer.observe(firstLi, {
                childList: true,
                subtree: true
            });
            return;
        } else {
            const event = new CustomEvent('anchorSet', {
                detail: { anchor, firstLi }
            });
            document.dispatchEvent(event);
        }
    } else if (lisWithAudioMatchingWord.length > 0) {
        for (const li of lisWithAudioMatchingWord) {
            li.style.backgroundColor = 'yellow';
            li.style.border = '2px solid red';
        }

        const firstLi = lisWithAudioMatchingWord[0];
        let anchor = firstLi.querySelector('a.mw-tmh-play');
        if (!anchor) {
            const observer = new MutationObserver((mutations) => {
                const newAnchor = firstLi.querySelector('a.mw-tmh-play');
                if (newAnchor) {
                    anchor = newAnchor;
                    const event = new CustomEvent('anchorSet', {
                        detail: { anchor, firstLi }
                    });
                    document.dispatchEvent(event);
                }
            });
            observer.observe(firstLi, {
                childList: true,
                subtree: true
            });
            return;
        } else {
            const event = new CustomEvent('anchorSet', {
                detail: { anchor, firstLi }
            });
            document.dispatchEvent(event);
        }
    } else if (lisWithAudioFrance.length > 0) {
        for (const li of lisWithAudioFrance) {
            li.style.backgroundColor = 'yellow';
            li.style.border = '2px solid red';
        }

        const firstLi = lisWithAudioFrance[0];
        let anchor = firstLi.querySelector('a.mw-tmh-play');
        if (!anchor) {
            const observer = new MutationObserver((mutations) => {
                const newAnchor = firstLi.querySelector('a.mw-tmh-play');
                if (newAnchor) {
                    anchor = newAnchor;
                    const event = new CustomEvent('anchorSet', {
                        detail: { anchor, firstLi }
                    });
                    document.dispatchEvent(event);
                }
            });
            observer.observe(firstLi, {
                childList: true,
                subtree: true
            });
            return;
        } else {
            const event = new CustomEvent('anchorSet', {
                detail: { anchor, firstLi }
            });
            document.dispatchEvent(event);
        }
    } else {
        console.warn('No matching audio found');
    }
}

document.addEventListener('anchorSet', function (event) {
    const anchor = event.detail.anchor;
    const firstLi = event.detail.firstLi;

    anchor.click();
    firstLi.style.backgroundColor = 'green';
    firstLi.style.border = '2px solid blue';

    const observer = new MutationObserver((mutations) => {
        const audioElement = firstLi.querySelector('audio');
        if (audioElement && audioElement.src) {
            browser.storage.local.set({ audioSrc: audioElement.src });
            observer.disconnect();
        }
    });
    observer.observe(firstLi, {
        childList: true,
        subtree: true
    });
});

main();
