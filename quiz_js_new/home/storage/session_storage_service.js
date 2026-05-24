const SessionStorageService = {
    saveQuizData(quizData, baseUrl) {
        sessionStorage.setItem(HomeConfig.STORAGE_KEYS.QUIZ_DATA, JSON.stringify({
            baseUrl,
            questions: quizData.questions || [],
        }));
    },

    redirectToQuiz() {
        window.location.href = `${HomeConfig.URLS.QUIZ_PAGE}?source=custom`;
    },

    saveAndRedirect(quizData, baseUrl) {
        this.saveQuizData(quizData, baseUrl);
        this.redirectToQuiz();
    },
};