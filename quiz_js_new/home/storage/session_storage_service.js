const SessionStorageService = {
    saveAndRedirect(quizData, baseUrl) {
        const payload = JSON.stringify({
            baseUrl,
            questions: quizData.questions || [],
        });
        sessionStorage.setItem(HomeConfig.STORAGE_KEYS.QUIZ_DATA, payload);
        window.location.href = HomeConfig.URLS.QUIZ_PAGE + '?source=custom';
    },
};