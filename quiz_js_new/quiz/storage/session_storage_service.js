const SessionStorageService = {
    loadQuizData() {
        console.log(QuizConfig.STORAGE_KEYS.QUIZ_DATA)
        const data = sessionStorage.getItem(QuizConfig.STORAGE_KEYS.QUIZ_DATA);
        if (!data) throw new Error('No quiz data found in session');
        const parsed = JSON.parse(data);
        const questions = parsed.questions || [];
        if (!questions.length) throw new Error('No questions found');
        return questions;
    },
};