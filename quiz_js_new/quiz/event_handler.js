class QuizEventHandler {
    constructor(quizCtrl) {
        this._quizCtrl = quizCtrl;
    }

    bindAll() {
        document.addEventListener('nav-prev',              () => this._handlePrev());
        document.addEventListener('nav-next',              () => this._handleNext());
        document.addEventListener('nav-mark-review',       () => this._handleMarkReview());
        document.addEventListener('nav-submit',            () => this._handleSubmit());
        document.addEventListener('question-selected',     (e) => this._handleQuestionSelected(e));
        document.addEventListener('restartWithWrongQuestions', (e) => this._handleRestartWrong(e));
        document.addEventListener('goHome',                () => this._handleGoHome());
        document.addEventListener('keydown',               (e) => this._handleKeydown(e));
    }

    // ── Handlers ──────────────────────────────────────────────

    _handlePrev()                    { this._quizCtrl.navigateBy(-1); }
    _handleNext()                    { this._quizCtrl.navigateBy(1); }
    _handleMarkReview()              { this._quizCtrl.toggleMarkReview(); }
    _handleSubmit()                  { this._quizCtrl.submitQuiz(); }
    _handleQuestionSelected(e)       { this._quizCtrl.navigateTo(e.detail.index); }
    _handleRestartWrong(e)           { this._quizCtrl.restartWithWrong(e.detail.questions); }
    _handleGoHome()                  { window.location.href = QuizConfig.URLS.HOME_PAGE; }

    _handleKeydown(e) {
        if (e.key === 'Enter') {
            const selected = document.querySelector('#question-wrapper input[type="radio"]:checked');
            if (selected) document.getElementById('next-btn')?.focus();
        }
        if (e.key === 'Control') this._quizCtrl.navigateBy(-1);
    }
}