export function fetchFrenchSentence(frenchWord) {
    return fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'jobautomation/OpenEuroLLM-French',
            prompt: 'Donne uniquement une phrase en français, niveau A1-A2, '
                    + `avec le mot suivant : ${frenchWord}. La phrase doit `
                    + 'avoir 10 mots ou moins. Ne réponds qu\'avec la phrase'
                    + ', sans explication ni introduction. Exemple : Si le '
                    + 'mot est "chat", réponds : "Le chat dort sur le canapé."',
            stream: false,
            options: {
                temperature: 0.5,
                top_k: 30, // eslint-disable-line camelcase
                top_p: 0.5 // eslint-disable-line camelcase
            }
        })
    })
        .then(response => response.json())
        .then(data => data.response.trim())
        .catch(error => {
            throw new Error(`Error fetching French sentence: ${error.message}`);
        });
}
