const SessionStorageService = {
    loadQuizData() {
        const data = sessionStorage.getItem(QuizConfig.STORAGE_KEYS.QUIZ_DATA);
        if (!data) throw new Error('No quiz data found. Please go back and select a quiz.');

        const parsed    = JSON.parse(data);
        const questions = parsed.questions || [];
        const baseUrl   = parsed.baseUrl   || '';

        if (!questions.length) throw new Error('No questions found in the quiz file.');

        const invalid = questions.find(q => !q.type);
        if (invalid) throw new Error(`Question "${invalid.question || invalid.id || '?'}" is missing a "type" field.`);

        return { questions, baseUrl };
    },
};