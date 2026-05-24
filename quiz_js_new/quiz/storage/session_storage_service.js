const SessionStorageService = {
    loadQuizData() {
        console.log('[SessionStorageService] current href:', window.location.href);

        let data = this._readData();
        console.log('[SessionStorageService] data found:', !!data);

        if (!data) throw new Error('No quiz data found. Please go back and select a quiz.');

        const parsed    = JSON.parse(data);
        const questions = parsed.questions || [];
        const baseUrl   = parsed.baseUrl   || '';

        console.log('[SessionStorageService] questions count:', questions.length);
        console.log('[SessionStorageService] baseUrl:', baseUrl);

        if (!questions.length) throw new Error('No questions found in the quiz file.');

        const invalid = questions.find(q => !q.type);
        if (invalid) throw new Error(`Question "${invalid.question || invalid.id || '?'}" is missing a "type" field.`);

        return { questions, baseUrl };
    },

    _readData() {
        // Try URL hash first (file:/// mode)
        if (window.location.hash) {
            console.log('[SessionStorageService] reading from URL hash');
            const data = decodeURIComponent(window.location.hash.substring(1));
            // Clear hash from URL without reloading
            history.replaceState(null, '', window.location.pathname + window.location.search);
            return data;
        }

        // Fall back to sessionStorage (server mode)
        console.log('[SessionStorageService] reading from sessionStorage');
        return sessionStorage.getItem(QuizConfig.STORAGE_KEYS.QUIZ_DATA);
    },
};