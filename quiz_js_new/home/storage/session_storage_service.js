const SessionStorageService = {
    saveAndRedirect(quizData, baseUrl) {
        const payload = JSON.stringify({
            baseUrl,
            questions: quizData.questions || [],
        });

        const base        = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        const quizPageUrl = base + HomeConfig.URLS.QUIZ_PAGE;

        if (BrowserEnvironment.isLocal()) {
            // file:/// — sessionStorage/localStorage don't share across file origins
            // pass data via URL hash instead
            console.log('[SessionStorageService] local mode: passing data via URL hash');
            window.location.href = quizPageUrl + '?source=custom#' + encodeURIComponent(payload);
        } else {
            console.log('[SessionStorageService] server mode: saving to sessionStorage');
            sessionStorage.setItem(HomeConfig.STORAGE_KEYS.QUIZ_DATA, payload);
            window.location.href = quizPageUrl + '?source=custom';
        }
    },
};