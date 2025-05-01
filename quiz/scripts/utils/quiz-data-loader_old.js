// QuizDataLoader.js

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
} 
