const SessionStorageService = {
    saveQuizData(quizData) {
        sessionStorage.setItem(HomeConfig.STORAGE_KEYS.QUIZ_DATA, JSON.stringify(quizData));
    },

    redirectToQuiz() {
        window.location.href = `${HomeConfig.URLS.QUIZ_PAGE}?source=custom`;
    },

    saveAndRedirect(quizData) {
        this.saveQuizData(quizData);
        this.redirectToQuiz();
    },
};
