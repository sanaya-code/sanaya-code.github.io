class QuizDataLoader {
    static getSessionJsonData() {
        const data = sessionStorage.getItem('customQuizData');
        if (!data) throw new Error('No custom quiz data found');
        const questionsList = JSON.parse(data).questions || [];
        if (!questionsList.length) throw new Error('No questions found');
        return questionsList;
    }

    static async getQuestionsList() {
        const urlParams = new URLSearchParams(window.location.search);
        const source = urlParams.get('source');
        if (source === 'custom') {
            return this.getSessionJsonData();
        } else {
            console.log("error : no custom session data available");
        }
    }

    static isLocal() {
        return (
            location.protocol === 'file:' ||
            location.hostname === 'localhost' ||
            location.hostname === '127.0.0.1'
        );
    }

    static async fetchInfoSubjects() {
        if (this.isLocal()) {
            console.warn('Running locally: skipping remote fetch of info_subjects.json');
            throw new Error('Remote fetching not allowed when running locally');
        }

        const response = await fetch('https://sanaya-code.github.io/quiz/data/info/info_subjects.json');
        if (!response.ok) throw new Error('Failed to load subjects info');
        return await response.json();
    }

    static async fetchQuizFromUrl(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    static async fetchQuizFromCashUrl(url) {
        const cache = await caches.open('sami-quiz-cache');
        const cachedResponse = await cache.match(url);
        console.log(url);
        console.log(cachedResponse);
        // If no cache exists, fetch fresh and cache it
        if (!cachedResponse) {
            console.log(" not chached: fetching from remote");
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const responseToCache = response.clone();
            await cache.put(url, responseToCache);
            return await response.json();
        }
    
        // If cache exists, make conditional request
        try {
            const networkResponse = await fetch(url, {
                headers: {'If-None-Match': cachedResponse.headers.get('ETag')}
            });
            
            if (networkResponse.status === 304) {
                console.log(networkResponse);
                console.log(" fetching from cache");
                return await cachedResponse.json();
            }
            
            if (networkResponse.ok) {
                console.log("cached file exists: fetching new version from remote");
                const responseToCache = networkResponse.clone();
                await cache.put(url, responseToCache);
                return await networkResponse.json();
            }
        } catch (e) {
            console.warn(url);
            console.warn('Network error, using cached version', e);
        }
        
        return await cachedResponse.json();
    }
}
