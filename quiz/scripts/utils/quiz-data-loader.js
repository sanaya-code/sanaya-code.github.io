class QuizDataLoader {
    static getSessionJsonData() {
        const data = sessionStorage.getItem('customQuizData');
        if (!data) throw new Error('No custom quiz data found');
        const questionsList = JSON.parse(data).questions || [];
        if (!questionsList.length) throw new Error('No questions found');
        return questionsList;
    }

    static async getRemoteJsonData() {
        const urlParams = new URLSearchParams(window.location.search);
        const subject = urlParams.get('subject');
        const response = await fetch(`data/${subject}.json`);
        if (!response.ok) throw new Error('Failed to fetch remote quiz data');
        const data = await response.json();
        const questionsList = data.questions || [];
        if (!questionsList.length) throw new Error('No questions found');
        return questionsList;
    }

    static async getQuestionsList() {
        const urlParams = new URLSearchParams(window.location.search);
        const source = urlParams.get('source');
        if (source === 'custom') {
            return this.getSessionJsonData();
        } else {
            return await this.getRemoteJsonData();
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
}
